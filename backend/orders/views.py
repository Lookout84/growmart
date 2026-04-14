from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth import get_user_model
from django.conf import settings
import requests as http_requests
from .models import Order, OrderItem, DeliveryMethod, PaymentMethod
from .tasks import send_order_confirmation_email, send_new_order_admin_email, send_new_order_viber_notification
from cart.models import Cart
from products.models import Product
from products.models import ProductVariant
from .serializers import OrderSerializer, OrderCreateSerializer, GuestOrderCreateSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

NP_API_URL = 'https://api.novaposhta.ua/v2.0/json/'


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create order from cart"""
        user = request.user
        
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({'error': 'Кошик порожній'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if not cart.items.exists():
            return Response({'error': 'Кошик порожній'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check stock availability
        for item in cart.items.all():
            if item.product.stock < item.quantity:
                return Response(
                    {'error': f'Недостатньо товару "{item.product.name}" на складі'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Calculate totals
        subtotal = cart.total_price
        dm = DeliveryMethod.objects.filter(
            code=serializer.validated_data['delivery_method'], is_active=True
        ).first()
        shipping_cost = dm.price if dm else 0
        
        tax = 0  # Calculate tax if needed
        total = subtotal + shipping_cost + tax
        
        # Create order
        order = Order.objects.create(
            user=user,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax=tax,
            total=total,
            **serializer.validated_data
        )
        
        # Create order items
        for cart_item in cart.items.all():
            unit_price = cart_item.variant.price if cart_item.variant_id else cart_item.product.final_price
            variant_name = f" ({cart_item.variant.name})" if cart_item.variant_id else ""
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name + variant_name,
                product_sku=cart_item.product.sku,
                price=unit_price,
                quantity=cart_item.quantity
            )
            # Decrease stock
            if cart_item.variant_id:
                cart_item.variant.stock -= cart_item.quantity
                cart_item.variant.save()
            else:
                cart_item.product.stock -= cart_item.quantity
                cart_item.product.save()
        
        # Clear cart
        cart.items.all().delete()

        # Send notifications asynchronously
        send_order_confirmation_email.delay(order.pk)
        send_new_order_admin_email.delay(order.pk)
        send_new_order_viber_notification.delay(order.pk)

        response_serializer = OrderSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel order"""
        order = self.get_object()
        
        if order.user != request.user and not request.user.is_staff:
            return Response({'error': 'У вас немає прав для цієї дії'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if order.status in ['shipped', 'delivered']:
            return Response({'error': 'Неможливо скасувати доставлене замовлення'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Return items to stock
        for item in order.items.all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save()
        
        order.status = 'cancelled'
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    @transaction.atomic
    def guest_create(self, request, *args, **kwargs):
        """Create order for guest (unauthenticated) or authenticated user with inline items"""
        serializer = GuestOrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        items_data = data.pop('items')
        create_account = data.pop('create_account', False)
        password = data.pop('password', '')

        if not items_data:
            return Response({'error': 'Кошик порожній'}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve products and validate stock
        order_items = []
        for entry in items_data:
            try:
                product = Product.objects.get(pk=entry['product_id'])
            except Product.DoesNotExist:
                return Response(
                    {'error': f'Товар з id {entry["product_id"]} не знайдено'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            variant = None
            if entry.get('variant_id'):
                try:
                    variant = ProductVariant.objects.get(pk=entry['variant_id'], product=product, is_active=True)
                except ProductVariant.DoesNotExist:
                    return Response(
                        {'error': f'Варіант товару не знайдено'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if variant.stock < entry['quantity']:
                    return Response(
                        {'error': f'Недостатньо товару "{product.name} ({variant.name})" на складі'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                if product.stock < entry['quantity']:
                    return Response(
                        {'error': f'Недостатньо товару "{product.name}" на складі'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            order_items.append((product, variant, entry['quantity']))

        # Optional account creation
        created_user = None
        tokens = None
        if create_account and password:
            email = data.get('email', '')
            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': 'Користувач з таким email вже існує'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                validate_password(password)
            except DjangoValidationError as exc:
                return Response({'error': ' '.join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

            username = email.split('@')[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f'{base_username}{counter}'
                counter += 1

            created_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
            )
            refresh = RefreshToken.for_user(created_user)
            tokens = {'access': str(refresh.access_token), 'refresh': str(refresh)}

        # Calculate totals
        subtotal = sum(
            (variant.price if variant else product.final_price) * qty
            for product, variant, qty in order_items
        )
        delivery_method = data.get('delivery_method', '')
        dm = DeliveryMethod.objects.filter(code=delivery_method, is_active=True).first()
        shipping_cost = dm.price if dm else 0
        total = subtotal + shipping_cost

        order = Order.objects.create(
            user=created_user,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax=0,
            total=total,
            **data,
        )

        for product, variant, qty in order_items:
            unit_price = variant.price if variant else product.final_price
            variant_name = f" ({variant.name})" if variant else ""
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name + variant_name,
                product_sku=product.sku,
                price=unit_price,
                quantity=qty,
            )
            if variant:
                variant.stock -= qty
                variant.save()
            else:
                product.stock -= qty
                product.save()

        response_data = OrderSerializer(order).data
        if tokens:
            response_data['tokens'] = tokens
            response_data['user'] = {
                'id': created_user.id,
                'username': created_user.username,
                'email': created_user.email,
                'first_name': created_user.first_name,
                'last_name': created_user.last_name,
            }

        # Send notifications asynchronously
        send_order_confirmation_email.delay(order.pk)
        send_new_order_admin_email.delay(order.pk)
        send_new_order_viber_notification.delay(order.pk)

        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='np/cities', permission_classes=[permissions.AllowAny])
    def np_cities(self, request):
        """Proxy: search Nova Poshta cities by name"""
        search = request.query_params.get('search', '').strip()
        if len(search) < 2:
            return Response([])
        payload = {
            'apiKey': settings.NOVA_POSHTA_API_KEY,
            'modelName': 'Address',
            'calledMethod': 'getCities',
            'methodProperties': {
                'FindByString': search,
                'Limit': '20',
                'Language': 'UA',
            },
        }
        try:
            resp = http_requests.post(NP_API_URL, json=payload, timeout=5)
            resp.raise_for_status()
            data = resp.json().get('data', [])
            cities = [
                {'ref': c['Ref'], 'name': c['Description'], 'area': c.get('AreaDescription', '')}
                for c in data
            ]
            return Response(cities)
        except Exception:
            return Response({'error': 'Помилка запиту до Нової Пошти'}, status=status.HTTP_502_BAD_GATEWAY)

    @action(detail=False, methods=['get'], url_path='np/warehouses', permission_classes=[permissions.AllowAny])
    def np_warehouses(self, request):
        """Proxy: get Nova Poshta warehouses for a city"""
        city_ref = request.query_params.get('city_ref', '').strip()
        if not city_ref:
            return Response([])
        payload = {
            'apiKey': settings.NOVA_POSHTA_API_KEY,
            'modelName': 'AddressGeneral',
            'calledMethod': 'getWarehouses',
            'methodProperties': {
                'CityRef': city_ref,
                'Limit': '200',
                'Language': 'UA',
            },
        }
        try:
            resp = http_requests.post(NP_API_URL, json=payload, timeout=5)
            resp.raise_for_status()
            data = resp.json().get('data', [])
            warehouses = [
                {'ref': w['Ref'], 'description': w['Description'], 'number': w.get('Number', '')}
                for w in data
            ]
            return Response(warehouses)
        except Exception:
            return Response({'error': 'Помилка запиту до Нової Пошти'}, status=status.HTTP_502_BAD_GATEWAY)

    @action(detail=False, methods=['get'], url_path='up/cities', permission_classes=[permissions.AllowAny])
    def up_cities(self, request):
        """Proxy: search Ukrainian cities via Nominatim (OpenStreetMap) for Ukrposhta delivery"""
        search = request.query_params.get('search', '').strip()
        if len(search) < 2:
            return Response([])
        params = {
            'q': search,
            'format': 'json',
            'countrycodes': 'ua',
            'addressdetails': '1',
            'limit': '15',
            'accept-language': 'uk',
            'featuretype': 'city',
        }
        headers = {'User-Agent': 'GrowMart/1.0 (contact@growmart.ua)'}
        try:
            resp = http_requests.get(
                'https://nominatim.openstreetmap.org/search',
                params=params,
                headers=headers,
                timeout=5,
            )
            resp.raise_for_status()
            results = resp.json()
            cities = []
            seen = set()
            for r in results:
                addr = r.get('address', {})
                name = (
                    addr.get('city')
                    or addr.get('town')
                    or addr.get('village')
                    or addr.get('municipality')
                    or r.get('display_name', '').split(',')[0]
                )
                region = addr.get('state', '')
                key = name.lower()
                if key not in seen:
                    seen.add(key)
                    cities.append({'name': name, 'region': region, 'display': r.get('display_name', '')})
            return Response(cities)
        except Exception:
            return Response({'error': 'Помилка запиту до геосервісу'}, status=status.HTTP_502_BAD_GATEWAY)

    @action(detail=False, methods=['get'], url_path='delivery-methods', permission_classes=[permissions.AllowAny])
    def delivery_methods(self, request):
        """Return active delivery methods (code, name, price)"""
        methods = DeliveryMethod.objects.filter(is_active=True).values('code', 'name', 'price')
        response = Response(list(methods))
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        response['Pragma'] = 'no-cache'
        return response

    @action(detail=False, methods=['get'], url_path='payment-methods', permission_classes=[permissions.AllowAny])
    def payment_methods(self, request):
        """Return active payment methods (code, name)"""
        methods = PaymentMethod.objects.filter(is_active=True).values('code', 'name')
        response = Response(list(methods))
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        response['Pragma'] = 'no-cache'
        return response

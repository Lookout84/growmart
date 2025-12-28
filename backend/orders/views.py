from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Order, OrderItem
from cart.models import Cart
from .serializers import OrderSerializer, OrderCreateSerializer


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
        shipping_cost = 0  # Calculate based on delivery method
        if serializer.validated_data['delivery_method'] == 'courier':
            shipping_cost = 100
        elif serializer.validated_data['delivery_method'] == 'nova_poshta':
            shipping_cost = 50
        
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
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                product_sku=cart_item.product.sku,
                price=cart_item.product.final_price,
                quantity=cart_item.quantity
            )
            # Decrease stock
            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save()
        
        # Clear cart
        cart.items.all().delete()
        
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

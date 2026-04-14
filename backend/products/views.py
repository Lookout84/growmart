from rest_framework import viewsets, filters, permissions, mixins, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from .models import Category, Product, Review, Banner, BlogPost, BlogCategory, Wishlist
from .serializers import (CategorySerializer, ProductListSerializer, 
                         ProductDetailSerializer, ReviewSerializer, ReviewCreateSerializer,
                         BannerSerializer, BlogPostSerializer, BlogCategorySerializer,
                         ProductCreateSerializer, WishlistSerializer)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).prefetch_related('images', 'reviews')
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'is_featured', 'is_new']
    search_fields = ['name', 'description', 'sku', 'brand']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return ProductCreateSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer
    
    def get_permissions(self):
        # Створення, оновлення та видалення доступні тільки для адміністраторів
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        # Для адміністраторів показуємо всі товари
        if self.request.user.is_staff:
            queryset = Product.objects.all().prefetch_related('images', 'reviews')
        else:
            queryset = super().get_queryset()
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by in stock
        in_stock = self.request.query_params.get('in_stock')
        if in_stock == 'true':
            queryset = queryset.filter(stock__gt=0)
        
        return queryset


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(status='approved').select_related('user', 'product')

    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_permissions(self):
        if self.action in ['create', 'my_review', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        if self.action == 'list':
            qs = Review.objects.filter(status='approved').select_related('user')
        else:
            qs = Review.objects.all().select_related('user', 'product')
        product_id = self.request.query_params.get('product')
        if product_id:
            qs = qs.filter(product_id=product_id)
        return qs

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product')
        if Review.objects.filter(user=request.user, product_id=product_id).exists():
            return Response(
                {'error': 'Ви вже залишили відгук для цього товару'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        review = serializer.save()
        try:
            from orders.tasks import send_new_review_notification
            send_new_review_notification.delay(review.pk)
        except Exception:
            pass

    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied('Ви не можете видалити цей відгук')
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_review(self, request):
        product_id = request.query_params.get('product')
        if not product_id:
            return Response(None)
        try:
            review = Review.objects.select_related('user').get(
                user=request.user, product_id=product_id
            )
            return Response(ReviewSerializer(review).data)
        except Review.DoesNotExist:
            return Response(None)


class BannerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BannerSerializer
    
    def get_queryset(self):
        queryset = Banner.objects.filter(is_active=True).order_by('order')
        return queryset


class BlogCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogCategory.objects.filter(is_active=True)
    serializer_class = BlogCategorySerializer
    lookup_field = 'slug'


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'author']
    search_fields = ['title', 'content', 'excerpt']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return BlogPost.objects.filter(is_published=True)


class WishlistViewSet(mixins.ListModelMixin, mixins.DestroyModelMixin,
                      viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WishlistSerializer

    def get_queryset(self):
        return (Wishlist.objects
                .filter(user=self.request.user)
                .select_related('product')
                .prefetch_related('product__images')
                .order_by('-created_at'))

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        existing = Wishlist.objects.filter(user=request.user, product_id=product_id).first()
        if existing:
            existing.delete()
            return Response({'wishlisted': False})
        Wishlist.objects.create(user=request.user, product_id=product_id)
        return Response({'wishlisted': True}, status=status.HTTP_201_CREATED)

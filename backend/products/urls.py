from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (CategoryViewSet, ProductViewSet, ReviewViewSet,
                   BannerViewSet, BlogCategoryViewSet, BlogPostViewSet)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('banners', BannerViewSet, basename='banner')
router.register('blog/categories', BlogCategoryViewSet, basename='blog-category')
router.register('blog/posts', BlogPostViewSet, basename='blog-post')
router.register('reviews', ReviewViewSet, basename='review')
router.register('', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]

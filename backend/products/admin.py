from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Product, ProductImage, Review, 
    Banner, BlogCategory, BlogPost, Wishlist
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'is_primary', 'order']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent', 'product_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'parent', 'created_at']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']
    list_editable = ['is_active']
    
    fieldsets = (
        ('Основна інформація', {
            'fields': ('name', 'slug', 'parent')
        }),
        ('Опис', {
            'fields': ('description', 'image')
        }),
        ('Налаштування', {
            'fields': ('is_active',)
        }),
    )
    
    def product_count(self, obj):
        count = obj.products.count()
        return format_html('<b>{}</b> товарів', count)
    product_count.short_description = 'Кількість товарів'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('products')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'category', 'price', 'stock', 'is_active', 
                   'is_featured', 'is_new', 'is_popular', 'created_at']
    list_filter = ['is_active', 'is_featured', 'is_new', 'is_popular', 'is_promo', 
                   'category', 'variety', 'created_at']
    search_fields = ['name', 'sku', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
    ordering = ['-created_at']
    list_editable = ['is_active', 'is_featured', 'is_new']
    
    fieldsets = (
        ('Основна інформація', {
            'fields': ('name', 'slug', 'category', 'brand', 'sku')
        }),
        ('Опис', {
            'fields': ('short_description', 'description')
        }),
        ('Ціна та знижки', {
            'fields': ('price', 'old_price', 'discount_percentage')
        }),
        ('Характеристики саджанців', {
            'fields': ('variety', 'age', 'fruit_weight', 'ripening_time', 
                      'planting_season', 'package_type'),
            'classes': ('collapse',)
        }),
        ('Залишки', {
            'fields': ('stock', 'weight')
        }),
        ('Статус', {
            'fields': ('is_active', 'is_featured', 'is_new', 'is_popular', 
                      'is_in_stock', 'is_promo', 'delivery_info')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'is_verified_purchase', 
                   'is_approved', 'created_at']
    list_filter = ['rating', 'is_verified_purchase', 'is_approved', 'created_at']
    search_fields = ['product__name', 'user__username', 'title', 'comment']
    ordering = ['-created_at']
    
    actions = ['approve_reviews', 'disapprove_reviews']
    
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Схвалити вибрані відгуки"
    
    def disapprove_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    disapprove_reviews.short_description = "Відхилити вибрані відгуки"


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'subtitle', 'description']
    ordering = ['order', '-created_at']
    list_editable = ['order', 'is_active']
    
    fieldsets = (
        ('Основна інформація', {
            'fields': ('title', 'subtitle', 'description')
        }),
        ('Зображення та посилання', {
            'fields': ('image', 'link', 'button_text')
        }),
        ('Налаштування', {
            'fields': ('order', 'is_active')
        }),
    )


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'post_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']
    list_editable = ['is_active']
    
    def post_count(self, obj):
        count = obj.posts.count()
        return format_html('<b>{}</b> статей', count)
    post_count.short_description = 'Кількість статей'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('posts')


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'author', 'views_count', 
                   'is_published', 'published_at', 'created_at']
    list_filter = ['is_published', 'category', 'published_at', 'created_at']
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['-published_at', '-created_at']
    list_editable = ['is_published']
    readonly_fields = ['views_count']
    
    fieldsets = (
        ('Основна інформація', {
            'fields': ('title', 'slug', 'category', 'author')
        }),
        ('Контент', {
            'fields': ('excerpt', 'content', 'image')
        }),
        ('Публікація', {
            'fields': ('is_published', 'published_at')
        }),
        ('Статистика', {
            'fields': ('views_count',),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not obj.author:
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'user__email', 'product__name']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    def has_add_permission(self, request):
        return False

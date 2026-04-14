from django.contrib import admin
from django.utils.html import format_html
from django.contrib import messages
from .models import (
    Category, Product, ProductImage, ProductVariant, Review,
    Banner, BlogCategory, BlogPost, Wishlist
)
from .utils import generate_product_description
from .image_utils import add_images_to_product


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'is_primary', 'order']


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['name', 'price', 'stock', 'sort_order', 'is_active']
    verbose_name = 'Варіант (розмір кореневої системи)'
    verbose_name_plural = 'Варіанти ціноутворення (розмір кореневої системи)'


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
    inlines = [ProductVariantInline, ProductImageInline]
    ordering = ['-created_at']
    list_editable = ['is_active', 'is_featured', 'is_new']
    actions = [
        'generate_descriptions_ai', 
        'generate_descriptions_template',
        'add_images_from_unsplash',
        'add_images_from_dalle'
    ]
    
    fieldsets = (
        ('Основна інформація', {
            'fields': ('name', 'slug', 'category', 'brand', 'sku')
        }),
        ('Опис', {
            'fields': ('short_description', 'description'),
            'description': 'Опис можна згенерувати автоматично через дії адміністратора'
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
    
    def generate_descriptions_ai(self, request, queryset):
        """Генерує описи для вибраних товарів за допомогою AI"""
        success_count = 0
        error_count = 0
        
        for product in queryset:
            try:
                description, short_description = generate_product_description(
                    product_name=product.name,
                    category_name=product.category.name if product.category else None,
                    use_ai=True
                )
                
                product.description = description
                product.short_description = short_description
                product.save(update_fields=['description', 'short_description'])
                success_count += 1
            except Exception as e:
                error_count += 1
                self.message_user(
                    request, 
                    f"Помилка при генерації опису для '{product.name}': {str(e)}", 
                    level=messages.ERROR
                )
        
        if success_count > 0:
            self.message_user(
                request, 
                f"Успішно згенеровано описи для {success_count} товар(ів) за допомогою AI", 
                level=messages.SUCCESS
            )
        if error_count > 0:
            self.message_user(
                request, 
                f"Не вдалося згенерувати описи для {error_count} товар(ів)", 
                level=messages.WARNING
            )
    
    generate_descriptions_ai.short_description = "🤖 Згенерувати описи (AI)"
    
    def generate_descriptions_template(self, request, queryset):
        """Генерує шаблонні описи для вибраних товарів"""
        success_count = 0
        
        for product in queryset:
            description, short_description = generate_product_description(
                product_name=product.name,
                category_name=product.category.name if product.category else None,
                use_ai=False
            )
            
            product.description = description
            product.short_description = short_description
            product.save(update_fields=['description', 'short_description'])
            success_count += 1
        
        self.message_user(
            request, 
            f"Успішно згенеровано шаблонні описи для {success_count} товар(ів)", 
            level=messages.SUCCESS
        )
    
    generate_descriptions_template.short_description = "📝 Згенерувати описи (Шаблон)"
    
    def add_images_from_unsplash(self, request, queryset):
        """Додає зображення до товарів з Unsplash"""
        success_count = 0
        error_count = 0
        total_images = 0
        
        for product in queryset:
            try:
                added = add_images_to_product(
                    product=product,
                    image_count=3,
                    use_ai=True,
                    use_dalle=False
                )
                
                if added > 0:
                    success_count += 1
                    total_images += added
                else:
                    error_count += 1
                    
            except Exception as e:
                error_count += 1
                self.message_user(
                    request,
                    f"Помилка при додаванні зображень для '{product.name}': {str(e)}",
                    level=messages.ERROR
                )
        
        if success_count > 0:
            self.message_user(
                request,
                f"Успішно додано {total_images} зображень для {success_count} товар(ів)",
                level=messages.SUCCESS
            )
        if error_count > 0:
            self.message_user(
                request,
                f"Не вдалося додати зображення для {error_count} товар(ів)",
                level=messages.WARNING
            )
    
    add_images_from_unsplash.short_description = "🖼️ Додати зображення (Unsplash/Pexels)"
    
    def add_images_from_dalle(self, request, queryset):
        """Генерує зображення для товарів через DALL-E"""
        success_count = 0
        error_count = 0
        
        for product in queryset:
            try:
                added = add_images_to_product(
                    product=product,
                    image_count=1,
                    use_ai=False,
                    use_dalle=True
                )
                
                if added > 0:
                    success_count += 1
                else:
                    error_count += 1
                    
            except Exception as e:
                error_count += 1
                self.message_user(
                    request,
                    f"Помилка при генерації зображення для '{product.name}': {str(e)}",
                    level=messages.ERROR
                )
        
        if success_count > 0:
            self.message_user(
                request,
                f"Успішно згенеровано зображення для {success_count} товар(ів) через DALL-E",
                level=messages.SUCCESS
            )
        if error_count > 0:
            self.message_user(
                request,
                f"Не вдалося згенерувати зображення для {error_count} товар(ів)",
                level=messages.WARNING
            )
    
    add_images_from_dalle.short_description = "🎨 Згенерувати зображення (DALL-E AI)"


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating_stars', 'comment_preview', 'status_badge', 'is_verified_purchase', 'created_at']
    list_filter = ['status', 'rating', 'is_verified_purchase', 'created_at']
    search_fields = ['product__name', 'user__username', 'user__first_name', 'user__last_name', 'title', 'comment']
    ordering = ['-created_at']
    readonly_fields = ['user', 'product', 'rating', 'title', 'comment', 'is_verified_purchase', 'created_at']
    actions = ['approve_reviews', 'reject_reviews']

    fieldsets = (
        ('Відгук', {
            'fields': ('product', 'user', 'rating', 'title', 'comment')
        }),
        ('Статус та інформація', {
            'fields': ('status', 'is_verified_purchase', 'created_at')
        }),
    )

    def rating_stars(self, obj):
        return '★' * obj.rating + '☆' * (5 - obj.rating)
    rating_stars.short_description = 'Рейтинг'

    def comment_preview(self, obj):
        text = obj.comment or ''
        return text[:80] + '...' if len(text) > 80 else text
    comment_preview.short_description = 'Відгук'

    def status_badge(self, obj):
        colors = {
            'pending': '#f59e0b',
            'approved': '#10b981',
            'rejected': '#ef4444',
        }
        labels = {
            'pending': 'Очікує',
            'approved': 'Схвалено',
            'rejected': 'Відхилено',
        }
        color = colors.get(obj.status, '#6b7280')
        label = labels.get(obj.status, obj.status)
        return format_html(
            '<span style="background:{};color:white;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;">{}</span>',
            color, label
        )
    status_badge.short_description = 'Статус'

    def approve_reviews(self, request, queryset):
        count = queryset.update(status='approved')
        self.message_user(request, f'✅ {count} відгуків схвалено', messages.SUCCESS)
    approve_reviews.short_description = '✅ Схвалити вибрані відгуки'

    def reject_reviews(self, request, queryset):
        count = queryset.update(status='rejected')
        self.message_user(request, f'❌ {count} відгуків відхилено', messages.WARNING)
    reject_reviews.short_description = '❌ Відхилити вибрані відгуки'


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

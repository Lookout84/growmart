from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify


class Category(models.Model):
    """Product Category"""
    name = models.CharField(max_length=200, unique=True, verbose_name='Назва')
    slug = models.SlugField(max_length=200, unique=True, verbose_name='URL')
    description = models.TextField(blank=True, verbose_name='Опис')
    image = models.ImageField(upload_to='categories/', blank=True, null=True, verbose_name='Зображення')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, 
                               related_name='children', verbose_name='Батьківська категорія')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Категорія'
        verbose_name_plural = 'Категорії'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    """Product Model - Саджанці"""
    SEASON_CHOICES = [
        ('spring', 'Весна'),
        ('summer', 'Літо'),
        ('autumn', 'Осінь'),
        ('winter', 'Зима'),
    ]
    
    VARIETY_CHOICES = [
        ('early', 'Ранній'),
        ('mid', 'Середній'),
        ('late', 'Пізній'),
        ('mid-late', 'Середньо-пізній'),
    ]
    
    name = models.CharField(max_length=255, verbose_name='Назва')
    slug = models.SlugField(max_length=255, unique=True, verbose_name='URL')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, 
                                 related_name='products', verbose_name='Категорія')
    description = models.TextField(verbose_name='Опис')
    short_description = models.CharField(max_length=500, blank=True, verbose_name='Короткий опис')
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Ціна')
    old_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, 
                                    null=True, verbose_name='Стара ціна')
    discount_percentage = models.IntegerField(default=0, validators=[MinValueValidator(0), 
                                              MaxValueValidator(100)], verbose_name='Знижка %')
    
    # Характеристики саджанців
    variety = models.CharField(max_length=50, choices=VARIETY_CHOICES, blank=True, verbose_name='Сорт')
    age = models.CharField(max_length=100, blank=True, verbose_name='Вік саджанця')
    fruit_weight = models.CharField(max_length=100, blank=True, verbose_name='Маса плоду')
    ripening_time = models.CharField(max_length=200, blank=True, verbose_name='Термін дозрівання')
    planting_season = models.CharField(max_length=50, choices=SEASON_CHOICES, blank=True, verbose_name='Сезон посадки')
    package_type = models.CharField(max_length=100, blank=True, verbose_name='Тип упаковки', 
                                    help_text='Наприклад: відкритий корінь, в горщику 10л')
    
    # Inventory
    stock = models.IntegerField(default=0, validators=[MinValueValidator(0)], verbose_name='Залишок')
    sku = models.CharField(max_length=100, unique=True, verbose_name='Артикул (Код товару)')
    
    # Attributes
    brand = models.CharField(max_length=100, blank=True, verbose_name='Бренд')
    weight = models.DecimalField(max_digits=6, decimal_places=2, blank=True, 
                                 null=True, verbose_name='Вага (кг)')
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name='Активний')
    is_featured = models.BooleanField(default=False, verbose_name='Бестселер')
    is_new = models.BooleanField(default=True, verbose_name='Новинка')
    is_popular = models.BooleanField(default=False, verbose_name='Популярний')
    is_in_stock = models.BooleanField(default=True, verbose_name='В наявності')
    is_promo = models.BooleanField(default=False, verbose_name='Акція')
    delivery_info = models.CharField(max_length=200, blank=True, verbose_name='Інформація про доставку',
                                    help_text='Наприклад: НА ВЕСНУ 2026')
    
    # SEO
    meta_title = models.CharField(max_length=255, blank=True, verbose_name='Meta Title')
    meta_description = models.TextField(blank=True, verbose_name='Meta Description')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Товар'
        verbose_name_plural = 'Товари'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['sku']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock > 0

    @property
    def final_price(self):
        if self.discount_percentage > 0:
            return self.price * (1 - self.discount_percentage / 100)
        return self.price


class ProductImage(models.Model):
    """Product Images"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, 
                               related_name='images', verbose_name='Товар')
    image = models.ImageField(upload_to='products/', verbose_name='Зображення')
    alt_text = models.CharField(max_length=255, blank=True, verbose_name='Alt текст')
    is_primary = models.BooleanField(default=False, verbose_name='Головне зображення')
    order = models.IntegerField(default=0, verbose_name='Порядок')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = 'Зображення товару'
        verbose_name_plural = 'Зображення товарів'

    def __str__(self):
        return f"{self.product.name} - Image {self.id}"


class Review(models.Model):
    """Product Review"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, 
                               related_name='reviews', verbose_name='Товар')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, 
                            related_name='reviews', verbose_name='Користувач')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], 
                                verbose_name='Рейтинг')
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    comment = models.TextField(verbose_name='Коментар')
    is_verified_purchase = models.BooleanField(default=False, verbose_name='Підтверджена покупка')
    is_approved = models.BooleanField(default=False, verbose_name='Схвалено')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Відгук'
        verbose_name_plural = 'Відгуки'
        unique_together = ['product', 'user']

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating}★)"


class Banner(models.Model):
    """Promotional Banners"""
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    subtitle = models.CharField(max_length=300, blank=True, verbose_name='Підзаголовок')
    description = models.TextField(blank=True, verbose_name='Опис')
    image = models.ImageField(upload_to='banners/', verbose_name='Зображення')
    link = models.URLField(blank=True, verbose_name='Посилання')
    button_text = models.CharField(max_length=100, blank=True, verbose_name='Текст кнопки')
    order = models.IntegerField(default=0, verbose_name='Порядок')
    is_active = models.BooleanField(default=True, verbose_name='Активний')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = 'Банер'
        verbose_name_plural = 'Банери'

    def __str__(self):
        return self.title


class BlogCategory(models.Model):
    """Blog Categories"""
    name = models.CharField(max_length=200, unique=True, verbose_name='Назва')
    slug = models.SlugField(max_length=200, unique=True, verbose_name='URL')
    description = models.TextField(blank=True, verbose_name='Опис')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Категорія блогу'
        verbose_name_plural = 'Категорії блогу'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogPost(models.Model):
    """Blog Posts"""
    title = models.CharField(max_length=255, verbose_name='Заголовок')
    slug = models.SlugField(max_length=255, unique=True, verbose_name='URL')
    category = models.ForeignKey(BlogCategory, on_delete=models.SET_NULL, null=True,
                                 related_name='posts', verbose_name='Категорія')
    content = models.TextField(verbose_name='Контент')
    excerpt = models.TextField(max_length=500, blank=True, verbose_name='Витяг')
    image = models.ImageField(upload_to='blog/', blank=True, null=True, verbose_name='Зображення')
    author = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True,
                              related_name='blog_posts', verbose_name='Автор')
    views_count = models.IntegerField(default=0, verbose_name='Кількість переглядів')
    is_published = models.BooleanField(default=False, verbose_name='Опубліковано')
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата публікації')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']
        verbose_name = 'Пост блогу'
        verbose_name_plural = 'Пости блогу'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Wishlist(models.Model):
    """User Wishlist - Мій сад"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE,
                            related_name='wishlist', verbose_name='Користувач')
    product = models.ForeignKey(Product, on_delete=models.CASCADE,
                               related_name='wishlisted_by', verbose_name='Товар')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']
        verbose_name = 'Список бажань'
        verbose_name_plural = 'Списки бажань'

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"

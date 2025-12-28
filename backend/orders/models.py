from django.db import models
from django.core.validators import MinValueValidator


class Order(models.Model):
    """Order Model"""
    STATUS_CHOICES = [
        ('pending', 'Очікує'),
        ('confirmed', 'Підтверджено'),
        ('processing', 'Обробляється'),
        ('shipped', 'Відправлено'),
        ('delivered', 'Доставлено'),
        ('cancelled', 'Скасовано'),
        ('refunded', 'Повернено'),
    ]
    
    PAYMENT_METHODS = [
        ('card', 'Картка'),
        ('cash', 'Готівка'),
        ('online', 'Онлайн'),
    ]
    
    DELIVERY_METHODS = [
        ('nova_poshta', 'Нова Пошта'),
        ('ukr_poshta', 'Укрпошта'),
        ('courier', "Кур'єр"),
        ('pickup', 'Самовивіз'),
    ]
    
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, 
                            related_name='orders', verbose_name='Користувач')
    order_number = models.CharField(max_length=100, unique=True, verbose_name='Номер замовлення')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, 
                             default='pending', verbose_name='Статус')
    
    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Сума товарів')
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, 
                                       default=0, verbose_name='Вартість доставки')
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Податок')
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Загальна сума')
    
    # Payment
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, 
                                     verbose_name='Спосіб оплати')
    is_paid = models.BooleanField(default=False, verbose_name='Оплачено')
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата оплати')
    
    # Delivery
    delivery_method = models.CharField(max_length=20, choices=DELIVERY_METHODS, 
                                      verbose_name='Спосіб доставки')
    
    # Shipping Address
    first_name = models.CharField(max_length=100, verbose_name="Ім'я")
    last_name = models.CharField(max_length=100, verbose_name='Прізвище')
    email = models.EmailField(verbose_name='Email')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    address = models.CharField(max_length=255, verbose_name='Адреса')
    city = models.CharField(max_length=100, verbose_name='Місто')
    postal_code = models.CharField(max_length=20, blank=True, verbose_name='Індекс')
    country = models.CharField(max_length=100, default='Україна', verbose_name='Країна')
    
    # Additional
    notes = models.TextField(blank=True, verbose_name='Примітки')
    tracking_number = models.CharField(max_length=200, blank=True, verbose_name='Номер відстеження')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Замовлення'
        verbose_name_plural = 'Замовлення'

    def __str__(self):
        return f"Order {self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            import uuid
            self.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Order Item"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, 
                             related_name='items', verbose_name='Замовлення')
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, 
                               null=True, verbose_name='Товар')
    product_name = models.CharField(max_length=255, verbose_name='Назва товару')
    product_sku = models.CharField(max_length=100, verbose_name='Артикул')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Ціна')
    quantity = models.IntegerField(validators=[MinValueValidator(1)], verbose_name='Кількість')
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Сума')

    class Meta:
        verbose_name = 'Товар замовлення'
        verbose_name_plural = 'Товари замовлення'

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    def save(self, *args, **kwargs):
        self.total = self.price * self.quantity
        super().save(*args, **kwargs)

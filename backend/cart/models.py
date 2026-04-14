from django.db import models
from django.core.validators import MinValueValidator


class Cart(models.Model):
    """Shopping Cart"""
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, 
                               related_name='cart', verbose_name='Користувач')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Кошик'
        verbose_name_plural = 'Кошики'

    def __str__(self):
        return f"Cart of {self.user.username}"

    @property
    def total_price(self):
        return sum(item.total_price for item in self.items.all())

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    """Cart Item"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, 
                            related_name='items', verbose_name='Кошик')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, 
                               verbose_name='Товар')
    variant = models.ForeignKey('products.ProductVariant', on_delete=models.SET_NULL,
                                null=True, blank=True, verbose_name='Варіант')
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)], 
                                  verbose_name='Кількість')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Товар у кошику'
        verbose_name_plural = 'Товари у кошику'
        unique_together = ['cart', 'product', 'variant']

    def __str__(self):
        variant_part = f" ({self.variant.name})" if self.variant else ""
        return f"{self.product.name}{variant_part} x {self.quantity}"

    @property
    def total_price(self):
        unit_price = self.variant.price if self.variant_id else self.product.final_price
        return unit_price * self.quantity

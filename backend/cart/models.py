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
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)], 
                                  verbose_name='Кількість')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Товар у кошику'
        verbose_name_plural = 'Товари у кошику'
        unique_together = ['cart', 'product']

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

    @property
    def total_price(self):
        return self.product.final_price * self.quantity

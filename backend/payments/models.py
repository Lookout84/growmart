from django.db import models


class Payment(models.Model):
    """Payment Model"""
    PAYMENT_STATUS = [
        ('pending', 'Очікує'),
        ('completed', 'Завершено'),
        ('failed', 'Помилка'),
        ('refunded', 'Повернено'),
    ]
    
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, 
                                 related_name='payment', verbose_name='Замовлення')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Сума')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, 
                             default='pending', verbose_name='Статус')
    payment_method = models.CharField(max_length=50, verbose_name='Метод оплати')
    transaction_id = models.CharField(max_length=200, blank=True, verbose_name='ID транзакції')
    payment_details = models.JSONField(blank=True, null=True, verbose_name='Деталі платежу')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Платіж'
        verbose_name_plural = 'Платежі'

    def __str__(self):
        return f"Payment for {self.order.order_number}"

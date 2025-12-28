from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'product_sku', 'price', 'quantity', 'total']
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'status', 'total', 'is_paid', 
                   'payment_method', 'delivery_method', 'created_at']
    list_filter = ['status', 'is_paid', 'payment_method', 'delivery_method', 'created_at']
    search_fields = ['order_number', 'user__username', 'user__email', 'email', 
                    'phone', 'tracking_number']
    readonly_fields = ['order_number', 'created_at', 'updated_at', 'paid_at']
    inlines = [OrderItemInline]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Інформація про замовлення', {
            'fields': ('order_number', 'user', 'status', 'created_at', 'updated_at')
        }),
        ('Ціна', {
            'fields': ('subtotal', 'shipping_cost', 'tax', 'total')
        }),
        ('Оплата', {
            'fields': ('payment_method', 'is_paid', 'paid_at')
        }),
        ('Доставка', {
            'fields': ('delivery_method', 'tracking_number')
        }),
        ('Адреса доставки', {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'address', 
                      'city', 'postal_code', 'country')
        }),
        ('Додатково', {
            'fields': ('notes',)
        }),
    )
    
    actions = ['mark_as_confirmed', 'mark_as_shipped', 'mark_as_delivered']
    
    def mark_as_confirmed(self, request, queryset):
        queryset.update(status='confirmed')
    mark_as_confirmed.short_description = "Підтвердити замовлення"
    
    def mark_as_shipped(self, request, queryset):
        queryset.update(status='shipped')
    mark_as_shipped.short_description = "Відмітити як відправлено"
    
    def mark_as_delivered(self, request, queryset):
        queryset.update(status='delivered')
    mark_as_delivered.short_description = "Відмітити як доставлено"

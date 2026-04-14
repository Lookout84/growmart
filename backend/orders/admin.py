from django.contrib import admin
from .models import Order, OrderItem, DeliveryMethod, PaymentMethod


@admin.register(DeliveryMethod)
class DeliveryMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'price', 'is_active', 'sort_order']
    list_editable = ['price', 'is_active', 'sort_order']
    save_on_top = True
    ordering = ['sort_order', 'name']
    actions = ['activate_methods', 'deactivate_methods']

    @admin.action(description='✅ Активувати обрані способи доставки')
    def activate_methods(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'Активовано: {updated}')

    @admin.action(description='🚫 Деактивувати обрані способи доставки')
    def deactivate_methods(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'Деактивовано: {updated}')

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'sort_order']
    list_editable = ['is_active', 'sort_order']
    save_on_top = True
    ordering = ['sort_order', 'name']
    actions = ['activate_methods', 'deactivate_methods']

    @admin.action(description='✅ Активувати обрані способи оплати')
    def activate_methods(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'Активовано: {updated}')

    @admin.action(description='🚫 Деактивувати обрані способи оплати')
    def deactivate_methods(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'Деактивовано: {updated}')


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

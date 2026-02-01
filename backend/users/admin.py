from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


def mark_verified(modeladmin, request, queryset):
    """Action to mark users as verified"""
    count = queryset.update(is_verified=True)
    modeladmin.message_user(
        request, 
        f'{count} користувач(ів) успішно верифіковано.'
    )

mark_verified.short_description = '✓ Верифікувати вибраних користувачів'


def mark_unverified(modeladmin, request, queryset):
    """Action to mark users as unverified"""
    count = queryset.update(is_verified=False)
    modeladmin.message_user(
        request, 
        f'{count} користувач(ів) успішно скасовано верифікацію.'
    )

mark_unverified.short_description = '✗ Скасувати верифікацію вибраних користувачів'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'full_name', 'phone', 'is_verified_badge', 'is_active', 'created_at']
    list_filter = ['is_verified', 'is_active', 'is_staff', 'is_superuser', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']
    actions = [mark_verified, mark_unverified]
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Верифікація та контакти', {
            'fields': ('phone', 'is_verified', 'date_of_birth', 'avatar'),
            'classes': ('wide',),
            'description': 'Позначте як верифіковано, щоб дозволити користувачеві доступ до всіх функцій'
        }),
        ('Адреса', {
            'fields': ('address', 'city', 'postal_code', 'country'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Верифікація та контакти', {'fields': ('phone', 'is_verified', 'email')}),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'is_verified_badge']
    
    def full_name(self, obj):
        """Display full name of user"""
        full_name = obj.get_full_name()
        return full_name if full_name else 'Ім\'я не вказано'
    full_name.short_description = 'Повне ім\'я'
    
    def is_verified_badge(self, obj):
        """Display verification status as badge"""
        if obj.is_verified:
            return '✅ Верифіковано'
        return '❌ Не верифіковано'
    is_verified_badge.short_description = 'Статус верифікації'
    
    def get_list_display(self, request):
        """Customize list display based on permissions"""
        list_display = super().get_list_display(request)
        return list_display

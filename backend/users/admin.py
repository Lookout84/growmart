from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'is_verified', 'created_at']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'is_verified']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Додаткова інформація', {'fields': ('phone', 'date_of_birth', 'avatar', 'is_verified')}),
        ('Адреса', {'fields': ('address', 'city', 'postal_code', 'country')}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Додаткова інформація', {'fields': ('phone', 'email')}),
    )

"""
Admin configuration cho Authentication module.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin cho User model với role field."""

    list_display = [
        'username', 'email', 'full_name', 'role', 'phone',
        'is_active', 'date_joined',
    ]
    list_filter = ['role', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'full_name', 'phone']
    ordering = ['-date_joined']

    # Thêm role, phone, full_name vào form chỉnh sửa
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Thông tin RainClinic', {
            'fields': ('role', 'phone', 'full_name'),
        }),
    )

    # Thêm vào form tạo user mới
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Thông tin RainClinic', {
            'fields': ('role', 'phone', 'full_name', 'email'),
        }),
    )

"""
Custom User model for RainClinic.

Mở rộng AbstractUser của Django để hỗ trợ:
- Phân quyền theo vai trò (role-based): patient, doctor, admin
- Thông tin bổ sung: số điện thoại, họ tên đầy đủ
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model với role-based phân quyền."""

    class Role(models.TextChoices):
        PATIENT = 'patient', 'Bệnh nhân'
        DOCTOR = 'doctor', 'Bác sĩ'
        ADMIN = 'admin', 'Quản trị viên'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.PATIENT,
        verbose_name='Vai trò',
        help_text='Vai trò của người dùng trong hệ thống.',
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        default='',
        verbose_name='Số điện thoại',
    )

    full_name = models.CharField(
        max_length=150,
        blank=True,
        default='',
        verbose_name='Họ và tên',
    )

    class Meta:
        verbose_name = 'Người dùng'
        verbose_name_plural = 'Người dùng'
        ordering = ['-date_joined']

    def __str__(self):
        return f'{self.full_name or self.username} ({self.get_role_display()})'

    @property
    def is_patient(self):
        return self.role == self.Role.PATIENT

    @property
    def is_doctor(self):
        return self.role == self.Role.DOCTOR

    @property
    def is_admin_role(self):
        """Distinguish from Django's is_staff/is_superuser."""
        return self.role == self.Role.ADMIN

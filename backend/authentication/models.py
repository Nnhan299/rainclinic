"""
Custom User model for RainClinic.

Mở rộng AbstractUser của Django để hỗ trợ:
- Phân quyền theo vai trò (role-based): patient, doctor, admin
- Thông tin bổ sung: số điện thoại, họ tên đầy đủ
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


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

class Service(models.Model):
    name = models.CharField(max_length=100, verbose_name='Tên dịch vụ')
    category = models.CharField(max_length=100, verbose_name='Chuyên khoa')
    duration_min = models.IntegerField(default=30, verbose_name='Thời lượng (phút)')
    price = models.IntegerField(verbose_name='Giá (nghìn VNĐ)')
    description = models.TextField(blank=True, default='', verbose_name='Mô tả')
    doctor_name = models.CharField(max_length=100, verbose_name='Bác sĩ phụ trách')

    class Meta:
        verbose_name = 'Dịch vụ y tế'
        verbose_name_plural = 'Dịch vụ y tế'

    def __str__(self):
        return f'{self.name} ({self.doctor_name})'


class TimeSlot(models.Model):
    time = models.CharField(max_length=50, unique=True, verbose_name='Khung giờ')
    is_available = models.BooleanField(default=True, verbose_name='Có sẵn')

    class Meta:
        verbose_name = 'Khung giờ khám'
        verbose_name_plural = 'Khung giờ khám'

    def __str__(self):
        return self.time


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Chờ xác nhận'
        CONFIRMED = 'confirmed', 'Đã duyệt'
        CANCELLED = 'cancelled', 'Đã hủy'

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='auth_appointments',
        verbose_name='Bệnh nhân'
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='auth_appointments',
        verbose_name='Dịch vụ'
    )
    time_slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name='auth_appointments',
        verbose_name='Khung giờ'
    )
    date = models.DateField(verbose_name='Ngày khám')
    symptoms = models.TextField(verbose_name='Triệu chứng lâm sàng')
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name='Trạng thái'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Thời gian tạo')

    class Meta:
        verbose_name = 'Lịch hẹn khám'
        verbose_name_plural = 'Lịch hẹn khám'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.patient.full_name or self.patient.username} - {self.service.name} - {self.date}'

from django.db import models
from django.conf import settings

class MedicalService(models.Model):
    """Mô hình dịch vụ y tế của phòng khám."""
    name = models.CharField(max_length=200, verbose_name="Tên dịch vụ")
    category = models.CharField(max_length=100, verbose_name="Chuyên khoa / Danh mục")
    duration_min = models.IntegerField(default=30, verbose_name="Thời lượng khám (phút)")
    price = models.IntegerField(verbose_name="Giá dịch vụ (USD hoặc VNĐ)")
    doctor_name = models.CharField(max_length=100, verbose_name="Tên bác sĩ phụ trách")
    description = models.TextField(blank=True, default="", verbose_name="Mô tả dịch vụ")

    class Meta:
        verbose_name = "Dịch vụ y tế"
        verbose_name_plural = "Dịch vụ y tế"
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} - {self.doctor_name} ({self.price}$)"


class TimeSlot(models.Model):
    """Khung giờ khám bệnh trong ngày."""
    time = models.CharField(max_length=50, unique=True, verbose_name="Khung giờ (VD: 08:00 - 09:00)")
    is_available = models.BooleanField(default=True, verbose_name="Còn trống")

    class Meta:
        verbose_name = "Khung giờ khám"
        verbose_name_plural = "Khung giờ khám"
        ordering = ['time']

    def __str__(self):
        status = "Còn trống" if self.is_available else "Đã đặt"
        return f"{self.time} ({status})"


class Appointment(models.Model):
    """Lịch hẹn khám bệnh của bệnh nhân."""
    STATUS_CHOICES = [
        ('pending', 'Chờ duyệt'),
        ('confirmed', 'Đã xác nhận'),
        ('cancelled', 'Đã hủy'),
    ]

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments",
        verbose_name="Bệnh nhân (Tài khoản)"
    )
    patient_name = models.CharField(max_length=150, verbose_name="Họ tên bệnh nhân")
    patient_phone = models.CharField(max_length=20, verbose_name="Số điện thoại")
    
    service = models.ForeignKey(
        MedicalService,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments",
        verbose_name="Dịch vụ khám"
    )
    # Lưu lại tên dịch vụ và tên bác sĩ phòng khi dịch vụ bị xóa hoặc thay đổi
    service_name = models.CharField(max_length=200, blank=True, verbose_name="Tên dịch vụ (lưu vết)")
    doctor_name = models.CharField(max_length=100, blank=True, verbose_name="Tên bác sĩ (lưu vết)")
    
    date = models.DateField(verbose_name="Ngày khám")
    time_slot = models.CharField(max_length=50, verbose_name="Khung giờ khám")
    symptoms = models.TextField(blank=True, default="", verbose_name="Triệu chứng/Mô tả bệnh")
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Trạng thái lịch hẹn"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian tạo")

    class Meta:
        verbose_name = "Lịch hẹn"
        verbose_name_plural = "Lịch hẹn"
        ordering = ['-date', 'time_slot']

    def save(self, *args, **kwargs):
        # Tự động điền service_name và doctor_name nếu chưa có và service tồn tại
        if self.service:
            if not self.service_name:
                self.service_name = self.service.name
            if not self.doctor_name:
                self.doctor_name = self.service.doctor_name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient_name} - {self.service_name} ({self.date} {self.time_slot}) - {self.get_status_display()}"

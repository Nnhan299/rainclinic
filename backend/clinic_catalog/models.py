from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class MedicalService(models.Model):
    """
    Mô hình dịch vụ y tế.
    Lưu trữ thông tin các dịch vụ khám, chữa trị tại phòng khám.
    """
    name = models.CharField(max_length=255, verbose_name="Tên dịch vụ")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    category = models.CharField(max_length=100, default="General", verbose_name="Danh mục")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Giá tiền")
    doctor_name = models.CharField(max_length=255, blank=True, default="", verbose_name="Tên bác sĩ")
    duration_minutes = models.IntegerField(default=30, verbose_name="Thời lượng (phút)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")

    class Meta:
        verbose_name = "Dịch vụ Y tế"
        verbose_name_plural = "Dịch vụ Y tế"
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class TimeSlot(models.Model):
    """
    Mô hình khung giờ khám.
    Lưu trữ các khoảng thời gian khám bệnh có sẵn.
    """
    start_time = models.TimeField(verbose_name="Giờ bắt đầu")
    end_time = models.TimeField(verbose_name="Giờ kết thúc")
    is_available = models.BooleanField(default=True, verbose_name="Có sẵn")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    class Meta:
        verbose_name = "Khung giờ khám"
        verbose_name_plural = "Khung giờ khám"
        ordering = ['start_time']

    def __str__(self):
        return f"{self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"


class Appointment(models.Model):
    """
    Mô hình lịch hẹn khám bệnh.
    Lưu trữ thông tin đặt lịch của bệnh nhân.
    """
    STATUS_CHOICES = [
        ('pending', 'Chờ xác nhận'),
        ('confirmed', 'Đã xác nhận'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Hủy lịch'),
    ]

    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='catalog_appointments', verbose_name="Bệnh nhân")
    service = models.ForeignKey(MedicalService, on_delete=models.CASCADE, related_name='catalog_appointments', verbose_name="Dịch vụ")
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='catalog_appointments', verbose_name="Khung giờ")
    appointment_date = models.DateField(verbose_name="Ngày khám")
    symptoms = models.TextField(blank=True, default="", verbose_name="Triệu chứng")
    notes = models.TextField(blank=True, default="", verbose_name="Ghi chú")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Trạng thái")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày đặt")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Cập nhật lần cuối")

    class Meta:
        verbose_name = "Lịch hẹn khám"
        verbose_name_plural = "Lịch hẹn khám"
        ordering = ['-appointment_date']

    def __str__(self):
        return f"{self.patient.full_name} - {self.service.name} ({self.appointment_date})"
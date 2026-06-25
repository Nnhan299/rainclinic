from django.db import models
from django.conf import settings

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Chờ xác nhận'),
        ('confirmed', 'Đã duyệt'),
        ('cancelled', 'Đã hủy'),
    ]

    # Liên kết với bảng User của Thành viên 1
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='appointments'
    )
    
    # Lưu thông tin cơ bản để chạy độc lập
    service_name = models.CharField(max_length=255, default="Khám tổng quát")
    time_slot_text = models.CharField(max_length=50, default="08:00 - 09:00")
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    symptoms = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lịch hẹn {self.id} - {self.patient.username} ({self.status})"
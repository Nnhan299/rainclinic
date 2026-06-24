from django.db import models

class MedicalService(models.Model):
    name = models.CharField(max_length=255, verbose_name="Tên dịch vụ")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Giá tiền")
    created_at = models.DateTimeField(auto_now_add=True)

    def __string__(self):
        return self.name

class TimeSlot(models.Model):
    start_time = models.TimeField(verbose_name="Giờ bắt đầu")
    end_time = models.TimeField(verbose_name="Giờ kết thúc")

    def __string__(self):
        return f"{self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"
from django.contrib import admin
from .models import MedicalService, TimeSlot, Appointment


@admin.register(MedicalService)
class MedicalServiceAdmin(admin.ModelAdmin):
    """Quản lý Dịch vụ Y tế trong Django Admin."""
    list_display = ['name', 'category', 'doctor_name', 'price', 'duration_minutes', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'description', 'doctor_name']
    ordering = ['-created_at']
    fields = ['name', 'description', 'category', 'price', 'doctor_name', 'duration_minutes']


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    """Quản lý Khung giờ Khám trong Django Admin."""
    list_display = ['start_time', 'end_time', 'is_available', 'created_at']
    list_filter = ['is_available', 'created_at']
    ordering = ['start_time']
    fields = ['start_time', 'end_time', 'is_available']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """Quản lý Lịch hẹn Khám trong Django Admin."""
    list_display = ['patient_name', 'service_name', 'appointment_date', 'status', 'created_at']
    list_filter = ['status', 'appointment_date', 'created_at']
    search_fields = ['patient__full_name', 'service__name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-appointment_date']

    def patient_name(self, obj):
        return obj.patient.full_name
    patient_name.short_description = 'Bệnh nhân'

    def service_name(self, obj):
        return obj.service.name
    service_name.short_description = 'Dịch vụ'

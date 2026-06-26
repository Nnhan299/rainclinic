from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'service_name', 'time_slot_text', 'date', 'status')
    list_filter = ('status', 'date')
    search_fields = ('patient__username', 'service_name')
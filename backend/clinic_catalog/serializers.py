from rest_framework import serializers
from .models import MedicalService, TimeSlot, Appointment
from authentication.serializers import UserSerializer

class MedicalServiceSerializer(serializers.ModelSerializer):
    """Serializer cho dịch vụ y tế."""
    class Meta:
        model = MedicalService
        fields = [
            'id', 'name', 'description', 'category', 'price',
            'doctor_name', 'duration_minutes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TimeSlotSerializer(serializers.ModelSerializer):
    """Serializer cho khung giờ khám."""
    class Meta:
        model = TimeSlot
        fields = ['id', 'start_time', 'end_time', 'is_available', 'created_at']
        read_only_fields = ['id', 'created_at']


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer cho lịch hẹn khám."""
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    time_slot_display = serializers.CharField(source='time_slot.__str__', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'service', 'service_name',
            'time_slot', 'time_slot_display', 'appointment_date',
            'symptoms', 'notes', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient', 'created_at', 'updated_at']
from rest_framework import serializers
from .models import Appointment

class AppointmentAdminSerializer(serializers.ModelSerializer):
    patient_info = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'service_name', 'time_slot_text', 'date', 
            'status', 'symptoms', 'patient_info', 'created_at'
        ]

    def get_patient_info(self, obj):
        # Trích xuất thông tin người dùng từ khóa ngoại (ForeignKey)
        return {
            "username": obj.patient.username,
            "email": obj.patient.email,
            "full_name": getattr(obj.patient, 'full_name', obj.patient.username),
            "phone": getattr(obj.patient, 'phone', 'Chưa có số ĐT')
        }
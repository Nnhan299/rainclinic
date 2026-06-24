from rest_framework import serializers
from .models import MedicalService, TimeSlot, Appointment

class MedicalServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalService
        fields = '__all__'


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    patient_username = serializers.ReadOnlyField(source='patient.username')
    patient_id = serializers.ReadOnlyField(source='patient.id')

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient_id', 'patient_username', 'patient_name', 'patient_phone',
            'service', 'service_name', 'doctor_name', 'date', 'time_slot',
            'symptoms', 'status', 'created_at'
        ]
        read_only_fields = ['patient', 'service_name', 'doctor_name', 'created_at']

    def validate(self, data):
        # Check if the time slot on that date is already booked and confirmed
        date = data.get('date')
        time_slot = data.get('time_slot')
        
        if date and time_slot:
            existing = Appointment.objects.filter(
                date=date,
                time_slot=time_slot,
                status='confirmed'
            )
            # If editing, exclude current instance
            if self.instance:
                existing = existing.exclude(id=self.instance.id)
            if existing.exists():
                raise serializers.ValidationError(
                    {"time_slot": "Khung giờ này đã được đặt và xác nhận bởi người khác."}
                )
        return data

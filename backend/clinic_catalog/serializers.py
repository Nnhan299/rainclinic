from rest_framework import serializers
from .models import MedicalService, TimeSlot

class MedicalServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalService
        fields = '__all__'

class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'
"""
Serializers cho module xác thực & phân quyền RainClinic.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer đọc thông tin user (không bao gồm password)."""

    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name', 'phone',
            'role', 'role_display', 'is_active', 'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer đăng ký tài khoản mới."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'full_name', 'phone', 'role',
        ]

    def validate(self, attrs):
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        if password_confirm is not None:
            if password != password_confirm:
                raise serializers.ValidationError({
                    'password_confirm': 'Mật khẩu xác nhận không khớp.',
                })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer đổi mật khẩu."""

    old_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'},
    )
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
    )
    new_password_confirm = serializers.CharField(
        required=True,
        style={'input_type': 'password'},
    )

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Mật khẩu cũ không đúng.')
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Mật khẩu xác nhận không khớp.',
            })
        return attrs


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Serializer cập nhật hồ sơ cá nhân."""

    class Meta:
        model = User
        fields = ['full_name', 'phone', 'email']


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom TokenObtainPairSerializer để trả về thêm trường is_admin."""
    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_admin'] = self.user.role == 'admin' or self.user.is_superuser
        return data

from .models import Service, TimeSlot, Appointment

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    patientId = serializers.CharField(source='patient.id', read_only=True)
    patientName = serializers.CharField(source='patient.full_name', read_only=True)
    patientPhone = serializers.CharField(source='patient.phone', read_only=True)
    serviceId = serializers.CharField(source='service.id', read_only=True)
    serviceName = serializers.CharField(source='service.name', read_only=True)
    doctorName = serializers.CharField(source='service.doctor_name', read_only=True)
    timeSlot = serializers.CharField(source='time_slot.time', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    # Write-only fields
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(), source='service', write_only=True
    )
    slot_id = serializers.PrimaryKeyRelatedField(
        queryset=TimeSlot.objects.all(), source='time_slot', write_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            'id', 'patientId', 'patientName', 'patientPhone',
            'serviceId', 'serviceName', 'doctorName',
            'slot_id', 'service_id', 'timeSlot', 'date', 'symptoms',
            'status', 'createdAt'
        ]
        read_only_fields = ['id', 'status', 'createdAt']

    def validate(self, attrs):
        service = attrs.get('service')
        time_slot = attrs.get('time_slot')
        date = attrs.get('date')

        # Check if the slot is already booked on that date
        existing = Appointment.objects.filter(
            date=date,
            time_slot=time_slot,
        ).exclude(status='cancelled')

        if existing.exists():
            raise serializers.ValidationError({
                'slot_id': 'Khung giờ này đã được đặt kín cho ngày này. Vui lòng chọn khung giờ khác.'
            })

        return attrs

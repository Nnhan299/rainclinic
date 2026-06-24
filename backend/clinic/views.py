from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from authentication.permissions import IsAdminRole, IsOwnerOrAdmin
from .models import MedicalService, TimeSlot, Appointment
from .serializers import MedicalServiceSerializer, TimeSlotSerializer, AppointmentSerializer

class MedicalServiceViewSet(viewsets.ModelViewSet):
    """ViewSet cho phép xem danh sách dịch vụ y tế. Chỉ Admin có quyền chỉnh sửa."""
    queryset = MedicalService.objects.all()
    serializer_class = MedicalServiceSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsAdminRole]
        return [permission() for permission in permission_classes]


class TimeSlotViewSet(viewsets.ModelViewSet):
    """ViewSet quản lý các khung giờ khám bệnh."""
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsAdminRole]
        return [permission() for permission in permission_classes]


class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet quản lý lịch hẹn khám. Bệnh nhân chỉ xem và sửa lịch của mình. Admin quản lý toàn bộ."""
    serializer_class = AppointmentSerializer

    def get_permissions(self):
        # Mọi thao tác đều yêu cầu đăng nhập
        permission_classes = [permissions.IsAuthenticated]
        if self.action in ['update', 'partial_update', 'destroy', 'retrieve']:
            permission_classes.append(IsOwnerOrAdmin)
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Appointment.objects.none()
        if user.role == 'admin':
            return Appointment.objects.all()
        # Bệnh nhân chỉ xem được lịch của bản thân
        return Appointment.objects.filter(patient=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'admin':
            # Admin có thể tùy ý gán lịch hẹn cho một tài khoản bệnh nhân khác (nếu có)
            serializer.save()
        else:
            # Bệnh nhân tự đặt lịch hẹn, hệ thống tự động gán tài khoản bệnh nhân hiện tại
            serializer.save(patient=user)
            
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsOwnerOrAdmin])
    def cancel(self, request, pk=None):
        """Hủy lịch hẹn khám nhanh."""
        appointment = self.get_object()
        if appointment.status == 'cancelled':
            return Response(
                {"detail": "Lịch hẹn này đã được hủy trước đó."},
                status=status.HTTP_400_BAD_REQUEST
            )
        appointment.status = 'cancelled'
        appointment.save()
        return Response(
            {"detail": "Hủy lịch hẹn thành công.", "status": appointment.status},
            status=status.HTTP_200_OK
        )

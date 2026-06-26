from rest_framework.generics import ListAPIView, CreateAPIView, DestroyAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import MedicalService, TimeSlot, Appointment
from .serializers import MedicalServiceSerializer, TimeSlotSerializer, AppointmentSerializer
from authentication.permissions import IsAdminRole

# --- PHÂN HỆ DỊCH VỤ Y TẾ ---
class ServiceListView(ListAPIView):
    """Lấy danh sách dịch vụ (công khai)."""
    queryset = MedicalService.objects.all().order_by('-id')
    serializer_class = MedicalServiceSerializer
    permission_classes = [AllowAny]

class ServiceCreateView(CreateAPIView):
    """Tạo dịch vụ mới (chỉ Admin)."""
    queryset = MedicalService.objects.all()
    serializer_class = MedicalServiceSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

class ServiceDeleteView(DestroyAPIView):
    """Xóa dịch vụ (chỉ Admin)."""
    queryset = MedicalService.objects.all()
    serializer_class = MedicalServiceSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

# --- PHÂN HỆ KHUNG GIỜ KHÁM ---
class TimeSlotListView(ListAPIView):
    """Lấy danh sách khung giờ (công khai)."""
    queryset = TimeSlot.objects.all().order_by('start_time')
    serializer_class = TimeSlotSerializer
    permission_classes = [AllowAny]

class TimeSlotCreateView(CreateAPIView):
    """Tạo khung giờ mới (chỉ Admin)."""
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

class TimeSlotDeleteView(DestroyAPIView):
    """Xóa khung giờ (chỉ Admin)."""
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

# --- PHÂN HỆ LỊCH HẸN KHÁM ---
class AppointmentListView(ListAPIView):
    """Lấy danh sách lịch hẹn (chỉ Admin xem toàn bộ)."""
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            # Admin xem tất cả
            return Appointment.objects.all().order_by('-appointment_date')
        else:
            # Bệnh nhân chỉ xem lịch của mình
            return Appointment.objects.filter(patient=user).order_by('-appointment_date')


class AppointmentCreateView(CreateAPIView):
    """Tạo lịch hẹn mới (bệnh nhân)."""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Tự động set patient = user hiện tại, không cần frontend gửi patient_id
        serializer.save(patient=self.request.user)


class AppointmentUpdateView(UpdateAPIView):
    """Cập nhật trạng thái lịch hẹn (Admin)."""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class AppointmentDeleteView(DestroyAPIView):
    """Xóa lịch hẹn (Admin)."""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
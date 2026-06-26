"""
API Views cho module xác thực & phân quyền RainClinic.

Endpoints:
- POST /api/auth/register/      → Đăng ký tài khoản
- POST /api/auth/login/         → Đăng nhập (lấy JWT tokens)
- POST /api/auth/token/refresh/ → Làm mới access token
- GET  /api/auth/me/            → Lấy thông tin user hiện tại
- PUT  /api/auth/me/            → Cập nhật hồ sơ cá nhân
- POST /api/auth/change-password/ → Đổi mật khẩu
- GET  /api/auth/users/         → Danh sách users (chỉ Admin)
"""

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ChangePasswordSerializer,
    UpdateProfileSerializer,
    ServiceSerializer,
    TimeSlotSerializer,
    AppointmentSerializer,
)
from .permissions import IsAdminRole, IsOwnerOrAdmin
from .models import Service, TimeSlot, Appointment

User = get_user_model()


# ============================================================
# ĐĂNG KÝ
# ============================================================
class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/

    Đăng ký tài khoản mới. Trả về thông tin user + JWT tokens.
    Không yêu cầu xác thực.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Tạo JWT tokens cho user mới đăng ký
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Đăng ký thành công.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
        }, status=status.HTTP_201_CREATED)


# ============================================================
# ĐĂNG NHẬP
# ============================================================
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/auth/login/

    Đăng nhập bằng username + password. Trả về JWT tokens.
    Body: { "username": "...", "password": "..." }
    """
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response(
            {'error': 'Username và mật khẩu là bắt buộc.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(username__iexact=username)
    except User.DoesNotExist:
        return Response(
            {'error': 'Tài khoản không tồn tại.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not user.check_password(password):
        return Response(
            {'error': 'Mật khẩu không đúng.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {'error': 'Tài khoản đã bị vô hiệu hóa.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Tạo JWT tokens
    refresh = RefreshToken.for_user(user)

    return Response({
        'message': 'Đăng nhập thành công.',
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        },
    })


# ============================================================
# THÔNG TIN CÁ NHÂN (ME)
# ============================================================
class MeView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/me/ → Lấy thông tin user hiện tại
    PUT  /api/auth/me/ → Cập nhật hồ sơ cá nhân
    """
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UpdateProfileSerializer
        return UserSerializer


# ============================================================
# ĐỔI MẬT KHẨU
# ============================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    POST /api/auth/change-password/

    Đổi mật khẩu. Yêu cầu gửi old_password, new_password, new_password_confirm.
    """
    serializer = ChangePasswordSerializer(
        data=request.data,
        context={'request': request},
    )
    serializer.is_valid(raise_exception=True)

    request.user.set_password(serializer.validated_data['new_password'])
    request.user.save()

    return Response({'message': 'Đổi mật khẩu thành công.'})


# ============================================================
# QUẢN LÝ USERS (CHỈ ADMIN)
# ============================================================
class UserListView(generics.ListAPIView):
    """
    GET /api/auth/users/

    Danh sách tất cả users. Chỉ Admin mới có quyền truy cập.
    Hỗ trợ filter theo role: ?role=patient|doctor|admin
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/auth/users/<id>/ → Xem chi tiết user
    PUT    /api/auth/users/<id>/ → Cập nhật user
    DELETE /api/auth/users/<id>/ → Xóa user

    Chỉ Admin mới có quyền truy cập.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/token/
    Trả về access, refresh token và is_admin.
    """
    serializer_class = CustomTokenObtainPairSerializer

# ============================================================
# CLINIC SERVICES VIEWS (MEMBER 2)
# ============================================================
class ServiceListView(generics.ListAPIView):
    """GET /api/services/ - Xem danh sách dịch vụ (Công khai)"""
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]


class ServiceCreateView(generics.CreateAPIView):
    """POST /api/admin/services/ - Tạo mới dịch vụ (Chỉ Admin)"""
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class ServiceDeleteView(generics.DestroyAPIView):
    """DELETE /api/admin/services/<id>/ - Xóa dịch vụ (Chỉ Admin)"""
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


# ============================================================
# CLINIC TIME SLOTS VIEWS (MEMBER 2)
# ============================================================
class TimeSlotListView(generics.ListAPIView):
    """GET /api/time-slots/ - Xem khung giờ (Công khai)"""
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [AllowAny]


class TimeSlotCreateView(generics.CreateAPIView):
    """POST /api/admin/time-slots/ - Tạo khung giờ (Chỉ Admin)"""
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class TimeSlotDeleteView(generics.DestroyAPIView):
    """DELETE /api/admin/time-slots/<id>/ - Xóa khung giờ (Chỉ Admin)"""
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


# ============================================================
# APPOINTMENT VIEWS (MEMBER 3 - BOOK & CANCEL)
# ============================================================
class BookAppointmentView(generics.CreateAPIView):
    """
    POST /api/appointments/book/
    
    Đặt lịch hẹn mới. Yêu cầu đăng nhập.
    Tự động gán patient là user đang đăng nhập.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)


class CancelAppointmentView(generics.UpdateAPIView):
    """
    PUT /api/appointments/<id>/cancel/
    
    Khách hàng chủ động hủy lịch. Yêu cầu đăng nhập & quyền sở hữu/admin.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def update(self, request, *args, **kwargs):
        appointment = self.get_object()
        
        # Patients can only cancel if appointment is pending
        if appointment.status != 'pending' and request.user.role != 'admin':
            return Response(
                {'error': 'Chỉ có thể hủy lịch hẹn ở trạng thái đang chờ duyệt.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        appointment.status = 'cancelled'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)


class PatientAppointmentListView(generics.ListAPIView):
    """
    GET /api/appointments/
    
    Lấy danh sách lịch hẹn của bệnh nhân hiện tại.
    """
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Appointment.objects.all()
        return Appointment.objects.filter(patient=self.request.user)


# ============================================================
# APPOINTMENT ADMIN VIEWS (MEMBER 4 - LIST & CONFIRM)
# ============================================================
class AdminAppointmentListView(generics.ListAPIView):
    """
    GET /api/admin/appointments/
    
    Danh sách toàn bộ lịch hẹn kèm bộ lọc theo ngày và trạng thái.
    """
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = Appointment.objects.all()
        date = self.request.query_params.get('date')
        status_param = self.request.query_params.get('status')
        if date:
            queryset = queryset.filter(date=date)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset


class ConfirmAppointmentView(generics.UpdateAPIView):
    """
    PUT /api/admin/appointments/<id>/confirm/
    
    Phê duyệt/Xác nhận lịch hẹn.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def update(self, request, *args, **kwargs):
        appointment = self.get_object()
        appointment.status = 'confirmed'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

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
)
from .permissions import IsAdminRole

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

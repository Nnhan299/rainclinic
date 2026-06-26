"""
URL patterns cho module xác thực & phân quyền.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = 'authentication'

urlpatterns = [
    # Đăng ký & Đăng nhập
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # JWT Token refresh
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Hồ sơ cá nhân
    path('me/', views.MeView.as_view(), name='me'),
    path('change-password/', views.change_password_view, name='change-password'),

    # Quản lý users (Admin only)
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
]

"""
Custom permissions cho RainClinic.

Hệ thống phân quyền dựa trên vai trò (Role-Based Access Control):
- IsPatient: Chỉ bệnh nhân
- IsDoctor: Chỉ bác sĩ
- IsAdminRole: Chỉ quản trị viên
- IsAdminOrDoctor: Bác sĩ hoặc quản trị viên
- IsOwnerOrAdmin: Chủ sở hữu tài nguyên hoặc admin
"""

from rest_framework.permissions import BasePermission


class IsPatient(BasePermission):
    """Chỉ cho phép bệnh nhân truy cập."""
    message = 'Chỉ bệnh nhân mới có quyền truy cập chức năng này.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'patient'
        )


class IsDoctor(BasePermission):
    """Chỉ cho phép bác sĩ truy cập."""
    message = 'Chỉ bác sĩ mới có quyền truy cập chức năng này.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'doctor'
        )


class IsAdminRole(BasePermission):
    """Chỉ cho phép quản trị viên truy cập."""
    message = 'Chỉ quản trị viên mới có quyền truy cập chức năng này.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsAdminOrDoctor(BasePermission):
    """Cho phép quản trị viên hoặc bác sĩ truy cập."""
    message = 'Chỉ quản trị viên hoặc bác sĩ mới có quyền truy cập.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('admin', 'doctor')
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Cho phép truy cập nếu:
    - User là chủ sở hữu của tài nguyên (obj.user == request.user)
    - Hoặc user có vai trò admin
    """
    message = 'Bạn không có quyền truy cập tài nguyên này.'

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True

        # Kiểm tra ownership: hỗ trợ cả obj.user và obj.patient
        owner = getattr(obj, 'user', None) or getattr(obj, 'patient', None)
        return owner == request.user

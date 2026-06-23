"""
Tests cho module xác thực & phân quyền RainClinic.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AuthenticationTests(TestCase):
    """Test suite cho xác thực (đăng ký, đăng nhập, JWT)."""

    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.me_url = '/api/auth/me/'

        # Tạo user mẫu
        self.test_user = User.objects.create_user(
            username='testuser',
            password='TestPass123!',
            email='test@rainclinic.med',
            full_name='Test User',
            phone='+84 123 456 789',
            role='patient',
        )

    def test_register_success(self):
        """Đăng ký thành công trả về user + tokens."""
        data = {
            'username': 'newpatient',
            'email': 'new@rainclinic.med',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
            'full_name': 'Nguyễn Văn Mới',
            'phone': '+84 999 888 777',
            'role': 'patient',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

    def test_register_password_mismatch(self):
        """Đăng ký với mật khẩu không khớp → lỗi 400."""
        data = {
            'username': 'newuser',
            'email': 'new@test.com',
            'password': 'StrongPass123!',
            'password_confirm': 'DifferentPass456!',
            'full_name': 'Test',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_username(self):
        """Đăng ký trùng username → lỗi 400."""
        data = {
            'username': 'testuser',  # Đã tồn tại
            'email': 'dup@test.com',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
            'full_name': 'Duplicate',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        """Đăng nhập đúng username/password → trả về tokens."""
        data = {'username': 'testuser', 'password': 'TestPass123!'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_login_wrong_password(self):
        """Đăng nhập sai mật khẩu → lỗi 401."""
        data = {'username': 'testuser', 'password': 'WrongPassword'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user(self):
        """Đăng nhập user không tồn tại → lỗi 404."""
        data = {'username': 'nobody', 'password': 'whatever'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_me_authenticated(self):
        """GET /me/ khi đã xác thực → trả về thông tin user."""
        # Login first
        login_resp = self.client.post(
            self.login_url,
            {'username': 'testuser', 'password': 'TestPass123!'},
            format='json',
        )
        token = login_resp.data['tokens']['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_me_unauthenticated(self):
        """GET /me/ khi chưa xác thực → lỗi 401."""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PermissionTests(TestCase):
    """Test suite cho phân quyền (role-based)."""

    def setUp(self):
        self.client = APIClient()
        self.login_url = '/api/auth/login/'
        self.users_url = '/api/auth/users/'

        # Tạo admin user
        self.admin_user = User.objects.create_user(
            username='adminuser',
            password='AdminPass123!',
            email='admin@rainclinic.med',
            full_name='Admin User',
            role='admin',
        )

        # Tạo patient user
        self.patient_user = User.objects.create_user(
            username='patientuser',
            password='PatientPass123!',
            email='patient@rainclinic.med',
            full_name='Patient User',
            role='patient',
        )

    def _get_token(self, username, password):
        """Helper: lấy access token."""
        resp = self.client.post(
            self.login_url,
            {'username': username, 'password': password},
            format='json',
        )
        return resp.data['tokens']['access']

    def test_admin_can_list_users(self):
        """Admin có thể xem danh sách users."""
        token = self._get_token('adminuser', 'AdminPass123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_patient_cannot_list_users(self):
        """Bệnh nhân không thể xem danh sách users → lỗi 403."""
        token = self._get_token('patientuser', 'PatientPass123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_filter_by_role(self):
        """Admin có thể filter users theo role."""
        token = self._get_token('adminuser', 'AdminPass123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get(f'{self.users_url}?role=patient')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

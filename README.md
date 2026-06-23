# RainClinic - Hệ thống Quản lý Phòng khám Thông minh 🏥✨

[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django-5.1-green.svg)](https://www.djangoproject.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

**RainClinic** là một ứng dụng web quản lý phòng khám hiện đại và thông minh, được chia thành **Frontend** (React + Vite) và **Backend** (Django + DRF) để dễ phát triển và bảo trì.

---

## 📂 Cấu trúc Thư mục

```text
rainclinic/
├── frontend/                   # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/         # Các module thành phần chính
│   │   │   ├── AuthModule.tsx
│   │   │   ├── PatientPortal.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── Navbar.tsx
│   │   ├── data/mockData.ts
│   │   ├── types.ts
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                    # Django + Django REST Framework
│   ├── config/                 # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── authentication/         # Module xác thực & phân quyền
│   │   ├── models.py           # Custom User model (patient/doctor/admin)
│   │   ├── serializers.py      # DRF serializers
│   │   ├── views.py            # API endpoints
│   │   ├── urls.py             # URL routing
│   │   ├── permissions.py      # Role-based permissions
│   │   ├── admin.py            # Django admin config
│   │   └── tests.py            # Unit tests
│   ├── manage.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## 🌟 Tính năng

### 🎨 Frontend (React + Vite + TailwindCSS)
- **Cổng thông tin Bệnh nhân**: Đặt lịch khám, xem dịch vụ, quản lý lịch hẹn
- **Trang Quản trị viên**: Thống kê, duyệt lịch, quản lý dịch vụ & khung giờ
- **Giao diện Glassmorphism** sang trọng, responsive, animation mượt mà

### 🔐 Backend - Xác thực & Phân quyền (Django + DRF)
- **Custom User Model**: Hỗ trợ 3 vai trò (patient, doctor, admin)
- **JWT Authentication**: Đăng nhập/đăng ký trả về access + refresh token
- **Role-Based Permissions**: `IsPatient`, `IsDoctor`, `IsAdminRole`, `IsOwnerOrAdmin`
- **API Endpoints**:
  | Method | Endpoint | Mô tả | Quyền |
  |--------|----------|-------|-------|
  | POST | `/api/auth/register/` | Đăng ký | Public |
  | POST | `/api/auth/login/` | Đăng nhập | Public |
  | POST | `/api/auth/token/refresh/` | Refresh JWT token | Public |
  | GET/PUT | `/api/auth/me/` | Xem/sửa hồ sơ cá nhân | Authenticated |
  | POST | `/api/auth/change-password/` | Đổi mật khẩu | Authenticated |
  | GET | `/api/auth/users/` | Danh sách users | Admin only |
  | GET/PUT/DELETE | `/api/auth/users/<id>/` | Chi tiết user | Admin only |

---

## 🚀 Hướng dẫn Chạy dự án

### Frontend

```bash
cd frontend
npm install
npm run dev
```
→ Truy cập: [http://localhost:3000](http://localhost:3000)

### Backend

```bash
cd backend

# Tạo virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo database & migration
python manage.py makemigrations
python manage.py migrate

# Tạo superuser (admin)
python manage.py createsuperuser

# Chạy server
python manage.py runserver 5000
```
→ API: [http://localhost:5000/api/auth/](http://localhost:5000/api/auth/)
→ Admin panel: [http://localhost:5000/admin/](http://localhost:5000/admin/)

### Chạy Tests

```bash
cd backend
python manage.py test authentication
```

---

## 🛠️ Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 19, Vite 6, TypeScript, Tailwind CSS v4, Motion, Lucide React |
| Backend | Python, Django 5.1, Django REST Framework, SimpleJWT |
| Database | SQLite (dev), PostgreSQL (production) |

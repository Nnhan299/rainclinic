import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = 'http://localhost:8000/api/clinic_catalog';
const AUTH_URL = 'http://localhost:8000/api/auth';

// 1. Hàm bóc tách lấy Token sạch từ localStorage
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('rc_access_token') || localStorage.getItem('access_token');
  return token && token.trim() ? token.trim() : null;
};

// 2. Khởi tạo Instance Axios chuyên dụng
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Đính kèm Access Token mới nhất vào header trước khi gửi đi
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();
  if (token) {
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Tự động Refresh Token ngầm khi dính lỗi 401
client.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 Unauthorized và Request này chưa từng được thử lại
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('rc_refresh_token') || localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          console.log("🔄 Access Token hết hạn. Đang tự động gọi sang phân hệ /api/auth để refresh...");
          
          // Gọi API đổi token mới chạy theo đúng định tuyến authentication.urls của Django
          const refreshResponse = await axios.post(`${AUTH_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = refreshResponse.data.access;

          // Lưu Access Token mới tinh vào bộ nhớ
          if (localStorage.getItem('rc_access_token')) {
            localStorage.setItem('rc_access_token', newAccessToken);
          } else {
            localStorage.setItem('access_token', newAccessToken);
          }

          // Cập nhật lại Token mới vào Request bị lỗi trước đó và chạy lại ngầm
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          console.log("✅ Làm mới Token thành công! Đang thực hiện lại request ban đầu...");
          return client(originalRequest);
        } catch (refreshError) {
          console.error("❌ Cả Refresh token cũng đã hết hạn. Ép buộc đăng xuất.");
        }
      }

      // Nếu không có refresh token hoặc đổi token thất bại -> Dọn dẹp LocalStorage
      localStorage.removeItem('rc_access_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('rc_refresh_token');
      localStorage.removeItem('refresh_token');
    }

    return Promise.reject(error);
  }
);

// Helper bóc tách dữ liệu mảng an toàn từ Django trả về
const unwrapResponseData = (response: AxiosResponse) => {
  const data = response.data;
  if (data && data.results && Array.isArray(data.results)) return data.results;
  if (data && data.data && Array.isArray(data.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

// 3. Export Service (Bỏ bọc try-catch rỗng ở các hàm GET để Interceptor làm nhiệm vụ)
export const adminCatalogService = {
  // ==================== QUẢN LÝ DỊCH VỤ ====================
  getAllServices: async () => {
    const response = await client.get('/services/');
    return unwrapResponseData(response);
  },

  createService: async (serviceData: any) => {
    const response = await client.post('/admin/services/', serviceData);
    return response.data;
  },

  deleteService: async (id: string) => {
    await client.delete(`/admin/services/${id}/`);
    return true;
  },

  // ==================== QUẢN LÝ KHUNG GIỜ ====================
  getAllTimeSlots: async () => {
    const response = await client.get('/time_slots/');
    return unwrapResponseData(response);
  },

  createTimeSlot: async (timeSlotData: any) => {
    const response = await client.post('/admin/time_slots/', timeSlotData);
    return response.data;
  },

  deleteTimeSlot: async (id: string) => {
    await client.delete(`/admin/time_slots/${id}/`);
    return true;
  },

  // ==================== QUẢN LÝ LỊCH HẸN ====================
  getAllAppointments: async () => {
    // Để lỗi tự nhiên đi qua Interceptor xử lý, không dùng try-catch bọc rỗng làm nuốt mất luồng retry
    const response = await client.get('/appointments/');
    return unwrapResponseData(response);
  },

  getUserAppointments: async () => {
    const response = await client.get('/appointments/');
    return response.data;
  },

  createAppointment: async (appointmentData: any) => {
    const response = await client.post('/appointments/create/', {
      service: appointmentData.service,
      time_slot: appointmentData.time_slot,
      appointment_date: appointmentData.appointment_date,
      symptoms: appointmentData.symptoms || '',
      notes: appointmentData.notes || '',
    });
    return response.data;
  },

  // updateAppointmentStatus: async (id: string, status: string) => {
  //   const djangoStatus = status === 'cancelled' ? 'canceled' : status;
  //   const response = await client.patch(`/appointments/${id}/update/`, { status: djangoStatus });
  //   return response.data;
  // },

  // cancelAppointment: async (id: string) => {
  //   const response = await client.patch(`/appointments/${id}/update/`, { status: 'canceled' });
  //   return response.data;
  // },
  // Hàm cập nhật trạng thái tổng quát
  updateAppointmentStatus: async (id: string, status: string) => {
    // Chuẩn hóa chuỗi trạng thái: loại bỏ khoảng trắng và chuyển về chữ thường để so sánh
    const lowerStatus = status.trim().toLowerCase();
    
    // Tạo biến gửi lên phù hợp với cấu trúc DB Backend của bạn
    let djangoStatus = lowerStatus;
    if (lowerStatus === 'cancelled' || lowerStatus === 'canceled') {
      // THỬ NGHIỆM: Nếu backend của bạn dùng 2 chữ l, hãy đổi thành 'cancelled'
      djangoStatus = 'cancelled'; 
    }

    const response = await client.patch(`/appointments/${id}/update/`, { 
      status: djangoStatus 
    });
    return response.data;
  },

  // Hàm hủy lịch hẹn trực tiếp từ cổng bệnh nhân
  cancelAppointment: async (id: string) => {
    // Đảm bảo URL có đủ dấu gạch chéo cuối cùng để tránh lỗi router Django
    const response = await client.patch(`/appointments/${id}/update/`, { 
      status: 'cancelled' // Nếu vẫn lỗi 400, hãy thử đổi chữ này thành 'cancelled'
    });
    return response.data;
  },

  deleteAppointment: async (id: string) => {
    await client.delete(`/appointments/${id}/delete/`);
    return { success: true };
  },

  // ==================== QUẢN LÝ BÁC SĨ (ADMIN ONLY) ====================
  getAllDoctors: async () => {
    const token = getAuthToken();
    const response = await axios.get(`${AUTH_URL}/users/?role=doctor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    // Trả về danh sách user bác sĩ
    return response.data.results || response.data || [];
  },

  createDoctor: async (doctorData: any) => {
    const response = await axios.post(`${AUTH_URL}/register/`, {
      ...doctorData,
      role: 'doctor'
    });
    return response.data.user;
  },

  deleteDoctor: async (id: number | string) => {
    const token = getAuthToken();
    await axios.delete(`${AUTH_URL}/users/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return true;
  },
};
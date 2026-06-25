/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, X, AlertTriangle, Key, Users, Calendar, Sparkles, 
  Settings, Info, ShieldAlert, HeartPulse, UserCircle 
} from 'lucide-react';

import { User, MedicalService, TimeSlot, Appointment } from './types';
import {
  DEFAULT_SERVICES,
  DEFAULT_TIME_SLOTS,
  DEFAULT_USERS,
  DEFAULT_APPOINTMENTS,
} from './data/mockData';
import { adminCatalogService } from './services/adminCatalogService';

import Navbar from './components/Navbar';
import AuthModule from './components/AuthModule';
import PatientPortal from './components/PatientPortal';
import AdminDashboard from './components/AdminDashboard';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rc_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [services, setServices] = useState<MedicalService[]>(DEFAULT_SERVICES);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(DEFAULT_TIME_SLOTS);
  const [appointments, setAppointments] = useState<Appointment[]>(DEFAULT_APPOINTMENTS);

  const [currentTab, setCurrentTab] = useState<'auth' | 'patient' | 'admin'>(() => {
    const savedUser = localStorage.getItem('rc_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser) as User;
        return u.role === 'admin' ? 'admin' : 'patient';
      } catch {}
    }
    return 'auth'; // Bắt đầu ở trang đăng nhập/đăng ký nếu chưa đăng nhập
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rc_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('rc_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const loadCatalogData = async () => {
      try {
        const [serviceResult, slotResult, appointmentResult] = await Promise.allSettled([
          adminCatalogService.getAllServices(),
          adminCatalogService.getAllTimeSlots(),
          currentUser ? adminCatalogService.getAllAppointments() : Promise.resolve([]),
        ]);

        // Nếu lỗi không lấy được từ DB, để mảng rỗng chứ không lấy dữ liệu giả đè lên
        if (serviceResult.status === 'fulfilled' && Array.isArray(serviceResult.value)) {
          setServices(serviceResult.value.map(mapServiceFromApi));
        } else {
          console.error('Lỗi tải dịch vụ:', serviceResult.status === 'rejected' ? serviceResult.reason : 'Sai format');
          setServices([]); // Trả về mảng rỗng để dễ debug lỗi API
        }

        if (slotResult.status === 'fulfilled' && Array.isArray(slotResult.value)) {
          setTimeSlots(slotResult.value.map(mapTimeSlotFromApi));
        } else {
          console.error('Lỗi tải khung giờ:', slotResult.status === 'rejected' ? slotResult.reason : 'Sai format');
          setTimeSlots([]);
        }

        if (appointmentResult.status === 'fulfilled' && Array.isArray(appointmentResult.value)) {
          setAppointments(appointmentResult.value.map(mapAppointmentFromApi));
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error('Không thể tải dữ liệu từ backend:', error);
      }
    };

    loadCatalogData();
  }, [currentUser]);

  // ----------------------------------------------------
  // TOAST EMITTER UTILITY
  // ----------------------------------------------------
  const handleShowToast = (message: string, type: 'success' | 'error' | 'info') => {
    const newId = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev: Toast[]) => [...prev, { id: newId, message, type }]);

    // Auto-destruct toast after 4000ms
    setTimeout(() => {
      setToasts((prev: Toast[]) => prev.filter((t: Toast) => t.id !== newId));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev: Toast[]) => prev.filter((t: Toast) => t.id !== id));
  };

  const mapServiceFromApi = (item: any): MedicalService => ({
    id: String(item.id),
    // Ưu tiên các key tiếng Việt/Snake case từ Django API trả về
    name: item.ten_dich_vu || item.name || '',
    category: item.danh_muc || item.category || 'Wellness & General',
    durationMin: Number(item.thoi_luong || item.duration_minutes || item.durationMin || 30),
    price: Number(item.gia_tien || item.price || 0),
    description: item.mo_ta || item.description || '',
    doctorName: item.ten_bac_si || item.doctor_name || item.doctorName || 'BS. Đang cập nhật',
  });

  const mapTimeSlotFromApi = (item: any): TimeSlot => {
    // Hỗ trợ cả trường tiếng Việt từ Model Django
    const start = item.gio_bat_dau || item.start_time || item.startTime || '';
    const end = item.gio_ket_thuc || item.end_time || item.endTime || '';
    
    let timeLabel = item.time || '';
    if (start && end) {
      timeLabel = `${String(start).slice(0, 5)} - ${String(end).slice(0, 5)}`;
    }
    
    return {
      id: String(item.id),
      time: timeLabel,
      // Django BooleanField thường đặt tên dạng snake_case
      isAvailable: item.is_available ?? item.is_active ?? item.isAvailable ?? true,
    };
  };

  const mapAppointmentFromApi = (item: any): Appointment => ({
    id: String(item.id),
    patientId: String(item.patient ?? item.patientId ?? ''),
    patientName: item.patient_name || item.patientName || '',
    patientPhone: item.patient_phone || item.patientPhone || '',
    serviceId: String(item.service ?? item.serviceId ?? ''),
    serviceName: item.service_name || item.serviceName || '',
    doctorName: item.doctor_name || item.doctorName || '',
    date: item.appointment_date || item.date || '',
    timeSlot: item.time_slot_display || item.timeSlot || '',
    symptoms: item.symptoms || '',
    status: item.status === 'canceled' ? 'cancelled' : item.status || 'pending',
    createdAt: item.created_at || item.createdAt || '',
  });

  // ----------------------------------------------------
  // CORE WORKFLOW HANDLERS
  // ----------------------------------------------------

  // ==================== USER MANAGEMENT ====================
  
  // Xử lý đăng nhập thành công - Nhận thông tin User từ AuthModule
  const handleLogin = (user: User) => {
    // AuthModule đã xác thực thành công và lưu tokens vào localStorage
    setCurrentUser(user);
    
    // Chỉ giữ lại check user.role chuẩn theo interface User của bạn
    if (user.role === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('patient');
    }
  };

  // Xử lý đăng ký tài khoản mới thành công
  const handleRegister = (newUser: User) => {
    // Tự động đăng nhập và đưa bệnh nhân vào phân hệ quản lý cá nhân
    setCurrentUser(newUser);
    setCurrentTab('patient');
  };

  // Xử lý đăng xuất hệ thống
  const handleLogout = () => {
    // 1. Reset sạch trạng thái UI về màn hình Auth ban đầu
    setCurrentUser(null);
    setCurrentTab('auth');
    
    // 2. DỌN SẠCH TẤT CẢ các biến thể key token có thể tồn tại trong LocalStorage
    const tokensToClear = [
      'rc_access_token',
      'rc_refresh_token',
      'rc_is_admin',
      'access_token',
      'refresh_token'
    ];
    tokensToClear.forEach(key => localStorage.removeItem(key));
    
    // 3. Thông báo cho người dùng
    handleShowToast('Đã đăng xuất khỏi phiên làm việc RainClinic.', 'info');
  };


  // APPOINTMENT BOOKING HANDLER
  const handleBookAppointment = async (bookingData: {
    serviceId: string;
    date: string;
    timeSlot: string;
    symptoms: string;
  }) => {
    const selectedService = services.find((s: MedicalService) => String(s.id) === String(bookingData.serviceId));
    if (!selectedService || !currentUser) {
      handleShowToast('Không tìm thấy dịch vụ tương ứng hoặc bạn chưa đăng nhập.', 'error');
      return false;
    }

    // Tìm khung giờ: Đảm bảo trường so sánh khớp nhau (ví dụ: cùng là slot.id hoặc slot.time)
    const selectedTimeSlot = timeSlots.find((slot: TimeSlot) => slot.time === bookingData.timeSlot);
    
    const serviceId = Number(selectedService.id);
    const timeSlotId = Number(selectedTimeSlot?.id);

    // Kiểm tra tính hợp lệ của ID từ DB thực tế
    if (isNaN(serviceId) || isNaN(timeSlotId)) {
      handleShowToast('Dữ liệu dịch vụ hoặc khung giờ không hợp lệ (Lỗi ID định dạng chuỗi Mockup).', 'error');
      return false;
    }

    try {
      const createdAppointment = await adminCatalogService.createAppointment({
        service: serviceId,
        time_slot: timeSlotId,
        appointment_date: bookingData.date,
        symptoms: bookingData.symptoms,
        notes: '',
      });

      setAppointments((prev: Appointment[]) => [mapAppointmentFromApi(createdAppointment), ...prev]);
      handleShowToast('Đặt lịch thành công. Dữ liệu đã được lưu vào MySQL.', 'success');
      return true;
    } catch (error) {
      console.error('Không thể đặt lịch:', error);
      handleShowToast('Không thể kết nối đến máy chủ đặt lịch.', 'error');
      return false;
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await adminCatalogService.cancelAppointment(id);
      setAppointments((prev: Appointment[]) =>
        prev.map((apt: Appointment) =>
          apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
        )
      );
      handleShowToast('Yêu cầu đặt lịch hẹn đã được chuyển sang trạng thái HỦY LỊCH.', 'success');
    } catch (error) {
      console.error('Không thể hủy lịch:', error);
      handleShowToast('Không thể cập nhật trạng thái lịch hẹn trên máy chủ.', 'error');
    }
  };

  const handleApproveAppointment = async (id: string) => {
    try {
      await adminCatalogService.updateAppointmentStatus(id, 'confirmed');
      setAppointments((prev: Appointment[]) =>
        prev.map((apt: Appointment) =>
          apt.id === id ? { ...apt, status: 'confirmed' as const } : apt
        )
      );
      handleShowToast('Phê duyệt thành công! Ca hẹn kiểm tra y khoa đã khóa giờ thành công.', 'success');
    } catch (error) {
      console.error('Không thể phê duyệt lịch:', error);
      handleShowToast('Không thể phê duyệt lịch hẹn.', 'error');
    }
  };

  const handleAddService = async (newService: MedicalService) => {
    try {
      const createdService = await adminCatalogService.createService({
        name: newService.name,
        description: newService.description,
        category: newService.category,
        price: newService.price,
        doctor_name: newService.doctorName,
        duration_minutes: newService.durationMin,
      });
      setServices((prev: MedicalService[]) => [mapServiceFromApi(createdService), ...prev]);
    } catch (error) {
      console.error('Không thể lưu dịch vụ vào backend:', error);
      handleShowToast('Không thể lưu dịch vụ vào cơ sở dữ liệu.', 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await adminCatalogService.deleteService(id);
      setServices((prev: MedicalService[]) => prev.filter((s: MedicalService) => s.id !== id));
      handleShowToast('Dịch vụ y tế dỡ bỏ khỏi danh sách vận hành hoạt động đầu mối.', 'error');
    } catch (error) {
      console.error('Không thể xóa dịch vụ:', error);
      handleShowToast('Không thể xóa dịch vụ khỏi cơ sở dữ liệu.', 'error');
    }
  };

  const handleAddTimeSlot = async (time: string) => {
    try {
      const [startTime, endTime] = time.split('-').map((item) => item.trim());
      const createdSlot = await adminCatalogService.createTimeSlot({
        start_time: startTime,
        end_time: endTime || startTime,
        is_available: true,
      });
      setTimeSlots((prev: TimeSlot[]) => [mapTimeSlotFromApi(createdSlot), ...prev]);
    } catch (error) {
      console.error('Không thể lưu khung giờ vào backend:', error);
      handleShowToast('Không thể lưu khung giờ vào cơ sở dữ liệu.', 'error');
    }
  };

  const handleDeleteTimeSlot = async (id: string) => {
    try {
      await adminCatalogService.deleteTimeSlot(id);
      setTimeSlots((prev: TimeSlot[]) => prev.filter((s: TimeSlot) => s.id !== id));
      handleShowToast('Đã xóa ca giờ hoạt động tương ứng khỏi bệnh viện.', 'error');
    } catch (error) {
      console.error('Không thể xóa khung giờ:', error);
      handleShowToast('Không thể xóa khung giờ khỏi cơ sở dữ liệu.', 'error');
    }
  };



  return (
    <div id="app-viewport" className="min-h-screen bg-[#f8fafc] flex flex-col justify-between font-sans">
      
      <div>
        {/* Sticky Global Navigation */}
        <Navbar
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
  
        {/* Core App Shell */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 pb-24 pt-8">
          
          <AnimatePresence mode="wait">
            {currentTab === 'auth' && (
              <motion.div
                key="tab-auth-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                id="view-auth"
              >
                <AuthModule
                  onLogin={handleLogin}
                  existingUsers={DEFAULT_USERS}
                  onRegister={handleRegister}
                  onShowToast={handleShowToast}
                />
              </motion.div>
            )}
  
            {currentTab === 'patient' && (
              <motion.div
                key="tab-patient-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                id="view-patient"
              >
                {/* Fallback to authorize context helper */}
                {!currentUser ? (
                  <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-md max-w-lg mx-auto space-y-6">
                    <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-900 mx-auto">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900 text-xl">Yêu Cầu Đăng Nhập</h3>
                      <p className="text-slate-500 text-sm">
                        Bạn đang cố gắng truy cập cổng đặt lịch của bệnh nhân. Vui lòng đăng nhập hoặc sử dụng bảng điều hướng chuyển nhanh vai trò giả lập ở trên để bắt đầu thử nghiệm.
                      </p>
                    </div>
                    <button
                      id="btn-goto-login-fallback"
                      type="button"
                      onClick={() => setCurrentTab('auth')}
                      className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      Đăng Nhập Ngay
                    </button>
                  </div>
                ) : (
                  <PatientPortal
                    services={services}
                    timeSlots={timeSlots}
                    appointments={appointments}
                    currentUser={currentUser}
                    onBookAppointment={handleBookAppointment}
                    onCancelAppointment={handleCancelAppointment}
                    onShowToast={handleShowToast}
                  />
                )}
              </motion.div>
            )}
  
            {currentTab === 'admin' && (
              <motion.div
                key="tab-admin-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                id="view-admin"
              >
                {/* Fallback to Admin verification warning */}
                {(!currentUser || currentUser.role !== 'admin') && (
                  <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-md max-w-lg mx-auto space-y-6">
                    <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto animate-pulse">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900 text-xl">Yêu Cầu Thẩm Quyền Quản Trị Viên</h3>
                      <p className="text-slate-500 text-sm font-medium">
                        Bạn đang cố gắng điều phối với tư cách là bệnh nhân vãng lai. Bảng vận hành bệnh điện tử chỉ được mở cho Ban giám đốc hoặc cán bộ kỹ thuật tương ứng.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <button
                        id="btn-goto-auth-admin"
                        type="button"
                        onClick={() => setCurrentTab('auth')}
                        className="px-5 py-2 text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        Đăng nhập bằng tài khoản Admin
                      </button>
                    </div>
                  </div>
                )}

                {currentUser && currentUser.role === 'admin' && (
                  <AdminDashboard
                    services={services}
                    timeSlots={timeSlots}
                    appointments={appointments}
                    onApproveAppointment={handleApproveAppointment}
                    onCancelAppointment={handleCancelAppointment}
                    onAddService={handleAddService}
                    onDeleteService={handleDeleteService}
                    onAddTimeSlot={handleAddTimeSlot}
                    onDeleteTimeSlot={handleDeleteTimeSlot}
                    onShowToast={handleShowToast}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* Persistent Footer and Interactive Reviewers Instruction panel */}
      <footer id="app-footer" className="bg-white border-t border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-teal-600 animate-pulse shrink-0" />
            <span className="text-xs text-slate-400 font-medium">
              &copy; 2026 Hệ thống Điều Hành Phòng Khám Thông Minh RainClinic. Bản quyền được bảo lưu.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">

            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span>Đồng bộ LocalStorage</span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toasts Emitters Render Frame */}
      <div id="toasts-portal" className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => {
            let iconEl = <Info className="w-4 h-4 text-blue-500 shrink-0" />;
            let colorCls = 'bg-blue-50 border-blue-200 text-blue-800';

            if (t.type === 'success') {
              iconEl = <Check className="w-4 h-4 text-emerald-500 shrink-0" />;
              colorCls = 'bg-emerald-50 border-emerald-200 text-emerald-800';
            } else if (t.type === 'error') {
              iconEl = <X className="w-4 h-4 text-red-500 shrink-0" />;
              colorCls = 'bg-red-50 border-red-200 text-red-800';
            }

            return (
              <motion.div
                key={t.id}
                id={t.id}
                initial={{ opacity: 0, y: 15, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 justify-between ${colorCls} max-w-sm`}
              >
                <div className="flex gap-2.5">
                  <div className="mt-0.5">{iconEl}</div>
                  <p className="text-xs font-semibold leading-relaxed">{t.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="text-slate-400 hover:text-slate-800 transition-colors shrink-0 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}

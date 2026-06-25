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
  DEFAULT_APPOINTMENTS 
} from './data/mockData';

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
  // ----------------------------------------------------
  // LOCAL STORAGE PERSISTENCE MANAGERS
  // ----------------------------------------------------
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rc_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_USERS[0]; // Jane Doe (Patient)
      }
    }
    // Default to Patient (Jane Doe) to make it ready-to-test
    return DEFAULT_USERS[0];
  });

  const [services, setServices] = useState<MedicalService[]>(() => {
    const saved = localStorage.getItem('rc_services');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_SERVICES;
  });

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => {
    const saved = localStorage.getItem('rc_timeslots');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_TIME_SLOTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('rc_appointments');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_APPOINTMENTS;
  });

  const [currentTab, setCurrentTab] = useState<'auth' | 'patient' | 'admin'>(() => {
    const savedUser = localStorage.getItem('rc_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser) as User;
        return u.role === 'admin' ? 'admin' : 'patient';
      } catch {}
    }
    return 'patient'; // Default tab matching user
  });

  // Toasts notification pipeline
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ----------------------------------------------------
  // API UTILITY & SYNC EFFECT HOOKS
  // ----------------------------------------------------
  const API_BASE = 'http://localhost:8000/api';

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('rc_access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || 'Có lỗi xảy ra');
    }

    return response.json();
  };

  // Fetch Services & Time Slots on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const servicesData = await apiRequest('/services/');
        if (Array.isArray(servicesData)) {
          setServices(servicesData.map((s: any) => ({
            id: s.id.toString(),
            name: s.name,
            category: s.category,
            durationMin: s.duration_min,
            price: s.price,
            doctorName: s.doctor_name,
            description: s.description,
          })));
        }
      } catch (err) {
        console.warn('Backend services not accessible, using mock data.', err);
      }

      try {
        const slotsData = await apiRequest('/time-slots/');
        if (Array.isArray(slotsData)) {
          setTimeSlots(slotsData.map((slot: any) => ({
            id: slot.id.toString(),
            time: slot.time,
            isAvailable: slot.is_available,
          })));
        }
      } catch (err) {
        console.warn('Backend time slots not accessible, using mock data.', err);
      }
    };

    loadInitialData();
  }, []);

  // Fetch Appointments when user logs in
  useEffect(() => {
    if (!currentUser) {
      setAppointments([]);
      return;
    }

    const loadAppointments = async () => {
      try {
        const aptsData = await apiRequest('/appointments/');
        if (Array.isArray(aptsData)) {
          setAppointments(aptsData.map((apt: any) => ({
            id: apt.id.toString(),
            patientId: apt.patientId,
            patientName: apt.patientName,
            patientPhone: apt.patientPhone,
            serviceId: apt.serviceId,
            serviceName: apt.serviceName,
            doctorName: apt.doctorName,
            date: apt.date,
            timeSlot: apt.timeSlot,
            symptoms: apt.symptoms,
            status: apt.status,
            createdAt: apt.createdAt,
          })));
        }
      } catch (err) {
        console.warn('Backend appointments not accessible.', err);
      }
    };

    loadAppointments();
  }, [currentUser]);

  // ----------------------------------------------------
  // WRITE STORAGE UPDATES TO LOCAL STORAGE
  // ----------------------------------------------------
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rc_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('rc_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('rc_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('rc_timeslots', JSON.stringify(timeSlots));
  }, [timeSlots]);

  useEffect(() => {
    localStorage.setItem('rc_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // ----------------------------------------------------
  // TOAST EMITTER UTILITY
  // ----------------------------------------------------
  const handleShowToast = (message: string, type: 'success' | 'error' | 'info') => {
    const newId = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id: newId, message, type }]);

    // Auto-destruct toast after 4000ms
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newId));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ----------------------------------------------------
  // CORE WORKFLOW HANDLERS
  // ----------------------------------------------------

  // USER MANAGEMENT
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Auto shift tab based on role
    if (user.role === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('patient');
    }
  };

  const handleRegister = (newUser: User) => {
    // We register but also automatically login as this user
    setCurrentUser(newUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab('auth');
    localStorage.removeItem('rc_access_token');
    localStorage.removeItem('rc_refresh_token');
    handleShowToast('Đã đăng xuất khỏi phiên làm việc RainClinic.', 'info');
  };

  // Switch perspective between Jane Doe (Patient) and Arthur Rain (Admin) on-the-fly for review
  const handleQuickRoleToggle = () => {
    if (!currentUser) {
      // If no active user, log in Jane Doe
      setCurrentUser(DEFAULT_USERS[0]);
      setCurrentTab('patient');
      handleShowToast('Giả lập đăng nhập: Jane Doe (Bệnh nhân)', 'success');
      return;
    }

    if (currentUser.role === 'patient') {
      // Swap to default admin
      const adminUser = DEFAULT_USERS.find((u) => u.role === 'admin') || DEFAULT_USERS[1];
      setCurrentUser(adminUser);
      setCurrentTab('admin');
      handleShowToast('Giả lập chuyển góc nhìn: Arthur Rain (Admin)', 'success');
    } else {
      // Swap to default patient
      const patientUser = DEFAULT_USERS.find((u) => u.role === 'patient') || DEFAULT_USERS[0];
      setCurrentUser(patientUser);
      setCurrentTab('patient');
      handleShowToast('Giả lập chuyển góc nhìn: Jane Doe (Bệnh nhân)', 'success');
    }
  };

  // APPOINTMENT BOOKING HANDLER
  const handleBookAppointment = async (bookingData: {
    serviceId: string;
    date: string;
    timeSlot: string;
    symptoms: string;
  }) => {
    const selectedService = services.find((s) => s.id === bookingData.serviceId);
    if (!selectedService || !currentUser) return;

    // Find the slot id by time string
    const selectedSlotObj = timeSlots.find((t) => t.time === bookingData.timeSlot);
    if (!selectedSlotObj) {
      handleShowToast('Không tìm thấy khung giờ phù hợp.', 'error');
      return;
    }

    const rawServiceId = selectedService.id.startsWith('srv-')
      ? selectedService.id.replace('srv-', '')
      : selectedService.id;

    const rawSlotId = selectedSlotObj.id.startsWith('ts-')
      ? selectedSlotObj.id.replace('ts-', '')
      : selectedSlotObj.id;

    try {
      const payload = {
        service_id: parseInt(rawServiceId),
        slot_id: parseInt(rawSlotId),
        date: bookingData.date,
        symptoms: bookingData.symptoms,
      };

      const newAptData = await apiRequest('/appointments/book/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const newAppointment: Appointment = {
        id: newAptData.id.toString(),
        patientId: newAptData.patientId,
        patientName: newAptData.patientName,
        patientPhone: newAptData.patientPhone,
        serviceId: newAptData.serviceId,
        serviceName: newAptData.serviceName,
        doctorName: newAptData.doctorName,
        date: newAptData.date,
        timeSlot: newAptData.timeSlot,
        symptoms: newAptData.symptoms,
        status: newAptData.status,
        createdAt: newAptData.createdAt,
      };

      setAppointments((prev) => [newAppointment, ...prev]);
      handleShowToast('Yêu cầu đặt lịch của bạn đã được tiếp nhận! Đang chờ quản trị viên duyệt.', 'success');
    } catch (err: any) {
      handleShowToast(err.message || 'Lỗi khi đặt lịch hẹn khám.', 'error');
    }
  };

  // APPOINTMENT CANCELLATION HANDLER
  const handleCancelAppointment = async (id: string) => {
    // Handle mock appointments locally
    if (id.startsWith('apt-')) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
        )
      );
      handleShowToast('Yêu cầu đặt lịch hẹn đã được chuyển sang trạng thái HỦY LỊCH (Dữ liệu mẫu).', 'error');
      return;
    }

    try {
      await apiRequest(`/appointments/${id}/cancel/`, {
        method: 'PUT',
      });

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
        )
      );
      handleShowToast('Yêu cầu đặt lịch hẹn đã được chuyển sang trạng thái HỦY LỊCH.', 'error');
    } catch (err: any) {
      handleShowToast(err.message || 'Không thể hủy lịch hẹn.', 'error');
    }
  };

  // APPOINTMENT APPROVAL HANDLER
  const handleApproveAppointment = async (id: string) => {
    // Handle mock appointments locally
    if (id.startsWith('apt-')) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, status: 'confirmed' as const } : apt
        )
      );
      handleShowToast('Phê duyệt thành công! Ca hẹn kiểm tra y khoa đã khóa giờ thành công (Dữ liệu mẫu).', 'success');
      return;
    }

    try {
      await apiRequest(`/admin/appointments/${id}/confirm/`, {
        method: 'PUT',
      });

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, status: 'confirmed' as const } : apt
        )
      );
      handleShowToast('Phê duyệt thành công! Ca hẹn kiểm tra y khoa đã khóa giờ thành công.', 'success');
    } catch (err: any) {
      handleShowToast(err.message || 'Không thể phê duyệt lịch hẹn.', 'error');
    }
  };

  // SERVICE MANAGEMENT HANDLERS
  const handleAddService = (newService: MedicalService) => {
    setServices((prev) => [...prev, newService]);
  };

  const handleDeleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    handleShowToast('Dịch vụ y tế dỡ bỏ khỏi danh sách vận hành hoạt động đầu mối.', 'error');
  };

  // TIME SLOTS SCHEDULER HANDLERS
  const handleAddTimeSlot = (time: string) => {
    const newSlot: TimeSlot = {
      id: `ts-${Date.now()}`,
      time,
      isAvailable: true,
    };
    setTimeSlots((prev) => [...prev, newSlot]);
  };

  const handleDeleteTimeSlot = (id: string) => {
    setTimeSlots((prev) => prev.filter((s) => s.id !== id));
    handleShowToast('Đã xóa ca giờ hoạt động tương ứng khỏi bệnh viện.', 'error');
  };

  // Reset demo databases to initial factory states
  const handleResetDatabase = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại cơ sở dữ liệu mẫu về cấu hình RainClinic ban đầu?')) {
      localStorage.removeItem('rc_services');
      localStorage.removeItem('rc_timeslots');
      localStorage.removeItem('rc_appointments');
      localStorage.removeItem('rc_current_user');
      setServices(DEFAULT_SERVICES);
      setTimeSlots(DEFAULT_TIME_SLOTS);
      setAppointments(DEFAULT_APPOINTMENTS);
      setCurrentUser(DEFAULT_USERS[0]);
      setCurrentTab('patient');
      handleShowToast('Hệ thống dịch vụ dữ liệu RainClinic đã khôi phục mặc định!', 'info');
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
          onQuickRoleToggle={handleQuickRoleToggle}
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
                        id="btn-elevate-perspective"
                        type="button"
                        onClick={handleQuickRoleToggle}
                        className="px-5 py-2 hover:bg-blue-950 text-white text-xs font-bold bg-blue-900 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>Chuyển Vai Trò Giả Lập</span>
                      </button>
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
            <button
              id="btn-global-db-reset"
              type="button"
              onClick={handleResetDatabase}
              title="Khôi phục mặc định"
              className="border border-slate-205 flex items-center gap-1 shadow-sm font-semibold rounded bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-700 py-1 px-3 transition-all cursor-pointer text-[10px]"
            >
              Reset dữ liệu mẫu về mặc định 
            </button>
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

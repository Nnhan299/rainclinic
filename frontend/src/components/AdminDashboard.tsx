/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle2, AlertCircle, Plus, Trash2, Calendar, 
  Filter, ShieldAlert, DollarSign, Clock, Stethoscope, X, Building 
} from 'lucide-react';
import { MedicalService, TimeSlot, Appointment } from '../types';

interface AdminDashboardProps {
  services: MedicalService[];
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  onApproveAppointment: (id: string) => void;
  onCancelAppointment: (id: string) => void;
  onAddService: (newService: MedicalService) => void;
  onDeleteService: (id: string) => void;
  onAddTimeSlot: (time: string) => void;
  onDeleteTimeSlot: (id: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function AdminDashboard({
  services,
  timeSlots,
  appointments,
  onApproveAppointment,
  onCancelAppointment,
  onAddService,
  onDeleteService,
  onAddTimeSlot,
  onDeleteTimeSlot,
  onShowToast,
}: AdminDashboardProps) {
  
  // 1. MASTER WORKSPACE FILTERS
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  // 2. MODAL STATE: Add Service
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCategory, setNewSrvCategory] = useState('Wellness & General');
  const [newSrvDoctor, setNewSrvDoctor] = useState('');
  const [newSrvDuration, setNewSrvDuration] = useState('30');
  const [newSrvPrice, setNewSrvPrice] = useState('150');
  const [newSrvDesc, setNewSrvDesc] = useState('');

  // 3. SERVICE VALIDATION ERRORS
  const [serviceErrors, setServiceErrors] = useState<Record<string, string>>({});

  // 4. ADD TIME SLOT FORM STATE Inline
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('10:00');

  // METRICS CALCULATIONS
  const totalAppointmentsCount = appointments.length;
  const pendingApprovalsCount = appointments.filter((apt) => apt.status === 'pending').length;
  const confirmedTodayCount = appointments.filter((apt) => {
    // Current local date in ISO format YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    return apt.status === 'confirmed' && apt.date === todayStr;
  }).length;
  
  // Total confirmed throughout the system
  const totalConfirmedCount = appointments.filter((apt) => apt.status === 'confirmed').length;

  // Filter Master Table rows based on State
  const filteredAppointments = appointments.filter((apt) => {
    const matchesDate = filterDate ? apt.date === filterDate : true;
    const matchesStatus = filterStatus === 'all' ? true : apt.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  // Handle service creation submission
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    const errorsList: Record<string, string> = {};

    if (!newSrvName.trim()) {
      errorsList.name = 'Tiêu đề dịch vụ không được để trống';
    }
    if (!newSrvDoctor.trim()) {
      errorsList.doctor = 'Tên bác sĩ không được để trống';
    }
    if (!newSrvDesc.trim()) {
      errorsList.desc = 'Mô tả tóm tắt không được để trống';
    }
    if (Number(newSrvPrice) <= 0 || isNaN(Number(newSrvPrice))) {
      errorsList.price = 'Đơn giá phải lớn hơn 0';
    }

    setServiceErrors(errorsList);

    if (Object.keys(errorsList).length > 0) {
      onShowToast('Vui lòng hoàn thiện đúng thông tin biểu mẫu!', 'error');
      return;
    }

    const newSrvObj: MedicalService = {
      id: `srv-${Date.now()}`,
      name: newSrvName.trim(),
      category: newSrvCategory,
      durationMin: Number(newSrvDuration),
      price: Number(newSrvPrice),
      doctorName: newSrvDoctor.startsWith('Bác sĩ ') || newSrvDoctor.startsWith('BS. ') ? newSrvDoctor.trim() : `BS. ${newSrvDoctor.trim()}`,
      description: newSrvDesc.trim(),
    };

    onAddService(newSrvObj);
    onShowToast(`Thành công! Đã ban hành thêm dịch vụ "${newSrvObj.name}".`, 'success');
    
    // Reset and close
    setIsServiceModalOpen(false);
    setNewSrvName('');
    setNewSrvDoctor('');
    setNewSrvDesc('');
    setNewSrvDuration('30');
    setNewSrvPrice('150');
    setServiceErrors({});
  };

  // Handle operational slots addition
  const handleCreateTimeSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotStart || !newSlotEnd) {
      onShowToast('Vui lòng nhập cả thời gian bắt đầu và kết thúc ca bệnh!', 'error');
      return;
    }

    const slotTimeFormatted = `${newSlotStart} - ${newSlotEnd}`;
    
    // Check if slot name exists already
    const isDuplicate = timeSlots.some((s) => s.time === slotTimeFormatted);
    if (isDuplicate) {
      onShowToast('Khung giờ làm việc này đã tồn tại sẵn trong danh mục vận hành!', 'error');
      return;
    }

    onAddTimeSlot(slotTimeFormatted);
    onShowToast(`Kích hoạt thành công ca làm việc: ${slotTimeFormatted}`, 'success');
  };

  return (
    <div id="admin-dashboard-root" className="space-y-8 animate-fade-in font-sans">
      
      {/* 1. TOP TITLE HEADER AND ROLES - Professional theme style */}
      <div id="admin-welcome-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-md">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-900 rounded-md font-bold text-xs border border-blue-200/60 mb-2 uppercase tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-800 animate-pulse" />
            Không Gian Quản Trị Hệ Thống
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bảng Điều Khiển Ban Quản Trị
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tuyển chọn phê duyệt lịch hẹn bệnh án của từng bệnh nhân, cập nhật danh mục kỹ thuật y tế và cấu hình thời gian làm việc toàn viện.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            id="btn-trigger-service-modal"
            type="button"
            onClick={() => setIsServiceModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 hover:bg-blue-950 text-white font-bold text-sm bg-blue-900 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Thêm dịch vụ mới</span>
          </button>
        </div>
      </div>

      {/* 2. METRIC CARDS SUMMARY GRID */}
      <div id="admin-metrics-row" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Total Appointments */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-md flex items-center justify-between"
        >
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng lượt đăng ký</p>
            <h4 id="stat-total" className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {totalAppointmentsCount}
            </h4>
            <p className="text-[11px] text-slate-400">Toàn bộ hồ sơ lâm sàng đã tải</p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Metric 2: Pending Approvals */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-md flex items-center justify-between"
        >
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lịch chờ phê duyệt</p>
            <h4 id="stat-pending" className="text-3xl font-extrabold text-amber-600 font-mono tracking-tight">
              {pendingApprovalsCount}
            </h4>
            <p className="text-[11px] text-slate-400">Đang chờ rà soát chẩn đoán sơ bộ</p>
          </div>
          <div className="p-4 bg-amber-50 text-amber-850 rounded-lg border border-amber-100">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
        </motion.div>

        {/* Metric 3: Confirmed Today / Total Confirmed */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-md flex items-center justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ca khám đã duyện</p>
            </div>
            <h4 id="stat-today" className="text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">
              {totalConfirmedCount}
            </h4>
            <p className="text-[11px] text-slate-400 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded inline-block font-semibold mt-1">
              Hôm nay có {confirmedTodayCount} lịch trình khám
            </p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-850 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </motion.div>

      </div>

      {/* 3. MASTER APPOINTMENT CONTROL CENTER (FULL WIDTH TABLE WITH ADVANCED FILTERS) */}
      <div id="master-control-card" className="bg-white rounded-xl border border-slate-200/80 shadow-md overflow-hidden">
        
        {/* Table Title and Advanced Filters */}
        <div className="p-6 md:p-8 border-b border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-550/15 text-blue-900 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hệ thống Điều phối Lịch Hẹn Toàn viện</h3>
                <p className="text-xs text-slate-500 font-medium">Bảng rà soát dữ liệu người dùng, quản trị chất lượng điều hành chỉ định lâm sàng</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-md border border-slate-200 uppercase tracking-wide">
              Tìm thấy {filteredAppointments.length} bản ghi phù hợp
            </span>
          </div>

          {/* INSTANT TOP FILTER PANEL - high contrast white bg with custom borders */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-4 items-end">
            
            {/* Filter Date Picker */}
            <div className="w-full sm:w-auto space-y-1.5 flex-1 max-w-xs">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Lọc Theo Ngày Khám
              </label>
              <input
                id="filter-date-input"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs py-2 px-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-700 outline-none text-slate-800 font-medium"
              />
            </div>

            {/* Filter Status Selector */}
            <div className="w-full sm:w-auto space-y-1.5 flex-1 max-w-xs">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                Lọc Theo Trạng Thái
              </label>
              <select
                id="filter-status-dropdown"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-700 text-slate-800 font-bold cursor-pointer"
              >
                <option value="all">⚠️ Xem Toàn Bộ Lịch Hẹn</option>
                <option value="pending">⏳ Đang Chờ Phê Duyệt</option>
                <option value="confirmed">✅ Hoạt Động (Đã Xác Nhận)</option>
                <option value="cancelled">❌ Đã Hủy / Hoãn Ca</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <button
              id="btn-clear-filters"
              type="button"
              onClick={() => { setFilterDate(''); setFilterStatus('all'); }}
              disabled={!filterDate && filterStatus === 'all'}
              className="py-2 px-4 shadow-sm bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-50 text-xs font-bold rounded-lg border border-slate-350 cursor-pointer disabled:cursor-not-allowed select-none transition-all"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>

        {/* Master Appointment Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold tracking-wider text-slate-700 uppercase">
                <th className="py-4 px-6">Thông Tin Bệnh Nhân</th>
                <th className="py-4 px-4">Dịch Vụ & Bác Sĩ Chuyên Khoa</th>
                <th className="py-4 px-4">Giờ Khám Đăng Ký</th>
                <th className="py-4 px-4">Triệu Chứng Bệnh Sử</th>
                <th className="py-4 px-4">Trạng Thái</th>
                <th className="py-4 px-6 text-right font-bold">Thao Tác Điều Hành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-xs text-slate-800">
              <AnimatePresence mode="popLayout">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center bg-white">
                      <div className="flex flex-col items-center justify-center p-6">
                        <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="font-bold text-slate-700">Không tìm thấy bất kỳ lịch khám nào trùng khớp!</p>
                        <p className="text-slate-400 text-xs mt-1">Hãy tùy chỉnh bộ lọc ngày hoặc thiết lập hiển thị toàn diện ở thanh điều khiển trên.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
                    let badgeColor = '';
                    let textStatus = '';
                    if (apt.status === 'pending') {
                      badgeColor = 'bg-amber-50 text-amber-900 border-amber-200/60';
                      textStatus = 'Chờ xử lý';
                    } else if (apt.status === 'confirmed') {
                      badgeColor = 'bg-emerald-50 text-emerald-900 border-emerald-200/60';
                      textStatus = 'Đã phê duyệt';
                    } else {
                      badgeColor = 'bg-red-50 text-red-900 border-red-200/60';
                      textStatus = 'Đã loại bỏ';
                    }

                    return (
                      <motion.tr
                        key={apt.id}
                        id={`master-row-${apt.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* Patient */}
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-950 text-sm">{apt.patientName}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">SĐT: {apt.patientPhone}</div>
                        </td>

                        {/* Service / Specialist */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">{apt.serviceName}</div>
                          <div className="text-[10px] text-teal-850 font-bold mt-0.5 uppercase tracking-wide">{apt.doctorName}</div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-4">
                          <div className="text-xs font-mono text-slate-800 font-bold">{apt.date}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{apt.timeSlot}</div>
                        </td>

                        {/* Symptoms */}
                        <td className="py-4 px-4 max-w-[200px]">
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed" title={apt.symptoms}>
                            {apt.symptoms}
                          </p>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wider ${badgeColor}`}>
                            <span>{textStatus}</span>
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          {apt.status === 'pending' ? (
                            <div className="flex justify-end gap-1.5">
                              <button
                                id={`master-approve-${apt.id}`}
                                type="button"
                                onClick={() => onApproveAppointment(apt.id)}
                                className="px-3 py-1.5 text-[10px] bg-emerald-650 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                <span>Phê duyệt đặt lịch</span>
                              </button>
                              <button
                                id={`master-decline-${apt.id}`}
                                type="button"
                                onClick={() => onCancelAppointment(apt.id)}
                                className="px-3 py-1.5 text-[10px] text-red-650 hover:text-white bg-white hover:bg-red-650 border border-slate-300 rounded-lg transition-all font-bold cursor-pointer"
                              >
                                <span>Hủy lịch</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider italic">
                              Hồ sơ sổ ({textStatus})
                            </div>
                          )}
                        </td>

                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SIDE-BY-SIDE CONFIGURATION MANAGERS GRID (SERVICES & TIME SLOTS) */}
      <div id="config-grid-layout" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Core Config Section 1: Service Management */}
        <div id="service-catalog-config-card" className="bg-white rounded-xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-900 rounded-lg">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Danh Mục Dịch Vụ Y Tế</h3>
                  <p className="text-[11px] text-slate-500">Thiết lập cấu trúc hoạt động danh sách chuyên khoa hỗ trợ</p>
                </div>
              </div>
              <button
                id="btn-add-service-shortcut"
                type="button"
                onClick={() => setIsServiceModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-800 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-teal-600" />
                <span>Tạo dịch vụ</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold tracking-wider uppercase">
                    <th className="p-3 pl-6">Dịch vụ (Bác sĩ chuyên trách)</th>
                    <th className="p-3">Khoa viện</th>
                    <th className="p-3 font-mono">Đơn giá / Ca hẹn</th>
                    <th className="p-3 pr-6 text-right font-bold">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-800">
                  {services.map((srv) => (
                    <tr key={srv.id} id={`service-row-${srv.id}`} className="hover:bg-slate-50">
                      <td className="p-3 pl-6">
                        <div className="font-bold text-slate-900">{srv.name}</div>
                        <div className="text-[11px] text-slate-500 italic font-semibold">{srv.doctorName}</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide border border-slate-200">
                          {srv.category}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-extrabold text-slate-900">VNĐ {srv.price}.000</span>
                        <span className="text-slate-400"> / {srv.durationMin}p</span>
                      </td>
                      <td className="p-3 pr-6 text-right">
                        <button
                          id={`del-service-${srv.id}`}
                          type="button"
                          onClick={() => onDeleteService(srv.id)}
                          title="Xóa dịch vụ"
                          className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 border border-slate-250 hover:border-red-650 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 italic">
            * Chú ý: Việc xóa bớt dịch vụ y tế chính quy sẽ loại bỏ lựa chọn của những bệnh nhân đăng ký mới, các lịch sử và tiến trình đã lưu trữ trước đó sẽ hoàn toàn được giữ nguyên để phục vụ đối chiếu bệnh án sau này.
          </div>
        </div>

        {/* Core Config Section 2: Operational Time Slots Scheduler */}
        <div id="timeslot-scheduler-config-card" className="bg-white rounded-xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-900 rounded-lg">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Quản Lý Khung Giờ Làm Việc</h3>
                  <p className="text-[11px] text-slate-500">Cấu hình thời gian đón tiếp và tiếp nhận lượt khám toàn diện</p>
                </div>
              </div>
            </div>

            {/* Inline Slot Creator Form */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <form onSubmit={handleCreateTimeSlot} className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[80px] space-y-1">
                  <span className="block text-[9px] font-bold text-slate-700 uppercase tracking-widest font-sans">Giờ Bắt Đầu</span>
                  <input
                    id="timeslot-start-time"
                    type="time"
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-4 focus:ring-blue-500/10 focus:border-blue-750 text-slate-800 focus:outline-none font-medium"
                  />
                </div>
                <div className="flex-1 min-w-[80px] space-y-1">
                  <span className="block text-[9px] font-bold text-slate-700 uppercase tracking-widest font-sans">Giờ Kết Thúc</span>
                  <input
                    id="timeslot-end-time"
                    type="time"
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-4 focus:ring-blue-500/10 focus:border-blue-750 text-slate-800 focus:outline-none font-medium"
                  />
                </div>
                <button
                  id="btn-add-timeslot"
                  type="submit"
                  className="px-3.5 py-2 hover:bg-blue-950 text-white text-xs font-bold bg-blue-900 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>Kích hoạt ca</span>
                </button>
              </form>
            </div>

            {/* Responsive grid system exhibiting active slots with deletion options */}
            <div className="p-6">
              <span className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-3">Các khung giờ đang vận hành hoạt động:</span>
              <div id="dashboard-slots-grid" className="grid grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                  {timeSlots.map((slot) => (
                    <motion.div
                      key={slot.id}
                      id={`config-slot-${slot.id}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative p-3 bg-white border border-slate-200 hover:border-slate-350 rounded-lg flex items-center justify-between font-mono text-xs text-slate-800 shadow-sm transition-all"
                    >
                      <span className="font-semibold">{slot.time}</span>
                      <button
                        id={`del-slot-${slot.id}`}
                        type="button"
                        onClick={() => onDeleteTimeSlot(slot.id)}
                        title="Xóa ca giờ này"
                        className="opacity-0 group-hover:opacity-100 p-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-md transition-all cursor-pointer border border-red-200/20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-205 text-[10px] text-slate-550 italic">
            * Thay đổi các mốc thời gian tiếp nhận lâm sàng sẽ cập nhật tự động lên trang đăng ký trực tuyến cho bệnh nhân.
          </div>
        </div>

      </div>

      {/* 5. ADD SERVICE CREATION FORM MODAL */}
      <AnimatePresence>
        {isServiceModalOpen && (
          <div id="service-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              id="service-modal-card"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-900" />
                  <h3 className="font-bold text-slate-900 text-base">Tạo Dịch Vụ Khám Mới</h3>
                </div>
                <button
                  id="modal-close-btn"
                  type="button"
                  onClick={() => { setIsServiceModalOpen(false); setServiceErrors({}); }}
                  className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form id="create-service-form" onSubmit={handleCreateService} className="p-6 space-y-4">
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Tiêu đề dịch vụ y tế</label>
                  <input
                    id="field-srv-name"
                    type="text"
                    placeholder="Ví dụ: Khám Tư vấn Chuyên khoa Thần kinh"
                    value={newSrvName}
                    onChange={(e) => setNewSrvName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-750 text-slate-800"
                  />
                  {serviceErrors.name && <p className="text-[10px] text-red-500 font-bold">{serviceErrors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Chuyên khoa phụ trách</label>
                    <select
                      id="field-srv-category"
                      value={newSrvCategory}
                      onChange={(e) => setNewSrvCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-750 text-slate-800"
                    >
                      <option value="Wellness & General">Tổng quát & Sức khỏe</option>
                      <option value="Internal Medicine">Nội tổng quát</option>
                      <option value="Cardiology">Tim mạch</option>
                      <option value="Pediatrics">Nhi khoa</option>
                      <option value="Orthopedics">Chấn thương chỉnh hình</option>
                      <option value="Dermatology">Da liễu</option>
                      <option value="Other">Chuyên khoa sâu khác</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Bác sĩ phụ trách chính</label>
                    <input
                      id="field-srv-doctor"
                      type="text"
                      placeholder="Ví dụ: BS. Arthur Rain"
                      value={newSrvDoctor}
                      onChange={(e) => setNewSrvDoctor(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-750 text-slate-800"
                    />
                    {serviceErrors.doctor && <p className="text-[10px] text-red-500 font-bold">{serviceErrors.doctor}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Thời lượng trung bình</label>
                    <select
                      id="field-srv-duration"
                      value={newSrvDuration}
                      onChange={(e) => setNewSrvDuration(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-750 text-slate-800"
                    >
                      <option value="15">15 phút (Khám lâm sàng nhanh)</option>
                      <option value="30">30 phút (Khám định kỳ tiêu chuẩn)</option>
                      <option value="45">45 phút (Đánh giá kỹ thuật cao)</option>
                      <option value="60">60 phút (Hội chẩn đặc biệt phức tạp)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Đơn giá thu phí (VNĐ)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                        <span className="font-bold text-xs">VNĐ</span>
                      </div>
                      <input
                        id="field-srv-price"
                        type="number"
                        placeholder="150"
                        value={newSrvPrice}
                        onChange={(e) => setNewSrvPrice(e.target.value)}
                        className="w-full pl-12 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-750 text-slate-800"
                      />
                    </div>
                    {serviceErrors.price && <p className="text-[10px] text-red-500 font-bold">{serviceErrors.price}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Mô tả tóm tắt dịch vụ</label>
                  <textarea
                    id="field-srv-desc"
                    rows={2}
                    placeholder="Nhập ghi chú hoặc tóm tắt quy trình sàng lọc cho bệnh nhân chuẩn bị..."
                    value={newSrvDesc}
                    onChange={(e) => setNewSrvDesc(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-750 text-slate-800 resize-none font-normal"
                  />
                  {serviceErrors.desc && <p className="text-[10px] text-red-500 font-bold">{serviceErrors.desc}</p>}
                </div>

                <div className="pt-4 border-t border-slate-200 style-form-action flex justify-end gap-3 bg-slate-50 -mx-6 -mb-6 p-4">
                  <button
                    id="btn-cancel-srv-modal"
                    type="button"
                    onClick={() => { setIsServiceModalOpen(false); setServiceErrors({}); }}
                    className="px-4 py-2 hover:bg-slate-255 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-slate-300 bg-white"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    id="btn-confirm-srv-modal"
                    type="submit"
                    className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    Xác nhận & Cập nhật
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Stethoscope, FileText, CheckCircle, AlertCircle, XCircle, CalendarDays, User as UserIcon } from 'lucide-react';
import { MedicalService, TimeSlot, Appointment, User } from '../types';

interface PatientPortalProps {
  services: MedicalService[];
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  currentUser: User;
  onBookAppointment: (bookingData: {
    serviceId: string;
    date: string;
    timeSlot: string;
    symptoms: string;
  }) => Promise<boolean>;
  onCancelAppointment: (id: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function PatientPortal({
  services,
  timeSlots,
  appointments,
  currentUser,
  onBookAppointment,
  onCancelAppointment,
  onShowToast,
}: PatientPortalProps) {
  // Booking State
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Current date in YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');

  // Personal appointments list
  const personalAppointments = appointments.filter(
    (apt) => apt.patientId === currentUser.id || apt.patientId === currentUser.username
  );

  // Derive selected service parameters
  const selectedServiceObj = services.find((s) => s.id === selectedServiceId);

  // Generate dynamic booked status for slots based on existing appointments for selected date
  const isSlotBookedOnDate = (slotTime: string) => {
    return appointments.some(
      (apt) =>
        apt.date === selectedDate &&
        apt.timeSlot === slotTime &&
        apt.status !== 'cancelled'
    );
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedServiceId) {
      onShowToast('Vui lòng chọn một dịch vụ y tế', 'error');
      return;
    }
    if (!selectedDate) {
      onShowToast('Vui lòng chỉ định ngày đặt lịch hợp lệ', 'error');
      return;
    }
    if (!selectedTimeSlot) {
      onShowToast('Vui lòng chọn một khung giờ khám còn trống', 'error');
      return;
    }
    if (!symptoms.trim()) {
      onShowToast('Vui lòng mô tả ngắn gọn triệu chứng hoặc lý do khám', 'error');
      return;
    }

    // Verify vacancy
    if (isSlotBookedOnDate(selectedTimeSlot)) {
      onShowToast('Khung giờ này đã được đặt kín cho ngày này. Vui lòng chọn khung giờ khác.', 'error');
      return;
    }

    const success = await onBookAppointment({
      serviceId: selectedServiceId,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      symptoms: symptoms.trim(),
    });

    if (success) {
      setSelectedTimeSlot('');
      setSymptoms('');
      onShowToast('Yêu cầu đặt lịch của bạn đã được tiếp nhận! Đang chờ quản trị viên duyệt.', 'success');
    }
  };

  return (
    <div id="patient-portal-root" className="space-y-8 animate-fade-in font-sans">
      
      {/* Banner / Info in Professional Polish Theme */}
      <div id="patient-welcome-banner" className="bg-blue-900 rounded-xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-8 translate-x-8">
          <Stethoscope className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-400/20 text-teal-300 rounded-md font-bold uppercase tracking-wider text-[10px]">
            <UserIcon className="w-3.5 h-3.5 text-teal-400" />
            Bàn làm việc Bệnh nhân
          </span>
          <h2 className="text-3xl font-bold tracking-tight">
            Xin chào, {currentUser.fullName}
          </h2>
          <p className="text-blue-150 text-sm leading-relaxed font-normal opacity-90">
            Đặt lịch hẹn khám cùng các bác sĩ chuyên khoa hàng đầu, theo dõi lịch sử khám bệnh và quản lý nhanh tiến độ xử lý lịch hẹn ngay từ bảng điều khiển.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: BOOKING INTAKE FORM */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div id="booking-form-card" className="bg-white rounded-xl border border-slate-200/80 shadow-md overflow-hidden h-full flex flex-col justify-between">
            <div className="p-6 md:p-8 space-y-5">
              
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="p-2.5 bg-blue-50 text-blue-950 rounded-lg">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Đăng Ký Đặt Lịch Khám</h3>
                  <p className="text-xs text-slate-500">Vui lòng chọn dịch vụ, ngày khám, khung giờ và triệu chứng</p>
                </div>
              </div>

              <form id="booking-sub-form" onSubmit={handleBookingSubmit} className="space-y-4">
                
                {/* 1. SELECT SERVICE */}
                <div className="space-y-1.5">
                  <label id="lbl-select-service" className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Chọn dịch vụ y tế
                  </label>
                  <div className="relative">
                    <select
                      id="select-service-dropdown"
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-705 transition-all text-slate-800 outline-none cursor-pointer font-medium"
                    >
                      {services.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} ({srv.doctorName}) — VNĐ {srv.price}.000
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedServiceObj && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic leading-snug">
                      "{selectedServiceObj.description}" — <strong className="text-teal-700 font-semibold">{selectedServiceObj.category}</strong>
                    </p>
                  )}
                </div>

                {/* 2. DATE PICKER */}
                <div className="space-y-1.5">
                  <label id="lbl-select-date" className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Chọn ngày hẹn khám
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      id="booking-date-picker"
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]} // restrict passed dates
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTimeSlot(''); // reset slot when date changes to prevent cross-date overlaps
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-750 transition-all text-slate-800 outline-none cursor-pointer font-medium"
                    />
                  </div>
                </div>

                {/* 3. TIME SLOT BADGE CHIPS GRID */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label id="lbl-select-timesp" className="block text-xs font-bold text-slate-700 uppercase tracking-widest font-sans">
                      Chọn khung giờ trống
                    </label>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium border border-slate-200">
                      Ngày đã chọn: {selectedDate}
                    </span>
                  </div>

                  <div id="timeslots-badge-grid" className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => {
                      const isBooked = isSlotBookedOnDate(slot.time);
                      const isSelected = selectedTimeSlot === slot.time;
                      
                      let ChipClasses = '';
                      if (isBooked) {
                        ChipClasses = 'bg-slate-100 text-slate-400 border-slate-250 cursor-not-allowed line-through opacity-55';
                      } else if (isSelected) {
                        ChipClasses = 'bg-teal-600 text-white border-teal-700 font-bold shadow-sm';
                      } else {
                        ChipClasses = 'bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-700 transition-all cursor-pointer';
                      }

                      return (
                        <button
                          key={slot.id}
                          id={`timeslot-${slot.id}`}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedTimeSlot(slot.time)}
                          className={`py-2 px-3 text-xs rounded-lg border text-center flex flex-col justify-center items-center ${ChipClasses}`}
                        >
                          <span className="font-mono font-semibold">{slot.time.split(' - ')[0]}</span>
                          <span className="text-[9px] opacity-75">{isBooked ? 'Đã đặt' : 'Còn trống'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. SYMPTOMS TEXTAREA */}
                <div className="space-y-1.5">
                  <label id="lbl-symptoms" className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Triệu chứng / Lý do khám bệnh
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 text-slate-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <textarea
                      id="booking-symptoms-input"
                      rows={3}
                      placeholder="Mô tả các triệu chứng hiện tại, thời gian khởi phát hoặc lý do đặt lịch chi tiết..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-750 transition-all text-slate-800 outline-none font-normal resize-none"
                    />
                  </div>
                </div>

                {/* 5. CONFIRM APPOINTMENT BUTTON */}
                <button
                  id="confirm-booking-btn"
                  type="submit"
                  className="w-full mt-2 py-3 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-lg shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-teal-300 animate-pulse" />
                  <span className="text-xs uppercase tracking-wider font-bold">Xác nhận Đặt Lịch Hẹn Khám</span>
                </button>

              </form>

            </div>
          </div>
        </div>

        {/* Right Side: PERSONAL APPOINTMENT LOGS TABLE */}
        <div id="logs-section" className="lg:col-span-12 xl:col-span-7 space-y-6">
          <div id="appointment-history-card" className="bg-white rounded-xl border border-slate-200/80 shadow-md overflow-hidden h-full flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-900 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Lịch Sử Đặt Hẹn Của Bạn</h3>
                  <p className="text-xs text-slate-500 font-medium">Theo dõi hoạt động đặt chỗ khám bệnh thực tế của bạn</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-blue-550/10 text-blue-900 px-3 py-1 rounded-md border border-blue-950/20 uppercase tracking-wide">
                Có {personalAppointments.length} hồ sơ liên kết
              </span>
            </div>

            <div className="flex-1 overflow-x-auto">
              <AnimatePresence mode="popLayout">
                {personalAppointments.length === 0 ? (
                  <motion.div
                    id="appointments-empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-12 text-center flex flex-col items-center justify-center h-full min-h-[300px]"
                  >
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center mb-4 border border-slate-200">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <p className="text-slate-900 font-bold text-sm">Chưa có lịch hẹn khám nào</p>
                    <p className="text-slate-500 text-xs max-w-xs mx-auto mt-1 leading-relaxed">
                      Hãy chọn dịch vụ y tế mong muốn, chỉ định ngày đi khám và điền mốc thời gian để bắt đầu lập phiếu hẹn.
                    </p>
                  </motion.div>
                ) : (
                  <table id="patient-logs-table" className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold tracking-wider text-slate-700 uppercase">
                        <th className="py-4 px-6">Dịch vụ & Chuyên khoa</th>
                        <th className="py-4 px-4">Bác sĩ phụ trách</th>
                        <th className="py-4 px-4">Triệu chứng lâm sàng</th>
                        <th className="py-4 px-4">Trạng thái duyệt</th>
                        <th className="py-4 px-6 text-right font-bold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-xs">
                      {personalAppointments.map((apt) => {
                        // Badge Styles
                        let badgeStyle = '';
                        let textStatus = '';
                        if (apt.status === 'pending') {
                          badgeStyle = 'bg-amber-50 text-amber-900 border-amber-200/60';
                          textStatus = 'Đang chờ duyệt';
                        } else if (apt.status === 'confirmed') {
                          badgeStyle = 'bg-emerald-50 text-emerald-900 border-emerald-200/60';
                          textStatus = 'Đã duyệt';
                        } else {
                          badgeStyle = 'bg-red-50 text-red-900 border-red-200/60';
                          textStatus = 'Đã hủy lịch';
                        }

                        return (
                          <motion.tr
                             key={apt.id}
                             id={`history-row-${apt.id}`}
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             exit={{ opacity: 0, scale: 0.95 }}
                             transition={{ duration: 0.2 }}
                             className="hover:bg-slate-50 transition-colors group"
                          >
                            {/* Schedule info & Service */}
                            <td className="py-4 px-6">
                              <div className="font-semibold text-slate-900 text-sm">{apt.serviceName}</div>
                              <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mt-1 font-mono">
                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-250">{apt.date}</span>
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-250">{apt.timeSlot}</span>
                              </div>
                            </td>

                            {/* Doctor */}
                            <td className="py-4 px-4 text-slate-850 font-semibold whitespace-nowrap">
                              {apt.doctorName}
                            </td>

                            {/* Symptoms */}
                            <td className="py-4 px-4 max-w-[200px]">
                              <p className="text-slate-600 line-clamp-2 text-xs" title={apt.symptoms}>
                                {apt.symptoms}
                              </p>
                            </td>

                            {/* Status badge */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wider ${badgeStyle}`}>
                                <span>{textStatus}</span>
                              </span>
                            </td>

                            {/* Cancellation logic */}
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              {apt.status === 'pending' ? (
                                <button
                                  id={`cancel-btn-${apt.id}`}
                                  type="button"
                                  onClick={() => onCancelAppointment(apt.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] text-red-600 hover:text-white bg-white hover:bg-red-600 border border-slate-300 hover:border-red-600 rounded-lg transition-all font-bold cursor-pointer shadow-none"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Hủy lịch hẹn</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic font-medium">Hồ sơ cũ</span>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </AnimatePresence>
            </div>
            
            <div className="bg-slate-50 border-t border-slate-200 p-4 text-xs text-slate-500 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-blue-900 shrink-0" />
              <span>Chỉ các yêu cầu đang ở trạng thái 'Đang chờ duyệt' mới có thể được hủy bỏ trực tiếp từ cổng bệnh nhân. Đối với trạng thái khác, vui lòng liên hệ trực tiếp CSKH.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

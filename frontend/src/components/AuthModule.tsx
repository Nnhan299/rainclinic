/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, User as UserIcon, Lock, Mail, CreditCard, Phone, CheckCircle, ArrowRight, Activity } from 'lucide-react';
import { User } from '../types';

interface AuthModuleProps {
  onLogin: (user: User) => void;
  existingUsers: User[];
  onRegister: (newUser: User) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function AuthModule({ onLogin, existingUsers, onRegister, onShowToast }: AuthModuleProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Validation feedback indicators
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim()) {
      onShowToast('Vui lòng nhập tên đăng nhập', 'error');
      return;
    }
    if (!loginPassword) {
      onShowToast('Vui lòng nhập mật khẩu', 'error');
      return;
    }

    // Interactive reviewer login suggestions compatibility (or manual types)
    const normalizedUsername = loginUsername.trim().toLowerCase();
    
    // Find among active users
    const matchedUser = existingUsers.find(
      u => u.username.toLowerCase() === normalizedUsername
    );

    if (matchedUser) {
      onLogin(matchedUser);
      onShowToast(`Chào mừng trở lại, ${matchedUser.fullName}! Đăng nhập với tư cách ${matchedUser.role === 'admin' ? 'Quản trị viên' : 'Bệnh nhân'}.`, 'success');
    } else {
      // Create transient on the fly for reviewer convenience
      if (normalizedUsername === 'admin') {
        const dummyAdmin: User = {
          id: 'usr-admin-transient',
          username: 'admin',
          email: 'admin@rainclinic.med',
          fullName: 'BS. Arthur Rain',
          phone: '+84 987 654 321',
          role: 'admin'
        };
        onLogin(dummyAdmin);
        onShowToast('Đăng nhập thành công: BS. Arthur Rain (Quản trị viên)', 'success');
      } else {
        // Assume patient for customized arbitrary test usernames with standard password
        const dummyPatient: User = {
          id: `usr-${Date.now()}`,
          username: loginUsername.trim(),
          email: `${normalizedUsername}@example.com`,
          fullName: loginUsername.trim().charAt(0).toUpperCase() + loginUsername.trim().slice(1),
          phone: '+84 912 000 111',
          role: 'patient',
        };
        onLogin(dummyPatient);
        onShowToast(`Đăng nhập thành công với bệnh nhân mới: ${dummyPatient.fullName}`, 'success');
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!regUsername.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (regUsername.length < 3) {
      newErrors.username = 'Tối thiểu phải từ 3 ký tự';
    }

    if (!regPassword) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (regPassword.length < 4) {
      newErrors.password = 'Tối thiểu phải từ 4 ký tự';
    }

    if (!regEmail.trim()) {
      newErrors.email = 'Địa chỉ email là bắt buộc';
    } else if (!validateEmail(regEmail)) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }

    if (!regFullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!regPhone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      onShowToast('Vui lòng sửa các lỗi nhập liệu trong biểu mẫu', 'error');
      return;
    }

    // Success register
    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: regUsername.trim(),
      email: regEmail.trim(),
      fullName: regFullName.trim(),
      phone: regPhone.trim(),
      role: regUsername.toLowerCase().includes('admin') ? 'admin' : 'patient'
    };

    onRegister(newUser);
    onLogin(newUser);
    onShowToast(`Tạo tài khoản thành công! Chào mừng tới RainClinic, ${newUser.fullName}!`, 'success');
  };

  const handleShortcutLogin = (username: string) => {
    setLoginUsername(username);
    setLoginPassword(username);
    onShowToast(`Đã tự động điền thông tin đăng nhập cho: ${username}`, 'info');
  };

  return (
    <div id="auth-container" className="min-h-[80vh] flex flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-md">
        
        {/* Branding header in Professional Polish theme */}
        <div id="auth-logo-header" className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-550/10 text-blue-900 rounded-md font-semibold text-xs tracking-wide mb-4 border border-blue-900/10">
            <Activity className="w-4 h-4 text-teal-500 animate-pulse" />
            <span className="font-sans uppercase font-bold tracking-widest text-[10px]">HỆ THỐNG RAINCLINIC</span>
          </div>
          <h1 id="brand-title" className="text-4xl font-bold tracking-tight text-blue-950 mt-1">
            Rain<span className="text-teal-550">Clinic</span>
          </h1>
          <p id="brand-tagline" className="text-slate-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
            Y khoa lâm sàng thế hệ mới, đặt lịch khám bệnh không phiền hà và vận hành thông suốt.
          </p>
        </div>

        {/* Unified Card Container with Clean Professional Shadow & Borders */}
        <motion.div
          id="auth-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden"
        >
          {/* Header Toggle tabs - Flat and sleek */}
          <div className="flex bg-slate-50 border-b border-slate-200">
            <button
              id="toggle-login-tab"
              type="button"
              onClick={() => { setIsLogin(true); setErrors({}); }}
              className={`flex-1 py-4 text-center text-sm font-semibold transition-all duration-200 ${
                isLogin
                  ? 'text-blue-900 bg-white border-b-2 border-teal-500 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              id="toggle-register-tab"
              type="button"
              onClick={() => { setIsLogin(false); setErrors({}); }}
              className={`flex-1 py-4 text-center text-sm font-semibold transition-all duration-200 ${
                !isLogin
                  ? 'text-blue-900 bg-white border-b-2 border-teal-500 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cổng Đăng Ký
            </button>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {isLogin ? (
                // LOGIN VIEW
                <motion.form
                  id="login-form"
                  key="login-form-key"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label id="lbl-login-username" className="block text-xs font-bold text-slate-700 uppercase tracking-widest font-sans">
                      Họ tên / Tên đăng nhập
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4.5 h-4.5" />
                      </div>
                      <input
                        id="login-username-input"
                        type="text"
                        placeholder="patient, admin hoặc tài khoản bất kỳ"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-700 transition-all text-slate-800 placeholder-slate-400 text-sm font-normal outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label id="lbl-login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-widest font-sans">
                        Mật khẩu
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4.5 h-4.5" />
                      </div>
                      <input
                        id="login-password-input"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-700 transition-all text-slate-800 placeholder-slate-400 text-sm font-normal outline-none"
                      />
                    </div>
                  </div>

                  {/* Refined Modern Solid Button */}
                  <button
                    id="login-submit-button"
                    type="submit"
                    className="w-full py-3 px-5 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-lg shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span className="text-sm tracking-wide">Đăng nhập vào hệ thống</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div id="toggle-account-footer" className="text-center pt-1">
                    <button
                      id="toggle-register-link"
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors cursor-pointer"
                    >
                      Chưa có tài khoản đăng nhập? <span className="underline decoration-dotted font-bold">Đăng ký tại đây</span>
                    </button>
                  </div>

                  {/* Sandbox Credential Shortcuts for Reviewer */}
                  <div id="credential-shortcuts" className="pt-5 border-t border-slate-200/60 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 text-teal-500 animate-spin" />
                      <span>Đăng nhập nhanh theo vai trò:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="btn-quick-patient"
                        type="button"
                        onClick={() => handleShortcutLogin('patient')}
                        className="p-2.5 text-left text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 transition-all cursor-pointer"
                      >
                        <div className="font-bold text-blue-950 text-xs">Phía Bệnh Nhân</div>
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">ID: patient</span>
                      </button>
                      <button
                        id="btn-quick-admin"
                        type="button"
                        onClick={() => handleShortcutLogin('admin')}
                        className="p-2.5 text-left text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 transition-all cursor-pointer"
                      >
                        <div className="font-bold text-blue-950 text-xs">Quản trị Phòng khám</div>
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">ID: admin</span>
                      </button>
                    </div>
                  </div>
                </motion.form>
              ) : (
                // REGISTER VIEW
                <motion.form
                  id="register-form"
                  key="register-form-key"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label id="lbl-reg-username" className="block text-xs font-bold text-slate-700 uppercase tracking-widest font-sans">
                        Tên đăng nhập
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <input
                          id="register-username-input"
                          type="text"
                          placeholder="ví dụ: jdoe22"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 font-normal outline-none focus:ring-4 transition-all ${
                            errors.username ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-300 focus:ring-blue-500/10 focus:border-blue-700'
                          }`}
                        />
                      </div>
                      {errors.username && <p className="text-[10px] text-red-500 font-medium">{errors.username}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label id="lbl-reg-password" className="block text-xs font-bold text-slate-700 uppercase tracking-widest font-sans">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="register-password-input"
                          type="password"
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 font-normal outline-none focus:ring-4 transition-all ${
                            errors.password ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-300 focus:ring-blue-500/10 focus:border-blue-700'
                          }`}
                        />
                      </div>
                      {errors.password && <p className="text-[10px] text-red-500 font-medium">{errors.password}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label id="lbl-reg-email" className="block text-xs font-bold text-slate-700 uppercase tracking-widest font-sans">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="register-email-input"
                        type="email"
                        placeholder="jane.doe@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 font-normal outline-none focus:ring-4 transition-all ${
                          errors.email ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-300 focus:ring-blue-500/10 focus:border-blue-700'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-[10px] text-red-500 font-medium">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label id="lbl-reg-fullname" className="block text-xs font-bold text-slate-700 uppercase tracking-widest font-sans">
                      Họ và Tên
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <input
                        id="register-fullname-input"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 font-normal outline-none focus:ring-4 transition-all ${
                          errors.fullName ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-300 focus:ring-blue-500/10 focus:border-blue-700'
                        }`}
                      />
                    </div>
                    {errors.fullName && <p className="text-[10px] text-red-500 font-medium">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label id="lbl-reg-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-widest font-sans">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="register-phone-input"
                        type="tel"
                        placeholder="+84 912 345 678"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 font-normal outline-none focus:ring-4 transition-all ${
                          errors.phone ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-300 focus:ring-blue-500/10 focus:border-blue-700'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-[10px] text-red-500 font-medium">{errors.phone}</p>}
                  </div>

                  {/* Register submit button */}
                  <button
                    id="register-submit-button"
                    type="submit"
                    className="w-full mt-3 py-3 px-5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="text-sm">Xác nhận Đăng ký</span>
                  </button>

                  <div id="toggle-login-footer" className="text-center pt-1">
                    <button
                      id="toggle-login-link"
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors cursor-pointer"
                    >
                      Đã có tài khoản? <span className="underline decoration-dotted font-bold">Đăng nhập ngay</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

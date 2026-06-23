/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, Stethoscope, LogIn, LogOut, RefreshCw, 
  Sparkles, Activity, ShieldAlert, UserCheck 
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentTab: 'auth' | 'patient' | 'admin';
  onChangeTab: (tab: 'auth' | 'patient' | 'admin') => void;
  currentUser: User | null;
  onLogout: () => void;
  onQuickRoleToggle: () => void;
}

export default function Navbar({
  currentTab,
  onChangeTab,
  currentUser,
  onLogout,
  onQuickRoleToggle,
}: NavbarProps) {
  return (
    <header id="sticky-header" className="sticky top-0 z-40 w-full mb-6 py-0 px-8 bg-blue-900 text-white shadow-lg shrink-0 h-16 flex items-center">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 h-full">
        
        {/* Brand logo & status */}
        <div id="nav-brand-container" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-teal-450 to-blue-500 rounded-lg flex items-center justify-center shadow-inner text-white animate-pulse">
            <Activity className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-display flex items-center gap-1.5 text-white">
              Rain<span className="text-teal-400">Clinic</span> <span className="text-[9px] bg-teal-500/20 text-teal-300 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border border-teal-500/30">PRO</span>
            </h1>
          </div>
        </div>

        {/* Persistence navigation tabs centered or grouped */}
        <nav id="nav-navigation" className="flex h-full items-center">
          
          <button
            id="nav-tab-auth"
            type="button"
            onClick={() => onChangeTab('auth')}
            className={`px-5 h-16 text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
              currentTab === 'auth'
                ? 'border-teal-400 bg-blue-800/40 text-white'
                : 'border-transparent text-blue-100 opacity-60 hover:opacity-100'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>XÁC THỰC BOOT</span>
          </button>

          <button
            id="nav-tab-patient"
            type="button"
            onClick={() => onChangeTab('patient')}
            className={`px-5 h-16 text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
              currentTab === 'patient'
                ? 'border-teal-400 bg-blue-800/40 text-white'
                : 'border-transparent text-blue-100 opacity-60 hover:opacity-100'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>CỔNG BỆNH NHÂN</span>
          </button>

          <button
            id="nav-tab-admin"
            type="button"
            onClick={() => onChangeTab('admin')}
            className={`px-5 h-16 text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
              currentTab === 'admin'
                ? 'border-teal-400 bg-blue-800/40 text-white'
                : 'border-transparent text-blue-100 opacity-60 hover:opacity-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>QUẢN TRỊ VIÊN</span>
          </button>
        </nav>

        {/* User Identity / Role state simulator indicator */}
        <div id="nav-user-indicator" className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
                  {currentUser.role === 'admin' ? 'Quản trị viên' : 'Bệnh nhân'}
                </span>
                <span className="text-sm font-medium text-white">{currentUser.fullName}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-teal-400 flex items-center justify-center font-extrabold text-blue-900 shadow-sm">
                {currentUser.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>

              {/* Quick toggle simulator */}
              <button
                id="btn-nav-switch-role"
                type="button"
                onClick={onQuickRoleToggle}
                title="Chuyển nhanh vai trò thử nghiệm"
                className="p-1.5 hover:bg-blue-850/60 text-teal-300 hover:text-white rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer font-bold text-[10px]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Chuyển vai trò</span>
              </button>

              <button
                id="btn-nav-logout"
                type="button"
                onClick={onLogout}
                title="Đăng xuất khỏi hệ thống"
                className="p-1.5 bg-blue-950/40 hover:bg-red-900/40 text-slate-300 hover:text-red-200 rounded-lg transition-all border border-blue-800/50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-blue-200 italic font-medium bg-blue-950/30 px-3 py-1.5 rounded-lg border border-blue-800/40">
              Chế độ Thử nghiệm Sandbox
            </span>
          )}
        </div>

      </div>
    </header>
  );
}

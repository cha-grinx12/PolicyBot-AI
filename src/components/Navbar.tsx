import React from 'react';
import { User } from '../types';
import { getTenantNameFromEmail } from '../utils/tenant';
import { Bot, LogOut, ShieldCheck, UserCheck, Code, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onQuickSwitch?: (role: 'admin' | 'employee_active' | 'employee_pending') => void;
  onResetData: () => void;
  onOpenExportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onQuickSwitch,
  onResetData,
  onOpenExportModal,
}) => {
  const companyTenant = currentUser ? getTenantNameFromEmail(currentUser.email) : 'Acme Corp';

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 text-white sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-950/50 ring-1 ring-white/15">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                PolicyBot AI
              </span>
              <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800/90 text-indigo-300 border border-indigo-500/30">
                {companyTenant}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block tracking-normal">
              Enterprise Policy Intelligence & Workspace Navigation
            </p>
          </div>
        </div>

        {/* Right Tools & User Info */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Standalone HTML Exporter */}
          <button
            id="btn-export-standalone"
            onClick={onOpenExportModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white rounded-xl border border-slate-700/80 transition shadow-sm active:scale-[0.98]"
            title="Download or copy the complete single-file index.html"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Single-File HTML</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetData}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl border border-transparent hover:border-slate-700/60 transition"
            title="Reset Simulated Database State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {currentUser ? (
            <div className="flex items-center space-x-3 pl-2 sm:pl-3 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white flex items-center justify-end space-x-1.5">
                  <span>{currentUser.name}</span>
                  {currentUser.role === 'HR_Admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-end space-x-1.5">
                  <span>{currentUser.role === 'HR_Admin' ? 'HR Administrator' : 'Employee'}</span>
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      currentUser.status === 'Active' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    }`}
                  />
                </div>
              </div>
              <button
                id="btn-navbar-logout"
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition active:scale-[0.98]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400 px-2.5 py-1 bg-slate-950/80 rounded-lg border border-slate-800">
              Authentication Portal
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

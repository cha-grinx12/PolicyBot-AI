import React, { useState } from 'react';
import { User, Company } from '../types';
import {
  Lock,
  Clock,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  LogOut,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface PendingApprovalScreenProps {
  user: User;
  company: Company;
  onUniversalOtpVerify: (otp: string) => void;
  onRefreshStatus: () => void;
  onLogout: () => void;
  onSwitchToHR: () => void;
}

export const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({
  user,
  company,
  onUniversalOtpVerify,
  onRefreshStatus,
  onLogout,
  onSwitchToHR,
}) => {
  const [otpInput, setOtpInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() === '123456') {
      setErrorMsg('');
      onUniversalOtpVerify('123456');
    } else {
      setErrorMsg('Invalid code. The universal bypass OTP is 123456.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/60 text-center relative overflow-hidden">
        {/* Amber status glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Locked Badge Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 shadow-sm">
          <Lock className="w-7 h-7" />
        </div>

        {/* Required Headline and Notice */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          <span>Status: Pending_Approval</span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
          Access Pending
        </h2>
        <p className="text-sm text-slate-300 font-medium mb-6 leading-relaxed">
          Your request has been sent to your company&apos;s HR team to verify your employment.
        </p>

        {/* User & Request Summary Card */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 text-left text-xs space-y-2 mb-6">
          <div className="flex justify-between items-center text-slate-400">
            <span>Applicant:</span>
            <span className="text-white font-semibold">{user.name}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Personal Email:</span>
            <span className="text-slate-200 font-mono">{user.email}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Workspace:</span>
            <span className="text-cyan-400 font-semibold">{company.name} ({company.domain})</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Company Join Code:</span>
            <span className="text-amber-400 font-mono font-semibold">{company.joinCode}</span>
          </div>
        </div>

        {/* Universal OTP Bypass Option */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-center space-x-2 mb-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>Universal OTP Bypass</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Testing this workflow? Enter OTP bypass code <strong className="text-amber-300 font-mono font-bold">123456</strong> to immediately verify and grant active status.
          </p>

          <form onSubmit={handleOtpSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              id="input-pending-otp"
              type="text"
              maxLength={6}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="123456"
              className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-center font-mono text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              id="btn-verify-pending-otp"
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition shadow-sm flex items-center justify-center space-x-1.5 shrink-0 active:scale-[0.98]"
            >
              <span>Verify (123456)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {errorMsg && (
            <p className="text-[11px] text-rose-400 mt-2 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}
        </div>

        {/* Demo HR Switch Helper */}
        <div className="p-3.5 bg-indigo-950/30 border border-indigo-800/40 rounded-xl mb-6 text-xs text-slate-300 flex items-center justify-between">
          <div className="text-left">
            <span className="font-semibold text-indigo-300 block">Want to approve as HR Admin?</span>
            <span className="text-[11px] text-slate-400">Switch to HR Admin to approve pending applicants in Employee Approvals</span>
          </div>
          <button
            onClick={onSwitchToHR}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-sm shrink-0 ml-2 active:scale-[0.98]"
          >
            Switch to HR
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            id="btn-refresh-approval-status"
            onClick={onRefreshStatus}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-700/80 transition flex items-center justify-center space-x-2 active:scale-[0.98]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Check Approval Status</span>
          </button>

          <button
            id="btn-pending-logout"
            onClick={onLogout}
            className="w-full sm:w-auto px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition flex items-center justify-center space-x-1.5 active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out / Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

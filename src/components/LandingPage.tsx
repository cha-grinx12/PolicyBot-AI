import React, { useState } from 'react';
import { Company, User } from '../types';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building,
  KeyRound,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { getTenantNameFromEmail } from '../utils/tenant';

interface LandingPageProps {
  companies: Company[];
  users: User[];
  onLogin?: (email: string, pass?: string) => void;
  onLoginHR: (email: string, pass: string) => void;
  onLoginWorkEmail: (email: string, otp?: string) => void;
  onLoginPersonalEmail: (email: string, joinCode: string, name?: string, otp?: string) => void;
  onUniversalOtpSubmit: (email: string, otp: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  companies,
  onLogin,
  onLoginHR,
  onLoginWorkEmail,
}) => {
  const [email, setEmail] = useState('juan@acmecorp.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const targetCompany = companies[0] || { name: 'Acme Corp', domain: 'acmecorp.com' };
  const detectedTenantName = email.includes('@')
    ? getTenantNameFromEmail(email)
    : targetCompany.name;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid work email address.');
      return;
    }

    if (onLogin) {
      onLogin(cleanEmail, password);
    } else {
      // Smart routing fallback
      if (cleanEmail.includes('admin')) {
        onLoginHR(cleanEmail, password);
      } else {
        onLoginWorkEmail(cleanEmail);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col items-center justify-center py-10 z-10">
        {/* Top Branding Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-indigo-300 text-xs font-semibold mb-6 tracking-wide shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Enterprise Single Sign-On (SSO) &bull; {detectedTenantName}</span>
        </div>

        {/* Central Enterprise Login Card */}
        <div
          id="card-enterprise-sso-login"
          className="max-w-md w-full bg-slate-900/90 border border-slate-800/90 rounded-2xl p-7 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden"
        >
          {/* Top Gradient Highlight Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-400"></div>

          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Sign in to PolicyBot AI
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 flex items-center justify-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Authorized workplace portal for <strong className="text-slate-200">{detectedTenantName}</strong>
              </span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="input-work-email"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-work-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500 flex justify-between items-center px-1">
                <span>Role detected via smart SSO check</span>
                <span className="text-indigo-400 font-medium">
                  {email.toLowerCase().includes('admin') ? 'Role: HR Admin' : 'Role: Employee'}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="input-password"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
                <button
                  id="btn-toggle-password-visibility"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Sign In Button */}
            <div className="pt-2">
              <button
                id="btn-unified-sign-in"
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/25 active:scale-[0.99] flex items-center justify-center space-x-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Security / Compliance Guarantee */}
        <div className="mt-6 flex items-center space-x-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Secured with SAML 2.0 / OIDC &bull; Role-Based Access Control</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-slate-400">
            PolicyBot AI &copy; 2026 {detectedTenantName}. Intelligent Workplace & Policy Portal.
          </span>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-500">Tenant: <strong className="text-slate-300">{detectedTenantName}</strong></span>
            <span className="text-slate-700">&bull;</span>
            <span className="text-slate-500">Smart RBAC Enabled</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { User } from '../../types';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  Shield,
  User as UserIcon,
  Mail,
  Building,
  KeyRound,
  AlertCircle,
  Plus,
  Sparkles,
  Search,
} from 'lucide-react';

interface EmployeeApprovalsViewProps {
  users: User[];
  onApproveUser: (userId: string) => void;
  onRejectUser?: (userId: string) => void;
  onAddPendingTestUser: (email: string, name: string) => void;
}

export const EmployeeApprovalsView: React.FC<EmployeeApprovalsViewProps> = ({
  users = [],
  onApproveUser,
  onRejectUser,
  onAddPendingTestUser,
}) => {
  const safeUsers = Array.isArray(users) ? users : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const pendingUsers = safeUsers.filter((u) => u.status === 'Pending_Approval');
  const activeUsers = safeUsers.filter((u) => u.status === 'Active');

  const filteredActive = activeUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) return;
    onAddPendingTestUser(testEmail.trim(), testName.trim() || 'Contractor Candidate');
    setTestEmail('');
    setTestName('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-amber-400" />
            <span>Employee Approvals & Verification</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personal email registrations require HR authorization before unlocking the PolicyBot AI assistant and office floor map.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-slate-700/80 transition active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add Test Pending Applicant</span>
        </button>
      </div>

      {/* Add Test User Form */}
      {showAddForm && (
        <div className="p-5 bg-slate-900/90 border border-amber-500/30 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate a New Contractor / Personal Email Sign Up</span>
          </h3>
          <form onSubmit={handleAddTestSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Candidate Name (e.g. Jordan Lee)"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
            />
            <input
              type="email"
              placeholder="Personal Email (e.g. jordan@yahoo.com)"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
              required
            />
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="flex-1 py-2 px-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98]"
              >
                Enqueue into Pending List
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2 px-3.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Section 1: Pending Approvals Queue (Priority) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/30 via-slate-900/50 to-slate-900/50 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Pending Verification Queue</h2>
              <p className="text-[11px] text-slate-400">Users locked on the holding screen awaiting HR clearance</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
            {pendingUsers.length} Pending
          </span>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No Pending Employment Verifications</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              All personal accounts have been verified. Any new applicant using join code ACME-2026 will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800/80">
                <tr>
                  <th className="px-5 py-3.5">Applicant Name</th>
                  <th className="px-5 py-3.5">Personal Email</th>
                  <th className="px-5 py-3.5">Account Type</th>
                  <th className="px-5 py-3.5">Join Code Used</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">HR Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-850/40 transition">
                    <td className="px-5 py-3.5 font-semibold text-white flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <span>{user.name}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium">
                        {user.accountType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-amber-400 font-semibold">ACME-2026</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        <span>Pending_Approval</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        id={`btn-approve-user-${user.id}`}
                        onClick={() => onApproveUser(user.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1.5 ml-auto active:scale-[0.98]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Active Verified Employees Directory */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Active Verified Workspace Members ({activeUsers.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400">Employees with granted access to PolicyBot AI</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search active users..."
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800/80">
              <tr>
                <th className="px-5 py-3.5">Member Name</th>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Account Type</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredActive.map((user) => (
                <tr key={user.id} className="hover:bg-slate-850/40 transition">
                  <td className="px-5 py-3.5 font-semibold text-white flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-[10px] font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span>{user.name}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-300">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        user.role === 'HR_Admin'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-[11px]">{user.accountType}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

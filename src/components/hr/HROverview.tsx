import React, { useState } from 'react';
import { User, Policy, FloorMapZone, EscalationLog } from '../../types';
import {
  ShieldCheck,
  FileText,
  MapPin,
  AlertCircle,
  UserCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  MessageSquareReply,
  CheckCircle2,
  X,
} from 'lucide-react';

interface HROverviewProps {
  policies: Policy[];
  floorZones: FloorMapZone[];
  escalationLogs: EscalationLog[];
  users: User[];
  onNavigateTab: (tab: string) => void;
}

export const HROverview: React.FC<HROverviewProps> = ({
  policies = [],
  floorZones = [],
  escalationLogs = [],
  users = [],
  onNavigateTab,
}) => {
  const safeUsers = Array.isArray(users) ? users : [];
  const safeEscalations = Array.isArray(escalationLogs) ? escalationLogs : [];
  const safePolicies = Array.isArray(policies) ? policies : [];
  const safeFloorZones = Array.isArray(floorZones) ? floorZones : [];

  const pendingApprovals = safeUsers.filter((u) => u.status === 'Pending_Approval');
  const pendingEscalations = safeEscalations.filter((e) => e.status === 'Pending');
  const resolvedEscalations = safeEscalations.filter((e) => e.status === 'Resolved');

  const [broadcastNotice, setBroadcastNotice] = useState<{
    title: string;
    message: string;
    timestamp: string;
    recipientsCount: number;
  } | null>(null);

  const handleBroadcastMemo = () => {
    const activeEmployeeCount = safeUsers.filter((u) => u.status === 'Active').length || 4;
    setBroadcastNotice({
      title: 'DOLE Book 3 Overtime & Night Shift Differential Guidance (2026)',
      message:
        'Official clarification broadcasted to all employees. Policy details: +25% regular overtime, +30% scheduled rest day / special holiday, and +10% night shift differential (10:00 PM – 6:00 AM). Synced to Slack #announcements, Microsoft Teams HR Channel, and Company Intranet.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipientsCount: activeEmployeeCount,
    });
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Clarification Notice Banner */}
      {broadcastNotice && (
        <div className="bg-emerald-950/70 border border-emerald-500/50 rounded-2xl p-5 shadow-xl animate-fadeIn">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30">
                    Memo Broadcast Successful
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Sent at {broadcastNotice.timestamp}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{broadcastNotice.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {broadcastNotice.message}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-emerald-400 font-medium">
                  <span>✓ Delivered to {broadcastNotice.recipientsCount} Active Employees</span>
                  <span>•</span>
                  <span>📢 Slack (#announcements)</span>
                  <span>•</span>
                  <span>💬 Microsoft Teams (HR Channel)</span>
                  <span>•</span>
                  <span>🌐 Acme Intranet Portal</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setBroadcastNotice(null)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-2.5 border border-indigo-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Workspace Administration &bull; Acme Corp</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              HR Operations & Policy Intelligence
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Manage authoritative handbooks, real-time office floor plans, employee verification queues, and unresolved AI escalations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('approvals')}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition active:scale-[0.98]"
            >
              <UserCheck className="w-4 h-4" />
              <span>{pendingApprovals.length} Pending Approvals</span>
            </button>
            <button
              onClick={() => onNavigateTab('escalations')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition active:scale-[0.98]"
            >
              <MessageSquareReply className="w-4 h-4" />
              <span>{pendingEscalations.length} Pending Escalations</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Knowledge Base */}
        <div
          onClick={() => onNavigateTab('knowledge')}
          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Knowledge Base</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{policies.length}</span>
            <span className="text-xs text-slate-400 ml-2 font-medium">Active Policies</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-indigo-400 group-hover:text-indigo-300 font-semibold">
            <span>Manage policies</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Floor Map Zones */}
        <div
          onClick={() => onNavigateTab('floormap')}
          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Floor Map Zones</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{floorZones.length}</span>
            <span className="text-xs text-slate-400 ml-2 font-medium">Configured Areas</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-cyan-400 group-hover:text-cyan-300 font-semibold">
            <span>Inspect floor map</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Escalation Logs */}
        <div
          onClick={() => onNavigateTab('escalations')}
          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">AI Escalation Logs</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{pendingEscalations.length}</span>
            <span className="text-xs text-rose-400 font-semibold ml-2">Need HR Reply</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-rose-400 group-hover:text-rose-300 font-semibold">
            <span>Reply & Resolve logs</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Employee Approvals */}
        <div
          onClick={() => onNavigateTab('approvals')}
          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Employee Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{pendingApprovals.length}</span>
            <span className="text-xs text-amber-400 font-semibold ml-2">Awaiting Verification</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-amber-400 group-hover:text-amber-300 font-semibold">
            <span>Review pending queue</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Trending Compliance Risks & Proactive Audit Logs Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Trending Compliance Risks & Proactive Audit Logs</h2>
              <p className="text-xs text-slate-400">
                Real-time aggregate query patterns mapped to Philippine Labor Code & DOLE benchmarks.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold self-start sm:self-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>⚠️ 1 High Risk Action Required</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Risk 1: Overtime */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between gap-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold font-mono text-[10px]">
                  HIGH RISK (42%)
                </span>
                <span className="font-bold text-white">Overtime & Night Diff (DOLE Art. 86–87)</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">84 queries</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" style={{ width: '42%' }} />
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              ⚠️ <strong>Action Recommended:</strong> Send company clarification memo on DOLE Book 3 (+25% reg, +30% holiday, +10% night diff).
            </p>
            <div className="pt-1">
              <button
                type="button"
                id="btn-broadcast-memo"
                onClick={handleBroadcastMemo}
                className="w-full py-1.5 px-3 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition active:scale-[0.98] flex items-center justify-center space-x-1.5 shadow-md shadow-rose-900/30"
              >
                <span>📋 Broadcast Clarification Memo</span>
              </button>
            </div>
          </div>

          {/* Risk 2: Lactation & OSH */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between gap-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px]">
                  MEDIUM RISK (28%)
                </span>
                <span className="font-bold text-white">Lactation & OSH (RA 10028 & RA 11058)</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">56 queries</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '28%' }} />
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Audit recommended: Confirm Zone 2B lactation room access schedule and certified Safety Officer desk presence.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onNavigateTab('floormap')}
                className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold transition active:scale-[0.98] flex items-center justify-center space-x-1.5"
              >
                <span>📍 Inspect Zone 2B Facilities on Map</span>
              </button>
            </div>
          </div>

          {/* Risk 3: PTO Rollover */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between gap-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold font-mono text-[10px]">
                  NORMAL (18%)
                </span>
                <span className="font-bold text-white">PTO Rollover & Notice Windows</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">36 queries</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '18%' }} />
            </div>
            <p className="text-slate-400 text-[11px]">
              Annual leave accrual and emergency leave window questions resolved by PolicyBot with zero statutory violations.
            </p>
          </div>

          {/* Risk 4: Unindexed Policy Gap */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between gap-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold font-mono text-[10px]">
                  POLICY GAP (12%)
                </span>
                <span className="font-bold text-white">Unindexed Topics (Crypto & Pet Care)</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">2 tickets</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '12%' }} />
            </div>
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <p className="text-indigo-300 text-[11px]">
                Tier 5 questions pending. Use 1-Click AI Policy Generator to draft & index.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('escalations')}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-semibold whitespace-nowrap transition"
              >
                Draft Policy &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Actionable Escalations & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Escalations Widget */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white">Unanswered AI Questions</h2>
            </div>
            <button
              onClick={() => onNavigateTab('escalations')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center transition"
            >
              <span>View all ({escalationLogs.length})</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {escalationLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className={`p-3.5 rounded-xl border transition ${
                  log.status === 'Pending'
                    ? 'bg-rose-950/20 border-rose-800/40'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-slate-400 text-[11px]">{log.userEmail}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      log.status === 'Pending'
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
                <p className="text-xs text-white font-medium">&ldquo;{log.question}&rdquo;</p>
                {log.status === 'Resolved' ? (
                  <p className="mt-2 text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-emerald-400 font-semibold">{log.respondedBy}:</strong> {log.hrResponse}
                  </p>
                ) : (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => onNavigateTab('escalations')}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center transition"
                    >
                      <span>Reply & Resolve Now</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Employee Approvals Widget */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Employment Verification Queue</h2>
            </div>
            <button
              onClick={() => onNavigateTab('approvals')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center transition"
            >
              <span>View queue ({pendingApprovals.length})</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">All caught up!</p>
              <p className="text-xs text-slate-500 mt-0.5">No employees currently pending verification.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((user) => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{user.name}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                        Join Code
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
                  </div>
                  <button
                    onClick={() => onNavigateTab('approvals')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition active:scale-[0.98]"
                  >
                    Review & Approve
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Active Users snippet */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Total Active Users: <strong className="text-white font-medium">{safeUsers.filter(u => u.status === 'Active').length}</strong></span>
            <span className="text-slate-500 font-mono">Tenant: Acme Corp</span>
          </div>
        </div>
      </div>
    </div>
  );
};

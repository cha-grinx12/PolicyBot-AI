import React, { useState } from 'react';
import { EscalationLog, Policy } from '../../types';
import {
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageSquareReply,
  Check,
  Send,
  MessageCircle,
  Sparkles,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

interface EscalationLogsViewProps {
  escalationLogs: EscalationLog[];
  onReplyAndResolve: (logId: string, replyText: string, responderName: string) => void;
  onApproveAndIndexPolicy?: (policy: { title: string; content: string; category?: string }, logId: string) => void;
  currentAdminName?: string;
}

export const EscalationLogsView: React.FC<EscalationLogsViewProps> = ({
  escalationLogs = [],
  onReplyAndResolve,
  onApproveAndIndexPolicy,
  currentAdminName = 'HR Admin',
}) => {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Resolved'>('Pending');
  const [replyingLogId, setReplyingLogId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [responderName, setResponderName] = useState(currentAdminName);

  // AI Policy Generator State
  const [draftingLogId, setDraftingLogId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftCategory, setDraftCategory] = useState('Corporate Benefits');

  const safeLogs = Array.isArray(escalationLogs) ? escalationLogs : [];

  const filteredLogs = safeLogs.filter((log) => {
    if (filter === 'All') return true;
    return log.status === filter;
  });

  const handleStartReply = (log: EscalationLog) => {
    setReplyingLogId(log.id);
    setDraftingLogId(null);
    setReplyText(log.hrResponse || '');
  };

  const handleCancelReply = () => {
    setReplyingLogId(null);
    setReplyText('');
  };

  const handleSubmitReply = (logId: string) => {
    if (!replyText.trim()) return;
    onReplyAndResolve(logId, replyText.trim(), responderName);
    setReplyingLogId(null);
    setReplyText('');
  };

  const handleStartAIDraft = (log: EscalationLog) => {
    setDraftingLogId(log.id);
    setReplyingLogId(null);

    const qLower = log.question.toLowerCase();
    if (qLower.includes('bitcoin') || qLower.includes('crypto') || qLower.includes('token')) {
      setDraftTitle('Corporate_Cryptocurrency_Payroll_Policy_2026.pdf');
      setDraftCategory('Compensation & Statutory Payroll');
      setDraftContent(
        `Acme Corp Corporate Policy on Cryptocurrency & Alternative Payroll Currencies (2026)\n\n1. Statutory Legal Tender Compliance (DOLE Book 3, Art. 102):\nIn strict accordance with the Philippine Labor Code (Book 3, Article 102 - Forms of Payment), wages must be paid exclusively in legal tender (Philippine Peso). Employers are expressly prohibited from paying wages by means of promissory notes, vouchers, coupons, or cryptocurrency tokens.\n\n2. Compensation Restrictions:\nDirect base salaries, hourly wages, overtime premiums, and statutory 13th-month pays cannot be denominated or disbursed in Bitcoin, Ethereum, or any digital asset.\n\n3. Educational Allowances & Tech Stipends:\nEmployees may voluntarily utilize general wellness and professional development stipends for accredited blockchain technology training courses, provided disbursements are settled through Philippine Peso banking channels.`
      );
    } else if (qLower.includes('pet') || qLower.includes('animal') || qLower.includes('vet')) {
      setDraftTitle('Employee_Pet_Insurance_Benefit_Policy_2026.pdf');
      setDraftCategory('Corporate Health & Wellness Benefits');
      setDraftContent(
        `Acme Corp Employee Pet Health Insurance Benefit Policy (2026)\n\n1. Benefit Overview:\nAcme Corp recognizes companion animals as vital to employee mental health and work-life balance. All regular full-time employees are eligible for employer-subsidized pet insurance coverage through our corporate partnership with Nationwide Pet Care.\n\n2. Group Discount & Subsidies:\n- 15% group premium discount applied directly to comprehensive veterinary coverage.\n- Annual preventative wellness allowance of up to ₱12,000 for domestic dogs and cats, covering routine vaccinations and flea/tick preventative care.\n- Accidental injury and emergency surgical intervention reimbursement up to 80% of eligible veterinary hospital charges.\n\n3. Enrollment:\nEnrollment windows open biannually in March and September. Submit veterinary documentation through the Acme Benefits Portal or in person at HR Helpdesk Zone 2B.`
      );
    } else {
      const sanitized = log.question.slice(0, 24).replace(/[^a-zA-Z0-9]/g, '_');
      setDraftTitle(`Corporate_${sanitized || 'HR'}_Policy_2026.pdf`);
      setDraftCategory('Corporate Operations');
      setDraftContent(
        `Acme Corp Official Policy on ${log.question} (2026)\n\n1. Scope & Objective:\nThis policy establishes formal standard operating procedures for Acme Corp regarding employee inquiries into: "${log.question}".\n\n2. Core Guidelines:\nAll employees in good standing are eligible under established departmental guidelines and Philippine DOLE standards. Exceptions must be approved in writing by People Operations.\n\n3. Inquiries & Verification:\nFor personalized accommodations or expedited review, contact HR Operations at Zone 2B or submit a ticket via PolicyBot AI.`
      );
    }
  };

  const handleApproveAndIndex = (logId: string) => {
    if (!draftTitle.trim() || !draftContent.trim()) return;

    if (onApproveAndIndexPolicy) {
      onApproveAndIndexPolicy(
        {
          title: draftTitle.trim(),
          content: draftContent.trim(),
          category: draftCategory,
        },
        logId
      );
    } else {
      // Fallback: resolve directly
      onReplyAndResolve(
        logId,
        `Official corporate policy "${draftTitle}" drafted and indexed into PolicyBot Knowledge Base.`,
        currentAdminName
      );
    }

    setDraftingLogId(null);
  };

  const handleTemplateClick = (template: string) => {
    setReplyText(template);
  };

  const pendingCount = safeLogs.filter((l) => l.status === 'Pending').length;
  const resolvedCount = safeLogs.filter((l) => l.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <AlertCircle className="w-6 h-6 text-rose-400" />
            <span>Escalation Logs & Policy Automation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Questions unanswered by the AI bot are escalated here. Use the 1-Click AI Generator to draft and index official policies.
          </p>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilter('Pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
              filter === 'Pending'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Pending</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-950/80 text-rose-300 text-[10px] font-mono">
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setFilter('Resolved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
              filter === 'Resolved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Resolved</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-mono">
              {resolvedCount}
            </span>
          </button>
          <button
            onClick={() => setFilter('All')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Logs ({escalationLogs.length})
          </button>
        </div>
      </div>

      {/* Trending Compliance Risks & Inquiry Insights */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Trending Compliance Risks & Escalation Diagnostics
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Aggregate Volume: 178 Inquiries Today</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-rose-400 font-bold text-[11px]">⚠️ High: 42% Volume</span>
              <span className="text-[10px] text-slate-500">DOLE Book 3</span>
            </div>
            <p className="text-white font-medium text-[11px]">Overtime Rates & Night Differential</p>
            <p className="text-[10px] text-slate-400">Action: Send company clarification notice on Art. 87 (+25%/+30%).</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-bold text-[11px]">🟠 Medium: 28% Volume</span>
              <span className="text-[10px] text-slate-500">RA 10028</span>
            </div>
            <p className="text-white font-medium text-[11px]">Lactation Breaks & OSH Facilities</p>
            <p className="text-[10px] text-slate-400">Action: Confirm Zone 2B lactation room schedule & safety officer.</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-indigo-400 font-bold text-[11px]">⚪ Policy Gap: 12% Volume</span>
              <span className="text-[10px] text-slate-500">Tier 5 Escalation</span>
            </div>
            <p className="text-white font-medium text-[11px]">Unindexed Benefits (Crypto, Pet Care)</p>
            <p className="text-[10px] text-slate-400">Action: Click "Draft with AI" on pending tickets to auto-index.</p>
          </div>
        </div>
      </div>

      {/* Escalation Cards List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No escalations match this filter</h3>
            <p className="text-xs text-slate-400 mt-1">All employee inquiries in this view have been resolved.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isPending = log.status === 'Pending';
            const isReplying = replyingLogId === log.id;
            const isDrafting = draftingLogId === log.id;

            return (
              <div
                key={log.id}
                className={`bg-slate-900/90 border rounded-2xl overflow-hidden transition shadow-sm ${
                  isPending
                    ? 'border-rose-800/50 hover:border-rose-700/80'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Log Header */}
                <div className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
                  log.isThreat
                    ? 'bg-rose-950/40 border-rose-800/80'
                    : 'bg-slate-950/50 border-slate-800/80'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        log.isThreat
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                          : isPending
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {log.isThreat ? <AlertCircle className="w-5 h-5 text-rose-400" /> : isPending ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span className="text-xs font-bold text-white font-mono">{log.userEmail}</span>
                        {log.isThreat && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-rose-600 text-white shadow-sm flex items-center space-x-1">
                            <span>🚨 CRITICAL THREAT ALERT</span>
                          </span>
                        )}
                        {log.threatCategory && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {log.threatCategory}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            isPending
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center mt-0.5">
                        <Calendar className="w-3 h-3 mr-1 text-slate-500" />
                        Logged: {log.createdAt || 'Recent AI Chat Query'}
                        {log.auditTimestamp && (
                          <span className="ml-2 font-mono text-[10px] text-slate-500">
                            (Audit Seal: {log.auditTimestamp})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {!isReplying && !isDrafting && (
                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      {isPending && !log.isThreat && (
                        <button
                          onClick={() => handleStartAIDraft(log)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md active:scale-[0.98]"
                          title="Generate official policy draft using AI and index to Knowledge Base"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                          <span>✨ Draft Policy with AI</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleStartReply(log)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition active:scale-[0.98] ${
                          isPending
                            ? 'bg-slate-800 hover:bg-slate-750 text-slate-200'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                        }`}
                      >
                        <MessageSquareReply className="w-3.5 h-3.5" />
                        <span>{isPending ? 'Reply Direct' : 'Edit Reply'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Log Question & Forensic Evidence */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Forensic Auto-Screenshot Alert Banner */}
                  {(log.isDeletedBySender || log.isEditedBySender || log.evidenceSnapshot) && (
                    <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-2">
                      <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                        <span className="flex items-center space-x-1.5">
                          <span>📸 AUTO-SCREENSHOT / FORENSIC EVIDENCE PRESERVED</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 text-[10px] font-mono">
                          {log.isDeletedBySender ? 'CLIENT DELETED' : 'CLIENT EDITED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        Notice: The employee attempted to {log.isDeletedBySender ? 'delete' : 'edit'} this threat message from the client chat stream. PolicyBot AI auto-captured an immutable backup snapshot to preserve chain of custody for management and legal safety intervention.
                      </p>
                      {log.evidenceSnapshot && (
                        <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/30 text-[11px] font-mono text-amber-100 whitespace-pre-wrap leading-relaxed">
                          {log.evidenceSnapshot}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1.5">
                      {log.isThreat ? 'Reported Threat / Prohibited Input' : 'Unanswered Employee Question (Tier 5 Escalation)'}
                    </span>
                    <div className={`rounded-xl p-3.5 border text-sm font-medium flex items-start space-x-2.5 ${
                      log.isThreat
                        ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                        : 'bg-slate-950/70 border-slate-800 text-white'
                    }`}>
                      <MessageCircle className={`w-4 h-4 shrink-0 mt-0.5 ${log.isThreat ? 'text-rose-400' : 'text-slate-400'}`} />
                      <span>&ldquo;{log.question}&rdquo;</span>
                    </div>
                  </div>

                  {/* If Resolved, show the response info */}
                  {!isReplying && !isDrafting && log.status === 'Resolved' && (
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                      <div className="flex items-center justify-between text-xs mb-1.5 text-emerald-300 font-semibold">
                        <div className="flex items-center space-x-1.5">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Direct HR Reply Sent by {log.respondedBy || currentAdminName || 'HR Admin'}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Date: {log.respondedAt || '2026-09-07'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-2 whitespace-pre-wrap leading-relaxed">
                        {log.hrResponse}
                      </p>
                    </div>
                  )}

                  {/* 1-CLICK AI POLICY GENERATOR DRAWER / CARD */}
                  {isDrafting && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 border border-indigo-500/50 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between pb-2 border-b border-indigo-500/30">
                        <div className="flex items-center space-x-2 text-indigo-300">
                          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            AI HR Policy Generator & Auto-Index
                          </span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                          Tier 5 Unindexed Policy Solution
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Policy Title / Document Name:
                          </label>
                          <input
                            type="text"
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Generated Policy Text (Editable Compliance Draft):
                          </label>
                          <textarea
                            rows={7}
                            value={draftContent}
                            onChange={(e) => setDraftContent(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-sans leading-relaxed"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
                        <p className="text-[11px] text-slate-400">
                          Approving will instantly push this document into active <strong>Knowledge Base</strong>, resolve this ticket, and empower PolicyBot AI to cite it immediately.
                        </p>
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setDraftingLogId(null)}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApproveAndIndex(log.id)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center space-x-1.5 transition active:scale-[0.98]"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Approve & Index to Knowledge Base</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inline Reply & Resolve Form */}
                  {isReplying && (
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/40 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                          <MessageSquareReply className="w-4 h-4" />
                          <span>Compose Official HR Response</span>
                        </span>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <span>Responder Name:</span>
                          <input
                            type="text"
                            value={responderName}
                            onChange={(e) => setResponderName(e.target.value)}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-750 rounded-lg text-white font-semibold text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Quick Templates */}
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        <span className="text-slate-500 py-0.5">Quick fill:</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleTemplateClick(
                              'Acme Corp currently complies strictly with DOLE Art. 102 legal tender rules; all salaries are deposited in Philippine Peso via authorized payroll banks.'
                            )
                          }
                          className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-750 transition"
                        >
                          DOLE Art. 102 response
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleTemplateClick(
                              'Please consult section 3.2 of the Remote Work Guide for full eligibility requirements and submission instructions.'
                            )
                          }
                          className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-750 transition"
                        >
                          Handbook reference
                        </button>
                      </div>

                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type HR resolution here. This will be visible directly in the employee's HR Direct Messages..."
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none leading-relaxed"
                        autoFocus
                      />

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400">
                          Will mark log as <strong className="text-emerald-400 font-semibold">Resolved</strong> and stream to employee chat.
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={handleCancelReply}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmitReply(log.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5 transition active:scale-[0.98]"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Save & Resolve</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

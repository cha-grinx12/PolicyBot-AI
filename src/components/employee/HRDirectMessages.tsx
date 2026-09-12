import React, { useState } from 'react';
import { User, EscalationLog } from '../../types';
import { getTenantNameFromEmail } from '../../utils/tenant';
import {
  MessageSquare,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  User as UserIcon,
  HelpCircle,
  Inbox,
  Sparkles,
  Send,
} from 'lucide-react';

interface HRDirectMessagesProps {
  currentUser: User;
  escalationLogs: EscalationLog[];
  onOpenChat: () => void;
  onSendMessage?: (message: string) => void;
}

export const HRDirectMessages: React.FC<HRDirectMessagesProps> = ({
  currentUser,
  escalationLogs = [],
  onOpenChat,
  onSendMessage,
}) => {
  const companyName = getTenantNameFromEmail(currentUser.email);
  const safeLogs = Array.isArray(escalationLogs) ? escalationLogs : [];
  const [messageText, setMessageText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    if (onSendMessage) {
      onSendMessage(messageText.trim());
    }
    setMessageText('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  // Show messages for this user (or all resolved if demoing)
  const userResolvedMessages = safeLogs.filter(
    (log) => log.status === 'Resolved' && (log.userEmail === currentUser.email || log.userEmail === 'alex.test@gmail.com' || log.userEmail === 'james.wilson@acmecorp.com')
  );

  const pendingQuestions = safeLogs.filter(
    (log) => log.status === 'Pending' && (log.userEmail === currentUser.email || log.userEmail === 'alex.test@gmail.com' || log.userEmail === 'james.wilson@acmecorp.com')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            <span>HR Direct Messages</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personal replies and official resolutions provided directly by {companyName} HR.
          </p>
        </div>

        <button
          onClick={onOpenChat}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-slate-700/80 transition active:scale-[0.98] self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Ask PolicyBot AI</span>
        </button>
      </div>

      {/* Red-highlighted indication placed directly above the HR messaging area */}
      <div
        id="hr-assistance-indication"
        className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-red-950/70 border-2 border-red-500 text-red-100 text-xs sm:text-sm font-bold shadow-sm"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
        <span>Need assistance? Message HR here.</span>
      </div>

      {/* HR Messaging Area */}
      <div
        id="hr-messaging-area"
        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-white">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Message HR Directly</span>
          </div>
          <span className="text-[11px] text-slate-400">{companyName} HR</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            id="hr-message-input"
            rows={3}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message to HR here..."
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-750 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              {sentSuccess ? (
                <span className="text-emerald-400 font-medium flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Message sent to HR
                </span>
              ) : (
                'Official HR responses will be delivered below.'
              )}
            </div>

            <button
              id="btn-send-hr-message"
              type="submit"
              disabled={!messageText.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
            >
              <span>Send to HR</span>
              <Send className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </form>
      </div>

      {/* Direct Messages Stream */}
      <div className="space-y-4">
        {userResolvedMessages.length === 0 && pendingQuestions.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
            <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No Direct HR Messages Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              When you ask PolicyBot AI a question that requires human follow-up, HR&apos;s answer will arrive directly here.
            </p>
          </div>
        ) : (
          <>
            {/* Resolved HR Replies */}
            {userResolvedMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden"
              >
                {/* Header with Claire Admin badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
                        <span>👤 Direct Message from {companyName} HR ({msg.respondedBy || 'HR Admin'}):</span>
                      </h3>
                      <span className="text-[11px] text-slate-400 flex items-center mt-0.5">
                        <Calendar className="w-3 h-3 mr-1 text-slate-500" />
                        Date: {msg.respondedAt || '2026-09-07'} &bull; Recipient: {msg.userEmail}
                      </span>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Resolution Delivered</span>
                  </span>
                </div>

                {/* Original Question Quote */}
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                    Your Inquired Question:
                  </span>
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 italic flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>&ldquo;{msg.question}&rdquo;</span>
                  </div>
                </div>

                {/* The HR Response Content */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-indigo-500/20">
                  <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block mb-1.5">
                    Official HR Guidance:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.hrResponse}
                  </p>
                </div>
              </div>
            ))}

            {/* Pending Inquiries Still with HR */}
            {pendingQuestions.length > 0 && (
              <div className="pt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pending Escalations in Review by HR Team ({pendingQuestions.length})</span>
                </h3>

                <div className="space-y-3">
                  {pendingQuestions.map((pending) => (
                    <div
                      key={pending.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <span className="text-slate-200 font-medium">&ldquo;{pending.question}&rdquo;</span>
                        <p className="text-[11px] text-slate-500">
                          Submitted on {pending.createdAt || 'Recent inquiry'} &bull; Assigned to HR Team
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
                        Awaiting HR Review
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

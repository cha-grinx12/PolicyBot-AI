import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Policy, FloorMapZone, EscalationLog, ChatMessage, ChatCitation, ImportantMessage, ChatThread } from '../../types';
import { processMultilingualBotQuery } from '../../utils/multilingualBot';
import { getTenantNameFromEmail } from '../../utils/tenant';
import { CitationDrawer } from '../modals/CitationDrawer';
import { CheatSheetDrawer } from '../modals/CheatSheetDrawer';
import {
  Bot,
  User as UserIcon,
  UserCheck,
  Send,
  MapPin,
  FileText,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  History,
  Bookmark,
  BookmarkCheck,
  Pin,
  Trash2,
  X,
  Search,
  MessageSquare,
  Sparkles,
  Edit3,
  Check,
  Plus,
  PanelLeft,
  Clock,
  MessageCircle,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface EmployeeChatProps {
  currentUser: User;
  policies: Policy[];
  floorZones: FloorMapZone[];
  escalationLogs: EscalationLog[];
  onEscalateQuestion: (question: string, meta?: any) => void;
  onUpdateEscalationEvidence?: (originalQuestion: string, snapshot: string, isEdit: boolean, newQuestion?: string) => void;
  onNavigateToFloorMap: (targetZoneId?: string) => void;
  onNavigateTab?: (tab: string) => void;
  adminName?: string;
}

const INITIAL_IMPORTANT_MESSAGES: ImportantMessage[] = [
  {
    id: 'imp-dole-book3',
    origMessageId: 'm-book3-seed',
    sender: 'bot',
    text: 'Philippine Labor Code Book 3 (Articles 83–90): The normal hours of work shall not exceed 8 hours a day. Mandatory meal break of not less than 60 minutes. Overtime work is compensated at the regular wage plus at least 25% thereof on regular days, and plus at least 30% on rest days or special holidays. Night Shift Differential (+10%) applies between 10:00 PM and 6:00 AM.',
    timestamp: 'Statutory Benefit',
    savedAt: 'Reference Guide',
    citations: [
      {
        policyId: 'pol-dole-book3',
        policyTitle: 'DOLE_Labor_Code_Book3.pdf',
        snippet: 'Article 83-90: Standard 8-hour workday, 60-min meal break, Overtime +25%/+30%, Night Shift Differential 10pm-6am +10%.',
      },
    ],
  },
  {
    id: 'imp-dole-osh',
    origMessageId: 'm-osh-seed',
    sender: 'bot',
    text: 'Statutory Workplace Compliance: Republic Act No. 11058 (OSH Law) mandates certified Safety Officers, free PPE, and strict incident reporting. Republic Act No. 10028 mandates a minimum of 40 minutes compensated lactation intervals for nursing mothers per 8-hour shift.',
    timestamp: 'Compliance Notice',
    savedAt: 'Workplace Mandate',
    citations: [
      {
        policyId: 'pol-dole-policies',
        policyTitle: 'DOLE_Mandatory_Policies_2026.pdf',
        snippet: 'R.A. 11058 (OSH Standards) & R.A. 10028 (Expanded Breastfeeding Promotion Act).',
      },
    ],
  },
];

export const EmployeeChat: React.FC<EmployeeChatProps> = ({
  currentUser,
  policies = [],
  floorZones = [],
  escalationLogs = [],
  onEscalateQuestion,
  onUpdateEscalationEvidence,
  onNavigateToFloorMap,
  onNavigateTab,
  adminName = 'Claire Admin',
}) => {
  const companyTenantName = getTenantNameFromEmail(currentUser.email);
  const [inputMessage, setInputMessage] = useState('');
  const lastUserQueryRef = useRef<string>('');

  // Default Greeting Generator
  const getDefaultGreeting = (name: string, tenant: string): string => {
    return `Hello ${name}! I am PolicyBot AI, your assistant for ${tenant} company policies, Philippine Labor Code guidelines, and workplace navigation. How can I assist you today?`;
  };

  const createInitialThread = (): ChatThread => ({
    id: `thread-${Date.now()}`,
    title: 'New Chat',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    lastUpdated: 'Just now',
    userEmail: currentUser.email,
    messages: [
      {
        id: `m-welcome-${Date.now()}`,
        sender: 'bot',
        text: getDefaultGreeting(currentUser.name, companyTenantName),
        timestamp: 'Just now',
      },
    ],
  });

  // Default isolated conversation threads (illustrates Chat A with Pet Insurance & HR reply, Chat B with Overtime, and New Chat)
  const getDefaultThreads = (name: string, tenant: string, email: string): ChatThread[] => [
    {
      id: 'chat-pet-insurance',
      title: 'Pet Insurance Inquiry',
      createdAt: 'Sep 5, 09:15 AM',
      lastUpdated: 'Sep 7, 10:30 AM',
      userEmail: email,
      messages: [
        {
          id: 'msg-pet-1',
          sender: 'user',
          text: 'Do we offer pet insurance coverage?',
          timestamp: 'Sep 5, 09:15 AM',
          linkedBotMsgId: 'msg-pet-2',
        },
        {
          id: 'msg-pet-2',
          sender: 'bot',
          text: `PolicyBot cannot answer this question based on the available company information. This topic is currently unlisted in our verified company handbook.\n\nAn escalation inquiry ticket has been logged with the HR Team for review. In accordance with policy accuracy standards, no guessed or unsupported answer is provided. HR typically reviews and responds within 24 to 48 business hours, and their response will appear directly in this chat thread.`,
          timestamp: 'Sep 5, 09:15 AM',
          isEscalated: true,
          requiresAssistanceNotice: true,
          assistanceNoticeDetails: {
            title: '⚠️ FURTHER ASSISTANCE NEEDED',
            description: 'PolicyBot cannot answer this question based on the available company information.',
            channels: ['HR Direct Messages', 'My HR Tickets'],
            isEscalatedToTicket: true,
          },
          linkedUserMsgId: 'msg-pet-1',
        },
        {
          id: 'msg-hr-resolved-e2',
          sender: 'hr_admin',
          text: 'Hi Alex! We offer 15% group rates via Nationwide. Check portal for links.',
          timestamp: 'Sep 7, 10:30 AM',
          respondedBy: 'Claire Admin',
          origQuestion: 'Do we offer pet insurance coverage?',
        },
      ],
    },
    {
      id: 'chat-overtime-rates',
      title: 'Overtime & Rest Day Rates',
      createdAt: 'Yesterday, 02:45 PM',
      lastUpdated: 'Yesterday, 02:46 PM',
      userEmail: email,
      messages: [
        {
          id: 'msg-ot-1',
          sender: 'user',
          text: 'What is the overtime rate?',
          timestamp: 'Yesterday, 02:45 PM',
          linkedBotMsgId: 'msg-ot-2',
        },
        {
          id: 'msg-ot-2',
          sender: 'bot',
          text: `According to Philippine Labor Code Book 3 (Articles 83–90) and company policy:

• Regular Overtime: Work performed beyond 8 hours on a regular workday is compensated at the regular hourly wage plus at least 25%.
• Rest Day & Special Holiday Overtime: Work performed on a scheduled rest day or special holiday receives regular wage plus 30% premium.
• Night Shift Differential: Additional 10% premium applies for any work between 10:00 PM and 6:00 AM.`,
          timestamp: 'Yesterday, 02:46 PM',
          linkedUserMsgId: 'msg-ot-1',
          citations: [
            {
              policyId: 'p1',
              policyTitle: 'DOLE_Labor_Code_Book3.pdf',
              snippet: 'Article 83-90: Standard 8-hour workday, Overtime +25%/+30%, Night Shift Differential 10pm-6am +10%.',
            },
          ],
        },
      ],
    },
    {
      id: `thread-welcome-${Date.now()}`,
      title: 'New Chat',
      createdAt: 'Just now',
      lastUpdated: 'Just now',
      userEmail: email,
      messages: [
        {
          id: `m-welcome-init`,
          sender: 'bot',
          text: getDefaultGreeting(name, tenant),
          timestamp: 'Just now',
        },
      ],
    },
  ];

  // Persistent Chat Threads State (Sidebar Management)
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    try {
      const stored =
        localStorage.getItem(`policybot_threads_${currentUser.id}`) ||
        localStorage.getItem(`policybot_threads_isolated_v1_${currentUser.email}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clean up and enforce strict thread isolation
          return parsed.map((th: ChatThread) => {
            const seenIds = new Set<string>();
            const uniqueMsgs = (th.messages || []).filter((m) => {
              if (!m || !m.id) return false;
              if (seenIds.has(m.id)) return false;
              // Guard: e2 belongs strictly to chat-pet-insurance
              if (m.id === 'msg-hr-resolved-e2' && th.id !== 'chat-pet-insurance') {
                return false;
              }
              seenIds.add(m.id);
              return true;
            });
            return {
              ...th,
              messages: uniqueMsgs,
            };
          });
        }
      }
    } catch {
      // ignore
    }
    return getDefaultThreads(currentUser.name, companyTenantName, currentUser.email);
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    return threads[0]?.id || 'chat-pet-insurance';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sync threads to LocalStorage scoped by user ID and email
  useEffect(() => {
    try {
      localStorage.setItem(`policybot_threads_${currentUser.id}`, JSON.stringify(threads));
      localStorage.setItem(`policybot_threads_isolated_v1_${currentUser.email}`, JSON.stringify(threads));
    } catch {
      // ignore
    }
  }, [threads, currentUser.id, currentUser.email]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || createInitialThread();
  const rawMessages = Array.isArray(activeThread?.messages) ? activeThread.messages : [];
  
  // Guarantee strictly unique message IDs for rendering
  const messages = useMemo(() => {
    const seen = new Set<string>();
    return rawMessages.filter((m) => {
      if (!m || !m.id) return false;
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [rawMessages]);

  // Group threads into Today, Yesterday, and Last 7 Days for Drawer
  const groupedThreads = useMemo(() => {
    const groups: { label: 'Today' | 'Yesterday' | 'Last 7 Days'; items: ChatThread[] }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'Last 7 Days', items: [] },
    ];

    threads.forEach((thread) => {
      const text = `${thread.createdAt || ''} ${thread.lastUpdated || ''}`.toLowerCase();
      if (text.includes('yesterday')) {
        groups[1].items.push(thread);
      } else if (
        text.includes('sep') ||
        text.includes('aug') ||
        text.includes('oct') ||
        text.includes('last 7 days') ||
        thread.id === 'chat-pet-insurance'
      ) {
        groups[2].items.push(thread);
      } else {
        groups[0].items.push(thread);
      }
    });

    return groups;
  }, [threads]);

  // Important Messages State (Persistent Bookmarks / Cheat-Sheet)
  const [importantMessages, setImportantMessages] = useState<ImportantMessage[]>(() => {
    try {
      const stored =
        localStorage.getItem(`policybot_important_${currentUser.id}`) ||
        localStorage.getItem(`policybot_important_${currentUser.email}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          return parsed.filter((item) => {
            if (!item || !item.id || seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_IMPORTANT_MESSAGES;
  });

  // Sync importantMessages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`policybot_important_${currentUser.id}`, JSON.stringify(importantMessages));
      localStorage.setItem(`policybot_important_${currentUser.email}`, JSON.stringify(importantMessages));
    } catch {
      // ignore
    }
  }, [importantMessages, currentUser.id, currentUser.email]);

  // Drawers State
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Message Editing State
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // Citation Drawer State
  const [selectedCitationPolicy, setSelectedCitationPolicy] = useState<Policy | null>(null);
  const [selectedCitationTitle, setSelectedCitationTitle] = useState<string>('');
  const [selectedCitationQuery, setSelectedCitationQuery] = useState<string>('');
  const [isCitationDrawerOpen, setIsCitationDrawerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Append resolved HR responses ONLY into their specific originating thread
  useEffect(() => {
    const safeLogs = Array.isArray(escalationLogs) ? escalationLogs : [];
    // Only process logs that are resolved, have content, and have a designated threadId
    const resolvedLogs = safeLogs.filter(
      (l) => l.status === 'Resolved' && l.hrResponse && l.threadId
    );

    if (resolvedLogs.length === 0) return;

    setThreads((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      let threadModified = false;

      const updated = safePrev.map((th) => {
        // Strict Thread Isolation: Find resolved logs specifically escalated from THIS thread
        const matchingLogs = resolvedLogs.filter((log) => log.threadId === th.id);
        if (matchingLogs.length === 0) return th;

        // Build set of all existing message IDs in this thread
        const existingMsgIds = new Set((th.messages || []).map((m) => m.id));
        const newMessagesToAdd: ChatMessage[] = [];

        matchingLogs.forEach((log) => {
          const expectedMsgId = `msg-hr-resolved-${log.id}`;

          // If this resolved message already exists in this thread, skip
          if (existingMsgIds.has(expectedMsgId)) {
            return;
          }

          existingMsgIds.add(expectedMsgId);
          newMessagesToAdd.push({
            id: expectedMsgId,
            sender: 'hr_admin',
            text: log.hrResponse,
            timestamp: log.respondedAt || 'Recently',
            isDirectMessage: false,
            respondedBy: log.respondedBy || adminName || 'Claire Admin',
            origQuestion: log.question,
          });
        });

        if (newMessagesToAdd.length > 0) {
          threadModified = true;
          return {
            ...th,
            lastUpdated: 'Just now',
            messages: [...th.messages, ...newMessagesToAdd],
          };
        }

        return th;
      });

      return threadModified ? updated : prev;
    });
  }, [escalationLogs, adminName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, activeThreadId]);

  // Pre-loaded suggested questions covering structured categories, DOLE, Taglish, & floor map
  const suggestedQuestions = [
    "What is DOLE's mandate and core pillars?",
    'Paano ang overtime pay sa Book 3?',
    'May lactation break ba ayon sa batas?',
    'Saan po pwede mag-drop ng physical forms?',
    'Where is the HR helpdesk?',
    'Can we get paid in Bitcoin?',
    'Do we offer pet insurance coverage?',
  ];

  // -------------------------------------------------------------------
  // NEW CHAT TRIGGER
  // Resets main view to fresh session with exact required greeting
  // -------------------------------------------------------------------
  const handleNewChat = () => {
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: 'New Chat',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastUpdated: 'Just now',
      userEmail: currentUser.email,
      messages: [
        {
          id: `m-welcome-${Date.now()}`,
          sender: 'bot',
          text: getDefaultGreeting(currentUser.name, companyTenantName),
          timestamp: 'Just now',
        },
      ],
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    setEditingMsgId(null);
  };

  // -------------------------------------------------------------------
  // SELECTIVE THREAD DELETION
  // -------------------------------------------------------------------
  const handleDeleteThread = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    setThreads((prev) => {
      const safeThreads = Array.isArray(prev) ? prev : [];
      const filtered = safeThreads.filter((t) => t.id !== threadId);
      if (filtered.length === 0) {
        const fresh = createInitialThread();
        setActiveThreadId(fresh.id);
        return [fresh];
      }
      if (activeThreadId === threadId) {
        setActiveThreadId(filtered[0].id);
      }
      return filtered;
    });
  };

  // -------------------------------------------------------------------
  // SEND MESSAGE HANDLER (WITH USER-BOT LINKING & SILENT THREAT AUDIT)
  // -------------------------------------------------------------------
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    lastUserQueryRef.current = query;
    setInputMessage('');

    const userMsgId = `user-${Date.now()}`;
    const botMsgId = `bot-${Date.now() + 1}`;

    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      linkedBotMsgId: botMsgId,
    };

    // Add user message to active thread & auto-rename title if first query
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== activeThreadId) return thread;
        const newTitle =
          thread.title === 'New Chat'
            ? query.length > 26
              ? query.slice(0, 26) + '...'
              : query
            : thread.title;

        return {
          ...thread,
          title: newTitle,
          lastUpdated: 'Just now',
          messages: [...thread.messages, userMsg],
        };
      })
    );

    setIsTyping(true);

    // Realistic processing delay
    await new Promise((r) => setTimeout(r, 550));

    const botResult = processMultilingualBotQuery(
      query,
      policies,
      floorZones,
      (q, meta) => {
        onEscalateQuestion(q, {
          ...meta,
          threadId: activeThreadId,
        });
      },
      companyTenantName,
      adminName
    );

    if (botResult.isSilentThreat) {
      userMsg.isThreat = true;
      userMsg.threatCategory = botResult.threatCategory;
    }

    // Check if floor map trigger targets a zone with an attendant
    let messageAttendantTrigger: { zoneId: string; attendantName: string; locationName: string } | undefined = undefined;
    if (botResult.floorMapTrigger) {
      const targetZone = floorZones.find((z) => z.id === botResult.floorMapTrigger?.zoneId);
      if (targetZone && targetZone.attendant) {
        messageAttendantTrigger = {
          zoneId: targetZone.id,
          locationName: targetZone.name,
          attendantName: targetZone.attendant,
        };
      }
    }

    const botMsg: ChatMessage = {
      id: botMsgId,
      sender: 'bot',
      text: botResult.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: botResult.citations,
      floorMapTrigger: botResult.floorMapTrigger,
      messageAttendantTrigger,
      isEscalated: botResult.isEscalated,
      requiresAssistanceNotice: botResult.requiresAssistanceNotice,
      assistanceNoticeDetails: botResult.assistanceNoticeDetails,
      linkedUserMsgId: userMsgId,
    };

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== activeThreadId) return thread;
        return {
          ...thread,
          lastUpdated: 'Just now',
          messages: [...thread.messages, botMsg],
        };
      })
    );

    setIsTyping(false);
  };

  // -------------------------------------------------------------------
  // MESSAGE DELETION WITH FULL CHAT SYNC & THREAT EVIDENCE CAPTURE
  // When user deletes a message, its corresponding AI response instantly vanishes.
  // If the deleted message was a critical threat, auto-screenshot backup is triggered!
  // -------------------------------------------------------------------
  const handleDeleteMessage = (userMsg: ChatMessage) => {
    // 1. Silent threat evidence backup capture
    const isThreatQuery =
      userMsg.isThreat ||
      /\b(kill myself|commit suicide|kill my boss|punch my manager|shoot up|make a bomb|harm myself|laslas|magpakamatay)\b/i.test(
        userMsg.text
      );

    if (isThreatQuery && onUpdateEscalationEvidence) {
      const timestamp = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}`;

      const snapshot = `[IMMUTABLE FORENSIC AUDIT EVIDENCE - SECURE THREAT BACKUP]\nAudit Timestamp: ${timestamp}\nIncident Type: Critical Threat Purge Attempt\nAction: User DELETED message from client chat stream.\nOriginal Threat Message: "${userMsg.text}"\nAuthenticated User: ${currentUser.name} (${currentUser.email})\nPlatform Context: PolicyBot AI Client Session\nEvidence Status: Preserved in HR Security Vault for Workplace Safety Intervention.`;

      onUpdateEscalationEvidence(userMsg.text, snapshot, false);
    }

    // 2. Instant synchronized removal of user message AND linked bot response
    setThreads((prev) => {
      const safeThreads = Array.isArray(prev) ? prev : [];
      return safeThreads.map((thread) => {
        if (thread.id !== activeThreadId) return thread;
        const msgList = Array.isArray(thread.messages) ? thread.messages : [];
        const filtered = msgList.filter((m) => {
          if (m.id === userMsg.id) return false;
          if (userMsg.linkedBotMsgId && m.id === userMsg.linkedBotMsgId) return false;
          if (m.linkedUserMsgId && m.linkedUserMsgId === userMsg.id) return false;
          return true;
        });

        return {
          ...thread,
          messages: filtered,
          lastUpdated: 'Just now',
        };
      });
    });

    if (editingMsgId === userMsg.id) {
      setEditingMsgId(null);
    }
  };

  // -------------------------------------------------------------------
  // MESSAGE EDITING WITH FULL CHAT SYNC & RE-EVALUATION
  // When user edits a message, chat engine re-evaluates revised text and
  // dynamically regenerates the updated corresponding AI response.
  // -------------------------------------------------------------------
  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setEditingText(msg.text);
  };

  const handleCancelEdit = () => {
    setEditingMsgId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (userMsg: ChatMessage) => {
    const revisedText = editingText.trim();
    if (!revisedText || revisedText === userMsg.text) {
      setEditingMsgId(null);
      return;
    }

    // 1. If original message was a critical threat, log forensic backup snapshot
    const originalWasThreat =
      userMsg.isThreat ||
      /\b(kill myself|commit suicide|kill my boss|punch my manager|shoot up|make a bomb|harm myself|laslas|magpakamatay)\b/i.test(
        userMsg.text
      );

    if (originalWasThreat && onUpdateEscalationEvidence) {
      const timestamp = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}`;

      const snapshot = `[IMMUTABLE FORENSIC AUDIT EVIDENCE - SECURE THREAT BACKUP]\nAudit Timestamp: ${timestamp}\nIncident Type: Critical Threat Modification Attempt\nAction: User EDITED message in client chat stream.\nOriginal Threat Message: "${userMsg.text}"\nRevised Modified Message: "${revisedText}"\nAuthenticated User: ${currentUser.name} (${currentUser.email})\nPlatform Context: PolicyBot AI Client Session\nEvidence Status: Preserved in HR Security Vault for Workplace Safety Intervention.`;

      onUpdateEscalationEvidence(userMsg.text, snapshot, true, revisedText);
    }

    setEditingMsgId(null);

    // 2. Re-evaluate revised query
    const botResult = processMultilingualBotQuery(
      revisedText,
      policies,
      floorZones,
      (question, meta) => {
        onEscalateQuestion(question, { ...meta, threadId: activeThreadId });
      },
      companyTenantName,
      adminName
    );

    let messageAttendantTrigger: { zoneId: string; attendantName: string; locationName: string } | undefined = undefined;
    if (botResult.floorMapTrigger) {
      const targetZone = floorZones.find((z) => z.id === botResult.floorMapTrigger?.zoneId);
      if (targetZone && targetZone.attendant) {
        messageAttendantTrigger = {
          zoneId: targetZone.id,
          locationName: targetZone.name,
          attendantName: targetZone.attendant,
        };
      }
    }

    // 3. Update user message and replace corresponding bot response in place
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== activeThreadId) return thread;

        const updatedMessages = thread.messages.map((m) => {
          if (m.id === userMsg.id) {
            return {
              ...m,
              text: revisedText,
              isEdited: true,
              isThreat: botResult.isSilentThreat,
              threatCategory: botResult.threatCategory,
            };
          }
          if (
            (userMsg.linkedBotMsgId && m.id === userMsg.linkedBotMsgId) ||
            m.linkedUserMsgId === userMsg.id
          ) {
            return {
              ...m,
              text: botResult.text,
              citations: botResult.citations,
              floorMapTrigger: botResult.floorMapTrigger,
              messageAttendantTrigger,
              isEscalated: botResult.isEscalated,
              requiresAssistanceNotice: botResult.requiresAssistanceNotice,
              assistanceNoticeDetails: botResult.assistanceNoticeDetails,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          }
          return m;
        });

        return {
          ...thread,
          messages: updatedMessages,
          lastUpdated: 'Just now',
        };
      })
    );
  };

  // -------------------------------------------------------------------
  // CITATION DRAWER CLICK HANDLER
  // -------------------------------------------------------------------
  const handleCitationClick = (citation: ChatCitation) => {
    const policy =
      policies.find(
        (p) => p.id === citation.policyId || p.title.toLowerCase() === citation.policyTitle.toLowerCase()
      ) || {
        id: citation.policyId,
        companyId: 'acme',
        title: citation.policyTitle,
        content: citation.snippet || '',
        category: 'Handbook & DOLE Policy',
        lastUpdated: '2026-03-01',
      };

    setSelectedCitationPolicy(policy);
    setSelectedCitationTitle(citation.policyTitle);
    setSelectedCitationQuery(lastUserQueryRef.current || citation.policyTitle);
    setIsCitationDrawerOpen(true);
  };

  const handleOpenCitationFromCheatSheet = (policyTitle: string, querySnippet?: string) => {
    const matched = policies.find((p) => p.title.toLowerCase().includes(policyTitle.toLowerCase()));
    setSelectedCitationPolicy(
      matched || {
        id: 'pol-cs',
        companyId: 'acme',
        title: policyTitle,
        content: querySnippet || 'Citation reference from saved cheat-sheet item.',
        category: 'Compliance Citation',
        lastUpdated: '2026-09-08',
      }
    );
    setSelectedCitationTitle(policyTitle);
    setSelectedCitationQuery(querySnippet || '');
    setIsCitationDrawerOpen(true);
  };

  // -------------------------------------------------------------------
  // DIRECT ATTENDANT PING CONFIRMATION
  // -------------------------------------------------------------------
  const handleSendAttendantPing = (attendantName: string, locationName: string) => {
    const confirmMsg: ChatMessage = {
      id: `bot-ping-${Date.now()}`,
      sender: 'bot',
      text: `🔔 Notification dispatched to **${attendantName}** at **${locationName}**. They have been informed of your arrival and will welcome you shortly.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setThreads((prev) =>
      prev.map((th) => {
        if (th.id !== activeThreadId) return th;
        return {
          ...th,
          messages: [...th.messages, confirmMsg],
        };
      })
    );
  };

  // -------------------------------------------------------------------
  // BOOKMARK / CHEAT-SHEET TOGGLE HANDLER
  // -------------------------------------------------------------------
  const isMessageBookmarked = (msgId: string) => {
    const list = Array.isArray(importantMessages) ? importantMessages : [];
    return list.some((im) => im.origMessageId === msgId || im.id === msgId);
  };

  const handleToggleBookmark = (msg: ChatMessage) => {
    const alreadySaved = isMessageBookmarked(msg.id);

    if (alreadySaved) {
      setImportantMessages((prev) => (Array.isArray(prev) ? prev : []).filter((im) => im.origMessageId !== msg.id && im.id !== msg.id));
      setThreads((prev) => {
        const safeThreads = Array.isArray(prev) ? prev : [];
        return safeThreads.map((th) => ({
          ...th,
          messages: (Array.isArray(th.messages) ? th.messages : []).map((m) => (m.id === msg.id ? { ...m, isBookmarked: false } : m)),
        }));
      });
    } else {
      const newSavedItem: ImportantMessage = {
        id: `imp-${Date.now()}`,
        origMessageId: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp,
        savedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        citations: msg.citations,
        floorMapTrigger: msg.floorMapTrigger,
        respondedBy: msg.respondedBy,
        origQuestion: msg.origQuestion,
      };

      setImportantMessages((prev) => [newSavedItem, ...(Array.isArray(prev) ? prev : [])]);
      setThreads((prev) => {
        const safeThreads = Array.isArray(prev) ? prev : [];
        return safeThreads.map((th) => ({
          ...th,
          messages: (Array.isArray(th.messages) ? th.messages : []).map((m) => (m.id === msg.id ? { ...m, isBookmarked: true } : m)),
        }));
      });
    }
  };

  const handleRemoveCheatSheetItem = (importantId: string) => {
    const list = Array.isArray(importantMessages) ? importantMessages : [];
    const target = list.find((im) => im.id === importantId);
    setImportantMessages((prev) => (Array.isArray(prev) ? prev : []).filter((im) => im.id !== importantId));

    if (target?.origMessageId) {
      setThreads((prev) => {
        const safeThreads = Array.isArray(prev) ? prev : [];
        return safeThreads.map((th) => ({
          ...th,
          messages: (Array.isArray(th.messages) ? th.messages : []).map((m) => (m.id === target.origMessageId ? { ...m, isBookmarked: false } : m)),
        }));
      });
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl flex h-[740px] shadow-sm overflow-hidden relative">
      {/* ============================================================ */}
      {/* PERSISTENT SIDEBAR: CHAT THREADS & HISTORY MANAGEMENT */}
      {/* ============================================================ */}
      <div
        className={`${
          isSidebarOpen ? 'w-64 sm:w-72' : 'w-0 hidden'
        } transition-all duration-200 border-r border-slate-800 bg-slate-950/80 flex flex-col shrink-0 overflow-hidden`}
      >
        {/* Sidebar Header & New Chat Button */}
        <div className="p-3.5 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Chat History</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 sm:hidden"
              title="Close history sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* "+ New Chat" Button */}
          <button
            id="btn-sidebar-new-chat"
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Thread List Grouped by Today, Yesterday, Last 7 Days */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {groupedThreads.map((group) => {
            if (group.items.length === 0) return null;

            return (
              <div key={group.label} className="space-y-1">
                {/* Group Header */}
                <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>{group.label}</span>
                  <span className="text-[9px] font-mono text-slate-500">{group.items.length}</span>
                </div>

                {/* Group Items */}
                <div className="space-y-1">
                  {group.items.map((thread) => {
                    const isActive = thread.id === activeThreadId;

                    return (
                      <div
                        key={thread.id}
                        onClick={() => {
                          setActiveThreadId(thread.id);
                          setEditingMsgId(null);
                          if (window.innerWidth < 1024) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition text-xs ${
                          isActive
                            ? 'bg-indigo-600/20 text-white border border-indigo-500/40 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-2.5 min-w-0 pr-6">
                          <MessageCircle
                            className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}
                          />
                          <div className="truncate">
                            <p className="font-semibold truncate text-[12px]">{thread.title}</p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {thread.messages.length} msgs &bull; {thread.lastUpdated}
                            </span>
                          </div>
                        </div>

                        {/* Selective Delete Thread Button with stopPropagation */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteThread(e, thread.id);
                          }}
                          className="absolute right-2 top-2.5 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition"
                          title="Delete conversation thread"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Sidebar Note */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="truncate">{currentUser.email}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono text-[10px]">
            {threads.length} threads
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN CHAT STREAM AREA */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/90">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Sidebar toggle button */}
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={isSidebarOpen ? 'Hide History' : 'Show History'}
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-tight">PolicyBot AI</h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Live &bull; DOLE Book 3
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                Grounded in {companyTenantName} handbooks, statutory labor laws, and spatial office maps.
              </p>
            </div>
          </div>

          {/* Top Header Actions */}
          <div className="flex items-center space-x-2">
            {/* My Cheat-Sheet Toggle */}
            <button
              id="btn-toggle-cheatsheet"
              onClick={() => setIsCheatSheetOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition active:scale-[0.98]"
              title="Open Saved Policy Cheat-Sheet"
            >
              <Pin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Cheat-Sheet</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-mono">
                {importantMessages.length}
              </span>
            </button>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950/30 to-slate-900/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isHRAdmin = msg.sender === 'hr_admin';
            const bookmarked = isMessageBookmarked(msg.id);
            const isEditingThis = editingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                    isUser
                      ? 'bg-slate-700 text-slate-200'
                      : isHRAdmin
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {isUser ? (
                    <UserIcon className="w-3.5 h-3.5" />
                  ) : isHRAdmin ? (
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Message Content Container */}
                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Subtle sender label for HR responses */}
                  {isHRAdmin && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium px-1">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{msg.respondedBy || adminName || 'Claire Admin'} (HR)</span>
                    </div>
                  )}

                  {/* Message Bubble - normal chat styling without green highlighted cards */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs shadow-md'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-xs shadow-sm'
                    }`}
                  >
                    {/* User Message Action Buttons: EDIT & DELETE */}
                    {isUser && !isEditingThis && (
                      <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleStartEdit(msg)}
                          className="p-1 rounded-md bg-indigo-700/80 hover:bg-indigo-800 text-indigo-200 hover:text-white transition"
                          title="Edit message & regenerate AI answer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg)}
                          className="p-1 rounded-md bg-indigo-700/80 hover:bg-rose-600 text-indigo-200 hover:text-white transition"
                          title="Delete message & linked AI answer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Pin / Bookmark Action Icon on Bot/HR messages */}
                    {!isUser && (
                      <button
                        onClick={() => handleToggleBookmark(msg)}
                        className={`absolute top-2.5 right-2.5 p-1 rounded-lg transition ${
                          bookmarked
                            ? 'text-amber-400 bg-amber-500/20 opacity-100'
                            : 'text-slate-500 hover:text-amber-300 hover:bg-slate-800 opacity-0 group-hover:opacity-100 focus:opacity-100'
                        }`}
                        title={bookmarked ? 'Remove from My Cheat-Sheet' : 'Pin to My Cheat-Sheet'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-400' : ''}`} />
                      </button>
                    )}

                    {/* Question context if this is an HR reply to an escalation */}
                    {msg.origQuestion && (
                      <div className="mb-2 text-[11px] text-slate-400 italic">
                        Re: &ldquo;{msg.origQuestion}&rdquo;
                      </div>
                    )}

                    {/* Inline Message Editor for User Message */}
                    {isEditingThis ? (
                      <div className="space-y-2 min-w-[240px] sm:min-w-[320px]">
                        <textarea
                          rows={3}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-indigo-400 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                        />
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(msg)}
                            className="px-3 py-1 text-[11px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1 shadow-sm"
                          >
                            <Check className="w-3 h-3" />
                            <span>Save & Regenerate</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Formatted body text */}
                        <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">{msg.text}</div>
                        {msg.isEdited && (
                          <span className="text-[10px] text-indigo-200/70 italic mt-1 block">
                            (edited)
                          </span>
                        )}
                      </>
                    )}

                    {/* RED-HIGHLIGHTED NOTICE: Unanswered / Out-of-Scope Questions */}
                    {msg.requiresAssistanceNotice && (
                      <div
                        id={`notice-further-assistance-${msg.id}`}
                        className="mt-3.5 p-3.5 sm:p-4 rounded-xl border-2 border-rose-500/80 bg-rose-950/40 text-rose-100 space-y-2.5 shadow-sm"
                      >
                        {/* Header Banner */}
                        <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs sm:text-sm tracking-wide">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>⚠️ FURTHER ASSISTANCE NEEDED</span>
                        </div>

                        {/* Statement */}
                        <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed font-normal">
                          PolicyBot cannot answer this question based on the available company information.
                        </p>

                        {/* Direct Employee to Channels */}
                        <div className="pt-2 border-t border-rose-500/30 space-y-2">
                          <p className="text-[11px] sm:text-xs text-rose-200/90 font-medium">
                            For assistance or clarification, please contact the HR Team through:
                          </p>

                          <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
                            <button
                              id={`btn-contact-hr-dm-${msg.id}`}
                              onClick={() => (onNavigateTab ? onNavigateTab('direct_msgs') : null)}
                              className="inline-flex items-center justify-between sm:justify-start space-x-2 px-3 py-2 rounded-lg bg-rose-900/60 hover:bg-rose-900/90 border border-rose-500/50 text-white text-xs font-semibold transition active:scale-[0.98] shadow-sm cursor-pointer"
                              title="Go to HR Direct Messages"
                            >
                              <div className="flex items-center space-x-1.5">
                                <span className="text-rose-300 font-bold">→</span>
                                <span>HR Direct Messages</span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-rose-300 ml-1" />
                            </button>

                            <button
                              id={`btn-contact-hr-tickets-${msg.id}`}
                              onClick={() => (onNavigateTab ? onNavigateTab('direct_msgs') : null)}
                              className="inline-flex items-center justify-between sm:justify-start space-x-2 px-3 py-2 rounded-lg bg-rose-900/60 hover:bg-rose-900/90 border border-rose-500/50 text-white text-xs font-semibold transition active:scale-[0.98] shadow-sm cursor-pointer"
                              title="Go to My HR Tickets"
                            >
                              <div className="flex items-center space-x-1.5">
                                <span className="text-rose-300 font-bold">→</span>
                                <span>My HR Tickets</span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-rose-300 ml-1" />
                            </button>
                          </div>

                          {/* Escalation context subtext */}
                          {msg.assistanceNoticeDetails?.isEscalatedToTicket ? (
                            <div className="text-[10px] sm:text-[11px] text-rose-300/80 pt-1 flex items-center space-x-1.5">
                              <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>An inquiry ticket has been logged with HR. Official resolution will be posted directly into this chat thread.</span>
                            </div>
                          ) : (
                            <div className="text-[10px] sm:text-[11px] text-rose-300/80 pt-1 flex items-center space-x-1.5">
                              <HelpCircle className="w-3 h-3 text-rose-400 shrink-0" />
                              <span>No HR ticket automatically created for out-of-scope inquiries. Please use the HR channels above if you need personal assistance.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Interactive Citation Badges */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-slate-400 font-medium mr-1">Statutory Citations:</span>
                        {msg.citations.map((c, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleCitationClick(c)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-medium transition cursor-pointer active:scale-[0.98]"
                            title="Click to inspect citation in Legal Drawer with clause highlighting"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            <span>[📄 {c.policyTitle}]</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Floor Map Interactive Button Trigger */}
                    {msg.floorMapTrigger && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-2 items-center">
                        <button
                          id="btn-trigger-floor-map"
                          onClick={() => onNavigateToFloorMap(msg.floorMapTrigger?.zoneId)}
                          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-sm transition active:scale-[0.98]"
                        >
                          <MapPin className="w-4 h-4 text-cyan-100" />
                          <span>{msg.floorMapTrigger.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {msg.messageAttendantTrigger && (
                          <button
                            onClick={() =>
                              handleSendAttendantPing(
                                msg.messageAttendantTrigger!.attendantName,
                                msg.messageAttendantTrigger!.locationName
                              )
                            }
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition active:scale-[0.98]"
                          >
                            <span>🔔 Ping {msg.messageAttendantTrigger.attendantName}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp & metadata */}
                  <div
                    className={`flex items-center space-x-2 text-[10px] text-slate-500 px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.isEscalated && (
                      <span className="text-amber-400 font-medium flex items-center space-x-1">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Escalated to HR</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm mt-1">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-xs bg-slate-950/80 border border-slate-800 text-slate-400 text-xs flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>PolicyBot AI is indexing verified company handbooks and DOLE articles...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starter Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800/60 overflow-x-auto">
            <div className="flex items-center space-x-1.5 whitespace-nowrap">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Quick Prompts:
              </span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-medium transition cursor-pointer active:scale-[0.98]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              id="input-employee-chat"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about leave, overtime, DOLE guidelines, or floor rooms..."
              disabled={isTyping}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              id="btn-send-employee-chat"
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md transition flex items-center space-x-1.5 active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
            <span>Powered by Acme Corp Knowledge Base &amp; Philippine DOLE Labor Code Book 3</span>
            <span>Tone Adaptation &bull; Strict HR Guardrails</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CITATION DRAWER (SLIDE-IN MODAL WITH MARK HIGHLIGHTING) */}
      {/* ============================================================ */}
      <CitationDrawer
        isOpen={isCitationDrawerOpen}
        policy={selectedCitationPolicy}
        policyTitle={selectedCitationTitle}
        querySnippet={selectedCitationQuery}
        onClose={() => setIsCitationDrawerOpen(false)}
      />

      {/* ============================================================ */}
      {/* CHEAT-SHEET DRAWER (PINNED MESSAGES / COMPLIANCE NOTES) */}
      {/* ============================================================ */}
      <CheatSheetDrawer
        isOpen={isCheatSheetOpen}
        importantMessages={importantMessages}
        onClose={() => setIsCheatSheetOpen(false)}
        onRemoveItem={handleRemoveCheatSheetItem}
        onOpenCitation={handleOpenCitationFromCheatSheet}
        onNavigateToFloorMap={onNavigateToFloorMap}
      />
    </div>
  );
};

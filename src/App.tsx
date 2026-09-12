import React, { useState, useEffect } from 'react';
import {
  User,
  Company,
  Policy,
  FloorMapZone,
  EscalationLog,
} from './types';
import {
  INITIAL_COMPANIES,
  INITIAL_USERS,
  INITIAL_POLICIES,
  INITIAL_FLOOR_ZONES,
  INITIAL_ESCALATION_LOGS,
} from './mockData';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { HROverview } from './components/hr/HROverview';
import { KnowledgeBase } from './components/hr/KnowledgeBase';
import { FloorMapManager } from './components/hr/FloorMapManager';
import { EscalationLogsView } from './components/hr/EscalationLogsView';
import { EmployeeApprovalsView } from './components/hr/EmployeeApprovalsView';
import { EmployeeChat } from './components/employee/EmployeeChat';
import { InteractiveFloorMap } from './components/employee/InteractiveFloorMap';
import { HRDirectMessages } from './components/employee/HRDirectMessages';
import { EmployeeKnowledgeBase } from './components/employee/EmployeeKnowledgeBase';
import { SingleFileExportModal } from './components/SingleFileExportModal';

import {
  LayoutDashboard,
  FileText,
  MapPin,
  AlertCircle,
  UserCheck,
  LogOut,
  Bot,
  MessageSquare,
  Building,
  ShieldCheck,
  Layers,
  BookOpen,
} from 'lucide-react';

const STORAGE_KEY = 'policybot_state_v2';

const dedupeById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export default function App() {
  // Database States (Simulated local storage with fallback guards)
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_companies`);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? dedupeById(parsed) : INITIAL_COMPANIES;
    } catch {
      return INITIAL_COMPANIES;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? dedupeById(parsed) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [policies, setPolicies] = useState<Policy[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_policies`);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? dedupeById(parsed) : INITIAL_POLICIES;
    } catch {
      return INITIAL_POLICIES;
    }
  });

  const [floorZones, setFloorZones] = useState<FloorMapZone[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_zones`);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? dedupeById(parsed) : INITIAL_FLOOR_ZONES;
    } catch {
      return INITIAL_FLOOR_ZONES;
    }
  });

  const [escalationLogs, setEscalationLogs] = useState<EscalationLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_escalations`);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? dedupeById(parsed) : INITIAL_ESCALATION_LOGS;
    } catch {
      return INITIAL_ESCALATION_LOGS;
    }
  });

  // Session States
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && typeof parsed === 'object' && parsed.id ? parsed : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [highlightedFloorZoneId, setHighlightedFloorZoneId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Synchronize activeTab based on user role to avoid stale tab states
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'HR_Admin') {
        const hrTabs = ['overview', 'knowledge', 'floormap', 'escalations', 'approvals'];
        if (!hrTabs.includes(activeTab)) {
          setActiveTab('overview');
        }
      } else {
        const empTabs = ['chat', 'floormap', 'floormap_emp', 'direct_msgs'];
        if (!empTabs.includes(activeTab)) {
          setActiveTab('chat');
        }
      }
    }
  }, [currentUser?.role]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_companies`, JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_policies`, JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_zones`, JSON.stringify(floorZones));
  }, [floorZones]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_escalations`, JSON.stringify(escalationLogs));
  }, [escalationLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  // Keep currentUser state in sync with users list
  useEffect(() => {
    if (currentUser) {
      const match = users.find((u) => u.id === currentUser.id);
      if (match && match.status !== currentUser.status) {
        setCurrentUser(match);
      }
    }
  }, [users, currentUser]);

  // Reset database state
  const handleResetData = () => {
    setCompanies(INITIAL_COMPANIES);
    setUsers(INITIAL_USERS);
    setPolicies(INITIAL_POLICIES);
    setFloorZones(INITIAL_FLOOR_ZONES);
    setEscalationLogs(INITIAL_ESCALATION_LOGS);
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_KEY}_companies`);
    localStorage.removeItem(`${STORAGE_KEY}_users`);
    localStorage.removeItem(`${STORAGE_KEY}_policies`);
    localStorage.removeItem(`${STORAGE_KEY}_zones`);
    localStorage.removeItem(`${STORAGE_KEY}_escalations`);
    localStorage.removeItem(`${STORAGE_KEY}_current_user`);
  };

  // Quick Switch helper for testing
  const handleQuickSwitch = (role: 'admin' | 'employee_active' | 'employee_pending') => {
    if (role === 'admin') {
      const admin = users.find((u) => u.role === 'HR_Admin') || users[0];
      setCurrentUser(admin);
      setActiveTab('overview');
    } else if (role === 'employee_active') {
      const activeEmp = users.find((u) => u.role === 'Employee' && u.status === 'Active') || users[2];
      setCurrentUser(activeEmp);
      setActiveTab('chat');
    } else {
      const pendingEmp = users.find((u) => u.status === 'Pending_Approval') || users[1];
      setCurrentUser(pendingEmp);
    }
  };

  // 0. Smart Enterprise SSO Login with RBAC Routing
  const handleSmartLogin = (email: string, _password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail.includes('admin');

    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      const rawName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName = rawName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      user = {
        id: `u-${Date.now()}`,
        companyId: 'acme',
        name: formattedName || (isAdmin ? 'Claire Admin' : 'Juan Dela Cruz'),
        email: cleanEmail,
        role: isAdmin ? 'HR_Admin' : 'Employee',
        accountType: 'Company_Account',
        status: 'Active',
        joinedAt: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [...prev, user!]);
    } else {
      const targetRole = isAdmin ? 'HR_Admin' : 'Employee';
      if (user.role !== targetRole || user.status !== 'Active') {
        user = { ...user, role: targetRole, status: 'Active' };
        setUsers((prev) => prev.map((u) => (u.id === user!.id ? user! : u)));
      }
    }

    setCurrentUser(user);
    if (isAdmin) {
      setActiveTab('overview');
    } else {
      setActiveTab('chat');
    }
  };

  // 1. HR Login
  const handleLoginHR = (email: string) => {
    let admin = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!admin) {
      admin = {
        id: `u-admin-${Date.now()}`,
        companyId: 'acme',
        name: 'Claire Admin',
        email,
        role: 'HR_Admin',
        accountType: 'Company_Account',
        status: 'Active',
      };
      setUsers((prev) => [...prev, admin!]);
    }
    setCurrentUser(admin);
    setActiveTab('overview');
  };

  // 2. Employee Login: Option 1 (Work Email)
  const handleLoginWorkEmail = (email: string, otp?: string) => {
    if (otp === '123456') {
      handleUniversalOtp(email, '123456');
      return;
    }

    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Auto match domain and set status to Active
      const generatedName = email.split('@')[0].replace('.', ' ');
      user = {
        id: `u-${Date.now()}`,
        companyId: 'acme',
        name: generatedName.charAt(0).toUpperCase() + generatedName.slice(1),
        email,
        role: 'Employee',
        accountType: 'Company_Account',
        status: 'Active',
        joinedAt: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [...prev, user!]);
    }
    setCurrentUser(user);
    setActiveTab('chat');
  };

  // 2. Employee Login: Option 2 (Personal Email + Join Code)
  const handleLoginPersonalEmail = (email: string, joinCode: string, name?: string, otp?: string) => {
    if (otp === '123456') {
      handleUniversalOtp(email, '123456');
      return;
    }

    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `u-${Date.now()}`,
        companyId: 'acme',
        name: name || 'New Contractor',
        email,
        role: 'Employee',
        accountType: 'Personal_Account',
        status: 'Pending_Approval',
        joinedAt: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [...prev, user!]);
    } else {
      // If user already existed but wasn't active
      if (user.status !== 'Active') {
        user = { ...user, status: 'Pending_Approval' };
        setUsers((prev) => prev.map((u) => (u.id === user!.id ? user! : u)));
      }
    }
    setCurrentUser(user);
    if (user.status === 'Active') {
      setActiveTab('chat');
    }
  };

  // Universal OTP Bypass: "123456"
  const handleUniversalOtp = (email: string, otp: string) => {
    if (otp === '123456') {
      let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        const updated = { ...user, status: 'Active' as const };
        setUsers((prev) => prev.map((u) => (u.id === user!.id ? updated : u)));
        setCurrentUser(updated);
      } else {
        const newUser: User = {
          id: `u-otp-${Date.now()}`,
          companyId: 'acme',
          name: email.split('@')[0],
          email,
          role: 'Employee',
          accountType: 'Personal_Account',
          status: 'Active',
          joinedAt: new Date().toISOString().split('T')[0],
        };
        setUsers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);
      }
      setActiveTab('chat');
    }
  };

  // HR Approves Pending Employee
  const handleApproveUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'Active' as const } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, status: 'Active' } : null));
    }
  };

  // HR Replies & Resolves Escalation
  const handleReplyAndResolveEscalation = (
    logId: string,
    replyText: string,
    responderName: string
  ) => {
    setEscalationLogs((prev) =>
      prev.map((log) =>
        log.id === logId
          ? {
              ...log,
              status: 'Resolved' as const,
              hrResponse: replyText,
              respondedBy: responderName || currentUser?.name || 'HR Admin',
              respondedAt: new Date().toISOString().split('T')[0],
            }
          : log
      )
    );
  };

  // 1-Click AI HR Policy Generator: Approves and indexes policy into Knowledge Base & resolves escalation
  const handleApproveAndIndexPolicy = (
    newPolicyData: { title: string; content: string; category?: string },
    logId: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newPolicy: Policy = {
      id: `pol-${Date.now()}`,
      companyId: 'acme',
      title: newPolicyData.title,
      content: newPolicyData.content,
      category: newPolicyData.category || 'Corporate Policy',
      lastUpdated: today,
    };

    setPolicies((prev) => [newPolicy, ...prev]);

    setEscalationLogs((prev) =>
      prev.map((log) =>
        log.id === logId
          ? {
              ...log,
              status: 'Resolved' as const,
              hrResponse: `Official corporate policy "${newPolicy.title}" drafted with AI and indexed into Knowledge Base.`,
              respondedBy: currentUser?.name || 'Claire Admin',
              respondedAt: today,
            }
          : log
      )
    );
  };

  // Employee AI Chat: Unanswered Question Fallback Guardrail & Silent Threat Escalations
  const handleEscalateQuestion = (
    question: string,
    meta?: {
      priority?: 'Critical_Threat' | 'High' | 'Medium' | 'Policy_Gap' | 'Direct_Message';
      isThreat?: boolean;
      threatCategory?: 'Self-Harm' | 'Violence/Threat' | 'Illegal Acts/Crime' | 'Sabotage';
      evidenceSnapshot?: string;
      originalThreatText?: string;
      threadId?: string;
    }
  ) => {
    const timestampStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`;

    const newLog: EscalationLog = {
      id: `e-${Date.now()}`,
      companyId: 'acme',
      userEmail: currentUser?.email || 'juan.delacruz@acmecorp.com',
      question,
      status: 'Pending',
      hrResponse: '',
      respondedBy: '',
      respondedAt: '',
      createdAt: timestampStr,
      priority: meta?.priority || 'Policy_Gap',
      isThreat: meta?.isThreat || false,
      threatCategory: meta?.threatCategory,
      evidenceSnapshot: meta?.evidenceSnapshot,
      originalThreatText: meta?.originalThreatText || (meta?.isThreat ? question : undefined),
      auditTimestamp: timestampStr,
      threadId: meta?.threadId,
    };
    setEscalationLogs((prev) => [newLog, ...prev]);
  };

  // Threat Audit Backup: When a user deletes or edits a critical threat message
  const handleUpdateEscalationEvidence = (
    originalQuestion: string,
    updatedSnapshot: string,
    isEdit: boolean,
    newQuestion?: string
  ) => {
    const auditTime = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`;

    setEscalationLogs((prev) =>
      prev.map((log) => {
        if (
          log.isThreat &&
          (log.question.toLowerCase().trim() === originalQuestion.toLowerCase().trim() ||
            log.originalThreatText?.toLowerCase().trim() === originalQuestion.toLowerCase().trim())
        ) {
          return {
            ...log,
            isDeletedBySender: !isEdit ? true : log.isDeletedBySender,
            isEditedBySender: isEdit ? true : log.isEditedBySender,
            editedThreatText: isEdit ? newQuestion : log.editedThreatText,
            evidenceSnapshot: updatedSnapshot,
            auditTimestamp: auditTime,
          };
        }
        return log;
      })
    );
  };

  // Add Policy
  const handleAddPolicy = (newPolicyData: Omit<Policy, 'id'>) => {
    const newPolicy: Policy = {
      ...newPolicyData,
      id: `p-${Date.now()}`,
    };
    setPolicies((prev) => [newPolicy, ...prev]);
  };

  const handleDeletePolicy = (policyId: string) => {
    setPolicies((prev) => (Array.isArray(prev) ? prev : []).filter((p) => p.id !== policyId));
  };

  // Floor Map Zones
  const handleAddZone = (newZoneData: Omit<FloorMapZone, 'id'>) => {
    const newZone: FloorMapZone = {
      ...newZoneData,
      id: `f-${Date.now()}`,
    };
    setFloorZones((prev) => [...(Array.isArray(prev) ? prev : []), newZone]);
  };

  const handleUpdateZoneCapacity = (zoneId: string, newCapacity: string) => {
    setFloorZones((prev) =>
      (Array.isArray(prev) ? prev : []).map((z) => (z.id === zoneId ? { ...z, capacity: newCapacity } : z))
    );
  };

  // Floor map navigation from Chat Assistant button
  const handleNavigateToFloorMap = (targetZoneId?: string | null) => {
    const zoneId = targetZoneId || 'f1';
    setSelectedZoneId(zoneId);
    setHighlightedFloorZoneId(zoneId);
    setActiveTab('floormap');
  };

  // Badge counts (with safe array fallbacks)
  const safeUsers = Array.isArray(users) ? users : [];
  const safeEscalations = Array.isArray(escalationLogs) ? escalationLogs : [];
  const pendingApprovalsCount = safeUsers.filter((u) => u.status === 'Pending_Approval').length;
  const pendingEscalationsCount = safeEscalations.filter((e) => e.status === 'Pending').length;
  const resolvedDirectMsgsCount = safeEscalations.filter((e) => e.status === 'Resolved').length;
  const currentCompany = companies.find((c) => c.id === currentUser?.companyId) || companies[0];
  const companyName = currentCompany?.name || 'Acme Corp';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onQuickSwitch={handleQuickSwitch}
        onResetData={handleResetData}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Content Branching */}
      {!currentUser ? (
        /* SCREEN 1: UNIFIED ENTERPRISE SSO LOGIN */
        <LandingPage
          companies={companies}
          users={users}
          onLogin={handleSmartLogin}
          onLoginHR={handleLoginHR}
          onLoginWorkEmail={handleLoginWorkEmail}
          onLoginPersonalEmail={handleLoginPersonalEmail}
          onUniversalOtpSubmit={(email, otp) => handleUniversalOtp(email, otp)}
        />
      ) : currentUser.status === 'Pending_Approval' ? (
        /* SCREEN 2: LOCKED HOLDING SCREEN FOR PENDING EMPLOYEES */
        <PendingApprovalScreen
          user={currentUser}
          company={companies[0]}
          onUniversalOtpVerify={(otp) => handleUniversalOtp(currentUser.email, otp)}
          onRefreshStatus={() => {
            const fresh = users.find((u) => u.id === currentUser.id);
            if (fresh) setCurrentUser(fresh);
          }}
          onLogout={() => setCurrentUser(null)}
          onSwitchToHR={() => handleQuickSwitch('admin')}
        />
      ) : (
        /* SCREEN 3: ROLE-BASED DASHBOARDS WITH STRICT SIDEBARS */
        <div className="flex-1 flex overflow-hidden">
          {/* ============================================================ */}
          {/* SIDEBAR NAVIGATION */}
          {/* ============================================================ */}
          <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none backdrop-blur-sm">
            {/* Upper Nav */}
            <div className="p-4 space-y-4">
              {/* Role Context Pill */}
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {currentUser.role === 'HR_Admin' ? (
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-cyan-400" />
                  )}
                  <span className="text-xs font-bold text-white">
                    {currentUser.role === 'HR_Admin' ? 'HR Administrator' : 'Employee Portal'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase">Active</span>
              </div>

              {/* HR Admin Navigation Sidebar Items */}
              {currentUser.role === 'HR_Admin' ? (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3">
                    Workspace Management
                  </span>

                  {/* 1. Overview Dashboard */}
                  <button
                    id="nav-hr-overview"
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                      activeTab === 'overview'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span>Overview Dashboard</span>
                  </button>

                  {/* 2. Knowledge Base */}
                  <button
                    id="nav-hr-knowledge"
                    onClick={() => setActiveTab('knowledge')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                      activeTab === 'knowledge'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>Knowledge Base</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-mono">
                      {policies.length}
                    </span>
                  </button>

                  {/* 3. Floor Map Manager */}
                  <button
                    id="nav-hr-floormap"
                    onClick={() => setActiveTab('floormap')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                      activeTab === 'floormap'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>Floor Map Manager</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-mono">
                      {floorZones.length}
                    </span>
                  </button>

                  {/* 4. Escalation Logs */}
                  <button
                    id="nav-hr-escalations"
                    onClick={() => setActiveTab('escalations')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                      activeTab === 'escalations'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Escalation Logs</span>
                    </div>
                    {pendingEscalationsCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                        {pendingEscalationsCount}
                      </span>
                    )}
                  </button>

                  {/* 5. Employee Approvals */}
                  <button
                    id="nav-hr-approvals"
                    onClick={() => setActiveTab('approvals')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                      activeTab === 'approvals'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <UserCheck className="w-4 h-4 shrink-0" />
                      <span>Employee Approvals</span>
                    </div>
                    {pendingApprovalsCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                        {pendingApprovalsCount}
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                /* Employee Navigation Sidebar Items (CLEAN VIEW CONTAINING ONLY 3 TABS) */
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3">
                    Employee Tools
                  </span>

                  {/* 1. Chat Assistant */}
                  <button
                    id="nav-emp-chat"
                    onClick={() => setActiveTab('chat')}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                      activeTab === 'chat'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <Bot className="w-4 h-4 shrink-0" />
                    <span>Chat Assistant</span>
                  </button>

                  {/* 2. Interactive Floor Map */}
                  <button
                    id="nav-emp-floormap"
                    onClick={() => {
                      setActiveTab('floormap');
                      setSelectedZoneId(null);
                      setHighlightedFloorZoneId(null);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                      activeTab === 'floormap' || activeTab === 'floormap_emp'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>Interactive Floor Map</span>
                  </button>

                  {/* 3. My HR Tickets */}
                  <button
                    id="nav-emp-tickets"
                    onClick={() => setActiveTab('direct_msgs')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                      activeTab === 'direct_msgs' || activeTab === 'tickets'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span>My HR Tickets</span>
                    </div>
                    {resolvedDirectMsgsCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-medium">
                        {resolvedDirectMsgsCount}
                      </span>
                    )}
                  </button>

                  {/* 4. Knowledge Base / Handbook */}
                  <button
                    id="nav-emp-knowledge"
                    onClick={() => setActiveTab('knowledge')}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                      activeTab === 'knowledge'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Knowledge Base / Handbook</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Sidebar Controls */}
            <div className="p-4 border-t border-slate-800/80 space-y-2">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
                <div className="flex items-center space-x-2 text-slate-300 font-semibold truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="truncate">{currentUser.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">{currentUser.email}</p>
              </div>

              {/* Sign Out Action */}
              <button
                id="btn-sidebar-signout"
                onClick={() => setCurrentUser(null)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition active:scale-[0.98]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* MAIN DASHBOARD CONTENT AREA */}
          {/* ============================================================ */}
          <main className={`flex-1 ${activeTab === 'chat' ? 'flex flex-col p-3 sm:p-4 overflow-hidden' : 'overflow-y-auto p-4 sm:p-6 lg:p-8'} bg-slate-950`}>
            <div className={`w-full max-w-7xl mx-auto ${activeTab === 'chat' ? 'flex-1 flex flex-col min-h-0' : ''}`}>
              {currentUser.role === 'HR_Admin' ? (
                /* HR Admin Tabs */
                <>
                  {activeTab === 'overview' && (
                    <HROverview
                      policies={policies}
                      floorZones={floorZones}
                      escalationLogs={escalationLogs}
                      users={users}
                      onNavigateTab={(tab) => setActiveTab(tab)}
                    />
                  )}

                  {activeTab === 'knowledge' && (
                    <KnowledgeBase
                      policies={policies}
                      onAddPolicy={handleAddPolicy}
                      onDeletePolicy={handleDeletePolicy}
                    />
                  )}

                  {activeTab === 'floormap' && (
                    <FloorMapManager
                      floorZones={floorZones}
                      onAddZone={handleAddZone}
                      onUpdateCapacity={handleUpdateZoneCapacity}
                    />
                  )}

                  {activeTab === 'escalations' && (
                    <EscalationLogsView
                      escalationLogs={escalationLogs}
                      onReplyAndResolve={handleReplyAndResolveEscalation}
                      onApproveAndIndexPolicy={handleApproveAndIndexPolicy}
                      currentAdminName={currentUser?.name || 'HR Admin'}
                    />
                  )}

                  {activeTab === 'approvals' && (
                    <EmployeeApprovalsView
                      users={users}
                      onApproveUser={handleApproveUser}
                      onAddPendingTestUser={(email, name) => {
                        const newUser: User = {
                          id: `u-${Date.now()}`,
                          companyId: 'acme',
                          name,
                          email,
                          role: 'Employee',
                          accountType: 'Personal_Account',
                          status: 'Pending_Approval',
                          joinedAt: new Date().toISOString().split('T')[0],
                        };
                        setUsers((prev) => [...prev, newUser]);
                      }}
                    />
                  )}
                </>
              ) : (
                /* Employee Tabs */
                <>
                  {activeTab === 'chat' && (
                    <EmployeeChat
                      key={currentUser.id}
                      currentUser={currentUser}
                      policies={policies}
                      floorZones={floorZones}
                      escalationLogs={escalationLogs}
                      onEscalateQuestion={handleEscalateQuestion}
                      onUpdateEscalationEvidence={handleUpdateEscalationEvidence}
                      onNavigateToFloorMap={handleNavigateToFloorMap}
                      onNavigateTab={(tab) => setActiveTab(tab)}
                      adminName={users.find((u) => u.companyId === currentUser?.companyId && u.role === 'HR_Admin')?.name || 'Claire Admin'}
                    />
                  )}

                  {(activeTab === 'floormap' || activeTab === 'floormap_emp') && (
                    <InteractiveFloorMap
                      floorZones={floorZones}
                      selectedZoneId={selectedZoneId || highlightedFloorZoneId}
                      highlightedZoneId={selectedZoneId || highlightedFloorZoneId}
                      onClearSelection={() => {
                        setSelectedZoneId(null);
                        setHighlightedFloorZoneId(null);
                      }}
                      onClearHighlight={() => {
                        setSelectedZoneId(null);
                        setHighlightedFloorZoneId(null);
                      }}
                    />
                  )}

                  {(activeTab === 'direct_msgs' || activeTab === 'tickets') && (
                    <HRDirectMessages
                      currentUser={currentUser}
                      escalationLogs={escalationLogs}
                      onOpenChat={() => setActiveTab('chat')}
                      onSendMessage={(msg) => handleEscalateQuestion(msg, { priority: 'Direct_Message' })}
                    />
                  )}

                  {activeTab === 'knowledge' && (
                    <EmployeeKnowledgeBase
                      policies={policies}
                      tenantName={companyName}
                    />
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      )}

      {/* Standalone HTML Exporter Modal */}
      <SingleFileExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

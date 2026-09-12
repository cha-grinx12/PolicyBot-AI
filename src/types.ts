export type UserRole = 'HR_Admin' | 'Employee';
export type AccountType = 'Company_Account' | 'Personal_Account';
export type UserStatus = 'Active' | 'Pending_Approval' | 'Rejected';

export interface Company {
  id: string;
  name: string;
  domain: string;
  joinCode: string;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  accountType: AccountType;
  status: UserStatus;
  joinedAt?: string;
}

export interface Policy {
  id: string;
  companyId: string;
  title: string;
  content: string;
  lastUpdated?: string;
  category?: string;
  fileSize?: string;
  sourceType?: 'system' | 'uploaded';
  fileUrl?: string;
  mimeType?: string;
}

export interface FloorMapZone {
  id: string;
  companyId: string;
  name: string;
  capacity: string;
  category: 'HR Desk' | 'Meeting Room' | 'Workspace' | 'Common Area' | 'Quiet Area';
  description?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  statusText?: string;
  statusType?: 'open' | 'busy' | 'moderate';
  waitTime?: string;
  attendant?: string;
}

export interface EscalationLog {
  id: string;
  companyId: string;
  userEmail: string;
  question: string;
  status: 'Pending' | 'Resolved';
  hrResponse: string;
  respondedBy: string;
  respondedAt: string;
  createdAt?: string;
  priority?: 'Critical_Threat' | 'High' | 'Medium' | 'Policy_Gap' | 'Direct_Message';
  isThreat?: boolean;
  threatCategory?: 'Self-Harm' | 'Violence/Threat' | 'Illegal Acts/Crime' | 'Sabotage';
  evidenceSnapshot?: string;
  isDeletedBySender?: boolean;
  isEditedBySender?: boolean;
  originalThreatText?: string;
  editedThreatText?: string;
  auditTimestamp?: string;
  threadId?: string;
}

export interface ChatCitation {
  policyId: string;
  policyTitle: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'hr_admin';
  text: string;
  timestamp: string;
  citations?: ChatCitation[];
  floorMapTrigger?: {
    zoneId: string;
    zoneName: string;
    actionLabel: string;
  };
  messageAttendantTrigger?: {
    zoneId: string;
    attendantName: string;
    locationName: string;
  };
  isEscalated?: boolean;
  isDirectMessage?: boolean;
  respondedBy?: string;
  origQuestion?: string;
  isBookmarked?: boolean;
  linkedBotMsgId?: string;
  linkedUserMsgId?: string;
  isEdited?: boolean;
  isThreat?: boolean;
  threatCategory?: string;
  requiresAssistanceNotice?: boolean;
  assistanceNoticeDetails?: {
    title: string;
    description: string;
    channels: string[];
    isEscalatedToTicket?: boolean;
    ticketId?: string;
  };
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  lastUpdated: string;
  messages: ChatMessage[];
  userEmail: string;
}

export interface ImportantMessage {
  id: string;
  origMessageId: string;
  sender: 'user' | 'bot' | 'hr_admin';
  text: string;
  timestamp: string;
  savedAt: string;
  citations?: ChatCitation[];
  floorMapTrigger?: {
    zoneId: string;
    zoneName: string;
    actionLabel: string;
  };
  respondedBy?: string;
  origQuestion?: string;
}

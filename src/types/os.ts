export type AppId =
  | 'voice_agent'
  | 'coding_agents'
  | 'command'
  | 'files'
  | 'browser'
  | 'terminal'
  | 'code'
  | 'docs'
  | 'sheets'
  | 'slides'
  | 'mail'
  | 'calendar'
  | 'tasks'
  | 'workflows'
  | 'memory'
  | 'appbuilder'
  | 'marketplace'
  | 'security'
  | 'activity'
  | 'vca'
  | 'engineering'
  | 'process_manager'
  | 'github_runner'
  | 'widget_studio'
  | 'emulator'
  | 'software_installer'
  | 'settings';

export type ScreenLayout =
  | 'floating'
  | 'split-2-h'
  | 'split-2-v'
  | 'split-3-main-left'
  | 'split-3-cols'
  | 'split-4-grid'
  | 'split-4-main-top';

export type TaskbarStyle = 'windows' | 'dock' | 'mobile';
export type WorkspaceHeaderMode = 'button' | 'bar';

export interface VirtualScreen {
  id: string;
  name: string;
  layout: ScreenLayout;
  splitApps: (AppId | null)[];
  pinnedWindowIds?: string[];
}

export type AppCategory = 'System' | 'Productivity' | 'Development' | 'Intelligence' | 'Specialized';

export interface WallpaperConfig {
  type: 'preset' | 'image' | 'video' | 'gif' | 'matrix' | 'color';
  id: string;
  name?: string;
  url?: string;
  blur?: number; // 0 to 24px
  dim?: number;  // 0 to 90%
  fit?: 'cover' | 'contain' | 'repeat';
  speed?: number; // matrix speed
}

export interface AppMetadata {
  id: AppId;
  name: string;
  icon: string;
  category: AppCategory;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
}

export type OSFile = VirtualFile;

export type VCACardRecord = VcaCardRecord;

export interface VCASubmission {
  id: string;
  submissionNumber: string;
  customerName: string;
  serviceLevel: string;
  cardCount: number;
  status: 'received' | 'imaging' | 'authenticating' | 'grading' | 'slabbing' | 'completed';
  createdAt: string;
  cards: VCACardRecord[];
}

export interface VCAForensicReport {
  cardId: string;
  overallAuthenticity: 'authentic' | 'likely_authentic' | 'requires_review' | 'suspicious' | 'counterfeit';
  confidenceScore: number;
  textForensics: { score: number; notes: string };
  printingForensics: { score: number; notes: string };
  holoForensics: { score: number; notes: string };
  cardBackForensics: { score: number; notes: string };
  detectedRedFlags: string[];
  positiveSignals: string[];
}

export interface VCAGradeCriteria {
  centering: number;
  corners: number;
  edges: number;
  surface: number;
  overall: number;
  notes?: string;
}


export interface OSWindow {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  opacity?: number;
  prevBounds?: { x: number; y: number; width: number; height: number; isMaximized?: boolean };
  initialData?: any;
  payload?: any;
  screenIndex?: number;
}

export interface AgentTaskStep {
  id: string;
  title: string;
  name?: string;
  args?: any;
  agent: string;
  tool?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval';
  details?: string;
  timestamp: string;
  output?: any;
}

export interface AgentTask {
  id: string;
  objective: string;
  title?: string;
  description?: string;
  primaryAgent: string;
  agentId?: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused' | 'waiting_approval';
  progress: number;
  steps: AgentTaskStep[];
  currentStep?: number;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  resultSummary?: string;
  result?: string;
  artifacts?: { name: string; type: string; path?: string; data?: any }[];
  requiresApprovalFor?: { action: string; details: string };
}

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  status: 'idle' | 'working' | 'thinking' | 'waiting';
  currentTask?: string;
  description: string;
  tools: string[];
  systemPrompt?: string;
}

export interface VirtualFile {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'document' | 'sheet' | 'slide' | 'code' | 'image' | 'pdf' | 'json' | 'workflow' | 'app';
  content: string;
  size: number;
  updatedAt: string;
  createdAt: string;
  isSystem?: boolean;
  isFolder?: boolean;
}

export interface AIMemoryItem {
  id: string;
  category: 'preference' | 'project' | 'fact' | 'decision' | 'instruction';
  content: string;
  key?: string;
  value?: string;
  tags?: string[];
  confidence: number;
  source: string;
  createdAt: string;
  updatedAt?: string;
  lastUsedAt?: string;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  tags: string[];
  sourceUrl?: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'ai_action' | 'browser_action' | 'file_action' | 'condition' | 'notification' | 'api_call';
  label: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  schedule?: string;
  isActive: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  lastRunStatus?: 'success' | 'failed' | 'running';
  lastRunAt?: string;
}

export interface EmailItem {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  isUrgent?: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash';
  aiSummary?: string;
  aiSuggestedReply?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  category: 'work' | 'meeting' | 'agent_run' | 'personal';
  attendees?: string[];
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgent?: string;
  assignedUser?: string;
  dueDate?: string;
  tags: string[];
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  toolUsed?: string;
  target: string;
  result?: string;
  duration?: string;
  status: 'success' | 'info' | 'warning' | 'error' | 'pending' | 'paused' | 'cancelled';
  details?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'approval';
  timestamp: string;
  read?: boolean;
  actionRequired?: boolean;
  taskId?: string;
  actionData?: any;
}

export interface VcaCardRecord {
  id: string;
  game?: string;
  name: string;
  set: string;
  cardNumber: string;
  year: number;
  language: string;
  variant?: string;
  rarity: string;
  grade?: number;
  gradeLabel?: string;
  subgrades?: {
    centering: number;
    corners: number;
    edges: number;
    surface: number;
  };
  certificationNumber: string;
  serialNumber: string;
  nfcId: string;
  qrId?: string;
  qrCode?: string;
  nfcStatus?: 'unbound' | 'bound' | 'verified';
  authStatus?: 'authentic' | 'likely_authentic' | 'requires_review' | 'suspicious' | 'counterfeit';
  authConfidence?: number;
  authenticityStatus?: string;
  authenticityConfidence?: number;
  marketPrice?: number;
  marketValue?: number;
  marketPricing?: {
    raw?: number;
    psa10?: number;
    psa9?: number;
    psa8?: number;
  };
  historicalPrices?: { date: string; price: number }[];
  ownerName?: string;
  submissionId?: string;
  updatedAt?: string;
  frontImage: string;
  backImage?: string;
  defects?: {
    id: string;
    type: string;
    severity: 'minor' | 'moderate' | 'major';
    x: number;
    y: number;
    note: string;
  }[];
  createdAt: string;
}

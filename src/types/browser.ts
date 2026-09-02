// VCA OS — Real Browser Subsystem Types & Architecture

export type SearchEngineId = 'google' | 'duckduckgo' | 'bing' | 'brave' | 'wikipedia' | 'yahoo';

export interface SearchEngineConfig {
  id: SearchEngineId | string;
  name: string;
  searchUrl: string; // e.g. "https://www.google.com/search?q=%s"
  suggestionUrl?: string;
  icon: string;
  isCustom?: boolean;
}

export interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  domain: string;
  favicon?: string;
  category?: string;
  engine?: string;
  date?: string;
  score?: number;
  sponsored?: boolean;
}

export interface KnowledgePanel {
  title: string;
  subtitle?: string;
  description?: string;
  attributes?: Record<string, string>;
  imageUrl?: string;
  sourceUrl?: string;
  sourceName?: string;
}

export interface SearchResponse {
  query: string;
  engine: string;
  totalResults?: number;
  searchTime?: string;
  results: SearchResultItem[];
  knowledgePanel?: KnowledgePanel;
  relatedQueries?: string[];
  aiSummary?: string;
  isOffline?: boolean;
  error?: string;
}

export type PageType =
  | 'new_tab'
  | 'search_results'
  | 'web_page'
  | 'settings'
  | 'history'
  | 'bookmarks'
  | 'downloads'
  | 'devtools'
  | 'vca_portal'
  | 'site_data'
  | 'permissions'
  | 'offline_error';

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  history: string[];
  historyIndex: number;
  zoom: number;
  isPinned: boolean;
  isMuted: boolean;
  isPrivate: boolean;
  pageType: PageType;
  searchQuery?: string;
  searchEngine?: SearchEngineId | string;
  searchResults?: SearchResponse;
  sslStatus: 'secure' | 'not_secure' | 'local' | 'warning' | 'internal';
  certificateInfo?: {
    issuer: string;
    validTo: string;
    protocol: string;
    cipher: string;
    subject: string;
  };
  proxyHtml?: string;
  rawText?: string;
  lastLoadedAt?: string;
  runtimePid?: number;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  folder?: string;
  favicon?: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: string;
  visitCount: number;
  favicon?: string;
  domain: string;
}

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  size: string;
  totalBytes: number;
  receivedBytes: number;
  progress: number;
  status: 'downloading' | 'completed' | 'paused' | 'failed' | 'cancelled';
  localPath?: string;
  startedAt: string;
  speed?: string;
  error?: string;
}

export type SitePermissionValue = 'ask' | 'allow' | 'block';

export interface SiteSettings {
  origin: string;
  camera: SitePermissionValue;
  microphone: SitePermissionValue;
  location: SitePermissionValue;
  notifications: SitePermissionValue;
  popups: SitePermissionValue;
  cookies: SitePermissionValue;
  storageUsedMB?: number;
  cookiesCount?: number;
  lastVisited?: string;
}

export interface BrowserSettings {
  defaultSearchEngine: SearchEngineId | string;
  customSearchEngines: SearchEngineConfig[];
  homePage: string;
  newTabPage: string;
  startupBehavior: 'new_tab' | 'restore_session' | 'specific_pages';
  startupUrls: string[];
  searchSuggestions: boolean;
  searchHistory: boolean;
  safeSearch: boolean;
  showBookmarksBar: boolean;
  theme: 'dark' | 'light' | 'cyber' | 'system';
  density: 'compact' | 'normal' | 'comfortable';
  downloadsPath: string;
  askDownloadLocation: boolean;
  blockThirdPartyCookies: boolean;
  blockPopups: boolean;
  httpsOnly: boolean;
  enableAiSidebar: boolean;
  defaultPermissions: {
    camera: SitePermissionValue;
    microphone: SitePermissionValue;
    location: SitePermissionValue;
    notifications: SitePermissionValue;
    popups: SitePermissionValue;
  };
}

export interface BrowserConsoleLog {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  text: string;
  time: string;
  source?: string;
}

export interface BrowserNetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  statusText: string;
  type: string;
  size: string;
  time: string;
  timestamp: string;
}

export interface BrowserAgentAction {
  id: string;
  tool: string; // e.g. 'browser.navigate', 'browser.click'
  params: Record<string, any>;
  requiresApproval: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  description: string;
  result?: any;
  timestamp: string;
}

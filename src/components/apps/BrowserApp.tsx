import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Search,
  Bookmark,
  BookmarkPlus,
  Star,
  Shield,
  ShieldCheck,
  Lock,
  Plus,
  X,
  Sparkles,
  ExternalLink,
  MoreVertical,
  Sliders,
  History,
  Download,
  Terminal,
  Code2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Printer,
  FileCode,
  Layers,
  Cpu,
  Folder,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Copy,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Settings,
  Share2,
  Compass,
  Zap,
  Info,
  Radio,
  FileText,
  HelpCircle
} from 'lucide-react';

interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  history: string[];
  historyIndex: number;
  zoom: number;
  isBookmarked: boolean;
  isPinned: boolean;
  pageType: 'google' | 'google_results' | 'vca_verify' | 'github' | 'webcontainers' | 'tcg' | 'hackernews' | 'settings' | 'history' | 'bookmarks' | 'downloads' | 'devtools' | 'custom_web';
  searchQuery?: string;
  customContent?: any;
}

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  folder?: string;
  icon?: string;
  color?: string;
}

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: string;
  favicon?: string;
}

interface DownloadItem {
  id: string;
  filename: string;
  size: string;
  progress: number;
  status: 'completed' | 'downloading' | 'failed';
  timestamp: string;
  url: string;
}

interface BrowserAppProps {
  initialUrl?: string;
}

const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  { id: 'bm-google', title: 'Google', url: 'https://google.com', icon: 'Search', color: 'text-blue-400' },
  { id: 'bm-vca', title: 'VCA Verify', url: 'https://vca-authority.com/verify/VCA-2026-000128', icon: 'Shield', color: 'text-emerald-400' },
  { id: 'bm-github', title: 'GitHub (vca-os)', url: 'https://github.com/vca/vca-os', icon: 'Code2', color: 'text-purple-400' },
  { id: 'bm-webcontainers', title: 'WebContainers Docs', url: 'https://webcontainers.io', icon: 'Cpu', color: 'text-cyan-400' },
  { id: 'bm-tcg', title: 'TCG Marketplace', url: 'https://tcgplayer.com', icon: 'Layers', color: 'text-amber-400' },
  { id: 'bm-hn', title: 'Hacker News', url: 'https://news.ycombinator.com', icon: 'Radio', color: 'text-orange-400' },
  { id: 'bm-npm', title: 'NPM Registry', url: 'https://npmjs.com', icon: 'Globe', color: 'text-red-400', folder: 'Dev Tools' },
  { id: 'bm-var', title: 'VAR Architecture', url: 'https://vca-runtime.dev/spec', icon: 'Zap', color: 'text-emerald-400', folder: 'Dev Tools' }
];

export const BrowserApp: React.FC<BrowserAppProps> = ({ initialUrl }) => {
  const { addNotification, logActivity, openWindow } = useOS();

  // Tabs State
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      url: initialUrl || 'https://google.com',
      title: initialUrl ? 'Web Destination' : 'Google',
      isLoading: false,
      history: [initialUrl || 'https://google.com'],
      historyIndex: 0,
      zoom: 100,
      isBookmarked: false,
      isPinned: false,
      pageType: initialUrl?.includes('verify') ? 'vca_verify' : 'google'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Omnibox state
  const [omniboxInput, setOmniboxInput] = useState<string>('https://google.com');
  const [isOmniboxFocused, setIsOmniboxFocused] = useState<boolean>(false);

  // Bookmarks & History & Downloads
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(DEFAULT_BOOKMARKS);
  const [showBookmarksBar, setShowBookmarksBar] = useState<boolean>(true);
  const [browsingHistory, setBrowsingHistory] = useState<HistoryItem[]>([
    { id: 'h-1', title: 'Google Search Engine', url: 'https://google.com', timestamp: '10:45 AM' },
    { id: 'h-2', title: 'VCA Forensic Lab - Holographic Card Verification', url: 'https://vca-authority.com/verify/VCA-2026-000128', timestamp: '10:42 AM' },
    { id: 'h-3', title: 'GitHub - Verified Card Authority OS', url: 'https://github.com/vca/vca-os', timestamp: '10:30 AM' }
  ]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    { id: 'd-1', filename: 'vca-os-architecture-v5.pdf', size: '2.4 MB', progress: 100, status: 'completed', timestamp: '10:20 AM', url: 'https://vca-runtime.dev/spec.pdf' },
    { id: 'd-2', filename: 'charizard-psa9-grading-cert.pdf', size: '1.1 MB', progress: 100, status: 'completed', timestamp: '09:15 AM', url: 'https://vca-authority.com/cert/VCA-2026-000128.pdf' }
  ]);

  // Modals & Drawers
  const [showThreeDotMenu, setShowThreeDotMenu] = useState<boolean>(false);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showBookmarksManagerModal, setShowBookmarksManagerModal] = useState<boolean>(false);
  const [showDownloadsModal, setShowDownloadsModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showDevTools, setShowDevTools] = useState<boolean>(false);
  const [devToolsTab, setDevToolsTab] = useState<'elements' | 'console' | 'network' | 'storage' | 'var_driver'>('console');
  const [showFindInPage, setShowFindInPage] = useState<boolean>(false);
  const [findQuery, setFindQuery] = useState<string>('');

  // DevTools Console State
  const [consoleLogs, setConsoleLogs] = useState<{ id: string; type: 'log' | 'info' | 'warn' | 'error'; text: string; time: string }[]>([
    { id: 'c-1', type: 'info', text: '[VCA Chromium Engine]: Initialized sandboxed session (PID: 10428).', time: '12:00:01' },
    { id: 'c-2', type: 'info', text: '[VCA VAR]: WebContainer WASM adapter & Local Host runtime connected.', time: '12:00:02' },
    { id: 'c-3', type: 'log', text: '[DOM]: Document loaded with zero layout shifts. TLS 1.3 AES-256 handshake valid.', time: '12:00:03' }
  ]);
  const [consoleInput, setConsoleInput] = useState<string>('');

  // AI Assistant Drawer
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);

  // Active Tab reference
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Synchronize Omnibox with active tab
  useEffect(() => {
    if (activeTab) {
      setOmniboxInput(activeTab.url);
    }
  }, [activeTab?.id, activeTab?.url]);

  // Navigation Logic
  const handleNavigate = async (rawInput: string, tabId = activeTabId) => {
    let target = rawInput.trim();
    if (!target) return;

    let targetUrl = target;
    let pageType: Tab['pageType'] = 'custom_web';
    let searchQuery = '';

    // Smart detection: Search Query vs Direct URL
    const isUrl = target.startsWith('http://') || target.startsWith('https://') || target.startsWith('chrome://') || target.includes('.com') || target.includes('.org') || target.includes('.io') || target.includes('.net') || target.includes('.dev');

    if (!isUrl) {
      // Treat as Google Search
      searchQuery = target;
      targetUrl = `https://google.com/search?q=${encodeURIComponent(target)}`;
      pageType = 'google_results';
    } else {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('chrome://')) {
        targetUrl = 'https://' + targetUrl;
      }

      if (targetUrl === 'https://google.com' || targetUrl === 'https://www.google.com') {
        pageType = 'google';
      } else if (targetUrl.includes('google.com/search')) {
        pageType = 'google_results';
        try {
          const urlObj = new URL(targetUrl);
          searchQuery = urlObj.searchParams.get('q') || '';
        } catch {
          searchQuery = target;
        }
      } else if (targetUrl.includes('vca-authority.com/verify')) {
        pageType = 'vca_verify';
      } else if (targetUrl.includes('github.com')) {
        pageType = 'github';
      } else if (targetUrl.includes('webcontainers.io')) {
        pageType = 'webcontainers';
      } else if (targetUrl.includes('tcgplayer.com') || targetUrl.includes('cardmarket.com')) {
        pageType = 'tcg';
      } else if (targetUrl.includes('news.ycombinator.com')) {
        pageType = 'hackernews';
      } else if (targetUrl === 'chrome://settings') {
        pageType = 'settings';
      } else if (targetUrl === 'chrome://history') {
        pageType = 'history';
      } else if (targetUrl === 'chrome://bookmarks') {
        pageType = 'bookmarks';
      } else if (targetUrl === 'chrome://downloads') {
        pageType = 'downloads';
      }
    }

    // Set loading state on tab
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === tabId) {
          const newHistory = t.history.slice(0, t.historyIndex + 1);
          newHistory.push(targetUrl);
          return {
            ...t,
            url: targetUrl,
            title: getTitleForPage(pageType, searchQuery, targetUrl),
            isLoading: true,
            pageType,
            searchQuery,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            isBookmarked: bookmarks.some((b) => b.url === targetUrl)
          };
        }
        return t;
      })
    );

    // Add to history
    setBrowsingHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        title: getTitleForPage(pageType, searchQuery, targetUrl),
        url: targetUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev.slice(0, 49)
    ]);

    logActivity('BROWSER_NAVIGATED', `Chromium navigated to: ${targetUrl}`);

    // Simulated fetch / search
    setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, isLoading: false } : t))
      );
    }, 400);
  };

  const getTitleForPage = (type: Tab['pageType'], query?: string, url?: string): string => {
    switch (type) {
      case 'google':
        return 'Google';
      case 'google_results':
        return `${query || 'Search'} - Google Search`;
      case 'vca_verify':
        return 'VCA Card Verification #VCA-2026-000128';
      case 'github':
        return 'vca/vca-os · GitHub';
      case 'webcontainers':
        return 'WebContainers · In-Browser Node.js';
      case 'tcg':
        return 'TCG Marketplace & Live Price Index';
      case 'hackernews':
        return 'Hacker News (Y Combinator)';
      case 'settings':
        return 'Chrome Settings';
      case 'history':
        return 'Chrome History';
      case 'bookmarks':
        return 'Chrome Bookmarks';
      case 'downloads':
        return 'Chrome Downloads';
      default:
        try {
          return new URL(url || '').hostname || 'Web Destination';
        } catch {
          return 'Web Destination';
        }
    }
  };

  // Tab Controls
  const handleNewTab = (initialTarget = 'https://google.com') => {
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      url: initialTarget,
      title: initialTarget === 'https://google.com' ? 'Google' : 'New Tab',
      isLoading: false,
      history: [initialTarget],
      historyIndex: 0,
      zoom: 100,
      isBookmarked: false,
      isPinned: false,
      pageType: initialTarget === 'https://google.com' ? 'google' : 'custom_web'
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (tabIdToClose: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (tabs.length === 1) {
      // Don't close last tab, just reset to Google
      handleNavigate('https://google.com', tabIdToClose);
      return;
    }
    const idx = tabs.findIndex((t) => t.id === tabIdToClose);
    const newTabs = tabs.filter((t) => t.id !== tabIdToClose);
    setTabs(newTabs);
    if (activeTabId === tabIdToClose) {
      const nextIdx = Math.max(0, idx - 1);
      setActiveTabId(newTabs[nextIdx].id);
    }
  };

  const handleGoBack = () => {
    if (activeTab && activeTab.historyIndex > 0) {
      const targetIndex = activeTab.historyIndex - 1;
      const targetUrl = activeTab.history[targetIndex];
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                url: targetUrl,
                historyIndex: targetIndex,
                title: targetUrl.includes('google.com') ? 'Google' : 'Web Destination'
              }
            : t
        )
      );
    }
  };

  const handleGoForward = () => {
    if (activeTab && activeTab.historyIndex < activeTab.history.length - 1) {
      const targetIndex = activeTab.historyIndex + 1;
      const targetUrl = activeTab.history[targetIndex];
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                url: targetUrl,
                historyIndex: targetIndex,
                title: targetUrl.includes('google.com') ? 'Google' : 'Web Destination'
              }
            : t
        )
      );
    }
  };

  const handleReload = () => {
    if (!activeTab) return;
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: true } : t))
    );
    setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: false } : t))
      );
    }, 450);
  };

  const handleToggleBookmark = () => {
    if (!activeTab) return;
    const isCurrentlyBookmarked = bookmarks.some((b) => b.url === activeTab.url);
    if (isCurrentlyBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.url !== activeTab.url));
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, isBookmarked: false } : t))
      );
      addNotification({
        title: 'Bookmark Removed',
        message: `Removed ${activeTab.title} from bookmarks`,
        type: 'info'
      });
    } else {
      const newBm: BookmarkItem = {
        id: `bm-${Date.now()}`,
        title: activeTab.title,
        url: activeTab.url,
        icon: 'Globe',
        color: 'text-cyan-400'
      };
      setBookmarks((prev) => [...prev, newBm]);
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, isBookmarked: true } : t))
      );
      setShowBookmarkModal(true);
    }
  };

  const handleAiExtract = () => {
    setIsAiAnalyzing(true);
    setShowAiDrawer(true);
    setTimeout(() => {
      if (activeTab.pageType === 'vca_verify') {
        setAiAnalysis(
          '### VCA Card Verification Analysis\n- **Card**: Charizard (Shadowless Holo #4/102)\n- **Authenticity**: 100% Cryptographically Verified (NFC-ISO14443A-BOUND)\n- **Subgrades**: Centering 9.5, Corners 9.0, Edges 9.5, Surface 9.0\n- **Estimated Fair Market Value**: $18,500 USD (Consensus from PSA & Heritage Auctions)'
        );
      } else if (activeTab.pageType === 'github') {
        setAiAnalysis(
          '### GitHub Repository Intelligence (`vca/vca-os`)\n- **Architecture**: Universal VCA Agent Runtime (VAR) + WebContainers Node WASM\n- **Key Modules**: Agent Swarm Orchestrator, Computer Use Driver, Forensic NFC Engine\n- **Autonomous Action**: Ready to clone into in-browser WebContainer or local container daemon.'
        );
      } else if (activeTab.pageType === 'webcontainers') {
        setAiAnalysis(
          '### WebContainers Platform Inspector\n- **Capability**: Native Node.js, npm, and dev servers inside browser tabs\n- **VCA Integration**: Acts as Browser Runtime Adapter for zero-backend deployments on Vercel.'
        );
      } else {
        setAiAnalysis(
          `### AI DOM Inspector (${activeTab.title})\n- **Destination**: \`${activeTab.url}\`\n- **Status**: Secure HTTPS connection, Zero CSP violations, DOM nodes parsed.\n- **Extracted Summary**: Page contains structured metadata with active interactive controls.`
        );
      }
      setIsAiAnalyzing(false);
    }, 600);
  };

  const handleConsoleEval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;
    const cmd = consoleInput.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let resultText = '';
    try {
      if (cmd === 'location.href') {
        resultText = `"${activeTab.url}"`;
      } else if (cmd === 'document.title') {
        resultText = `"${activeTab.title}"`;
      } else if (cmd === 'navigator.userAgent') {
        resultText = '"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 VCA-OS/5.0"';
      } else if (cmd.startsWith('var.') || cmd.startsWith('runtime.')) {
        resultText = '{"runtime": "webcontainer", "adapters": ["local", "docker", "remote_worker"], "status": "nominal"}';
      } else {
        resultText = String(eval(cmd));
      }
    } catch (err: any) {
      setConsoleLogs((prev) => [
        ...prev,
        { id: `c-${Date.now()}`, type: 'log', text: `> ${cmd}`, time },
        { id: `c-err-${Date.now()}`, type: 'error', text: `Uncaught TypeError: ${err.message}`, time }
      ]);
      setConsoleInput('');
      return;
    }

    setConsoleLogs((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, type: 'log', text: `> ${cmd}`, time },
      { id: `c-res-${Date.now()}`, type: 'info', text: `< ${resultText}`, time }
    ]);
    setConsoleInput('');
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* 1. CHROME TABS STRIP */}
      <div className="h-10 bg-slate-950 border-b border-slate-800/80 px-2 pt-1.5 flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs font-medium cursor-pointer transition-all max-w-[200px] min-w-[130px] border-t border-x ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-700/80 shadow-md'
                  : 'bg-slate-950/70 text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-slate-200'
              }`}
            >
              {/* Favicon or loading spinner */}
              {tab.isLoading ? (
                <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
              ) : tab.pageType === 'google' || tab.pageType === 'google_results' ? (
                <Search className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              ) : tab.pageType === 'vca_verify' ? (
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : tab.pageType === 'github' ? (
                <Code2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              ) : tab.pageType === 'webcontainers' ? (
                <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}

              {/* Title */}
              <span className="truncate flex-1 text-[11px]">{tab.title}</span>

              {/* Close Tab Button */}
              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className={`p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="Close Tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* New Tab Button */}
        <button
          onClick={() => handleNewTab()}
          className="p-1.5 hover:bg-slate-800/80 text-slate-400 hover:text-cyan-300 rounded-full transition shrink-0"
          title="New Tab (Ctrl+T)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 2. CHROME NAVIGATION & OMNIBOX BAR */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 px-3 flex items-center gap-2 shrink-0">
        {/* Nav Controls */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={handleGoBack}
            disabled={!activeTab || activeTab.historyIndex <= 0}
            className="p-1.5 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition hover:text-white"
            title="Click to go back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleGoForward}
            disabled={!activeTab || activeTab.historyIndex >= activeTab.history.length - 1}
            className="p-1.5 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition hover:text-white"
            title="Click to go forward"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReload}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition hover:text-white"
            title="Reload this page"
          >
            <RotateCw className={`w-3.5 h-3.5 ${activeTab?.isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => handleNavigate('https://google.com')}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition hover:text-white"
            title="Open Homepage"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Omnibox (Address & Search Bar) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNavigate(omniboxInput);
          }}
          className={`flex-1 flex items-center bg-slate-950 border rounded-full px-3.5 py-1.5 text-xs gap-2 transition-all ${
            isOmniboxFocused
              ? 'border-cyan-500 ring-2 ring-cyan-500/20 text-white'
              : 'border-slate-700/80 text-slate-300 hover:border-slate-600'
          }`}
        >
          {/* Security SSL Lock */}
          <button
            type="button"
            onClick={() => setShowSecurityModal(!showSecurityModal)}
            className="text-emerald-400 hover:text-emerald-300 transition shrink-0 flex items-center gap-1"
            title="View site information"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>

          <input
            type="text"
            value={omniboxInput}
            onChange={(e) => setOmniboxInput(e.target.value)}
            onFocus={() => setIsOmniboxFocused(true)}
            onBlur={() => setIsOmniboxFocused(false)}
            className="w-full bg-transparent border-none text-xs text-white focus:outline-none placeholder-slate-500"
            placeholder="Search Google or type a URL..."
          />

          {/* Bookmark Star Button */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`p-1 hover:bg-slate-800 rounded-full transition shrink-0 ${
              activeTab?.isBookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-amber-300'
            }`}
            title="Bookmark this tab"
          >
            <Star className={`w-3.5 h-3.5 ${activeTab?.isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </form>

        {/* Action Tools */}
        <div className="flex items-center gap-1 text-slate-300">
          {/* AI Page Intelligence */}
          <button
            onClick={handleAiExtract}
            className="px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/50 rounded-full text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
            title="AI Page Intelligence & DOM Extractor"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">AI Inspect</span>
          </button>

          {/* DevTools Toggle */}
          <button
            onClick={() => setShowDevTools(!showDevTools)}
            className={`p-1.5 rounded-lg transition ${showDevTools ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            title="Developer Tools (F12)"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Chrome Three-Dot Menu */}
          <div className="relative">
            <button
              onClick={() => setShowThreeDotMenu(!showThreeDotMenu)}
              className={`p-1.5 rounded-lg transition ${showThreeDotMenu ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
              title="Customize and control Google Chrome"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Three Dot Dropdown Menu */}
            {showThreeDotMenu && (
              <div className="absolute right-0 top-9 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 text-xs text-slate-200 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    handleNewTab();
                    setShowThreeDotMenu(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5 text-cyan-400" /> New Tab</span>
                  <span className="text-[10px] text-slate-500">Ctrl+T</span>
                </button>
                <button
                  onClick={() => {
                    handleNewTab('https://google.com');
                    setShowThreeDotMenu(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-emerald-400" /> New Window</span>
                  <span className="text-[10px] text-slate-500">Ctrl+N</span>
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <button
                  onClick={() => {
                    setShowHistoryModal(true);
                    setShowThreeDotMenu(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2"><History className="w-3.5 h-3.5 text-amber-400" /> History</span>
                  <span className="text-[10px] text-slate-500">Ctrl+H</span>
                </button>
                <button
                  onClick={() => {
                    setShowBookmarksManagerModal(true);
                    setShowThreeDotMenu(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2"><Bookmark className="w-3.5 h-3.5 text-purple-400" /> Bookmarks</span>
                  <span className="text-[10px] text-slate-500">Ctrl+Shift+O</span>
                </button>
                <button
                  onClick={() => {
                    setShowDownloadsModal(true);
                    setShowThreeDotMenu(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2"><Download className="w-3.5 h-3.5 text-cyan-400" /> Downloads</span>
                  <span className="text-[10px] text-slate-500">Ctrl+J</span>
                </button>
                <div className="h-px bg-slate-800 my-1" />
                {/* Zoom Controls */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-slate-400">Zoom</span>
                  <div className="flex items-center gap-2 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, zoom: Math.max(50, t.zoom - 10) } : t)))}
                      className="hover:text-cyan-400 font-bold"
                    >
                      -
                    </button>
                    <span className="text-[11px] font-mono">{activeTab?.zoom || 100}%</span>
                    <button
                      onClick={() => setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, zoom: Math.min(200, t.zoom + 10) } : t)))}
                      className="hover:text-cyan-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowFindInPage(true);
                    setShowThreeDotMenu(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2"><Search className="w-3.5 h-3.5 text-blue-400" /> Find on page...</span>
                  <span className="text-[10px] text-slate-500">Ctrl+F</span>
                </button>
                <button
                  onClick={() => {
                    setShowDevTools(true);
                    setShowThreeDotMenu(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2"><Code2 className="w-3.5 h-3.5 text-emerald-400" /> Developer Tools</span>
                  <span className="text-[10px] text-slate-500">F12</span>
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <button
                  onClick={() => {
                    handleNavigate('chrome://settings');
                    setShowThreeDotMenu(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2 text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" /> Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. CHROME BOOKMARKS BAR */}
      {showBookmarksBar && (
        <div className="h-8 bg-slate-950 border-b border-slate-800/80 px-3 flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar text-xs">
          {bookmarks.map((bm) => (
            <button
              key={bm.id}
              onClick={() => handleNavigate(bm.url)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition shrink-0 text-[11px]"
              title={bm.url}
            >
              {bm.icon === 'Search' ? (
                <Search className={`w-3 h-3 ${bm.color || 'text-blue-400'}`} />
              ) : bm.icon === 'Shield' ? (
                <Shield className={`w-3 h-3 ${bm.color || 'text-emerald-400'}`} />
              ) : bm.icon === 'Code2' ? (
                <Code2 className={`w-3 h-3 ${bm.color || 'text-purple-400'}`} />
              ) : bm.icon === 'Cpu' ? (
                <Cpu className={`w-3 h-3 ${bm.color || 'text-cyan-400'}`} />
              ) : bm.icon === 'Layers' ? (
                <Layers className={`w-3 h-3 ${bm.color || 'text-amber-400'}`} />
              ) : (
                <Globe className={`w-3 h-3 ${bm.color || 'text-slate-400'}`} />
              )}
              <span>{bm.title}</span>
            </button>
          ))}

          {/* Add Bookmark button */}
          <button
            onClick={() => setShowBookmarkModal(true)}
            className="p-1 hover:bg-slate-900 text-slate-500 hover:text-slate-300 rounded-md transition ml-auto shrink-0"
            title="Add Bookmark"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Find In Page Banner */}
      {showFindInPage && (
        <div className="h-10 bg-slate-900 border-b border-cyan-500/40 px-4 flex items-center justify-between text-xs shrink-0 z-20">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <input
              type="text"
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              placeholder="Find in page..."
              autoFocus
              className="bg-slate-950 border border-slate-700 px-2 py-0.5 rounded text-white text-xs w-full focus:outline-none"
            />
            {findQuery && <span className="text-[10px] text-slate-400 whitespace-nowrap">3 matches</span>}
          </div>
          <button onClick={() => setShowFindInPage(false)} className="p-1 hover:bg-slate-800 rounded">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      )}

      {/* 4. MAIN BROWSER VIEWPORT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Web Content Render Area */}
        <div
          className="flex-1 bg-slate-950 overflow-y-auto select-text relative"
          style={{ transform: `scale(${activeTab?.zoom ? activeTab.zoom / 100 : 1})`, transformOrigin: 'top left' }}
        >
          {/* A. GOOGLE HOME PAGE */}
          {activeTab.pageType === 'google' && (
            <div className="min-h-full flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
              {/* Google Wordmark */}
              <div className="flex items-center justify-center select-none cursor-default font-bold text-5xl tracking-tight">
                <span className="text-blue-500">G</span>
                <span className="text-red-500">o</span>
                <span className="text-amber-500">o</span>
                <span className="text-blue-500">g</span>
                <span className="text-emerald-500">l</span>
                <span className="text-red-500">e</span>
              </div>

              {/* Google Central Search Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (omniboxInput && omniboxInput !== 'https://google.com') {
                    handleNavigate(omniboxInput);
                  }
                }}
                className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 hover:border-slate-500 focus-within:border-cyan-500 rounded-full px-5 py-3 flex items-center gap-3 shadow-2xl transition"
              >
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Google or type a URL"
                  className="w-full bg-transparent text-sm text-white focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNavigate((e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </form>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={() => handleNavigate('1999 charizard base set shadowless psa 9 price')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition shadow"
                >
                  Google Search
                </button>
                <button
                  onClick={() => handleNavigate('https://vca-authority.com/verify/VCA-2026-000128')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition shadow flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> I'm Feeling Lucky
                </button>
              </div>

              {/* Quick Dial Shortcuts */}
              <div className="grid grid-cols-4 gap-4 w-full max-w-lg pt-4">
                {[
                  { name: 'VCA Verify', url: 'https://vca-authority.com/verify/VCA-2026-000128', icon: 'Shield', color: 'text-emerald-400' },
                  { name: 'GitHub Repo', url: 'https://github.com/vca/vca-os', icon: 'Code2', color: 'text-purple-400' },
                  { name: 'WebContainers', url: 'https://webcontainers.io', icon: 'Cpu', color: 'text-cyan-400' },
                  { name: 'TCG Markets', url: 'https://tcgplayer.com', icon: 'Layers', color: 'text-amber-400' }
                ].map((dial) => (
                  <button
                    key={dial.name}
                    onClick={() => handleNavigate(dial.url)}
                    className="p-3 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-2xl flex flex-col items-center gap-2 transition hover:scale-105"
                  >
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      {dial.icon === 'Shield' && <Shield className={`w-5 h-5 ${dial.color}`} />}
                      {dial.icon === 'Code2' && <Code2 className={`w-5 h-5 ${dial.color}`} />}
                      {dial.icon === 'Cpu' && <Cpu className={`w-5 h-5 ${dial.color}`} />}
                      {dial.icon === 'Layers' && <Layers className={`w-5 h-5 ${dial.color}`} />}
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 truncate w-full">{dial.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* B. GOOGLE SEARCH RESULTS PAGE */}
          {activeTab.pageType === 'google_results' && (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
              {/* Search Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 overflow-x-auto pb-1">
                  <span className="text-cyan-400 border-b-2 border-cyan-400 pb-1 font-bold flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" /> All
                  </span>
                  <span className="hover:text-slate-200 cursor-pointer flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Cards & Auth
                  </span>
                  <span className="hover:text-slate-200 cursor-pointer flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" /> Code & Runtimes
                  </span>
                  <span className="hover:text-slate-200 cursor-pointer flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" /> News
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">About 482,000 results (0.24 seconds) for "{activeTab.searchQuery}"</p>
              </div>

              {/* Main Results Grid (Results + Knowledge Panel) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Results Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Organic Result 1 */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-md">
                        <Shield className="w-3 h-3" />
                      </div>
                      <span className="text-slate-300">vca-authority.com › verify › VCA-2026-000128</span>
                    </div>
                    <h3
                      onClick={() => handleNavigate('https://vca-authority.com/verify/VCA-2026-000128')}
                      className="text-base font-semibold text-cyan-400 hover:underline cursor-pointer"
                    >
                      Verified Card Authority (VCA) - Official Slab & NFC Registry
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Official authentication portal for Grade 9.0+ 1999 Shadowless Holo Charizard. Includes micro-rosette CMYK verification, cryptographic NFC ISO14443A signature, and subgrades breakdown.
                    </p>
                  </div>

                  {/* Organic Result 2 */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="p-1 bg-purple-500/20 text-purple-400 rounded-md">
                        <Code2 className="w-3 h-3" />
                      </div>
                      <span className="text-slate-300">github.com › vca › vca-os</span>
                    </div>
                    <h3
                      onClick={() => handleNavigate('https://github.com/vca/vca-os')}
                      className="text-base font-semibold text-cyan-400 hover:underline cursor-pointer"
                    >
                      GitHub - vca/vca-os: The Autonomous AI Operating System
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Environment-agnostic VCA Agent Runtime (VAR) architecture with Universal Tool Contracts, in-browser WebContainers WASM execution, Docker isolation, and live Linux process supervision.
                    </p>
                  </div>

                  {/* Organic Result 3 */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="p-1 bg-cyan-500/20 text-cyan-400 rounded-md">
                        <Cpu className="w-3 h-3" />
                      </div>
                      <span className="text-slate-300">webcontainers.io › docs › introduction</span>
                    </div>
                    <h3
                      onClick={() => handleNavigate('https://webcontainers.io')}
                      className="text-base font-semibold text-cyan-400 hover:underline cursor-pointer"
                    >
                      WebContainers - Run Node.js directly inside your browser
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      WebContainers allow operating systems, Node dev servers, npm packages, and terminal commands to execute securely within browser tabs without relying on backend servers.
                    </p>
                  </div>
                </div>

                {/* Right Knowledge Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl h-fit">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">Charizard #4/102</h4>
                      <p className="text-xs text-slate-400">Base Set (1999 Shadowless Holo)</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 text-[11px] font-bold rounded-full border border-amber-500/40">
                      VCA 9.0 MINT
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Market Value:</span>
                      <span className="font-bold text-emerald-400">$18,500 USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Population:</span>
                      <span className="font-mono text-slate-200">842 worldwide</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">NFC Security:</span>
                      <span className="font-mono text-cyan-400">Active & Sealed</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavigate('https://vca-authority.com/verify/VCA-2026-000128')}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition shadow"
                  >
                    View Official VCA Certificate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* C. VCA OFFICIAL CARD VERIFICATION PORTAL */}
          {activeTab.pageType === 'vca_verify' && (
            <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        Official VCA Forensic Authentication Portal
                      </h2>
                      <p className="text-xs text-slate-400 font-mono">vca-authority.com/verify/VCA-2026-000128</p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold rounded-full border border-emerald-500/50 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> CRYPTOGRAPHICALLY CERTIFIED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Card Title:</span>
                      <span className="text-base font-bold text-white">Charizard (1st Edition Shadowless)</span>
                    </div>
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Set / Release:</span>
                      <span className="font-semibold text-slate-200">1999 Base Set • Card #4/102</span>
                    </div>
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Overall Grade & Subgrades:</span>
                      <span className="text-xl font-black text-amber-400 block">VCA 9.0 MINT</span>
                      <div className="text-[11px] text-slate-400 mt-1 grid grid-cols-2 gap-1 font-mono">
                        <span>Centering: 9.5</span>
                        <span>Corners: 9.0</span>
                        <span>Edges: 9.5</span>
                        <span>Surface: 9.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">VCA Certification Serial:</span>
                      <span className="font-mono text-cyan-400 font-bold text-sm">VCA-2026-000128</span>
                    </div>
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Cryptographic NFC Status:</span>
                      <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> NFC-ISO14443A-AUTHENTIC
                      </span>
                    </div>
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Estimated Auction Value:</span>
                      <span className="font-bold text-emerald-400 text-base">$18,500 - $22,000 USD</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      addNotification({
                        title: 'Certificate Downloaded',
                        message: 'Saved official VCA grading certificate PDF to Downloads',
                        type: 'success'
                      });
                    }}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
                  >
                    <Download className="w-4 h-4" /> Download Official PDF Certificate
                  </button>
                  <button
                    onClick={() => handleAiExtract()}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-2 transition"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Run AI Forensic Audit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* D. GITHUB REPOSITORY EXPLORER */}
          {activeTab.pageType === 'github' && (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-2xl">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        vca / vca-os <span className="px-2 py-0.5 bg-slate-800 text-[10px] text-slate-400 rounded-full">Public</span>
                      </h2>
                      <p className="text-xs text-slate-400">The Autonomous AI Operating System with Universal Runtime Contracts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      addNotification({
                        title: 'Cloning Repository',
                        message: 'Cloning vca/vca-os into in-browser WebContainer runtime...',
                        type: 'info'
                      });
                      openWindow('coding_agents');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition"
                  >
                    <Play className="w-3.5 h-3.5" /> Clone to VAR WebContainer
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                    <span>branch: <strong>main</strong></span>
                    <span>latest commit: <strong className="text-cyan-400">7f9a2e1</strong></span>
                  </div>
                  <div className="space-y-1.5 pt-1 text-slate-300">
                    <div className="flex items-center gap-2"><Folder className="w-3.5 h-3.5 text-cyan-400" /> /src/vca-runtime/core</div>
                    <div className="flex items-center gap-2"><Folder className="w-3.5 h-3.5 text-cyan-400" /> /src/vca-runtime/runtimes</div>
                    <div className="flex items-center gap-2"><Folder className="w-3.5 h-3.5 text-cyan-400" /> /src/vca-runtime/tools</div>
                    <div className="flex items-center gap-2"><FileCode className="w-3.5 h-3.5 text-purple-400" /> README.md</div>
                    <div className="flex items-center gap-2"><FileCode className="w-3.5 h-3.5 text-purple-400" /> package.json</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* E. WEBCONTAINERS INTERACTIVE DOCS */}
          {activeTab.pageType === 'webcontainers' && (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">WebContainers Technology</h2>
                    <p className="text-xs text-slate-400">Browser-native Node.js WebAssembly runtime</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  WebContainers enable the VCA OS to run full Node.js toolchains, npm package installations, and Vite development servers directly inside user browser tabs without server bottlenecks.
                </p>
              </div>
            </div>
          )}

          {/* F. TCG MARKETPLACE */}
          {activeTab.pageType === 'tcg' && (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">TCG Marketplace & Live Price Index</h2>
                      <p className="text-xs text-slate-400">Real-time aggregate sales from eBay, Heritage, and PWCC</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                    INDEX +4.2% TODAY
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* G. HACKER NEWS */}
          {activeTab.pageType === 'hackernews' && (
            <div className="p-6 max-w-4xl mx-auto space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Radio className="w-5 h-5 text-orange-400" />
                  <h3 className="text-base font-bold text-white">Hacker News</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <a className="font-semibold text-cyan-400 hover:underline">1. VCA Agent Runtime: Environment-Agnostic AI Operating System</a>
                    <p className="text-[11px] text-slate-400 mt-1">428 points by vcadev 2 hours ago | 184 comments</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <a className="font-semibold text-cyan-400 hover:underline">2. Running WebContainers and Node.js WASM in Production</a>
                    <p className="text-[11px] text-slate-400 mt-1">312 points by stackblitz 4 hours ago | 92 comments</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* H. CHROME INTERNAL SETTINGS */}
          {activeTab.pageType === 'settings' && (
            <div className="p-6 max-w-3xl mx-auto space-y-6 animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <Settings className="w-6 h-6 text-slate-400" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Google Chrome Settings</h2>
                    <p className="text-xs text-slate-400">Customize browser preferences, search engine, and security</p>
                  </div>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <div>
                      <span className="font-semibold text-white block">Default Search Engine</span>
                      <span className="text-slate-400 text-[11px]">Search engine used in the address bar</span>
                    </div>
                    <select className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none">
                      <option>Google (Default)</option>
                      <option>DuckDuckGo</option>
                      <option>Bing</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <div>
                      <span className="font-semibold text-white block">Always Show Bookmarks Bar</span>
                      <span className="text-slate-400 text-[11px]">Display quick bookmarks strip under omnibar</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showBookmarksBar}
                      onChange={(e) => setShowBookmarksBar(e.target.checked)}
                      className="w-4 h-4 rounded accent-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. AI INTELLIGENCE DRAWER */}
        {showAiDrawer && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 p-4 flex flex-col justify-between shrink-0 animate-in slide-in-from-right duration-200">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Page Intelligence
                </span>
                <button onClick={() => setShowAiDrawer(false)} className="p-1 hover:bg-slate-800 rounded">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {isAiAnalyzing ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <RotateCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  <span className="text-xs text-slate-400">Extracting DOM & Grounding search...</span>
                </div>
              ) : (
                <div className="text-xs text-slate-300 space-y-3 leading-relaxed whitespace-pre-line">
                  {aiAnalysis || 'Click "AI Inspect" to analyze the current webpage.'}
                </div>
              )}
            </div>

            <button
              onClick={() => handleAiExtract()}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition shadow"
            >
              Re-analyze Page
            </button>
          </div>
        )}
      </div>

      {/* 6. DEVELOPER TOOLS (F12) */}
      {showDevTools && (
        <div className="h-64 bg-slate-950 border-t border-slate-800 flex flex-col shrink-0 text-xs">
          {/* DevTools Tab Strip */}
          <div className="h-8 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1">
              {[
                { id: 'elements', label: 'Elements' },
                { id: 'console', label: 'Console' },
                { id: 'network', label: 'Network' },
                { id: 'storage', label: 'Storage' },
                { id: 'var_driver', label: 'VAR Driver' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDevToolsTab(tab.id as any)}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                    devToolsTab === tab.id
                      ? 'bg-slate-800 text-cyan-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDevTools(false)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* DevTools Body */}
          <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] select-text">
            {devToolsTab === 'console' && (
              <div className="space-y-1.5 flex flex-col justify-between h-full">
                <div className="space-y-1 overflow-y-auto">
                  {consoleLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`flex items-start gap-2 ${
                        log.type === 'error'
                          ? 'text-red-400 bg-red-950/20 p-1 rounded'
                          : log.type === 'warn'
                          ? 'text-amber-400'
                          : log.type === 'info'
                          ? 'text-cyan-400'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="text-slate-600 text-[10px]">{log.time}</span>
                      <span>{log.text}</span>
                    </div>
                  ))}
                </div>

                {/* Console REPL prompt */}
                <form onSubmit={handleConsoleEval} className="flex items-center gap-2 border-t border-slate-800 pt-2 shrink-0">
                  <span className="text-cyan-400 font-bold">{'>'}</span>
                  <input
                    type="text"
                    value={consoleInput}
                    onChange={(e) => setConsoleInput(e.target.value)}
                    placeholder="Enter JavaScript expression (e.g. location.href, navigator.userAgent)"
                    className="w-full bg-transparent border-none text-white text-xs focus:outline-none font-mono"
                  />
                </form>
              </div>
            )}

            {devToolsTab === 'elements' && (
              <div className="text-slate-300 space-y-1">
                <div><span className="text-slate-500">&lt;!DOCTYPE html&gt;</span></div>
                <div><span className="text-purple-400">&lt;html <span className="text-amber-400">lang</span>=<span className="text-emerald-400">"en"</span>&gt;</span></div>
                <div className="pl-4"><span className="text-purple-400">&lt;head&gt;...&lt;/head&gt;</span></div>
                <div className="pl-4"><span className="text-purple-400">&lt;body <span className="text-amber-400">class</span>=<span className="text-emerald-400">"vca-os-desktop"</span>&gt;</span></div>
                <div className="pl-8"><span className="text-purple-400">&lt;div <span className="text-amber-400">id</span>=<span className="text-emerald-400">"root"</span>&gt;</span> ... <span className="text-purple-400">&lt;/div&gt;</span></div>
                <div className="pl-4"><span className="text-purple-400">&lt;/body&gt;</span></div>
                <div><span className="text-purple-400">&lt;/html&gt;</span></div>
              </div>
            )}

            {devToolsTab === 'network' && (
              <div className="space-y-1">
                <div className="grid grid-cols-5 text-slate-500 font-bold border-b border-slate-800 pb-1">
                  <span>Name</span>
                  <span>Status</span>
                  <span>Type</span>
                  <span>Size</span>
                  <span>Time</span>
                </div>
                <div className="grid grid-cols-5 text-slate-300">
                  <span className="text-cyan-400 truncate">{activeTab.url}</span>
                  <span className="text-emerald-400">200 OK</span>
                  <span>document</span>
                  <span>42.8 KB</span>
                  <span>14ms</span>
                </div>
                <div className="grid grid-cols-5 text-slate-300">
                  <span className="text-cyan-400 truncate">bundle.js</span>
                  <span className="text-emerald-400">200 OK</span>
                  <span>script</span>
                  <span>142 KB</span>
                  <span>28ms</span>
                </div>
              </div>
            )}

            {devToolsTab === 'var_driver' && (
              <div className="space-y-2 text-slate-300">
                <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Autonomous Browser Driver Telemetry
                </div>
                <p className="text-slate-400 text-[10px]">Active Driver: Gemini Computer Mode / VAR Browser Adapter</p>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 space-y-1">
                  <div>• DOM Tree Nodes Indexed: 142</div>
                  <div>• Active Viewport: 1280 x 800</div>
                  <div>• Input Capabilities: Click, Scroll, Keypress, Screenshot, Extract</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. SSL SECURITY MODAL */}
      {showSecurityModal && (
        <div className="absolute top-12 left-16 w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-xs text-slate-200 z-50 animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold text-white block">Connection is secure</span>
              <span className="text-[10px] text-slate-400">Valid SSL/TLS Certificate</span>
            </div>
          </div>
          <div className="space-y-2 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Issued by:</span>
              <span className="font-semibold text-white">Google Trust Services / VCA CA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Encryption:</span>
              <span className="font-mono text-emerald-400">TLS 1.3 (AES-256-GCM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cookies in use:</span>
              <span className="text-slate-200">2 active</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. BOOKMARKS MANAGER MODAL */}
      {showBookmarksManagerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-400" /> Bookmarks Manager
              </h3>
              <button onClick={() => setShowBookmarksManagerModal(false)} className="p-1 hover:bg-slate-800 rounded">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              {bookmarks.map((bm) => (
                <div key={bm.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-bold text-white block truncate">{bm.title}</span>
                    <span className="text-[10px] text-slate-500 truncate">{bm.url}</span>
                  </div>
                  <button
                    onClick={() => setBookmarks((prev) => prev.filter((b) => b.id !== bm.id))}
                    className="p-1 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" /> Browsing History
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 hover:bg-slate-800 rounded">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
              {browsingHistory.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    handleNavigate(h.url);
                    setShowHistoryModal(false);
                  }}
                  className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-cyan-500 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="truncate flex-1 pr-2">
                    <span className="font-semibold text-white block truncate">{h.title}</span>
                    <span className="text-[10px] text-slate-500 truncate">{h.url}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{h.timestamp}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setBrowsingHistory([]);
                  addNotification({ title: 'History Cleared', message: 'Cleared browsing data', type: 'info' });
                }}
                className="text-xs text-red-400 hover:underline"
              >
                Clear browsing data
              </button>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

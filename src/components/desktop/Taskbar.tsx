import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { AppId, ScreenLayout } from '../../types/os';
import { APPS_REGISTRY } from '../../lib/appsRegistry';
import {
  Sparkles,
  Folder,
  Globe,
  Terminal,
  Code2,
  FileText,
  Table,
  Presentation,
  Mail,
  Calendar,
  CheckSquare,
  GitFork,
  Brain,
  Layers,
  ShieldCheck,
  ShoppingBag,
  Lock,
  Activity,
  Cpu,
  Settings,
  FolderGit2,
  LayoutGrid,
  Bot,
  Search,
  Pin,
  PinOff,
  MoreVertical,
  ChevronUp,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Sliders,
  Columns,
  Rows,
  Grid,
  Wifi,
  Battery,
  Volume2,
  VolumeX,
  Bell,
  Wrench,
  Smartphone,
  Monitor,
  ExternalLink,
  Star,
  Zap,
  Check,
  Mic
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Mic: <Mic className="w-5 h-5 text-cyan-400" />,
  Bot: <Bot className="w-5 h-5 text-emerald-400" />,
  Sparkles: <Sparkles className="w-5 h-5 text-cyan-400" />,
  Folder: <Folder className="w-5 h-5 text-blue-400" />,
  Globe: <Globe className="w-5 h-5 text-indigo-400" />,
  Terminal: <Terminal className="w-5 h-5 text-emerald-400" />,
  Code2: <Code2 className="w-5 h-5 text-teal-400" />,
  FileText: <FileText className="w-5 h-5 text-sky-400" />,
  Table: <Table className="w-5 h-5 text-emerald-500" />,
  Presentation: <Presentation className="w-5 h-5 text-amber-400" />,
  Mail: <Mail className="w-5 h-5 text-rose-400" />,
  Calendar: <Calendar className="w-5 h-5 text-red-400" />,
  CheckSquare: <CheckSquare className="w-5 h-5 text-orange-400" />,
  GitFork: <GitFork className="w-5 h-5 text-purple-400" />,
  Brain: <Brain className="w-5 h-5 text-pink-400" />,
  Layers: <Layers className="w-5 h-5 text-cyan-300" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-teal-300" />,
  Cpu: <Cpu className="w-5 h-5 text-cyan-400" />,
  FolderGit2: <FolderGit2 className="w-5 h-5 text-amber-400" />,
  LayoutGrid: <LayoutGrid className="w-5 h-5 text-cyan-300" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5 text-yellow-400" />,
  Lock: <Lock className="w-5 h-5 text-amber-500" />,
  Activity: <Activity className="w-5 h-5 text-emerald-300" />,
  Settings: <Settings className="w-5 h-5 text-slate-400" />
};

export const Taskbar: React.FC = () => {
  const {
    windows,
    activeWindowId,
    openWindow,
    focusWindow,
    minimizeWindow,
    closeWindow,
    maximizeWindow,
    screens,
    activeScreenIndex,
    setActiveScreenIndex,
    addScreen,
    setScreenLayout,
    isLauncherOpen,
    setLauncherOpen,
    isQuickSettingsOpen,
    setQuickSettingsOpen,
    isNotificationsOpen,
    setNotificationsOpen,
    isSideToolsOpen,
    setSideToolsOpen,
    isVoiceAgentOpen,
    toggleVoiceAgent,
    setCommandPaletteOpen,
    notifications,
    taskbarStyle,
    setTaskbarStyle,
    pinnedApps,
    pinApp,
    unpinApp,
    isAppPinned,
    workspaceHeaderMode,
    setWorkspaceHeaderMode,
    isWorkspaceMenuOpen,
    setWorkspaceMenuOpen,
    soundEnabled,
    setSoundEnabled
  } = useOS();

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    appId?: AppId;
    windowId?: string;
  } | null>(null);

  const [isScreenMenuOpen, setIsScreenMenuOpen] = useState(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);

  const taskbarRef = useRef<HTMLDivElement>(null);

  // Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close popup menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  // Active windows on current screen
  const screenWindows = windows.filter(
    (w) => (w.screenIndex ?? 0) === activeScreenIndex
  );

  // App Click Handler (Windows / Dock logic)
  const handleAppClick = (appId: AppId) => {
    const existing = windows.find((w) => w.appId === appId && (w.screenIndex ?? 0) === activeScreenIndex);
    if (existing) {
      if (existing.isMinimized) {
        focusWindow(existing.id);
      } else if (existing.id === activeWindowId) {
        minimizeWindow(existing.id);
      } else {
        focusWindow(existing.id);
      }
    } else {
      openWindow(appId);
    }
  };

  // Right click / Long press handler for Pinning
  const handleAppContextMenu = (e: React.MouseEvent, appId: AppId, windowId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      x: Math.min(rect.left, window.innerWidth - 220),
      y: rect.top - 140,
      appId,
      windowId
    });
  };

  // Combine pinned apps with currently open apps to ensure all active apps appear on taskbar
  const runningAppIds = Array.from(new Set(screenWindows.map((w) => w.appId)));
  const displayAppIds = Array.from(new Set([...pinnedApps, ...runningAppIds]));

  return (
    <>
      {/* ============================================================ */}
      {/* 1. WINDOWS STYLE BOTTOM TASKBAR                              */}
      {/* ============================================================ */}
      {taskbarStyle === 'windows' && (
        <div
          ref={taskbarRef}
          className="fixed bottom-0 inset-x-0 h-12 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 z-40 flex items-center justify-between px-2 text-slate-200 select-none shadow-[0_-8px_30px_rgba(0,0,0,0.7)]"
        >
          {/* LEFT: VCA WINDOW / START BUTTON & SEARCH */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* VCA WINDOW / START BUTTON */}
            <button
              id="vca-start-button"
              onClick={() => setLauncherOpen(!isLauncherOpen)}
              className={`relative h-10 px-3 rounded-xl flex items-center gap-2 transition-all duration-200 font-bold text-xs group ${
                isLauncherOpen
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white hover:border-cyan-500/50'
              }`}
              title="VCA Start Menu & Applications"
            >
              {/* Holographic VCA Badge Icon */}
              <div className="relative flex items-center justify-center">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>

              <span className="hidden sm:inline tracking-wider font-extrabold bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent group-hover:text-white transition-colors">
                VCA OS
              </span>
            </button>

            {/* Quick Command / AI Search Bar */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 h-10 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 transition text-xs font-medium"
              title="AI Search & Quick Launch (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Search apps, cards, AI...</span>
              <kbd className="text-[10px] font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Virtual Screen Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setIsScreenMenuOpen(!isScreenMenuOpen)}
                className="h-10 px-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 flex items-center gap-1.5 text-xs font-bold text-cyan-400 transition"
                title={`Current: ${screens[activeScreenIndex]?.name || 'Screen'} (Click to switch screens 1-10)`}
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="font-mono">{activeScreenIndex + 1}</span>
                <span className="hidden lg:inline text-[11px] text-slate-300 font-normal">
                  / {screens.length}
                </span>
              </button>

              {/* Screens 1-10 Dropdown Picker */}
              {isScreenMenuOpen && (
                <div className="absolute left-0 bottom-12 w-64 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 z-50 backdrop-blur-2xl text-slate-200 text-xs animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-slate-800 font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                    <span>Virtual Screens</span>
                    <span className="text-cyan-400 font-mono">{screens.length}/10</span>
                  </div>

                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {screens.map((sc, idx) => (
                      <button
                        key={sc.id}
                        onClick={() => {
                          setActiveScreenIndex(idx);
                          setIsScreenMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition ${
                          idx === activeScreenIndex
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-950 flex items-center justify-center font-mono text-[10px] text-cyan-400 border border-slate-800">
                            {idx + 1}
                          </span>
                          <span className="truncate font-semibold">{sc.name}</span>
                        </div>
                        <span className="text-[10px] font-mono uppercase text-slate-500">
                          {sc.layout}
                        </span>
                      </button>
                    ))}
                  </div>

                  {screens.length < 10 && (
                    <button
                      onClick={() => {
                        addScreen();
                        setIsScreenMenuOpen(false);
                      }}
                      className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Screen ({screens.length + 1})</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Split Screen Layout Picker Button */}
            <div className="relative">
              <button
                onClick={() => setIsLayoutMenuOpen(!isLayoutMenuOpen)}
                className="h-10 px-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 flex items-center gap-1 text-xs font-bold text-slate-300 transition"
                title="Split Screen Layouts (2-4 apps on one screen)"
              >
                <LayoutGrid className="w-4 h-4 text-teal-400" />
                <span className="hidden xl:inline text-[11px]">Split</span>
              </button>

              {isLayoutMenuOpen && (
                <div className="absolute left-0 bottom-12 w-56 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-2xl text-slate-200 text-xs animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                    Screen Layouts
                  </div>
                  <button
                    onClick={() => {
                      setScreenLayout(activeScreenIndex, 'floating');
                      setIsLayoutMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-300 text-left transition"
                  >
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Floating Windows</span>
                  </button>
                  <button
                    onClick={() => {
                      setScreenLayout(activeScreenIndex, 'split-2-h');
                      setIsLayoutMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-300 text-left transition"
                  >
                    <Columns className="w-4 h-4 text-cyan-400" />
                    <span>Split 2 (Side by Side)</span>
                  </button>
                  <button
                    onClick={() => {
                      setScreenLayout(activeScreenIndex, 'split-2-v');
                      setIsLayoutMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-300 text-left transition"
                  >
                    <Rows className="w-4 h-4 text-cyan-400" />
                    <span>Split 2 (Top & Bottom)</span>
                  </button>
                  <button
                    onClick={() => {
                      setScreenLayout(activeScreenIndex, 'split-3-main-left');
                      setIsLayoutMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-300 text-left transition"
                  >
                    <Grid className="w-4 h-4 text-cyan-400" />
                    <span>Split 3 (Main Left)</span>
                  </button>
                  <button
                    onClick={() => {
                      setScreenLayout(activeScreenIndex, 'split-4-grid');
                      setIsLayoutMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-300 text-left transition"
                  >
                    <LayoutGrid className="w-4 h-4 text-cyan-400" />
                    <span>Split 4 Grid (2x2 Quad)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CENTER: PINNED & RUNNING APPS TASKBAR (WINDOWS STYLE WITH ACTIVE GLOW) */}
          <div className="flex-1 flex items-center justify-center overflow-x-auto scrollbar-none px-2 mx-1 gap-1 max-w-full">
            {displayAppIds.map((appId) => {
              const app = APPS_REGISTRY[appId];
              if (!app) return null;

              const isPinned = isAppPinned(appId);
              const win = screenWindows.find((w) => w.appId === appId);
              const isOpen = !!win;
              const isFocused = win && win.id === activeWindowId && !win.isMinimized;
              const isMinimized = win?.isMinimized;

              return (
                <div key={appId} className="relative group shrink-0">
                  <button
                    id={`taskbar-app-${appId}`}
                    onClick={() => handleAppClick(appId)}
                    onContextMenu={(e) => handleAppContextMenu(e, appId, win?.id)}
                    className={`h-10 px-2.5 sm:px-3 rounded-xl transition-all duration-150 flex items-center gap-2 border ${
                      isFocused
                        ? 'bg-slate-800/90 border-cyan-500/70 shadow-lg shadow-cyan-500/10 text-white'
                        : isOpen
                        ? 'bg-slate-900/80 border-slate-700 hover:bg-slate-800 text-slate-200'
                        : 'bg-transparent border-transparent hover:bg-slate-900/70 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title={`${app.name} ${isPinned ? '(Pinned)' : ''} ${isOpen ? (isMinimized ? '- Minimized' : '- Open') : ''}`}
                  >
                    <div className="shrink-0 group-hover:scale-110 transition-transform">
                      {iconMap[app.icon] || <Sparkles className="w-5 h-5 text-cyan-400" />}
                    </div>

                    {/* App Title (Visible when open or focused on wide screens) */}
                    <span className="hidden lg:inline text-xs font-semibold max-w-[100px] truncate">
                      {app.name}
                    </span>

                    {/* Pin Indicator Icon (Subtle) */}
                    {isPinned && !isOpen && (
                      <span className="hidden xl:inline text-[9px] text-cyan-400/70">
                        <Pin className="w-2.5 h-2.5" />
                      </span>
                    )}

                    {/* Active / Running Indicator Bar under icon */}
                    <div className="absolute bottom-0.5 inset-x-2 flex justify-center">
                      {isOpen && (
                        <div
                          className={`h-0.5 rounded-full transition-all ${
                            isFocused
                              ? 'w-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                              : isMinimized
                              ? 'w-2 bg-slate-500'
                              : 'w-4 bg-cyan-600'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                </div>
              );
            })}

            {/* Manage Pinned Favorites Button */}
            <button
              onClick={() => setIsFavoritesModalOpen(true)}
              className="h-10 px-2 rounded-xl hover:bg-slate-900 text-slate-500 hover:text-cyan-400 transition flex items-center justify-center shrink-0"
              title="Pin & Save Favorites..."
            >
              <Star className="w-4 h-4" />
            </button>
          </div>

          {/* RIGHT: SYSTEM TRAY, SIDE TOOLS & CLOCK */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Taskbar Style Switcher (Windows vs Dock vs Mobile) */}
            <div className="relative">
              <button
                onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
                className="h-10 px-2 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white transition flex items-center gap-1 text-xs"
                title="Taskbar & Dock View Style"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              {isStyleMenuOpen && (
                <div className="absolute right-0 bottom-12 w-56 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 z-50 backdrop-blur-2xl text-slate-200 text-xs animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1.5">
                    Bottom Bar Style
                  </div>
                  <button
                    onClick={() => {
                      setTaskbarStyle('windows');
                      setIsStyleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition ${
                      (taskbarStyle as string) === 'windows'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-cyan-400" />
                      <span>Windows Taskbar</span>
                    </div>
                    {(taskbarStyle as string) === 'windows' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>

                  <button
                    onClick={() => {
                      setTaskbarStyle('dock');
                      setIsStyleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition ${
                      (taskbarStyle as string) === 'dock'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span>Floating Dock (macOS)</span>
                    </div>
                    {(taskbarStyle as string) === 'dock' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>

                  <button
                    onClick={() => {
                      setTaskbarStyle('mobile');
                      setIsStyleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition ${
                      (taskbarStyle as string) === 'mobile'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Mobile Phone Bar</span>
                    </div>
                    {(taskbarStyle as string) === 'mobile' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <div className="border-t border-slate-800 my-1.5" />

                  {/* Top Workspace Header Mode Switcher */}
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Top Workspace Bar
                  </div>
                  <button
                    onClick={() => {
                      setWorkspaceHeaderMode(workspaceHeaderMode === 'button' ? 'bar' : 'button');
                      setIsStyleMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-300 text-left transition"
                  >
                    <span>Mode: {workspaceHeaderMode === 'button' ? 'Menu Button (Clean)' : 'Full Top Bar'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2-Way Voice AI Agent Quick Button */}
            <button
              onClick={toggleVoiceAgent}
              className={`h-10 px-3 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold shadow-md ${
                isVoiceAgentOpen
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-cyan-500/40 animate-pulse'
                  : 'bg-slate-900/90 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white'
              }`}
              title="2-Way Voice Agent & Terminal AI (Speak or Run Commands)"
            >
              <Mic className="w-4 h-4 text-cyan-400" />
              <span className="hidden xl:inline">Voice Agent</span>
            </button>

            {/* Side Tools Drawer Quick Button */}
            <button
              onClick={() => setSideToolsOpen(!isSideToolsOpen)}
              className={`h-10 px-2.5 rounded-xl transition flex items-center gap-1 text-xs font-semibold ${
                isSideToolsOpen
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-cyan-400'
              }`}
              title="Quick Side Tools & Diagnostics"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span className="hidden 2xl:inline">Tools</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-10 px-2 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white transition"
              title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setNotificationsOpen(!isNotificationsOpen)}
              className="relative h-10 px-2.5 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white transition flex items-center"
              title="Notification Center"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-[9px] flex items-center justify-center animate-pulse">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* System Clock / Quick Settings */}
            <button
              onClick={() => setQuickSettingsOpen(!isQuickSettingsOpen)}
              className="h-10 px-2.5 rounded-xl hover:bg-slate-900/90 text-right transition flex flex-col justify-center text-slate-300"
              title="Time & Quick Settings"
            >
              <span className="text-xs font-mono font-bold leading-tight text-white">{timeStr}</span>
              <span className="text-[10px] text-slate-400 leading-tight hidden sm:inline">{dateStr}</span>
            </button>

            {/* Peek at Desktop Divider (Windows Style Corner Slice) */}
            <button
              onClick={() => {
                screenWindows.forEach((w) => minimizeWindow(w.id));
              }}
              className="w-1.5 h-8 bg-slate-800 hover:bg-cyan-500/70 rounded-full transition ml-1"
              title="Show Desktop"
            />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. MOBILE PHONE APP BAR MODE (HIGH TOUCH-TARGET NAV)          */}
      {/* ============================================================ */}
      {taskbarStyle === 'mobile' && (
        <div className="fixed bottom-0 inset-x-0 h-14 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800 z-40 flex items-center justify-around px-3 shadow-2xl select-none">
          {/* Mobile VCA Start Button */}
          <button
            onClick={() => setLauncherOpen(!isLauncherOpen)}
            className="flex flex-col items-center justify-center p-2 rounded-2xl active:scale-95 transition text-cyan-400 hover:text-white"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="text-[9px] font-bold mt-0.5">VCA Start</span>
          </button>

          {/* Mobile Recents / Active Apps */}
          <button
            onClick={() => {
              if (screenWindows.length > 0) {
                const next = screenWindows[0];
                focusWindow(next.id);
              } else {
                openWindow('vca');
              }
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl active:scale-95 transition text-slate-300 hover:text-cyan-400"
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-0.5">Apps ({screenWindows.length})</span>
          </button>

          {/* Mobile Screen Switcher (1-10) */}
          <button
            onClick={() => setIsScreenMenuOpen(!isScreenMenuOpen)}
            className="flex flex-col items-center justify-center p-2 rounded-xl active:scale-95 transition text-cyan-300 hover:text-white"
          >
            <div className="w-6 h-6 rounded-lg bg-slate-900 border border-cyan-500/40 flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
              {activeScreenIndex + 1}
            </div>
            <span className="text-[9px] font-medium mt-0.5">Screen</span>
          </button>

          {/* Mobile Favorites Modal Trigger */}
          <button
            onClick={() => setIsFavoritesModalOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-xl active:scale-95 transition text-amber-400 hover:text-amber-300"
          >
            <Star className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-0.5">Pinned</span>
          </button>

          {/* Mobile Side Tools */}
          <button
            onClick={() => setSideToolsOpen(!isSideToolsOpen)}
            className="flex flex-col items-center justify-center p-2 rounded-xl active:scale-95 transition text-slate-300 hover:text-cyan-400"
          >
            <Wrench className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-0.5">Tools</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MACOS STYLE FLOATING DOCK MODE                            */}
      {/* ============================================================ */}
      {taskbarStyle === 'dock' && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 select-none max-w-[95vw] overflow-x-auto scrollbar-none">
          <div className="flex items-end gap-1.5 p-2 bg-slate-950/80 backdrop-blur-2xl border border-slate-700/70 rounded-3xl shadow-2xl shadow-black/80">
            {/* VCA Start Launcher Icon */}
            <button
              onClick={() => setLauncherOpen(!isLauncherOpen)}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20"
              title="VCA OS Start Menu"
            >
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </button>

            <div className="w-px h-8 bg-slate-800 self-center mx-1" />

            {/* Pinned & Running Apps */}
            {displayAppIds.map((appId) => {
              const app = APPS_REGISTRY[appId];
              if (!app) return null;
              const win = screenWindows.find((w) => w.appId === appId);
              const isOpen = !!win;
              const isFocused = win && win.id === activeWindowId && !win.isMinimized;

              return (
                <button
                  key={appId}
                  onClick={() => handleAppClick(appId)}
                  onContextMenu={(e) => handleAppContextMenu(e, appId, win?.id)}
                  className={`p-2.5 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center hover:scale-125 hover:-translate-y-2 ${
                    isFocused
                      ? 'bg-slate-800/90 border border-cyan-500/60 shadow-lg'
                      : isOpen
                      ? 'bg-slate-900/60 border border-slate-700/60'
                      : 'bg-slate-900/30 hover:bg-slate-800/50'
                  }`}
                  title={app.name}
                >
                  {iconMap[app.icon] || <Sparkles className="w-6 h-6 text-cyan-400" />}
                  {isOpen && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        isFocused ? 'bg-cyan-400 ring-2 ring-cyan-400/40' : 'bg-slate-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}

            <div className="w-px h-8 bg-slate-800 self-center mx-1" />

            {/* Style Switcher */}
            <button
              onClick={() => setTaskbarStyle('windows')}
              className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-white transition text-xs font-semibold"
              title="Switch to Windows Taskbar"
            >
              <Monitor className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONTEXT MENU: PIN / UNPIN / MANAGE APP                       */}
      {/* ============================================================ */}
      {contextMenu && (
        <div
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-52 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2 backdrop-blur-2xl text-slate-200 text-xs animate-in fade-in zoom-in-95"
        >
          {contextMenu.appId && (
            <>
              <div className="px-2.5 py-1 font-bold text-slate-300 truncate border-b border-slate-800 mb-1">
                {APPS_REGISTRY[contextMenu.appId]?.name || 'Application'}
              </div>

              {/* Pin / Unpin Favorite */}
              <button
                onClick={() => {
                  if (contextMenu.appId) {
                    if (isAppPinned(contextMenu.appId)) {
                      unpinApp(contextMenu.appId);
                    } else {
                      pinApp(contextMenu.appId);
                    }
                  }
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 text-left transition"
              >
                {contextMenu.appId && isAppPinned(contextMenu.appId) ? (
                  <>
                    <PinOff className="w-4 h-4 text-rose-400" />
                    <span>Unpin from Taskbar</span>
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4 text-cyan-400" />
                    <span>Pin to Taskbar</span>
                  </>
                )}
              </button>

              {/* Open / Launch */}
              <button
                onClick={() => {
                  if (contextMenu.appId) openWindow(contextMenu.appId);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 text-left transition"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Launch New Window</span>
              </button>

              {/* Close if Window ID exists */}
              {contextMenu.windowId && (
                <button
                  onClick={() => {
                    if (contextMenu.windowId) closeWindow(contextMenu.windowId);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-rose-500/20 text-rose-300 text-left transition mt-1 border-t border-slate-800/80"
                >
                  <X className="w-4 h-4" />
                  <span>Close Window</span>
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* PIN & SAVE FAVORITES MANAGER MODAL                           */}
      {/* ============================================================ */}
      {isFavoritesModalOpen && (
        <div
          onClick={() => setIsFavoritesModalOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pin & Save Favorites</h3>
                  <p className="text-xs text-slate-400">
                    Customize the apps permanently pinned to your bottom taskbar & dock
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFavoritesModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2 pr-1">
              {Object.values(APPS_REGISTRY).map((app) => {
                const isPinned = isAppPinned(app.id);
                return (
                  <div
                    key={app.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                      isPinned
                        ? 'bg-slate-800/80 border-cyan-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        {iconMap[app.icon] || <Sparkles className="w-5 h-5 text-cyan-400" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{app.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                            {app.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{app.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (isPinned) {
                          unpinApp(app.id);
                        } else {
                          pinApp(app.id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isPinned
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-105'
                      }`}
                    >
                      {isPinned ? (
                        <>
                          <PinOff className="w-3.5 h-3.5" />
                          <span>Unpin</span>
                        </>
                      ) : (
                        <>
                          <Pin className="w-3.5 h-3.5" />
                          <span>Pin to Taskbar</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsFavoritesModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/20 transition"
              >
                Done / Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

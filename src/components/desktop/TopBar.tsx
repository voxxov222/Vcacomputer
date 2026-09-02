import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Sparkles,
  Command,
  Bell,
  Sliders,
  Wifi,
  Battery,
  Volume2,
  VolumeX,
  Cpu,
  MonitorPlay,
  Grid,
  Layers,
  ArrowUpToLine,
  ArrowDownToLine,
  Maximize2,
  Minus,
  X,
  Eye,
  Wrench,
  PanelRightOpen,
  LayoutGrid,
  Mic
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    activeWindowId,
    windows,
    screens,
    activeScreenIndex,
    setActiveScreenIndex,
    addScreen,
    setCommandPaletteOpen,
    isLauncherOpen,
    setLauncherOpen,
    isQuickSettingsOpen,
    setQuickSettingsOpen,
    isNotificationsOpen,
    setNotificationsOpen,
    isSideToolsOpen,
    setSideToolsOpen,
    isVoiceAgentOpen,
    setVoiceAgentOpen,
    toggleVoiceAgent,
    isComputerMode,
    setComputerMode,
    notifications,
    systemStatus,
    soundEnabled,
    setSoundEnabled,
    bringToFront,
    sendToBack,
    setWindowOpacity,
    maximizeWindow,
    minimizeWindow,
    closeWindow,
    closeAllWindows,
    tileWindows,
    snapWindow
  } = useOS();

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeWin = windows.find((w) => w.id === activeWindowId);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <header className="fixed top-0 left-0 right-0 h-9 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 text-slate-200 text-xs px-3.5 flex items-center justify-between z-50 select-none shadow-sm">
      {/* Left Menu Items */}
      <div className="flex items-center gap-3.5" ref={menuRef}>
        {/* OS Logo / Launcher Trigger */}
        <button
          id="os-launcher-btn"
          onClick={() => setLauncherOpen(!isLauncherOpen)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors font-semibold ${
            isLauncherOpen ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-slate-800/60 text-white'
          }`}
          title="App Launcher"
        >
          <Grid className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold tracking-tight">AI Work OS</span>
        </button>

        {/* Active Application Name */}
        <span className="hidden sm:inline font-medium text-slate-300 border-l border-slate-800 pl-3">
          {activeWin ? activeWin.title : 'Desktop'}
        </span>

        {/* System menus */}
        <div className="hidden md:flex items-center gap-1 text-slate-400 font-normal text-[11px] relative">
          {/* Screens Dropdown Menu */}
          <button
            onClick={() => setActiveMenu(activeMenu === 'screens' ? null : 'screens')}
            className={`px-2 py-1 rounded hover:text-slate-200 hover:bg-slate-800/60 transition flex items-center gap-1 ${
              activeMenu === 'screens' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Screen {activeScreenIndex + 1}</span>
          </button>

          {activeMenu === 'screens' && (
            <div className="absolute left-0 top-7 w-64 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-2xl text-slate-200 text-xs animate-in fade-in duration-75">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Virtual Screens (Up to 10)</span>
                <span className="text-cyan-400 font-mono">{screens.length}/10</span>
              </div>
              <div className="space-y-1 my-1 max-h-48 overflow-y-auto">
                {screens.map((sc, idx) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setActiveScreenIndex(idx);
                      setActiveMenu(null);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      idx === activeScreenIndex
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{sc.name}</span>
                    <span className="text-[10px] font-mono uppercase text-slate-500">{sc.layout}</span>
                  </button>
                ))}
              </div>

              {screens.length < 10 && (
                <button
                  onClick={() => {
                    addScreen();
                    setActiveMenu(null);
                  }}
                  className="w-full mt-1.5 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>+ Create Screen {screens.length + 1}</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => setActiveMenu(activeMenu === 'window' ? null : 'window')}
            className={`px-2 py-1 rounded hover:text-slate-200 hover:bg-slate-800/60 transition ${
              activeMenu === 'window' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            Window
          </button>

          {/* Window Dropdown Menu */}
          {activeMenu === 'window' && (
            <div className="absolute left-0 top-7 w-56 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-2xl text-slate-200 text-xs animate-in fade-in duration-75">
              {activeWin ? (
                <>
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Active: {activeWin.title}
                  </div>
                  <button
                    onClick={() => {
                      bringToFront(activeWin.id);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded text-left transition"
                  >
                    <ArrowUpToLine className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Bring to Front</span>
                  </button>
                  <button
                    onClick={() => {
                      sendToBack(activeWin.id);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-indigo-500/20 hover:text-indigo-300 rounded text-left transition"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Send to Back</span>
                  </button>

                  <div className="h-px bg-slate-800 my-1" />

                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Opacity</span>
                    <span className="text-cyan-400 font-mono">{Math.round((activeWin.opacity ?? 1) * 100)}%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 px-1 mb-1">
                    {[1.0, 0.85, 0.65, 0.4].map((op) => (
                      <button
                        key={op}
                        onClick={() => {
                          setWindowOpacity(activeWin.id, op);
                          setActiveMenu(null);
                        }}
                        className={`py-1 text-[10px] rounded border transition ${
                          Math.abs((activeWin.opacity ?? 1) - op) < 0.05
                            ? 'bg-cyan-500/30 border-cyan-400/60 text-cyan-200 font-bold'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700/60 text-slate-300'
                        }`}
                      >
                        {Math.round(op * 100)}%
                      </button>
                    ))}
                  </div>

                  <div className="h-px bg-slate-800 my-1" />

                  <button
                    onClick={() => {
                      snapWindow(activeWin.id, 'left');
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded text-left transition"
                  >
                    <span className="font-mono text-[10px]">◧</span>
                    <span>Tile Left Half</span>
                  </button>
                  <button
                    onClick={() => {
                      snapWindow(activeWin.id, 'right');
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded text-left transition"
                  >
                    <span className="font-mono text-[10px]">◨</span>
                    <span>Tile Right Half</span>
                  </button>
                  <button
                    onClick={() => {
                      maximizeWindow(activeWin.id);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded text-left transition"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeWin.isMaximized ? 'Restore Normal Size' : 'Maximize Window'}</span>
                  </button>

                  <div className="h-px bg-slate-800 my-1" />

                  <button
                    onClick={() => {
                      closeWindow(activeWin.id);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-rose-500/20 hover:text-rose-300 rounded text-left text-rose-400 transition font-medium"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close Window</span>
                  </button>
                </>
              ) : (
                <div className="px-2 py-2 text-slate-500 text-xs">No active window selected</div>
              )}

              {windows.length > 0 && (
                <>
                  <div className="h-px bg-slate-800 my-1" />
                  <button
                    onClick={() => {
                      tileWindows();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded text-left transition"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Tile All ({windows.length}) Windows</span>
                  </button>
                  <button
                    onClick={() => {
                      closeAllWindows();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-rose-500/20 text-rose-400 rounded text-left transition text-[11px]"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close All Windows</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center - Global Search / Command Bar */}
      <button
        id="topbar-cmd-palette-btn"
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 px-3 py-1 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 hover:border-cyan-500/40 rounded-md text-slate-400 hover:text-slate-200 transition shadow-inner max-w-xs md:max-w-md w-full justify-between"
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-[11px] truncate">Ask AI or search commands...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Right System Tray & Status */}
      <div className="flex items-center gap-2.5">
        {/* Computer Mode Toggle */}
        <button
          onClick={() => setComputerMode(!isComputerMode)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition ${
            isComputerMode
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Autonomous Computer Mode"
        >
          <MonitorPlay className="w-3 h-3 text-amber-400" />
          <span className="hidden lg:inline">{isComputerMode ? 'Computer Mode ON' : 'Computer Mode'}</span>
        </button>

        {/* Live CPU Meter */}
        <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>{systemStatus.cpu}%</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
          title={soundEnabled ? 'Mute Interface Sound' : 'Enable Interface Sound'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-slate-300" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        {/* Wifi / Battery status */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <Battery className="w-3.5 h-3.5 text-slate-300" />
        </div>

        {/* 2-Way Voice Agent Trigger */}
        <button
          id="topbar-voice-agent-btn"
          onClick={toggleVoiceAgent}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
            isVoiceAgentOpen
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40 animate-pulse'
              : 'hover:bg-cyan-950/60 text-cyan-300 hover:text-white bg-slate-900/80 border border-cyan-500/30'
          }`}
          title="2-Way Voice AI & Terminal Agent"
        >
          <Mic className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Voice Agent</span>
        </button>

        {/* Side Tools & Utilities Drawer */}
        <button
          id="topbar-sidetools-btn"
          onClick={() => setSideToolsOpen(!isSideToolsOpen)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition ${
            isSideToolsOpen
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'hover:bg-slate-800 text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
          title="Side Tools & System Utilities"
        >
          <Wrench className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Side Tools</span>
        </button>

        {/* Notifications Bell */}
        <button
          id="topbar-notifications-btn"
          onClick={() => setNotificationsOpen(!isNotificationsOpen)}
          className={`relative p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition ${
            isNotificationsOpen ? 'bg-slate-800 text-cyan-400' : ''
          }`}
          title="Notifications & Approvals"
        >
          <Bell className="w-3.5 h-3.5" />
          {unreadNotifs > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-cyan-500 rounded-full ring-2 ring-slate-950" />
          )}
        </button>

        {/* Quick Settings Sliders */}
        <button
          id="topbar-quicksettings-btn"
          onClick={() => setQuickSettingsOpen(!isQuickSettingsOpen)}
          className={`p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition ${
            isQuickSettingsOpen ? 'bg-slate-800 text-cyan-400' : ''
          }`}
          title="Control Center & Wallpaper"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Clock & Date */}
        <div className="border-l border-slate-800 pl-2 text-slate-300 font-medium text-[11px] flex items-center gap-1.5">
          <span className="hidden sm:inline text-slate-400">{dateStr}</span>
          <span>{timeStr}</span>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { OSProvider, useOS } from './context/OSContext';
import { AuthProvider } from './context/AuthContext';
import { TopBar } from './components/desktop/TopBar';
import { Taskbar } from './components/desktop/Taskbar';
import { WindowFrame } from './components/desktop/WindowFrame';
import { DesktopIcons } from './components/desktop/DesktopIcons';
import { LauncherMenu } from './components/desktop/LauncherMenu';
import { QuickSettings } from './components/desktop/QuickSettings';
import { NotificationCenter } from './components/desktop/NotificationCenter';
import { CommandPalette } from './components/desktop/CommandPalette';
import { ComputerModeOverlay } from './components/desktop/ComputerModeOverlay';
import { DesktopWidgetsLayer } from './components/desktop/DesktopWidgetsLayer';
import { DesktopContextMenu } from './components/desktop/DesktopContextMenu';
import { WallpaperModal } from './components/desktop/WallpaperModal';
import { MatrixRain } from './components/desktop/MatrixRain';

import { UserPortal } from './components/public/UserPortal';

// Applications
import { VCAApp } from './components/apps/VCAApp';
import { AICommandApp } from './components/apps/AICommandApp';
import { BrowserApp } from './components/apps/BrowserApp';
import { TerminalApp } from './components/apps/TerminalApp';
import { FilesApp } from './components/apps/FilesApp';
import { CodeApp } from './components/apps/CodeApp';
import { DocsApp } from './components/apps/DocsApp';
import { SheetsApp } from './components/apps/SheetsApp';
import { WorkflowsApp } from './components/apps/WorkflowsApp';
import { MemoryApp } from './components/apps/MemoryApp';
import { AppBuilderApp } from './components/apps/AppBuilderApp';
import { TasksApp } from './components/apps/TasksApp';
import { MailApp } from './components/apps/MailApp';
import { SettingsApp } from './components/apps/SettingsApp';
import { ProcessManagerApp } from './components/apps/ProcessManagerApp';
import { GitHubRunnerApp } from './components/apps/GitHubRunnerApp';
import { WidgetStudioApp } from './components/apps/WidgetStudioApp';
import { TechnologyRegistryApp } from './components/engineering/TechnologyRegistryApp';
import { CodingAgentsApp } from './components/apps/CodingAgentsApp';
import { SlidesApp } from './components/apps/SlidesApp';
import { MarketplaceApp } from './components/apps/MarketplaceApp';
import { SecurityApp } from './components/apps/SecurityApp';
import { ActivityApp } from './components/apps/ActivityApp';
import { EmulatorApp } from './components/apps/EmulatorApp';
import { SoftwareInstallerApp } from './components/apps/SoftwareInstallerApp';
import { VoiceAgentApp } from './components/apps/VoiceAgentApp';
import { VoiceAgentOverlay } from './components/desktop/VoiceAgentOverlay';
import { MultiScreenWorkspace } from './components/desktop/MultiScreenWorkspace';
import { SideToolsPanel } from './components/desktop/SideToolsPanel';
import { Wrench } from 'lucide-react';

const DesktopWorkspace: React.FC = () => {
  const {
    windows,
    screens,
    activeScreenIndex,
    wallpaper,
    wallpaperConfig,
    isLauncherOpen,
    isQuickSettingsOpen,
    isNotificationsOpen,
    isSideToolsOpen,
    setSideToolsOpen,
    isCommandPaletteOpen
  } = useOS();

  // Desktop Context Menu State
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Press-and-hold (Long Press) state
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [holdPosition, setHoldPosition] = useState<{ x: number; y: number } | null>(null);
  const holdTimerRef = useRef<any>(null);
  const holdProgressIntervalRef = useRef<any>(null);
  const holdStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    // Only open if clicking on desktop background, desktop icons layer, or widgets container
    const target = e.target as HTMLElement;
    if (target.closest('.window-frame') || target.closest('button') || target.closest('input') || target.closest('textarea')) {
      return;
    }
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    cancelHold();
  };

  // Press and Hold Handlers (Supports touch and mouse click-and-hold)
  const startHold = (clientX: number, clientY: number, target: HTMLElement) => {
    // Don't trigger on window frame contents or interactive inputs
    if (target.closest('.window-frame') || target.closest('button') || target.closest('input') || target.closest('textarea')) {
      return;
    }

    cancelHold();
    holdStartPosRef.current = { x: clientX, y: clientY };
    setHoldPosition({ x: clientX, y: clientY });
    setHoldProgress(0);

    const startTime = Date.now();
    const HOLD_DURATION = 420; // ms

    holdProgressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setHoldProgress(progress);
    }, 20);

    holdTimerRef.current = setTimeout(() => {
      cancelHold();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      setContextMenuPos({ x: clientX, y: clientY });
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdProgressIntervalRef.current) {
      clearInterval(holdProgressIntervalRef.current);
      holdProgressIntervalRef.current = null;
    }
    setHoldPosition(null);
    setHoldProgress(0);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 0 || e.pointerType === 'touch') {
      startHold(e.clientX, e.clientY, e.target as HTMLElement);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (holdPosition) {
      const dist = Math.hypot(e.clientX - holdStartPosRef.current.x, e.clientY - holdStartPosRef.current.y);
      if (dist > 8) {
        cancelHold();
      }
    }
  };

  const handlePointerUp = () => {
    cancelHold();
  };

  // Helper to render the active application inside a window frame
  const renderAppContent = (appId: string, payload?: any) => {
    switch (appId) {
      case 'vca':
        return <VCAApp initialTab={payload?.tab} initialCardId={payload?.cardId} />;
      case 'engineering':
        return <TechnologyRegistryApp initialTab={payload?.tab} targetRepoId={payload?.repoId} />;
      case 'coding_agents':
        return <CodingAgentsApp />;
      case 'process_manager':
        return <ProcessManagerApp />;
      case 'github_runner':
        return <GitHubRunnerApp />;
      case 'widget_studio':
        return <WidgetStudioApp />;
      case 'ai_command':
      case 'command':
        return <AICommandApp />;
      case 'browser':
        return <BrowserApp initialUrl={payload?.url} />;
      case 'terminal':
        return <TerminalApp />;
      case 'files':
        return <FilesApp initialFolder={payload?.folder} />;
      case 'code':
        return <CodeApp fileId={payload?.fileId} />;
      case 'docs':
        return <DocsApp fileId={payload?.fileId} />;
      case 'sheets':
        return <SheetsApp />;
      case 'slides':
        return <SlidesApp />;
      case 'workflows':
        return <WorkflowsApp />;
      case 'memory':
        return <MemoryApp />;
      case 'app_builder':
      case 'appbuilder':
        return <AppBuilderApp />;
      case 'tasks':
        return <TasksApp />;
      case 'mail':
        return <MailApp />;
      case 'settings':
        return <SettingsApp />;
      case 'marketplace':
        return <MarketplaceApp />;
      case 'security':
        return <SecurityApp />;
      case 'activity':
        return <ActivityApp />;
      case 'emulator':
        return <EmulatorApp />;
      case 'voice_agent':
        return <VoiceAgentApp />;
      case 'software_installer':
      case 'installer':
        return <SoftwareInstallerApp />;
      default:
        return <VCAApp />;
    }
  };

  const getPresetBackground = () => {
    const wpId = wallpaperConfig?.id || wallpaper;
    switch (wpId) {
      case 'cyber':
      case 'cyber-dark':
        return 'bg-gradient-to-br from-slate-950 via-cyan-950/40 to-slate-950';
      case 'aurora':
      case 'electric-cyan':
        return 'bg-gradient-to-br from-purple-950/40 via-slate-950 to-cyan-950/30';
      case 'deep-space':
        return 'bg-gradient-to-br from-[#12072b] via-[#080214] to-[#1a0a38]';
      case 'slate-minimal':
      case 'graphite':
      default:
        return 'bg-gradient-to-br from-[#06080e] via-[#090d16] to-[#04060a]';
    }
  };

  const isMatrix = wallpaperConfig?.type === 'matrix';
  const isVideo = wallpaperConfig?.type === 'video' && Boolean(wallpaperConfig.url);
  const isImageOrGif = (wallpaperConfig?.type === 'image' || wallpaperConfig?.type === 'gif') && Boolean(wallpaperConfig.url);

  return (
    <div
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`w-screen h-screen overflow-hidden select-none relative ${getPresetBackground()} text-slate-100 flex flex-col font-sans`}
    >
      {/* 1. DYNAMIC WALLPAPER LAYER */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Live Matrix Rain Canvas */}
        {isMatrix && <MatrixRain />}

        {/* Video Wallpaper */}
        {isVideo && (
          <video
            src={wallpaperConfig.url}
            autoPlay
            loop
            muted
            playsInline
            style={{
              filter: `blur(${wallpaperConfig.blur || 0}px)`,
              objectFit: (wallpaperConfig.fit === 'repeat' ? 'fill' : wallpaperConfig.fit || 'cover') as React.CSSProperties['objectFit']
            }}
            className="w-full h-full object-cover transition-all duration-300"
          />
        )}

        {/* Animated GIF or Still Image Wallpaper */}
        {isImageOrGif && (
          <img
            src={wallpaperConfig.url}
            alt="Desktop Wallpaper"
            style={{
              filter: `blur(${wallpaperConfig.blur || 0}px)`,
              objectFit: (wallpaperConfig.fit === 'repeat' ? 'fill' : wallpaperConfig.fit || 'cover') as React.CSSProperties['objectFit']
            }}
            className="w-full h-full transition-all duration-300"
          />
        )}

        {/* Dark Dim Overlay */}
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300"
          style={{ opacity: (wallpaperConfig?.dim ?? 15) / 100 }}
        />

        {/* Background Fine Tech Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* 2. PRESS & HOLD ANIMATED RIPPLE INDICATOR */}
      {holdPosition && (
        <div
          style={{ left: `${holdPosition.x}px`, top: `${holdPosition.y}px` }}
          className="fixed z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
        >
          <svg className="w-14 h-14 -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="22"
              stroke="rgba(6, 182, 212, 0.2)"
              strokeWidth="3"
              fill="rgba(15, 23, 42, 0.6)"
            />
            <circle
              cx="28"
              cy="28"
              r="22"
              stroke="#06b6d4"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray="138"
              strokeDashoffset={138 - (138 * holdProgress) / 100}
              className="transition-all duration-75 ease-linear"
            />
          </svg>
          <div className="absolute w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>
      )}

      {/* 3. TOP BAR NAVIGATION & STATUS */}
      <TopBar />

      {/* 4. DESKTOP CANVAS */}
      <div className="flex-1 relative overflow-hidden z-10">
        {/* Desktop Icons */}
        <DesktopIcons />

        {/* Dynamic Desktop Live Widgets */}
        <DesktopWidgetsLayer />

        {/* Floating Side Panel Quick Edge Trigger Button */}
        <button
          onClick={() => setSideToolsOpen(!isSideToolsOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-slate-900/90 hover:bg-slate-800 text-cyan-400 hover:text-white p-2 rounded-l-xl border-y border-l border-cyan-500/40 shadow-xl backdrop-blur-md transition group flex flex-col items-center gap-1 cursor-pointer"
          title="Open Side Tools & Utilities"
        >
          <Wrench className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="text-[9px] font-bold uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 py-1 text-slate-300">
            TOOLS
          </span>
        </button>

        {/* Multi-Screen & Split-Screen Workspaces Layer */}
        <MultiScreenWorkspace renderAppContent={renderAppContent} />

        {/* Windows Manager Layer (Floating windows for current active screen) */}
        {windows
          .filter((win) => {
            const winScreen = win.screenIndex ?? 0;
            return winScreen === activeScreenIndex;
          })
          .map((win) => (
            <WindowFrame key={win.id} window={win}>
              {renderAppContent(win.appId, win.payload)}
            </WindowFrame>
          ))}

        {/* Launcher Menu Modal */}
        {isLauncherOpen && <LauncherMenu />}

        {/* Quick Settings Drawer */}
        {isQuickSettingsOpen && <QuickSettings />}

        {/* Notification Center */}
        {isNotificationsOpen && <NotificationCenter />}

        {/* OS Side Tools & Utilities Drawer */}
        {isSideToolsOpen && <SideToolsPanel />}

        {/* Global Command Palette (Cmd + K) */}
        {isCommandPaletteOpen && <CommandPalette />}

        {/* Autonomous Computer Mode AI Cursor Overlay */}
        <ComputerModeOverlay />

        {/* Desktop Context Menu */}
        {contextMenuPos && (
          <DesktopContextMenu
            x={contextMenuPos.x}
            y={contextMenuPos.y}
            onClose={() => setContextMenuPos(null)}
          />
        )}

        {/* 2-Way Voice Agent & Autonomous Terminal HUD */}
        <VoiceAgentOverlay />

        {/* Wallpaper Customizer Modal */}
        <WallpaperModal />
      </div>

      {/* 5. MODERN OS TASKBAR (WINDOWS STYLE / DOCK / MOBILE TOUCH) */}
      <Taskbar />
    </div>
  );
};

export default function App() {
  const [viewMode, setViewMode] = useState<'admin' | 'user'>('user');

  return (
    <AuthProvider>
      {viewMode === 'admin' ? (
        <OSProvider>
          <DesktopWorkspace />
        </OSProvider>
      ) : (
        <UserPortal />
      )}
      
      {/* Universal Mode Switcher */}
      <button 
        onClick={() => setViewMode(prev => prev === 'admin' ? 'user' : 'admin')}
        className="fixed bottom-6 right-6 z-[99999] bg-slate-900/90 backdrop-blur border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xl transition flex items-center gap-2 group"
      >
        <div className={`w-2 h-2 rounded-full ${viewMode === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'} group-hover:animate-pulse`} />
        Switch to {viewMode === 'admin' ? 'User Portal' : 'Admin OS'}
      </button>
    </AuthProvider>
  );
}


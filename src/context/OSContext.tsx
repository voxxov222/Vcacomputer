import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppId,
  OSWindow,
  VirtualFile,
  AgentTask,
  AgentProfile,
  AIMemoryItem,
  KnowledgeDoc,
  WorkflowItem,
  EmailItem,
  CalendarEvent,
  KanbanTask,
  ActivityEvent,
  SystemNotification,
  VcaCardRecord,
  WallpaperConfig,
  ScreenLayout,
  VirtualScreen,
  TaskbarStyle,
  WorkspaceHeaderMode
} from '../types/os';
import { DynamicWidgetConfig } from '../types/runtime';
import { APPS_REGISTRY } from '../lib/appsRegistry';
import { initialVirtualFiles } from '../lib/defaultFiles';
import {
  initialAgents,
  initialMemories,
  initialKnowledge,
  initialWorkflows,
  initialEmails,
  initialCalendarEvents,
  initialKanbanTasks,
  initialRecentTasks,
  initialVcaCards
} from '../lib/defaultData';
import { playSound } from '../lib/sound';

interface OSContextType {
  // Window Management
  windows: OSWindow[];
  activeWindowId: string | null;
  openWindow: (appId: AppId, initialData?: any) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  setWindowOpacity: (id: string, opacity: number) => void;
  updateWindowBounds: (id: string, bounds: { x: number; y: number; width: number; height: number; isMaximized?: boolean }) => void;
  snapWindow: (id: string, quadrant: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'maximize') => void;
  centerWindow: (id: string) => void;
  moveWindowBy: (id: string, dx: number, dy: number) => void;

  // Multi-Screen & Split-Screen Workspaces (Up to 10 Pages)
  screens: VirtualScreen[];
  activeScreenIndex: number;
  setActiveScreenIndex: (index: number) => void;
  addScreen: (name?: string) => void;
  removeScreen: (index: number) => void;
  setScreenLayout: (screenIndex: number, layout: ScreenLayout) => void;
  setSplitApp: (screenIndex: number, slotIndex: number, appId: AppId | null) => void;
  renameScreen: (screenIndex: number, name: string) => void;
  moveWindowToScreen: (windowId: string, targetScreenIndex: number) => void;
  isMultiScreenOverviewOpen: boolean;
  setMultiScreenOverviewOpen: (open: boolean) => void;

  // OS Menus & Overlays
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isLauncherOpen: boolean;
  setLauncherOpen: (open: boolean) => void;
  isQuickSettingsOpen: boolean;
  setQuickSettingsOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  isSideToolsOpen: boolean;
  setSideToolsOpen: (open: boolean) => void;
  closeAllWindows: () => void;
  minimizeAllWindows: () => void;
  tileWindows: () => void;

  // Computer Mode (Autonomous Cursor & Action Simulation)
  isComputerMode: boolean;
  setComputerMode: (active: boolean) => void;
  computerModeLog: string[];
  simulatedCursor: { x: number; y: number; isClicking: boolean; targetApp?: string };

  // Data Stores
  files: VirtualFile[];
  createFile: (file: Omit<VirtualFile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFile: (id: string, contentOrUpdates: string | Partial<VirtualFile>) => void;
  deleteFile: (id: string) => void;

  agents: AgentProfile[];
  tasks: AgentTask[];
  activeTask: AgentTask | null;
  executeGoal: (goal: string) => Promise<void>;
  createTask?: (titleOrGoal: string, agent?: string, source?: string) => Promise<string> | string;
  executeAICommand?: (cmd: string) => Promise<string>;
  updateTask?: (id: string, updates: Partial<AgentTask>) => void;
  approveTaskAction: (taskId: string) => void;

  memories: AIMemoryItem[];
  addMemory: (category: any, content: string) => void;
  deleteMemory: (id: string) => void;

  knowledgeDocs: KnowledgeDoc[];
  addKnowledgeDoc: (doc: Omit<KnowledgeDoc, 'id' | 'updatedAt'>) => void;

  workflows: WorkflowItem[];
  runWorkflow: (id: string) => void;
  toggleWorkflow: (id: string) => void;

  emails: EmailItem[];
  sendEmail: (email: Omit<EmailItem, 'id' | 'date'>) => void;
  markEmailRead: (id: string) => void;
  customers?: any[];

  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;

  kanbanTasks: KanbanTask[];
  addKanbanTask: (task: Omit<KanbanTask, 'id'>) => void;
  updateKanbanTaskStatus: (id: string, status: KanbanTask['status']) => void;

  vcaCards: VcaCardRecord[];
  vcaSubmissions?: any[];
  addVcaCard: (card: VcaCardRecord) => void;
  updateVcaCard: (id: string, updates: Partial<VcaCardRecord>) => void;
  addVCACard?: (card: any) => void;
  updateVCACard?: (id: string, updates: any) => void;

  activities: ActivityEvent[];
  logActivity: (action: string, target?: string, extraParams?: Partial<ActivityEvent>) => void;
  updateActivity?: (id: string, updates: Partial<ActivityEvent>) => void;
  notifications: SystemNotification[];
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  clearAllNotifications: () => void;
  markNotificationRead: (id: string) => void;
  approveTask: (taskId: string) => void;
  rejectTask: (taskId: string) => void;

  // Dynamic Widgets
  widgets: DynamicWidgetConfig[];
  addWidget: (widget: DynamicWidgetConfig) => void;
  deleteWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<DynamicWidgetConfig>) => void;

  // 2-Way Voice Agent & Autonomous Shell
  isVoiceAgentOpen: boolean;
  setVoiceAgentOpen: (open: boolean) => void;
  toggleVoiceAgent: () => void;

  // Taskbar & Pinned Favorites
  taskbarStyle: TaskbarStyle;
  setTaskbarStyle: (style: TaskbarStyle) => void;
  pinnedApps: AppId[];
  pinApp: (appId: AppId) => void;
  unpinApp: (appId: AppId) => void;
  togglePinApp: (appId: AppId) => void;
  isAppPinned: (appId: AppId) => boolean;

  // Workspace Header / Button Mode
  workspaceHeaderMode: WorkspaceHeaderMode;
  setWorkspaceHeaderMode: (mode: WorkspaceHeaderMode) => void;
  isWorkspaceMenuOpen: boolean;
  setWorkspaceMenuOpen: (open: boolean) => void;

  // Settings & Wallpaper
  wallpaper: string;
  setWallpaper: (wp: string) => void;
  wallpaperConfig: WallpaperConfig;
  setWallpaperConfig: (config: WallpaperConfig) => void;
  isWallpaperModalOpen: boolean;
  setWallpaperModalOpen: (open: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  systemStatus: {
    cpu: number;
    memory: number;
    disk: number;
    agentsActive: number;
    isOnline: boolean;
    processes: number;
    portsActive: number;
    networkStatus: string;
  };
}

const OSContext = createContext<OSContextType | null>(null);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Windows state
  const [windows, setWindows] = useState<OSWindow[]>([
    {
      id: 'win-command',
      appId: 'command',
      title: 'AI Command Center',
      icon: 'Sparkles',
      x: 80,
      y: 60,
      width: 920,
      height: 620,
      zIndex: 10,
      opacity: 1,
      isMinimized: false,
      isMaximized: false,
      isFocused: true
    }
  ]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>('win-command');
  const [topZ, setTopZ] = useState(10);

  // Sound & System state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Menus
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isLauncherOpen, setLauncherOpen] = useState(false);
  const [isQuickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isSideToolsOpen, setSideToolsOpen] = useState(false);
  const [isMultiScreenOverviewOpen, setMultiScreenOverviewOpen] = useState(false);
  const [isVoiceAgentOpen, setVoiceAgentOpen] = useState(false);

  const toggleVoiceAgent = useCallback(() => {
    setVoiceAgentOpen((prev) => !prev);
  }, []);

  // Multi-Screen Workspaces (Up to 10 Pages)
  const [screens, setScreens] = useState<VirtualScreen[]>([
    {
      id: 'screen-1',
      name: 'Main Lab',
      layout: 'floating',
      splitApps: ['command', 'vca']
    },
    {
      id: 'screen-2',
      name: 'Android S26 Emulation',
      layout: 'split-2-h',
      splitApps: ['emulator', 'terminal']
    },
    {
      id: 'screen-3',
      name: 'Card Forensic Matrix',
      layout: 'split-4-grid',
      splitApps: ['vca', 'engineering', 'files', 'activity']
    },
    {
      id: 'screen-4',
      name: 'Software & Dev',
      layout: 'split-2-h',
      splitApps: ['software_installer', 'code']
    }
  ]);
  const [activeScreenIndex, setActiveScreenIndexState] = useState<number>(0);

  const setActiveScreenIndex = useCallback((index: number) => {
    setActiveScreenIndexState(index);
    if (soundEnabled) playSound('click');
  }, [soundEnabled]);

  const addScreen = useCallback((name?: string) => {
    setScreens((prev) => {
      if (prev.length >= 10) return prev;
      const nextNum = prev.length + 1;
      const newScreen: VirtualScreen = {
        id: `screen-${Date.now()}`,
        name: name || `Screen ${nextNum}`,
        layout: 'floating',
        splitApps: ['command', 'emulator']
      };
      return [...prev, newScreen];
    });
    if (soundEnabled) playSound('open');
  }, [soundEnabled]);

  const removeScreen = useCallback((index: number) => {
    setScreens((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setActiveScreenIndexState((curr) => {
      if (curr >= index && curr > 0) return curr - 1;
      return curr;
    });
    if (soundEnabled) playSound('close');
  }, [soundEnabled]);

  const setScreenLayout = useCallback((screenIndex: number, layout: ScreenLayout) => {
    setScreens((prev) =>
      prev.map((s, idx) => (idx === screenIndex ? { ...s, layout } : s))
    );
    if (soundEnabled) playSound('click');
  }, [soundEnabled]);

  const setSplitApp = useCallback((screenIndex: number, slotIndex: number, appId: AppId | null) => {
    setScreens((prev) =>
      prev.map((s, idx) => {
        if (idx !== screenIndex) return s;
        const newSplitApps = [...s.splitApps];
        newSplitApps[slotIndex] = appId;
        return { ...s, splitApps: newSplitApps };
      })
    );
    if (soundEnabled) playSound('click');
  }, [soundEnabled]);

  const renameScreen = useCallback((screenIndex: number, name: string) => {
    setScreens((prev) =>
      prev.map((s, idx) => (idx === screenIndex ? { ...s, name } : s))
    );
  }, []);

  const moveWindowToScreen = useCallback((windowId: string, targetScreenIndex: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, screenIndex: targetScreenIndex } : w))
    );
    if (soundEnabled) playSound('open');
  }, [soundEnabled]);

  // Computer mode
  const [isComputerMode, setComputerMode] = useState(false);
  const [computerModeLog, setComputerModeLog] = useState<string[]>([
    'Computer Mode standby: Agents have access to browser, files, terminal, and code editor.'
  ]);
  const [simulatedCursor, setSimulatedCursor] = useState<{ x: number; y: number; isClicking: boolean; targetApp?: string }>({
    x: 450,
    y: 320,
    isClicking: false
  });

  // Persistent collections
  const [files, setFiles] = useState<VirtualFile[]>(() => {
    const saved = localStorage.getItem('ai_os_files');
    return saved ? JSON.parse(saved) : initialVirtualFiles;
  });

  const [agents] = useState<AgentProfile[]>(initialAgents);
  const [tasks, setTasks] = useState<AgentTask[]>(() => {
    const saved = localStorage.getItem('ai_os_tasks');
    return saved ? JSON.parse(saved) : initialRecentTasks;
  });
  const [activeTask, setActiveTask] = useState<AgentTask | null>(tasks[0] || null);

  const [memories, setMemories] = useState<AIMemoryItem[]>(() => {
    const saved = localStorage.getItem('ai_os_memories');
    return saved ? JSON.parse(saved) : initialMemories;
  });

  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>(initialKnowledge);
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(initialWorkflows);
  const [emails, setEmails] = useState<EmailItem[]>(initialEmails);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>(initialKanbanTasks);
  const [vcaCards, setVcaCards] = useState<VcaCardRecord[]>(initialVcaCards);

  const [activities, setActivities] = useState<ActivityEvent[]>([
    {
      id: 'act-1',
      timestamp: '14:28:10',
      agent: 'System Kernel',
      action: 'BOOT_DESKTOP',
      target: 'AI Work OS v4.2',
      status: 'success',
      details: 'Initialized window compositor, dock, and multi-agent service bus.'
    }
  ]);

  // Taskbar style and Pinned Favorites
  const [taskbarStyle, setTaskbarStyleState] = useState<TaskbarStyle>(() => {
    const saved = localStorage.getItem('vca_taskbar_style');
    return (saved as TaskbarStyle) || 'windows';
  });

  const setTaskbarStyle = (style: TaskbarStyle) => {
    setTaskbarStyleState(style);
    localStorage.setItem('vca_taskbar_style', style);
  };

  const DEFAULT_PINNED: AppId[] = [
    'vca',
    'command',
    'coding_agents',
    'emulator',
    'software_installer',
    'files',
    'terminal',
    'code',
    'browser',
    'settings'
  ];

  const [pinnedApps, setPinnedApps] = useState<AppId[]>(() => {
    const saved = localStorage.getItem('vca_pinned_apps');
    return saved ? JSON.parse(saved) : DEFAULT_PINNED;
  });

  const pinApp = (appId: AppId) => {
    setPinnedApps((prev) => {
      if (prev.includes(appId)) return prev;
      const next = [...prev, appId];
      localStorage.setItem('vca_pinned_apps', JSON.stringify(next));
      return next;
    });
  };

  const unpinApp = (appId: AppId) => {
    setPinnedApps((prev) => {
      const next = prev.filter((id) => id !== appId);
      localStorage.setItem('vca_pinned_apps', JSON.stringify(next));
      return next;
    });
  };

  const togglePinApp = (appId: AppId) => {
    if (pinnedApps.includes(appId)) {
      unpinApp(appId);
    } else {
      pinApp(appId);
    }
  };

  const isAppPinned = (appId: AppId) => pinnedApps.includes(appId);

  // Workspace header mode (button vs bar)
  const [workspaceHeaderMode, setWorkspaceHeaderModeState] = useState<WorkspaceHeaderMode>(() => {
    const saved = localStorage.getItem('vca_workspace_header_mode');
    return (saved as WorkspaceHeaderMode) || 'button';
  });

  const setWorkspaceHeaderMode = (mode: WorkspaceHeaderMode) => {
    setWorkspaceHeaderModeState(mode);
    localStorage.setItem('vca_workspace_header_mode', mode);
  };

  const [isWorkspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      title: 'Real Computing Daemon Online',
      message: 'Host execution runtime active. Real process supervisor, filesystem, and Git runners ready.',
      type: 'success',
      timestamp: 'Just now',
      read: false
    }
  ]);

  // Dynamic Widgets State
  const [widgets, setWidgets] = useState<DynamicWidgetConfig[]>([
    {
      id: 'w-sys-mon',
      title: 'Host Hardware Monitor',
      type: 'system_monitor',
      size: 'medium',
      position: { x: 24, y: 24 },
      refreshIntervalMs: 2000,
      isPinned: true,
      isLocked: false,
      theme: 'cyber',
      props: { showGraph: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'w-proc-mon',
      title: 'Active Ports & Daemons',
      type: 'port_monitor',
      size: 'medium',
      position: { x: 380, y: 24 },
      refreshIntervalMs: 3500,
      isPinned: true,
      isLocked: false,
      theme: 'dark',
      props: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const addWidget = (widget: DynamicWidgetConfig) => {
    setWidgets((prev) => [...prev, widget]);
    if (soundEnabled) playSound('click');
  };

  const deleteWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWidget = (id: string, updates: Partial<DynamicWidgetConfig>) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w)));
  };

  const logActivity = (action: string, target?: string, extraParams?: Partial<ActivityEvent>) => {
    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agent: extraParams?.agent || 'Operator',
      action: action as any,
      target: target || 'Host System',
      status: extraParams?.status || 'success',
      details: extraParams?.details || `Action performed at ${new Date().toISOString()}`,
      toolUsed: extraParams?.toolUsed,
      result: extraParams?.result,
      duration: extraParams?.duration
    };
    setActivities((prev) => [newEvent, ...prev]);
  };

  const updateActivity = (id: string, updates: Partial<ActivityEvent>) => {
    setActivities((prev) => prev.map((act) => act.id === id ? { ...act, ...updates } : act));
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'timestamp'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Settings & Wallpaper
  const [wallpaper, setWallpaper] = useState<string>('graphite-aurora');
  const [wallpaperConfig, setWallpaperConfigState] = useState<WallpaperConfig>(() => {
    try {
      const saved = localStorage.getItem('ai_os_wallpaper_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      type: 'preset',
      id: 'graphite-aurora',
      name: 'Graphite Aurora (Default)',
      blur: 0,
      dim: 15,
      fit: 'cover'
    };
  });
  const [isWallpaperModalOpen, setWallpaperModalOpen] = useState<boolean>(false);

  const setWallpaperConfig = (config: WallpaperConfig) => {
    setWallpaperConfigState(config);
    if (config.id) {
      setWallpaper(config.id);
    }
    try {
      localStorage.setItem('ai_os_wallpaper_config', JSON.stringify(config));
    } catch {}
  };

  const [systemStatus, setSystemStatus] = useState({
    cpu: 14,
    memory: 42,
    disk: 1420,
    agentsActive: 2,
    isOnline: true,
    processes: 19,
    portsActive: 3,
    networkStatus: 'Connected (1 Gbps)'
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ai_os_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('ai_os_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ai_os_memories', JSON.stringify(memories));
  }, [memories]);

  // Telemetry fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemStatus((prev) => ({
        ...prev,
        cpu: Math.floor(10 + Math.random() * 22),
        memory: Math.floor(38 + Math.random() * 8),
        disk: Math.floor(1420 + Math.random() * 15),
        processes: 18 + (Math.random() > 0.5 ? 1 : 0)
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K for global command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        if (soundEnabled) playSound('command');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [soundEnabled]);

  // Window operations
  const openWindow = useCallback(
    (appId: AppId, initialData?: any) => {
      const app = APPS_REGISTRY[appId];
      if (!app) return;

      if (soundEnabled) playSound('open');

      setWindows((prev) => {
        const existing = prev.find((w) => w.appId === appId);
        if (existing) {
          const nextZ = topZ + 1;
          setTopZ(nextZ);
          setActiveWindowId(existing.id);
          return prev.map((w) =>
            w.id === existing.id
              ? { ...w, isMinimized: false, isFocused: true, zIndex: nextZ, initialData: initialData || w.initialData }
              : { ...w, isFocused: false }
          );
        }

        const newZ = topZ + 1;
        setTopZ(newZ);
        const winId = `win-${appId}-${Date.now()}`;
        setActiveWindowId(winId);

        // Cascade positioning
        const offset = (prev.length % 6) * 28;
        const width = Math.min(app.defaultWidth, window.innerWidth - 60);
        const height = Math.min(app.defaultHeight, window.innerHeight - 120);

        const newWin: OSWindow = {
          id: winId,
          appId,
          title: app.name,
          icon: app.icon,
          x: Math.max(20, 80 + offset),
          y: Math.max(40, 50 + offset),
          width,
          height,
          zIndex: newZ,
          opacity: 1,
          isMinimized: false,
          isMaximized: false,
          isFocused: true,
          initialData,
          screenIndex: activeScreenIndex
        };

        return [...prev.map((w) => ({ ...w, isFocused: false })), newWin];
      });
    },
    [topZ, soundEnabled, activeScreenIndex]
  );

  const closeWindow = useCallback(
    (id: string) => {
      if (soundEnabled) playSound('close');
      setWindows((prev) => {
        const filtered = prev.filter((w) => w.id !== id);
        return filtered;
      });
      setActiveWindowId((currentActive) => {
        if (currentActive === id) {
          setWindows((current) => {
            const nextTop = [...current].sort((a, b) => b.zIndex - a.zIndex)[0];
            return current.map((w) =>
              nextTop && w.id === nextTop.id ? { ...w, isFocused: true } : w
            );
          });
          return null;
        }
        return currentActive;
      });
    },
    [soundEnabled]
  );

  const closeAllWindows = useCallback(() => {
    if (soundEnabled) playSound('close');
    setWindows([]);
    setActiveWindowId(null);
  }, [soundEnabled]);

  const minimizeAllWindows = useCallback(() => {
    setWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true, isFocused: false })));
    setActiveWindowId(null);
  }, []);

  const tileWindows = useCallback(() => {
    setWindows((prev) => {
      if (prev.length === 0) return prev;
      const count = prev.length;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight - 110;
      const startY = 38;

      if (count === 1) {
        return prev.map((w) => ({
          ...w,
          isMinimized: false,
          isMaximized: false,
          x: 40,
          y: startY + 20,
          width: screenW - 80,
          height: screenH - 40
        }));
      }

      const cols = count <= 2 ? count : Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      const colWidth = Math.floor(screenW / cols);
      const rowHeight = Math.floor(screenH / rows);

      return prev.map((w, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        return {
          ...w,
          isMinimized: false,
          isMaximized: false,
          x: c * colWidth + 10,
          y: startY + r * rowHeight + 10,
          width: colWidth - 20,
          height: rowHeight - 20
        };
      });
    });
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true, isFocused: false } : w)));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          if (w.isMaximized) {
            const pb = w.prevBounds || { x: 80, y: 60, width: 800, height: 500 };
            return { ...w, isMaximized: false, ...pb };
          } else {
            return {
              ...w,
              isMaximized: true,
              prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
              x: 0,
              y: 36,
              width: window.innerWidth,
              height: window.innerHeight - 100
            };
          }
        }
        return w;
      })
    );
  }, []);

  const focusWindow = useCallback(
    (id: string) => {
      const nextZ = topZ + 1;
      setTopZ(nextZ);
      setActiveWindowId(id);
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ, isFocused: true, isMinimized: false } : { ...w, isFocused: false }))
      );
    },
    [topZ]
  );

  const bringToFront = useCallback(
    (id: string) => {
      setWindows((prev) => {
        const maxZ = Math.max(...prev.map((w) => w.zIndex), 10);
        const nextZ = maxZ + 1;
        setTopZ(nextZ);
        setActiveWindowId(id);
        return prev.map((w) =>
          w.id === id
            ? { ...w, zIndex: nextZ, isFocused: true, isMinimized: false }
            : { ...w, isFocused: false }
        );
      });
    },
    []
  );

  const sendToBack = useCallback(
    (id: string) => {
      setWindows((prev) => {
        const target = prev.find((w) => w.id === id);
        if (!target) return prev;
        
        // Sort other active windows by zIndex
        const others = prev.filter((w) => w.id !== id).sort((a, b) => a.zIndex - b.zIndex);
        const reindexed = others.map((w, index) => ({
          ...w,
          zIndex: index + 2,
          isFocused: false
        }));

        // Top-most other window becomes focused
        const topOther = reindexed[reindexed.length - 1];
        if (topOther) {
          topOther.isFocused = true;
          setActiveWindowId(topOther.id);
        } else {
          setActiveWindowId(id);
        }

        setTopZ(reindexed.length + 5);

        return [{ ...target, zIndex: 1, isFocused: !topOther }, ...reindexed];
      });
    },
    []
  );

  const bringForward = useCallback((id: string) => {
    setWindows((prev) => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex((w) => w.id === id);
      if (idx === -1 || idx === sorted.length - 1) return prev;
      
      const currentWin = sorted[idx];
      const aboveWin = sorted[idx + 1];
      const newZ = aboveWin.zIndex + 1;
      
      setTopZ((z) => Math.max(z, newZ + 1));
      setActiveWindowId(id);
      return prev.map((w) => {
        if (w.id === id) return { ...w, zIndex: newZ, isFocused: true };
        return { ...w, isFocused: false };
      });
    });
  }, []);

  const sendBackward = useCallback((id: string) => {
    setWindows((prev) => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex((w) => w.id === id);
      if (idx <= 0) return prev;
      
      const belowWin = sorted[idx - 1];
      const newZ = Math.max(1, belowWin.zIndex - 1);
      
      return prev.map((w) => {
        if (w.id === id) return { ...w, zIndex: newZ };
        return w;
      });
    });
  }, []);

  const setWindowOpacity = useCallback((id: string, opacity: number) => {
    const clamped = Math.min(1, Math.max(0.15, Number(opacity.toFixed(2))));
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, opacity: clamped } : w)));
  }, []);

  const updateWindowBounds = useCallback((id: string, bounds: { x: number; y: number; width: number; height: number; isMaximized?: boolean }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...bounds, isMaximized: bounds.isMaximized ?? false } : w)));
  }, []);

  const snapWindow = useCallback((id: string, quadrant: string) => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight - 100;
    const topY = 36;

    let target = { x: 0, y: topY, width: screenW, height: screenH };
    if (quadrant === 'left') {
      target = { x: 0, y: topY, width: screenW / 2, height: screenH };
    } else if (quadrant === 'right') {
      target = { x: screenW / 2, y: topY, width: screenW / 2, height: screenH };
    } else if (quadrant === 'top-left') {
      target = { x: 0, y: topY, width: screenW / 2, height: screenH / 2 };
    } else if (quadrant === 'top-right') {
      target = { x: screenW / 2, y: topY, width: screenW / 2, height: screenH / 2 };
    } else if (quadrant === 'bottom-left') {
      target = { x: 0, y: topY + screenH / 2, width: screenW / 2, height: screenH / 2 };
    } else if (quadrant === 'bottom-right') {
      target = { x: screenW / 2, y: topY + screenH / 2, width: screenW / 2, height: screenH / 2 };
    }

    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...target, isMaximized: quadrant === 'maximize' } : w)));
  }, []);

  const centerWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const screenW = window.innerWidth;
          const screenH = window.innerHeight;
          const targetX = Math.max(20, Math.floor((screenW - w.width) / 2));
          const targetY = Math.max(40, Math.floor((screenH - w.height) / 2));
          return { ...w, x: targetX, y: targetY, isMaximized: false, isMinimized: false };
        }
        return w;
      })
    );
  }, []);

  const moveWindowBy = useCallback((id: string, dx: number, dy: number) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const screenW = window.innerWidth;
          const screenH = window.innerHeight;
          const newX = Math.max(-w.width + 80, Math.min(screenW - 80, w.x + dx));
          const newY = Math.max(34, Math.min(screenH - 50, w.y + dy));
          return { ...w, x: newX, y: newY, isMaximized: false, isMinimized: false };
        }
        return w;
      })
    );
  }, []);

  // Filesystem CRUD
  const createFile = useCallback((fileData: Omit<VirtualFile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFile: VirtualFile = {
      ...fileData,
      id: `f-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setFiles((prev) => [newFile, ...prev]);
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Filesystem',
        action: 'CREATE_FILE',
        target: newFile.path,
        status: 'success',
        details: `${newFile.name} (${newFile.type})`
      },
      ...prev
    ]);
  }, []);

  const updateFile = useCallback((id: string, contentOrUpdates: string | Partial<VirtualFile>) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        if (typeof contentOrUpdates === 'string') {
          return { ...f, content: contentOrUpdates, size: contentOrUpdates.length, updatedAt: new Date().toISOString() };
        }
        return {
          ...f,
          ...contentOrUpdates,
          size: contentOrUpdates.content !== undefined ? contentOrUpdates.content.length : f.size,
          updatedAt: new Date().toISOString()
        };
      })
    );
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Agent Goal Execution
  const executeGoal = async (goal: string) => {
    if (!goal.trim()) return;

    if (soundEnabled) playSound('click');

    const taskId = `task-${Date.now()}`;
    const newTask: AgentTask = {
      id: taskId,
      objective: goal,
      primaryAgent: 'Command Orchestrator',
      status: 'running',
      progress: 15,
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: 'step-1',
          title: 'Analyze user intent & decompose task requirements',
          agent: 'Command Orchestrator',
          status: 'running',
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    };

    setTasks((prev) => [newTask, ...prev]);
    setActiveTask(newTask);

    // If computer mode is active, simulate cursor moving to apps
    if (isComputerMode) {
      setComputerModeLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Orchestrator launching objective: "${goal}"`,
        ...prev
      ]);
      setSimulatedCursor({ x: 320, y: 180, isClicking: true, targetApp: 'AI Command Center' });
    }

    try {
      const resp = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: goal })
      });

      const data = await resp.json();
      const plan = data.plan || {};

      const completedSteps = (plan.steps || []).map((s: any, idx: number) => ({
        id: s.id || `s-${idx}`,
        title: s.title || `Execute subtask ${idx + 1}`,
        agent: s.agent || 'Deep Research Agent',
        tool: s.tool,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString(),
        output: s.output
      }));

      const finalTask: AgentTask = {
        ...newTask,
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString(),
        primaryAgent: plan.primaryAgent || 'Command Orchestrator',
        resultSummary: plan.summary || `Autonomous execution completed for: ${goal}`,
        steps: completedSteps.length > 0 ? completedSteps : newTask.steps.map((s) => ({ ...s, status: 'completed' }))
      };

      setTasks((prev) => prev.map((t) => (t.id === taskId ? finalTask : t)));
      setActiveTask(finalTask);

      // Create new file if artifacts were generated
      if (plan.artifacts && plan.artifacts.length > 0) {
        for (const art of plan.artifacts) {
          createFile({
            name: art.name || `Artifact_${Date.now()}.md`,
            path: `/Workspace/Documents/${art.name || `Artifact_${Date.now()}.md`}`,
            type: (art.type as any) || 'document',
            content: art.content || '# Generated by AI Work OS\n',
            size: (art.content || '').length
          });
        }
      }

      if (soundEnabled) playSound('success');

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Agent Task Completed',
          message: plan.summary?.slice(0, 100) || `Goal achieved: ${goal.slice(0, 50)}...`,
          type: 'success',
          timestamp: 'Just now',
          read: false
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error('Goal execution error:', err);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'failed',
                resultSummary: `Execution error: ${err.message || 'Network error'}`
              }
            : t
        )
      );
    }
  };

  const approveTaskAction = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'completed', requiresApprovalFor: undefined } : t))
    );
    if (soundEnabled) playSound('success');
  };

  const updateTask = (id: string, updates: Partial<AgentTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const createTask = (titleOrGoal: string, agent = 'Command Orchestrator') => {
    const id = `task-${Date.now()}`;
    const newTask: AgentTask = {
      id,
      objective: titleOrGoal,
      title: titleOrGoal,
      primaryAgent: agent,
      status: 'queued',
      progress: 0,
      steps: [],
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
    return id;
  };

  const executeAICommand = async (cmd: string) => {
    await executeGoal(cmd);
    return `task-${Date.now()}`;
  };

  // Memory operations
  const addMemory = (category: AIMemoryItem['category'], content: string) => {
    const item: AIMemoryItem = {
      id: `mem-${Date.now()}`,
      category,
      content,
      confidence: 0.99,
      source: 'User Instruction',
      createdAt: new Date().toISOString()
    };
    setMemories((prev) => [item, ...prev]);
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const addKnowledgeDoc = (docData: Omit<KnowledgeDoc, 'id' | 'updatedAt'>) => {
    const newDoc: KnowledgeDoc = {
      ...docData,
      id: `kb-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    setKnowledgeDocs((prev) => [newDoc, ...prev]);
  };

  const runWorkflow = (id: string) => {
    const targetWf = workflows.find((w) => w.id === id);
    if (!targetWf) return;

    if (soundEnabled) playSound('click');
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, lastRunStatus: 'running', lastRunAt: new Date().toISOString() } : w))
    );

    setTimeout(() => {
      setWorkflows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, lastRunStatus: 'success', lastRunAt: new Date().toISOString() } : w))
      );
      if (soundEnabled) playSound('success');
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `Workflow Finished: ${targetWf.name}`,
          message: 'All 5 pipeline nodes executed cleanly. Checkpoint saved.',
          type: 'success',
          timestamp: 'Just now',
          read: false
        },
        ...prev
      ]);
    }, 1800);
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) => prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w)));
  };

  // Email
  const sendEmail = (emailData: Omit<EmailItem, 'id' | 'date'>) => {
    const newMail: EmailItem = {
      ...emailData,
      id: `mail-${Date.now()}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setEmails((prev) => [newMail, ...prev]);
    if (soundEnabled) playSound('success');
  };

  const markEmailRead = (id: string) => {
    setEmails((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
  };

  // Calendar
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `cal-${Date.now()}`
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
  };

  // Kanban
  const addKanbanTask = (taskData: Omit<KanbanTask, 'id'>) => {
    const newTask: KanbanTask = {
      ...taskData,
      id: `t-${Date.now()}`
    };
    setKanbanTasks((prev) => [newTask, ...prev]);
  };

  const updateKanbanTaskStatus = (id: string, status: KanbanTask['status']) => {
    setKanbanTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  // VCA Cards
  const addVcaCard = (card: VcaCardRecord) => {
    setVcaCards((prev) => [card, ...prev]);
  };

  const updateVcaCard = (id: string, updates: Partial<VcaCardRecord>) => {
    setVcaCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Notifications & Tasks
  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const approveTask = (taskId: string) => {
    approveTaskAction(taskId);
  };

  const rejectTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'failed', resultSummary: 'Action rejected by user' } : t))
    );
    addNotification({
      title: 'Action Rejected',
      message: `Task ${taskId} was cancelled by user.`,
      type: 'warning',
      read: false
    });
  };

  return (
    <OSContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        bringToFront,
        sendToBack,
        bringForward,
        sendBackward,
        setWindowOpacity,
        updateWindowBounds,
        snapWindow,
        centerWindow,
        moveWindowBy,
        closeAllWindows,
        minimizeAllWindows,
        tileWindows,

        // Multi-Screen & Split-Screen Workspaces
        screens,
        activeScreenIndex,
        setActiveScreenIndex,
        addScreen,
        removeScreen,
        setScreenLayout,
        setSplitApp,
        renameScreen,
        moveWindowToScreen,
        isMultiScreenOverviewOpen,
        setMultiScreenOverviewOpen,

        // Menus & Overlays
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        isLauncherOpen,
        setLauncherOpen,
        isQuickSettingsOpen,
        setQuickSettingsOpen,
        isNotificationsOpen,
        setNotificationsOpen,
        isSideToolsOpen,
        setSideToolsOpen,

        isComputerMode,
        setComputerMode,
        computerModeLog,
        simulatedCursor,

        files,
        createFile,
        updateFile,
        deleteFile,

        agents,
        tasks,
        activeTask,
        executeGoal,
        createTask,
        executeAICommand,
        updateTask,
        approveTaskAction,
        approveTask,
        rejectTask,

        memories,
        addMemory,
        deleteMemory,

        knowledgeDocs,
        addKnowledgeDoc,

        workflows,
        runWorkflow,
        toggleWorkflow,

        emails,
        sendEmail,
        markEmailRead,
        customers: [],

        calendarEvents,
        addCalendarEvent,

        kanbanTasks,
        addKanbanTask,
        updateKanbanTaskStatus,

        vcaCards,
        vcaSubmissions: [],
        addVcaCard,
        updateVcaCard,
        addVCACard: addVcaCard,
        updateVCACard: updateVcaCard,

        activities,
        logActivity,
        updateActivity,
        notifications,
        addNotification,
        dismissNotification,
        clearNotifications,
        clearAllNotifications,
        markNotificationRead,

        widgets,
        addWidget,
        deleteWidget,
        updateWidget,

        // 2-Way Voice Agent & Autonomous Shell
        isVoiceAgentOpen,
        setVoiceAgentOpen,
        toggleVoiceAgent,

        // Taskbar & Pinned Favorites
        taskbarStyle,
        setTaskbarStyle,
        pinnedApps,
        pinApp,
        unpinApp,
        togglePinApp,
        isAppPinned,

        // Workspace Header / Button Mode
        workspaceHeaderMode,
        setWorkspaceHeaderMode,
        isWorkspaceMenuOpen,
        setWorkspaceMenuOpen,

        wallpaper,
        setWallpaper,
        wallpaperConfig,
        setWallpaperConfig,
        isWallpaperModalOpen,
        setWallpaperModalOpen,
        soundEnabled,
        setSoundEnabled,
        systemStatus
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};

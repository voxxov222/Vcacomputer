import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { AppId } from '../../types/os';
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
  Bot
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Bot: <Bot className="w-6 h-6 text-emerald-400" />,
  Sparkles: <Sparkles className="w-6 h-6 text-cyan-400" />,
  Folder: <Folder className="w-6 h-6 text-blue-400" />,
  Globe: <Globe className="w-6 h-6 text-indigo-400" />,
  Terminal: <Terminal className="w-6 h-6 text-emerald-400" />,
  Code2: <Code2 className="w-6 h-6 text-teal-400" />,
  FileText: <FileText className="w-6 h-6 text-sky-400" />,
  Table: <Table className="w-6 h-6 text-emerald-500" />,
  Presentation: <Presentation className="w-6 h-6 text-amber-400" />,
  Mail: <Mail className="w-6 h-6 text-rose-400" />,
  Calendar: <Calendar className="w-6 h-6 text-red-400" />,
  CheckSquare: <CheckSquare className="w-6 h-6 text-orange-400" />,
  GitFork: <GitFork className="w-6 h-6 text-purple-400" />,
  Brain: <Brain className="w-6 h-6 text-pink-400" />,
  Layers: <Layers className="w-6 h-6 text-cyan-300" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-teal-300" />,
  Cpu: <Cpu className="w-6 h-6 text-cyan-400" />,
  FolderGit2: <FolderGit2 className="w-6 h-6 text-amber-400" />,
  LayoutGrid: <LayoutGrid className="w-6 h-6 text-cyan-300" />,
  ShoppingBag: <ShoppingBag className="w-6 h-6 text-yellow-400" />,
  Lock: <Lock className="w-6 h-6 text-amber-500" />,
  Activity: <Activity className="w-6 h-6 text-emerald-300" />,
  Settings: <Settings className="w-6 h-6 text-slate-400" />
};

// Curated primary apps for the bottom dock
const DOCK_APPS: AppId[] = [
  'coding_agents',
  'vca',
  'engineering',
  'process_manager',
  'github_runner',
  'widget_studio',
  'command',
  'files',
  'terminal',
  'code',
  'browser',
  'docs',
  'sheets',
  'tasks',
  'workflows',
  'memory',
  'settings'
];

export const Dock: React.FC = () => {
  const { windows, activeWindowId, openWindow, focusWindow } = useOS();
  const [hoveredApp, setHoveredApp] = useState<AppId | null>(null);

  const isAppOpen = (appId: AppId) => windows.some((w) => w.appId === appId);
  const isAppFocused = (appId: AppId) => {
    const win = windows.find((w) => w.appId === appId);
    return win && win.id === activeWindowId && !win.isMinimized;
  };

  const handleAppClick = (appId: AppId) => {
    const existing = windows.find((w) => w.appId === appId);
    if (existing) {
      if (existing.isMinimized || existing.id !== activeWindowId) {
        focusWindow(existing.id);
      } else {
        // Toggle minimize if already focused
        // or re-focus
        focusWindow(existing.id);
      }
    } else {
      openWindow(appId);
    }
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 select-none">
      <div className="flex items-end gap-1.5 p-2 bg-slate-950/70 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/80">
        {DOCK_APPS.map((appId) => {
          const app = APPS_REGISTRY[appId];
          if (!app) return null;
          const open = isAppOpen(appId);
          const focused = isAppFocused(appId);
          const isHovered = hoveredApp === appId;

          return (
            <div key={appId} className="relative flex flex-col items-center group">
              {/* Floating Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 px-2.5 py-1 bg-slate-900/95 border border-slate-700 text-slate-200 text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none transition-all">
                  {app.name}
                </div>
              )}

              {/* App Button */}
              <button
                id={`dock-app-${appId}`}
                onClick={() => handleAppClick(appId)}
                onMouseEnter={() => setHoveredApp(appId)}
                onMouseLeave={() => setHoveredApp(null)}
                className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                  isHovered ? 'scale-125 -translate-y-2 bg-slate-800/80 shadow-lg' : 'hover:scale-110 hover:-translate-y-1'
                } ${focused ? 'bg-slate-800/60 border border-slate-700/70' : 'bg-slate-900/40 hover:bg-slate-800/50'}`}
              >
                {iconMap[app.icon] || <Sparkles className="w-6 h-6 text-cyan-400" />}
              </button>

              {/* Open / Active Dot */}
              <div className="h-1 flex items-center justify-center mt-1">
                {open && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      focused ? 'bg-cyan-400 ring-2 ring-cyan-400/30' : 'bg-slate-500'
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

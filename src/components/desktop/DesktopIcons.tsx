import React from 'react';
import { useOS } from '../../context/OSContext';
import { AppId } from '../../types/os';
import {
  Sparkles,
  ShieldCheck,
  Folder,
  Terminal,
  Brain,
  Globe,
  Code2,
  GitFork,
  CheckSquare,
  Cpu,
  Activity,
  Bot
} from 'lucide-react';

interface DesktopIconItem {
  id: string;
  name: string;
  appId: AppId;
  icon: React.ReactNode;
  params?: Record<string, any>;
}

export const DesktopIcons: React.FC = () => {
  const { openWindow } = useOS();

  const desktopShortcuts: DesktopIconItem[] = [
    {
      id: 'coding-agents-lab',
      name: 'Coding Agents Lab',
      appId: 'coding_agents',
      icon: <Bot className="w-8 h-8 text-emerald-400" />
    },
    {
      id: 'vca-os',
      name: 'VCA Forensic Lab',
      appId: 'vca',
      icon: <ShieldCheck className="w-8 h-8 text-cyan-400" />
    },
    {
      id: 'engineering-lab',
      name: 'Autonomous Engineering',
      appId: 'engineering',
      icon: <Cpu className="w-8 h-8 text-teal-300" />
    },
    {
      id: 'process-manager',
      name: 'Process Manager',
      appId: 'process_manager',
      icon: <Activity className="w-8 h-8 text-emerald-400" />
    },
    {
      id: 'github-runner',
      name: 'GitHub Runner',
      appId: 'github_runner',
      icon: <Folder className="w-8 h-8 text-amber-400" />
    },
    {
      id: 'widget-studio',
      name: 'Widget Studio',
      appId: 'widget_studio',
      icon: <Sparkles className="w-8 h-8 text-cyan-400" />
    },
    {
      id: 'ai-command',
      name: 'Command Center',
      appId: 'command',
      icon: <Sparkles className="w-8 h-8 text-cyan-300" />
    },
    {
      id: 'files-storage',
      name: 'Virtual Drive',
      appId: 'files',
      icon: <Folder className="w-8 h-8 text-blue-400" />
    },
    {
      id: 'terminal-cli',
      name: 'Host Terminal',
      appId: 'terminal',
      icon: <Terminal className="w-8 h-8 text-emerald-400" />
    },
    {
      id: 'autonomous-agents',
      name: 'Agent Swarm',
      appId: 'memory',
      icon: <Brain className="w-8 h-8 text-pink-400" />
    },
    {
      id: 'code-workspace',
      name: 'Code Studio',
      appId: 'code',
      icon: <Code2 className="w-8 h-8 text-teal-400" />
    },
    {
      id: 'workflows-engine',
      name: 'Workflows & Schedules',
      appId: 'workflows',
      icon: <GitFork className="w-8 h-8 text-purple-400" />
    },
    {
      id: 'tasks-board',
      name: 'Operations Tracker',
      appId: 'tasks',
      icon: <CheckSquare className="w-8 h-8 text-orange-400" />
    }
  ];

  return (
    <div className="absolute top-12 left-2 sm:left-4 z-20 flex flex-col gap-2.5 sm:gap-3 select-none max-h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden p-1 scrollbar-none pointer-events-auto">
      {desktopShortcuts.map((item) => (
        <button
          key={item.id}
          id={`desktop-icon-${item.id}`}
          onClick={(e) => {
            e.stopPropagation();
            openWindow(item.appId, item.params);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            openWindow(item.appId, item.params);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openWindow(item.appId, item.params);
            }
          }}
          className="w-16 sm:w-20 flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-slate-800/70 active:scale-95 focus:bg-cyan-500/25 focus:border focus:border-cyan-500/50 focus:outline-none transition group text-center cursor-pointer"
          title={`Open ${item.name}`}
        >
          <div className="p-2 bg-slate-900/80 group-hover:bg-slate-900/95 group-hover:border-cyan-500/50 group-focus:border-cyan-400 rounded-2xl border border-slate-800/80 shadow-lg group-hover:scale-110 transition-transform backdrop-blur-md">
            {item.icon}
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-200 group-hover:text-cyan-300 drop-shadow-md leading-tight line-clamp-2 px-1 rounded bg-slate-950/60 border border-slate-800/40">
            {item.name}
          </span>
        </button>
      ))}
    </div>
  );
};

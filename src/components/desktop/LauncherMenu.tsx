import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { APPS_REGISTRY } from '../../lib/appsRegistry';
import { AppCategory, AppId } from '../../types/os';
import {
  Search,
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
  Settings,
  X,
  Pin,
  PinOff,
  Smartphone,
  DownloadCloud,
  Cpu,
  Monitor,
  Mic,
  Bot
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Mic: <Mic className="w-8 h-8 text-cyan-400" />,
  Bot: <Bot className="w-8 h-8 text-emerald-400" />,
  Sparkles: <Sparkles className="w-8 h-8 text-cyan-400" />,
  Folder: <Folder className="w-8 h-8 text-blue-400" />,
  Globe: <Globe className="w-8 h-8 text-indigo-400" />,
  Terminal: <Terminal className="w-8 h-8 text-emerald-400" />,
  Code2: <Code2 className="w-8 h-8 text-teal-400" />,
  FileText: <FileText className="w-8 h-8 text-sky-400" />,
  Table: <Table className="w-8 h-8 text-emerald-500" />,
  Presentation: <Presentation className="w-8 h-8 text-amber-400" />,
  Mail: <Mail className="w-8 h-8 text-rose-400" />,
  Calendar: <Calendar className="w-8 h-8 text-red-400" />,
  CheckSquare: <CheckSquare className="w-8 h-8 text-orange-400" />,
  GitFork: <GitFork className="w-8 h-8 text-purple-400" />,
  Brain: <Brain className="w-8 h-8 text-pink-400" />,
  Layers: <Layers className="w-8 h-8 text-cyan-300" />,
  ShieldCheck: <ShieldCheck className="w-8 h-8 text-teal-300" />,
  ShoppingBag: <ShoppingBag className="w-8 h-8 text-yellow-400" />,
  Lock: <Lock className="w-8 h-8 text-amber-500" />,
  Activity: <Activity className="w-8 h-8 text-emerald-300" />,
  Settings: <Settings className="w-8 h-8 text-slate-400" />,
  Smartphone: <Smartphone className="w-8 h-8 text-cyan-400" />,
  DownloadCloud: <DownloadCloud className="w-8 h-8 text-blue-400" />,
  Cpu: <Cpu className="w-8 h-8 text-emerald-400" />,
  Monitor: <Monitor className="w-8 h-8 text-purple-400" />
};

export const LauncherMenu: React.FC = () => {
  const { isLauncherOpen, setLauncherOpen, openWindow, pinnedApps, togglePinApp } = useOS();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isLauncherOpen) return null;

  const categories = [
    { id: 'all', label: 'All Apps' },
    { id: 'pinned', label: '★ Pinned Favorites' },
    { id: 'Intelligence', label: 'Intelligence' },
    { id: 'Productivity', label: 'Productivity' },
    { id: 'Development', label: 'Development' },
    { id: 'Specialized', label: 'VCA & Emulation' },
    { id: 'System', label: 'System' }
  ];

  const filteredApps = Object.values(APPS_REGISTRY).filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase());
    
    if (selectedCategory === 'pinned') {
      return pinnedApps.includes(app.id) && matchesSearch;
    }
    
    const matchesCategory =
      selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLaunch = (appId: AppId) => {
    openWindow(appId);
    setLauncherOpen(false);
  };

  return (
    <div
      onClick={() => setLauncherOpen(false)}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[85vh] bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl p-4 sm:p-6 flex flex-col backdrop-blur-2xl animate-in fade-in zoom-in-95"
      >
        {/* Header with Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Applications & Workspaces</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Launch built-in tools or pin favorites to the bottom taskbar
            </p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search apps or tools..."
                autoFocus
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={() => setLauncherOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto text-xs scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Apps Grid */}
        <div className="flex-1 overflow-y-auto pt-3 pb-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredApps.map((app) => {
            const isPinned = pinnedApps.includes(app.id);
            return (
              <div
                key={app.id}
                onClick={() => handleLaunch(app.id)}
                className="relative p-3.5 sm:p-4 bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl flex flex-col items-center text-center transition group shadow-sm cursor-pointer"
              >
                {/* Pin/Unpin Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinApp(app.id);
                  }}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg transition opacity-60 group-hover:opacity-100 ${
                    isPinned
                      ? 'bg-cyan-500/20 text-cyan-400 hover:bg-rose-500/20 hover:text-rose-400'
                      : 'hover:bg-slate-800 text-slate-500 hover:text-cyan-400'
                  }`}
                  title={isPinned ? 'Unpin from Taskbar' : 'Pin to Taskbar'}
                >
                  {isPinned ? <Pin className="w-3.5 h-3.5 fill-cyan-400" /> : <Pin className="w-3.5 h-3.5" />}
                </button>

                <div className="p-3 bg-slate-900/80 group-hover:bg-slate-850 rounded-2xl mb-2.5 group-hover:scale-110 transition-transform shadow-inner">
                  {iconMap[app.icon] || <Sparkles className="w-8 h-8 text-cyan-400" />}
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition mb-1">
                  {app.name}
                </span>
                <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                  {app.description}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredApps.length} applications</span>
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Pin className="w-3 h-3 text-cyan-400" /> Click pin to customize bottom taskbar
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { APPS_REGISTRY } from '../../lib/appsRegistry';
import { AppId } from '../../types/os';
import {
  Search,
  Sparkles,
  Command,
  ArrowRight,
  MonitorPlay,
  FileText,
  Terminal,
  Brain,
  Layers,
  ShieldCheck,
  Send,
  Loader2
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    openWindow,
    executeGoal,
    files,
    isComputerMode,
    setComputerMode
  } = useOS();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Filter apps
  const matchedApps = Object.values(APPS_REGISTRY).filter((app) =>
    app.name.toLowerCase().includes(query.toLowerCase()) ||
    app.description.toLowerCase().includes(query.toLowerCase()) ||
    app.category.toLowerCase().includes(query.toLowerCase())
  );

  // Filter files
  const matchedFiles = files.filter(
    (f) =>
      !f.isFolder &&
      (f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.path.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 4);

  // System actions
  const systemActions = [
    {
      id: 'action-computer-mode',
      title: isComputerMode ? 'Disable Autonomous Computer Mode' : 'Enable Autonomous Computer Mode',
      category: 'System',
      icon: <MonitorPlay className="w-4 h-4 text-amber-400" />,
      run: () => setComputerMode(!isComputerMode)
    },
    {
      id: 'action-vca-scan',
      title: 'VScan: Capture & Authenticate Collectible Card',
      category: 'Authentication',
      icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
      run: () => openWindow('vca', { defaultTab: 'vscan' })
    },
    {
      id: 'action-agent-swarm',
      title: 'Swarm: Launch Autonomous Operations Agent Swarm',
      category: 'Intelligence',
      icon: <Brain className="w-4 h-4 text-pink-400" />,
      run: () => openWindow('command')
    }
  ];

  const handleLaunchApp = (appId: AppId) => {
    openWindow(appId);
    setCommandPaletteOpen(false);
  };

  const handleGoalSubmit = async () => {
    if (!query.trim()) return;
    setIsProcessingAI(true);

    try {
      await executeGoal(query.trim());
      openWindow('command');
    } catch {
      openWindow('command');
    } finally {
      setIsProcessingAI(false);
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div
      onClick={() => setCommandPaletteOpen(false)}
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-start justify-center pt-24 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                if (matchedApps.length > 0 && query.length < 15 && !query.includes(' ')) {
                  handleLaunchApp(matchedApps[0].id);
                } else {
                  handleGoalSubmit();
                }
              }
            }}
            placeholder="Type any goal (e.g. 'Research market prices for Charizard', 'Write sales proposal', 'Inspect card defects')..."
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          {isProcessingAI ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
          ) : (
            <button
              onClick={handleGoalSubmit}
              disabled={!query.trim()}
              className="p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white rounded-lg transition shrink-0"
              title="Execute with AI"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-4 text-xs">
          {/* AI Goal prompt suggestion when typing */}
          {query.trim().length > 0 && (
            <div className="p-2">
              <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Autonomous Execution
              </div>
              <button
                onClick={handleGoalSubmit}
                className="w-full text-left p-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 text-slate-200 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Delegate goal to AI Operating System:</div>
                    <div className="text-cyan-300 text-xs truncate max-w-md">"{query}"</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-cyan-400 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Operate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          )}

          {/* Quick System Actions */}
          <div className="p-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Quick Actions
            </div>
            <div className="space-y-1">
              {systemActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.run();
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-200 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2.5">
                    {action.icon}
                    <span>{action.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{action.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Applications list */}
          <div className="p-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Applications ({matchedApps.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {matchedApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleLaunchApp(app.id)}
                  className="text-left px-3 py-2 rounded-lg bg-slate-950/40 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-200 flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-400 transition">
                      {app.name}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">{app.category}</span>
                  </div>
                  <kbd className="text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100">
                    Open
                  </kbd>
                </button>
              ))}
            </div>
          </div>

          {/* Files matched */}
          {matchedFiles.length > 0 && (
            <div className="p-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Files
              </div>
              <div className="space-y-1">
                {matchedFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      if (file.type === 'code' || file.type === 'json') {
                        openWindow('code', { fileId: file.id });
                      } else {
                        openWindow('docs', { fileId: file.id });
                      }
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-300 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{file.path}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">↵ Enter</kbd> to execute</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">ESC</kbd> to dismiss</span>
          </div>
          <span className="text-cyan-500 font-medium">Verified Card Authority & Construct OS</span>
        </div>
      </div>
    </div>
  );
};

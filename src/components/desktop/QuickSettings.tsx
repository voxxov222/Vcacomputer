import React from 'react';
import { useOS } from '../../context/OSContext';
import {
  Sliders,
  Volume2,
  VolumeX,
  MonitorPlay,
  Cpu,
  HardDrive,
  Wifi,
  Image as ImageIcon,
  Shield,
  RotateCcw,
  Sparkles,
  X,
  Layout,
  Smartphone,
  Layers,
  PanelTop
} from 'lucide-react';
import { TaskbarStyle, WorkspaceHeaderMode } from '../../types/os';

export const QuickSettings: React.FC = () => {
  const {
    isQuickSettingsOpen,
    setQuickSettingsOpen,
    wallpaper,
    setWallpaper,
    soundEnabled,
    setSoundEnabled,
    isComputerMode,
    setComputerMode,
    systemStatus,
    taskbarStyle,
    setTaskbarStyle,
    workspaceHeaderMode,
    setWorkspaceHeaderMode
  } = useOS();

  if (!isQuickSettingsOpen) return null;

  const wallpapers = [
    {
      id: 'cyber-dark',
      name: 'Cyber Horizon (Dark Graphite)',
      preview: 'linear-gradient(to bottom right, #090d16, #020617, #0b1329)'
    },
    {
      id: 'electric-cyan',
      name: 'Electric Grid (Cyber Cyan)',
      preview: 'linear-gradient(to bottom right, #042f2e, #020617, #083344)'
    },
    {
      id: 'deep-space',
      name: 'Deep Nebula (Violet Pulse)',
      preview: 'linear-gradient(to bottom right, #1e1b4b, #020617, #2e1065)'
    },
    {
      id: 'slate-minimal',
      name: 'Slate Minimalist (Monochrome)',
      preview: 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)'
    }
  ];

  return (
    <div
      onClick={() => setQuickSettingsOpen(false)}
      className="fixed inset-0 z-50 bg-black/20"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-11 right-3 w-84 max-h-[90vh] overflow-y-auto bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-xs text-slate-200 backdrop-blur-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 scrollbar-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-white">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Control Center & Layout</span>
          </div>
          <button
            onClick={() => setQuickSettingsOpen(false)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Taskbar & Navigation Style Selector */}
        <div className="space-y-1.5">
          <div className="font-semibold text-slate-300 text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-cyan-400" /> Taskbar & Navigation Style
            </span>
            <span className="text-[10px] text-cyan-400 font-mono capitalize">{taskbarStyle}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'windows' as TaskbarStyle, name: 'Windows Bar', desc: 'Start + Pin Favs' },
              { id: 'dock' as TaskbarStyle, name: 'Floating Dock', desc: 'macOS Style' },
              { id: 'mobile' as TaskbarStyle, name: 'Mobile Bar', desc: 'Touch Optimized' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setTaskbarStyle(st.id)}
                className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-0.5 ${
                  taskbarStyle === st.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow'
                    : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-[11px] leading-tight">{st.name}</span>
                <span className="text-[9px] text-slate-500">{st.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Top Menu Selector */}
        <div className="space-y-1.5">
          <div className="font-semibold text-slate-300 text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <PanelTop className="w-3.5 h-3.5 text-purple-400" /> Top Workspace Mode
            </span>
            <span className="text-[10px] text-purple-300 font-mono">
              {workspaceHeaderMode === 'button' ? 'Compact Button' : 'Expanded Bar'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setWorkspaceHeaderMode('button')}
              className={`p-2 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                workspaceHeaderMode === 'button'
                  ? 'bg-purple-500/20 border-purple-400 text-purple-200 font-bold'
                  : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800 text-slate-400'
              }`}
            >
              <span className="text-[11px]">Menu Button (Clean)</span>
              <span className="text-[9px] text-slate-500">Pop-up modal on click</span>
            </button>
            <button
              onClick={() => setWorkspaceHeaderMode('bar')}
              className={`p-2 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                workspaceHeaderMode === 'bar'
                  ? 'bg-purple-500/20 border-purple-400 text-purple-200 font-bold'
                  : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800 text-slate-400'
              }`}
            >
              <span className="text-[11px]">Full Top Bar</span>
              <span className="text-[9px] text-slate-500">Always visible tabs</span>
            </button>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="grid grid-cols-2 gap-2">
          {/* Autonomous Computer Mode */}
          <button
            onClick={() => setComputerMode(!isComputerMode)}
            className={`p-2.5 rounded-xl border flex flex-col gap-1 text-left transition ${
              isComputerMode
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <MonitorPlay className={`w-4 h-4 ${isComputerMode ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-800 text-slate-400">
                {isComputerMode ? 'ON' : 'OFF'}
              </span>
            </div>
            <span className="font-semibold text-xs mt-1">Computer Mode</span>
            <span className="text-[10px] text-slate-400">Autonomous cursor</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border flex flex-col gap-1 text-left transition ${
              soundEnabled
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-800 text-slate-400">
                {soundEnabled ? 'ON' : 'MUTE'}
              </span>
            </div>
            <span className="font-semibold text-xs mt-1">Audio Feedback</span>
            <span className="text-[10px] text-slate-400">Spatial clicks</span>
          </button>
        </div>

        {/* System Vitals */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
          <div className="font-semibold text-slate-300 text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> System Resources
            </span>
            <span className="font-mono text-cyan-400">{systemStatus.cpu}% CPU</span>
          </div>

          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Memory usage</span>
                <span>{systemStatus.memory} MB / 4096 MB</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(systemStatus.memory / 4096) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Storage (NVMe)</span>
                <span>{systemStatus.disk} MB used</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(systemStatus.disk / 5120) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wallpaper Picker */}
        <div className="space-y-1.5">
          <div className="font-semibold text-slate-300 text-[11px] flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Wallpaper Themes
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {wallpapers.map((w) => (
              <button
                key={w.id}
                onClick={() => setWallpaper(w.id)}
                className={`p-2 rounded-lg border text-left flex items-center gap-2 transition ${
                  wallpaper === w.id
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-medium'
                    : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-md border border-slate-700 shrink-0"
                  style={{ background: w.preview }}
                />
                <span className="truncate text-[11px]">{w.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Security & Version info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> Sandbox Isolation Active
          </span>
          <span>v2.5.0-pro</span>
        </div>
      </div>
    </div>
  );
};

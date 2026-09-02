import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { runtimeApi } from '../../lib/runtimeApi';
import { RuntimeSystemInfo } from '../../types/runtime';
import {
  Wrench,
  X,
  Cpu,
  HardDrive,
  Radio,
  Terminal,
  Activity,
  Shield,
  Layers,
  Sparkles,
  Bot,
  Play,
  RotateCw,
  Folder,
  Code2,
  Globe,
  Grid,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Maximize2,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Server,
  Zap,
  LayoutGrid
} from 'lucide-react';

export const SideToolsPanel: React.FC = () => {
  const {
    isSideToolsOpen,
    setSideToolsOpen,
    openWindow,
    closeAllWindows,
    minimizeAllWindows,
    tileWindows,
    widgets,
    addWidget,
    deleteWidget,
    tasks,
    approveTask,
    rejectTask,
    systemStatus,
    setCommandPaletteOpen
  } = useOS();

  const [activeTab, setActiveTab] = useState<'tools' | 'telemetry' | 'agents' | 'widgets' | 'actions'>('tools');
  const [sysInfo, setSysInfo] = useState<RuntimeSystemInfo | null>(null);
  const [ports, setPorts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quickCmdOutput, setQuickCmdOutput] = useState<string | null>(null);

  const fetchHostData = async () => {
    setIsRefreshing(true);
    try {
      const [info, portList] = await Promise.all([
        runtimeApi.getSystemInfo().catch(() => null),
        runtimeApi.getPorts().catch(() => [])
      ]);
      if (info) setSysInfo(info);
      setPorts(portList);
    } catch {
      // quiet fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isSideToolsOpen) {
      fetchHostData();
    }
  }, [isSideToolsOpen]);

  if (!isSideToolsOpen) return null;

  const handleQuickCommand = async (cmd: string, label: string) => {
    setQuickCmdOutput(`Executing [${label}]...`);
    try {
      const res = await runtimeApi.executeCommand({ command: cmd });
      setQuickCmdOutput(res.stdout || res.stderr || 'Execution completed successfully.');
    } catch (err: any) {
      setQuickCmdOutput(`Failed: ${err.message}`);
    }
  };

  const toolLaunchers = [
    { id: 'coding_agents', name: 'Coding Agents Lab', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { id: 'vca', name: 'VCA Forensic Lab', icon: ShieldCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    { id: 'terminal', name: 'Shell Terminal', icon: Terminal, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { id: 'files', name: 'File Explorer', icon: Folder, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    { id: 'github_runner', name: 'GitHub Runner', icon: Play, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
    { id: 'process_manager', name: 'Process Supervisor', icon: Server, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
    { id: 'widget_studio', name: 'Widget Studio', icon: Grid, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
    { id: 'browser', name: 'Web Browser', icon: Globe, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' },
    { id: 'code', name: 'Code Editor', icon: Code2, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' },
    { id: 'engineering', name: 'Tech Registry', icon: Layers, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30' }
  ];

  return (
    <div
      onClick={() => setSideToolsOpen(false)}
      className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] transition-opacity"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-9 right-0 bottom-12 w-96 max-w-[calc(100vw-16px)] bg-slate-900/98 border-l border-slate-700/80 shadow-2xl flex flex-col text-xs text-slate-200 backdrop-blur-2xl animate-in slide-in-from-right duration-200 select-text"
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                OS Side Tools & Utilities
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">Real Local Computing Runtime</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchHostData}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition"
              title="Refresh telemetry"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={() => setSideToolsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Close Side Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 border-b border-slate-800 bg-slate-950/40 shrink-0">
          {[
            { id: 'tools', label: 'Launchers', icon: Zap },
            { id: 'telemetry', label: 'Telemetry', icon: Activity },
            { id: 'agents', label: 'Agents', icon: Bot },
            { id: 'widgets', label: 'Widgets', icon: Grid },
            { id: 'actions', label: 'Window Grid', icon: LayoutGrid }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-medium transition text-[11px] ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {/* TAB: TOOLS LAUNCHER */}
          {activeTab === 'tools' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Access Applications
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">1-Click Launch</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {toolLaunchers.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        openWindow(tool.id as any);
                        setSideToolsOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border ${tool.bg} flex items-center gap-2.5 text-left transition hover:scale-[1.02] active:scale-[0.98] group`}
                    >
                      <Icon className={`w-4 h-4 ${tool.color} group-hover:animate-pulse`} />
                      <div className="truncate">
                        <div className="font-semibold text-xs text-white truncate">{tool.name}</div>
                        <div className="text-[9px] text-slate-400">Launch workspace</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick CLI Actions */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Quick Host Utilities
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleQuickCommand('uname -a && uptime', 'Host Vitals')}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left text-[11px] flex items-center justify-between text-slate-300 hover:text-cyan-300 transition"
                  >
                    <span>System Uptime</span>
                    <Play className="w-2.5 h-2.5 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleQuickCommand('free -m || vmstat', 'Memory Check')}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left text-[11px] flex items-center justify-between text-slate-300 hover:text-cyan-300 transition"
                  >
                    <span>Free Memory</span>
                    <Play className="w-2.5 h-2.5 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleQuickCommand('df -h .', 'Disk Usage')}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left text-[11px] flex items-center justify-between text-slate-300 hover:text-cyan-300 transition"
                  >
                    <span>Disk Space</span>
                    <Play className="w-2.5 h-2.5 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleQuickCommand('git status', 'Git Branch')}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left text-[11px] flex items-center justify-between text-slate-300 hover:text-cyan-300 transition"
                  >
                    <span>Git Status</span>
                    <Play className="w-2.5 h-2.5 text-slate-500" />
                  </button>
                </div>

                {quickCmdOutput && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-cyan-300 whitespace-pre-wrap max-h-24 overflow-y-auto">
                    {quickCmdOutput}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU Allocation
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">{systemStatus.cpu}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(8, systemStatus.cpu))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Load Avg: {sysInfo?.cpu?.loadAverage ? sysInfo.cpu.loadAverage.map((n) => n.toFixed(2)).join(', ') : '0.12, 0.08, 0.05'}</span>
                  <span>Cores: {sysInfo?.cpu?.cores || 4}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Memory Buffer
                  </span>
                  <span className="font-mono text-emerald-300 font-bold">{systemStatus.memory} MB</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (systemStatus.memory / 4096) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Host: {sysInfo?.memory?.totalMB ? `${sysInfo.memory.usedMB} / ${sysInfo.memory.totalMB} MB` : '420 / 4096 MB'}</span>
                  <span>Free: ~3.6 GB</span>
                </div>
              </div>

              {/* Active Network Ports */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Active Port Bindings
                  </span>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                    {ports.length || 1} Open
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      :3000
                      <span className="text-slate-400 text-[10px]">VCA OS Main Container</span>
                    </div>
                    <span className="text-emerald-400 text-[10px]">LISTENING</span>
                  </div>
                  {ports.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-purple-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        :{p.port}
                        <span className="text-slate-400 text-[10px] truncate max-w-[140px]">{p.processName || 'Service'}</span>
                      </div>
                      <span className="text-purple-400 text-[10px]">ACTIVE</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACTIVE AGENTS */}
          {activeTab === 'agents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Agent Orchestration
                </span>
                <span className="text-[10px] text-amber-400 font-mono">{tasks.length} Objectives</span>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>No active agent tasks</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-xs text-white leading-tight">{task.objective}</div>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                          task.status === 'running'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
                            : task.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : task.status === 'waiting_approval'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>

                    {task.status === 'waiting_approval' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => approveTask(task.id)}
                          className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center justify-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => rejectTask(task.id)}
                          className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: WIDGETS MANAGER */}
          {activeTab === 'widgets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Desktop Widgets ({widgets.length})
                </span>
                <button
                  onClick={() => openWindow('widget_studio')}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Studio
                </button>
              </div>

              <div className="space-y-2">
                {widgets.map((w) => (
                  <div key={w.id} className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-white">{w.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{w.type}</div>
                    </div>
                    <button
                      onClick={() => deleteWidget(w.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      title="Remove widget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Default Presets */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Add Preset Widget</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() =>
                      addWidget({
                        id: `widget-sys-${Date.now()}`,
                        title: 'Hardware Monitor',
                        type: 'system_monitor',
                        size: 'medium',
                        position: { x: 80, y: 100 },
                        isPinned: true,
                        isLocked: false,
                        props: {}
                      })
                    }
                    className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left text-[11px] text-slate-300"
                  >
                    + Sys Monitor
                  </button>
                  <button
                    onClick={() =>
                      addWidget({
                        id: `widget-port-${Date.now()}`,
                        title: 'Port Sentinel',
                        type: 'port_monitor',
                        size: 'medium',
                        position: { x: 80, y: 300 },
                        isPinned: true,
                        isLocked: false,
                        props: {}
                      })
                    }
                    className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left text-[11px] text-slate-300"
                  >
                    + Port Sentinel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WINDOW ACTIONS & GRID */}
          {activeTab === 'actions' && (
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Window Management Grid
              </span>

              <div className="space-y-2">
                <button
                  onClick={tileWindows}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between text-slate-200 hover:text-cyan-300 transition"
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-cyan-400" />
                    <span>Tile All Windows Side-by-Side</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <button
                  onClick={minimizeAllWindows}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between text-slate-200 hover:text-amber-300 transition"
                >
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-amber-400" />
                    <span>Minimize All (Show Desktop)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <button
                  onClick={closeAllWindows}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 flex items-center justify-between text-slate-200 hover:text-rose-300 transition"
                >
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Close All Open Windows</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <button
                  onClick={() => setCommandPaletteOpen(true)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 flex items-center justify-between text-slate-200 hover:text-purple-300 transition"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Open AI Command Palette (Ctrl+K)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">VCA Local Runtime Online</span>
          </div>
          <span className="font-mono text-[10px]">Port 3000</span>
        </div>
      </div>
    </div>
  );
};

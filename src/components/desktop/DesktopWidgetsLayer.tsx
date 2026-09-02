import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { DynamicWidgetConfig, RuntimeSystemInfo } from '../../types/runtime';
import { runtimeApi } from '../../lib/runtimeApi';
import {
  Activity,
  Cpu,
  HardDrive,
  Radio,
  Terminal,
  FileCode,
  Globe,
  Trash2,
  Minimize2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const DesktopWidgetsLayer: React.FC = () => {
  const { widgets, deleteWidget, updateWidget } = useOS();
  const [sysInfo, setSysInfo] = useState<RuntimeSystemInfo | null>(null);
  const [ports, setPorts] = useState<any[]>([]);
  const [quickNotes, setQuickNotes] = useState('# Quick Notes\n- VCA OS Local Runtime Online\n- Multimodal Forensic Engine active');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('Type any shell command...');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [info, portList] = await Promise.all([
          runtimeApi.getSystemInfo().catch(() => null),
          runtimeApi.getPorts().catch(() => [])
        ]);
        if (info) setSysInfo(info);
        setPorts(portList);
      } catch {
        // quiet fallback
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRunMiniTerminal = async () => {
    if (!terminalInput.trim()) return;
    setTerminalOutput(`Running: ${terminalInput}...`);
    try {
      const res = await runtimeApi.executeCommand({ command: terminalInput });
      setTerminalOutput(res.stdout || res.stderr || 'Done.');
      setTerminalInput('');
    } catch (e: any) {
      setTerminalOutput(`Error: ${e.message}`);
    }
  };

  const renderWidgetContent = (w: DynamicWidgetConfig) => {
    switch (w.type) {
      case 'system_monitor':
        return (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU Load:</span>
              <strong className="text-cyan-300 font-mono">{sysInfo?.cpu ? `${(sysInfo.cpu.loadAverage[0] * 10).toFixed(1)}%` : '2.4%'}</strong>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, (sysInfo?.cpu?.loadAverage[0] || 0.24) * 10))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-slate-400 pt-1">
              <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Memory (RAM):</span>
              <strong className="text-emerald-300 font-mono">{sysInfo?.memory ? `${sysInfo.memory.usagePercent}%` : '42%'}</strong>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${sysInfo?.memory?.usagePercent || 42}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
              <span>OS: {sysInfo?.platform || 'linux'} ({sysInfo?.arch || 'x64'})</span>
              <span>Node: {sysInfo?.nodeVersion || 'v20'}</span>
            </div>
          </div>
        );

      case 'port_monitor':
        return (
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Port Bindings</div>
            <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
              {ports.slice(0, 4).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 truncate">
                    <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                    <span className="text-cyan-300 font-bold">:{p.port}</span>
                    <span className="text-slate-400 text-[10px] truncate max-w-[120px]">{p.processName}</span>
                  </div>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'terminal_live':
        return (
          <div className="space-y-1.5 text-xs font-mono flex flex-col h-full">
            <div className="p-2 rounded bg-slate-950 text-slate-300 text-[10px] h-20 overflow-y-auto whitespace-pre-wrap border border-slate-800/80 select-text">
              {terminalOutput}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunMiniTerminal()}
                placeholder="npm test, ls, git status..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleRunMiniTerminal}
                className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 text-[10px] font-sans"
              >
                Run
              </button>
            </div>
          </div>
        );

      case 'notes_scratchpad':
        return (
          <textarea
            value={quickNotes}
            onChange={(e) => setQuickNotes(e.target.value)}
            className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-cyan-500"
          />
        );

      case 'website_embed':
        return (
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <Globe className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <span className="font-semibold text-slate-200 text-xs block">{w.props.title || 'VCA Web Portal'}</span>
              <a
                href={w.props.url || 'https://vca-authority.com'}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 hover:underline flex items-center justify-center gap-1 mt-1"
              >
                <span>{w.props.url || 'https://vca-authority.com'}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-xs text-slate-400">
            {w.props?.aiGoal ? (
              <div className="space-y-1">
                <span className="text-cyan-300 font-semibold">{w.props.aiGoal}</span>
                {w.props.insights?.map((ins: string, idx: number) => (
                  <div key={idx} className="text-[11px] text-slate-400">• {ins}</div>
                ))}
              </div>
            ) : (
              'Active Widget Monitor'
            )}
          </div>
        );
    }
  };

  if (widgets.length === 0) return null;

  return (
    <div className="absolute top-12 left-24 sm:left-28 right-12 bottom-20 pointer-events-none z-0 p-2 overflow-y-auto scrollbar-none">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className="pointer-events-auto rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800/80 shadow-xl p-3.5 flex flex-col justify-between transition-all hover:border-slate-700 select-none group"
          >
            {/* Widget Top Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200 text-xs">{widget.title}</span>
              </div>

              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => deleteWidget(widget.id)}
                  className="text-slate-500 hover:text-rose-400 p-0.5"
                  title="Close widget"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Widget Body */}
            <div>{renderWidgetContent(widget)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

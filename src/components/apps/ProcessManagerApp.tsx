import React, { useState, useEffect } from 'react';
import { runtimeApi } from '../../lib/runtimeApi';
import { RealProcessItem, PortBindingInfo } from '../../types/runtime';
import {
  Activity,
  Cpu,
  HardDrive,
  RefreshCw,
  XCircle,
  Play,
  Search,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Radio,
  Terminal,
  ShieldCheck
} from 'lucide-react';

export const ProcessManagerApp: React.FC = () => {
  const [processes, setProcesses] = useState<RealProcessItem[]>([]);
  const [ports, setPorts] = useState<PortBindingInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'processes' | 'ports'>('processes');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [procs, portList] = await Promise.all([
        runtimeApi.getProcesses().catch(() => []),
        runtimeApi.getPorts().catch(() => [])
      ]);
      setProcesses(procs);
      setPorts(portList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleKill = async (pid: number) => {
    try {
      const res = await runtimeApi.stopProcess(pid);
      setActionMessage(res.message || `Signal sent to PID ${pid}`);
      fetchData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  const filteredProcesses = processes.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.command.toLowerCase().includes(search.toLowerCase()) ||
    String(p.pid).includes(search)
  );

  const filteredPorts = ports.filter((p) =>
    String(p.port).includes(search) ||
    p.processName.toLowerCase().includes(search.toLowerCase())
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 font-sans text-xs select-none overflow-hidden">
      {/* Header Bar */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-100 text-sm">Real Process & Port Supervisor</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[10px] font-mono flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE DAEMON
          </span>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('processes')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'processes' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Processes ({processes.length})
            </button>
            <button
              onClick={() => setActiveTab('ports')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'ports' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ports & Sockets ({ports.length})
            </button>
          </div>

          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PID, name..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-cyan-950/60 border-b border-cyan-800/40 px-4 py-1.5 text-cyan-300 text-[11px] flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-200">×</button>
        </div>
      )}

      {/* Main Table View */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'processes' ? (
          <table className="w-full border-collapse text-left font-mono">
            <thead className="bg-slate-900/80 sticky top-0 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="py-2 px-3">PID</th>
                <th className="py-2 px-3">Name / Command</th>
                <th className="py-2 px-3 text-right">CPU %</th>
                <th className="py-2 px-3 text-right">Memory</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredProcesses.map((proc) => (
                <tr
                  key={proc.pid}
                  onClick={() => setSelectedPid(proc.pid)}
                  className={`hover:bg-slate-900/60 transition-colors cursor-pointer ${
                    selectedPid === proc.pid ? 'bg-cyan-950/30' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-cyan-400 font-semibold">{proc.pid}</td>
                  <td className="py-2 px-3 max-w-xs truncate text-slate-200">
                    <span className="font-semibold text-slate-100">{proc.name}</span>
                    <span className="text-slate-500 text-[10px] ml-2 block truncate">{proc.command}</span>
                  </td>
                  <td className="py-2 px-3 text-right font-medium">
                    <span className={proc.cpuPercent > 10 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      {proc.cpuPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-300">{formatBytes(proc.memoryBytes)}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      proc.status === 'running' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {proc.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{proc.user}</td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleKill(proc.pid);
                      }}
                      className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[10px] font-sans flex items-center gap-1 mx-auto transition-all"
                    >
                      <XCircle className="w-3 h-3" /> Stop
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse text-left font-mono">
            <thead className="bg-slate-900/80 sticky top-0 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="py-2 px-3">Port</th>
                <th className="py-2 px-3">Protocol</th>
                <th className="py-2 px-3">PID</th>
                <th className="py-2 px-3">Associated Service</th>
                <th className="py-2 px-3">State</th>
                <th className="py-2 px-3 text-center">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredPorts.map((item, idx) => (
                <tr key={`${item.port}-${idx}`} className="hover:bg-slate-900/60">
                  <td className="py-2.5 px-3 text-cyan-400 font-bold text-sm">:{item.port}</td>
                  <td className="py-2.5 px-3 uppercase text-slate-400 text-[10px]">{item.protocol}</td>
                  <td className="py-2.5 px-3 text-slate-300">{item.pid || '-'}</td>
                  <td className="py-2.5 px-3 text-slate-200 font-medium">{item.processName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px]">
                      {item.state}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 text-[10px] font-sans inline-flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" /> Connect
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom Summary Bar */}
      <div className="h-8 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span>Active Processes: <strong className="text-slate-200">{processes.length}</strong></span>
          <span>Bound Ports: <strong className="text-slate-200">{ports.length}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-time Kernel Supervisor</span>
        </div>
      </div>
    </div>
  );
};

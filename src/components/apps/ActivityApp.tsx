import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Clock,
  Filter,
  Search,
  Bot,
  Terminal,
  Play,
  Pause,
  RotateCcw,
  StopCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { ActivityEvent } from '../../types/os';

export const ActivityApp: React.FC = () => {
  const { activities, updateActivity, logActivity } = useOS();
  const [filterType, setFilterType] = useState<'all' | 'success' | 'warning' | 'error' | 'pending' | 'paused'>('all');
  const [search, setSearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityEvent | null>(null);

  // Generate some mock real-time events if activities are empty
  useEffect(() => {
    if (activities.length === 0) {
      logActivity('Analyze Market Trends', 'Market Database', {
        agent: 'Research Agent',
        status: 'success',
        toolUsed: 'WebScraper v2.1',
        result: 'Compiled 200 data points',
        duration: '45s'
      });
      logActivity('Scan Codebase for Vulnerabilities', 'Frontend Repo', {
        agent: 'Project Manager Agent',
        status: 'pending',
        toolUsed: 'SecurityScanner',
        duration: 'In Progress'
      });
    }
  }, [activities.length, logActivity]);

  const filteredActivities = activities.filter((act) => {
    const matchesFilter = filterType === 'all' || act.status === filterType;
    const matchesSearch =
      act.action.toLowerCase().includes(search.toLowerCase()) ||
      act.agent.toLowerCase().includes(search.toLowerCase()) ||
      act.target.toLowerCase().includes(search.toLowerCase()) ||
      (act.details && act.details.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-amber-500" />;
      case 'cancelled':
        return <StopCircle className="w-4 h-4 text-slate-500" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'warning':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'error':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'pending':
        return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
      case 'paused':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'cancelled':
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      default:
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    }
  };

  const handleAction = (id: string, newStatus: ActivityEvent['status']) => {
    if (updateActivity) {
      updateActivity(id, { status: newStatus });
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-text">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              REAL-TIME ACTIVITY CENTER
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                {activities.length} Events
              </span>
            </h1>
            <p className="text-xs text-slate-400">Multi-agent execution timeline</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {(['all', 'pending', 'paused', 'success', 'error'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium uppercase transition ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, agent or target..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <Terminal className="w-12 h-12 opacity-20" />
            <p>No activity logs match your filter</p>
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div
              key={act.id}
              className={`p-4 rounded-xl border bg-slate-900/40 backdrop-blur transition-all duration-300 ${
                selectedActivity?.id === act.id ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`mt-0.5 p-1.5 rounded-lg border ${getStatusColor(act.status)}`}>
                    {getStatusIcon(act.status)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-slate-500">{act.timestamp}</span>
                      <span className="text-xs font-medium text-slate-300 px-2 py-0.5 bg-slate-800 rounded-full flex items-center space-x-1">
                        <Bot className="w-3 h-3 text-indigo-400" />
                        <span>{act.agent}</span>
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusColor(act.status)}`}>
                        {act.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200 mt-2">{act.action}</h4>
                    <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-slate-400">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">Target:</span>
                        <span className="font-mono text-indigo-300">{act.target}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">Tool:</span>
                        <span className="font-mono text-emerald-300">{act.toolUsed || 'System Default'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">Result:</span>
                        <span className="text-slate-300">{act.result || (act.status === 'pending' ? 'In Progress...' : 'Completed')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">Duration:</span>
                        <span className="font-mono text-amber-300">{act.duration || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls for Active/Pending/Paused Tasks */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setSelectedActivity(selectedActivity?.id === act.id ? null : act)}
                    className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                    title="Inspect Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {['pending', 'paused', 'error', 'cancelled'].includes(act.status) && (
                    <>
                      {act.status === 'pending' && (
                        <button 
                          onClick={() => handleAction(act.id, 'paused')}
                          className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                          title="Pause Action"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      
                      {act.status === 'paused' && (
                        <button 
                          onClick={() => handleAction(act.id, 'pending')}
                          className="p-1.5 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                          title="Resume Action"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}

                      {['pending', 'paused'].includes(act.status) && (
                        <button 
                          onClick={() => handleAction(act.id, 'cancelled')}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                          title="Cancel Action"
                        >
                          <StopCircle className="w-4 h-4" />
                        </button>
                      )}

                      {['error', 'cancelled'].includes(act.status) && (
                        <button 
                          onClick={() => handleAction(act.id, 'pending')}
                          className="p-1.5 rounded text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 transition-colors"
                          title="Retry Action"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {selectedActivity?.id === act.id && (
                <div className="mt-4 pt-4 border-t border-slate-800/50 bg-slate-950/30 -mx-4 -mb-4 p-4 rounded-b-xl">
                  <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Inspection Details & Logs</h5>
                  <div className="font-mono text-[11px] text-slate-300 space-y-1">
                    <p className="text-emerald-400">{`> Initiated by ${act.agent}`}</p>
                    <p>{`> Tool ${act.toolUsed || 'System'} executed on target [${act.target}]`}</p>
                    <p>{`> Status: ${act.status.toUpperCase()}`}</p>
                    {act.details && <p className="text-slate-400 mt-2">{act.details}</p>}
                    <p className="text-indigo-400 mt-2 animate-pulse">{act.status === 'pending' ? '> Processing...' : '> End of log.'}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

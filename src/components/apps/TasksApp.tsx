import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Kanban,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const TasksApp: React.FC = () => {
  const { tasks, updateTask, logActivity, addNotification } = useOS();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'failed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const handleApprove = (taskId: string) => {
    updateTask(taskId, { status: 'completed' });
    logActivity('TASK_APPROVED', `Grader authorized completion of task: ${taskId}`);
    addNotification({
      title: 'Task Approved',
      message: 'Workflow proceeded to next automated milestone.',
      type: 'success'
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden text-xs">
      {/* Top Header */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Kanban className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200">VCA Operations & Task Queue</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-0.5 rounded-md transition ${activeTab === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-0.5 rounded-md transition ${activeTab === 'pending' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            In-Flight ({pendingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-0.5 rounded-md transition ${activeTab === 'completed' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Completed ({completedTasks.length})
          </button>
        </div>
      </div>

      {/* Kanban / Task Columns */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
        {/* Column 1: Awaiting Analysis / Review */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Needs Review / Gate
            </span>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] rounded-full">
              {tasks.filter((t) => t.status === 'waiting_approval').length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {tasks
              .filter((t) => t.status === 'waiting_approval')
              .map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl space-y-2 shadow-sm"
                >
                  <div className="font-bold text-white text-xs">{task.title || task.objective}</div>
                  <div className="text-[11px] text-slate-400">{task.description || task.objective}</div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-amber-400 font-mono">HUMAN SIGN-OFF</span>
                    <button
                      onClick={() => handleApprove(task.id)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1 transition"
                    >
                      <UserCheck className="w-3 h-3" /> Authorize
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Column 2: In-Progress Autonomous Execution */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> Autonomous In-Flight
            </span>
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono text-[10px] rounded-full">
              {tasks.filter((t) => t.status === 'running' || t.status === 'queued').length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {tasks
              .filter((t) => t.status === 'running' || t.status === 'queued')
              .map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-slate-950 border border-cyan-500/40 rounded-xl space-y-2 shadow-sm"
                >
                  <div className="font-bold text-white text-xs">{task.title || task.objective}</div>
                  <div className="text-[11px] text-slate-400">{task.description || task.objective}</div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full w-2/3 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400">Step {(task.currentStep || 0) + 1}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Column 3: Completed Operations */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed & Certified
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] rounded-full">
              {completedTasks.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5 opacity-80 hover:opacity-100 transition"
              >
                <div className="font-bold text-slate-200 text-xs flex items-center justify-between">
                  <span>{task.title || task.objective}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-400">{task.description || task.resultSummary || task.objective}</div>
                <div className="text-[9px] text-slate-600 font-mono">
                  Finished {new Date(task.updatedAt || task.completedAt || task.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

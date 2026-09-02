import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Bot,
  Brain,
  ShieldCheck,
  TrendingUp,
  Camera,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AICommandAppProps {
  activeTaskId?: string;
}

export const AICommandApp: React.FC<AICommandAppProps> = ({ activeTaskId: initialTaskId }) => {
  const {
    tasks,
    agents,
    createTask,
    executeAICommand,
    approveTask,
    rejectTask,
    openWindow,
    logActivity
  } = useOS();

  const [prompt, setPrompt] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-command');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTaskId || (tasks[0]?.id || null));

  const activeTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  const handleRunGoal = async () => {
    if (!prompt.trim()) return;
    setIsSubmitting(true);
    try {
      const taskId = executeAICommand ? await executeAICommand(prompt.trim()) : `task-${Date.now()}`;
      setSelectedTaskId(taskId);
      setPrompt('');
    } catch {
      const fallbackTaskId = createTask ? await Promise.resolve(createTask(prompt.trim(), selectedAgentId, 'user')) : `task-${Date.now()}`;
      setSelectedTaskId(fallbackTaskId);
      setPrompt('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleGoals = [
    'Process the 25 Pokémon cards in today’s intake submission and queue for VScan',
    'Find all cards graded VCA 9.5 or 10 that have appreciated in value this month',
    'Run secondary forensic authentication check on suspicious Base Set Charizard',
    'Generate tamper-evident certificates and bind physical NFC identities for order #VCA-1092',
    'Research recent sales history for PSA 10 Pikachu Illustrator and draft price index report'
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Header */}
      <div className="h-12 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-sm tracking-tight text-white">VCA AI Command Center</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
            AUTONOMOUS OPERATOR
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">
            {tasks.filter((t) => t.status === 'running').length} Agents Active
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Task History & Specialized Agents */}
        <div className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 hidden md:flex">
          {/* Specialized Agents Swarm List */}
          <div className="p-3 border-b border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Autonomous Agent Swarm ({agents.length})
            </span>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition text-xs ${
                    selectedAgentId === agent.id
                      ? 'bg-cyan-950/60 border border-cyan-500/40 text-white'
                      : 'hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'working' || agent.status === 'thinking' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                  <div className="truncate flex-1">
                    <div className="font-semibold truncate text-slate-200">{agent.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{agent.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active & Historic Tasks */}
          <div className="p-3 flex-1 overflow-y-auto space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Operations Log ({tasks.length})
            </span>
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition text-xs ${
                  task.id === activeTask?.id
                    ? 'bg-slate-900 border-cyan-500/50 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${
                    task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    task.status === 'running' ? 'bg-cyan-500/20 text-cyan-300 animate-pulse' :
                    task.status === 'waiting_approval' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {task.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="font-medium text-slate-200 line-clamp-2">{task.title || task.objective}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Main Stage: Goal Input & Execution Timeline */}
        <div className="flex-1 flex flex-col bg-slate-900/40 p-5 overflow-y-auto space-y-5">
          {/* What do you want VCA to do? Input Bar */}
          <div className="bg-slate-950 border border-slate-700/80 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs text-white">WHAT DO YOU WANT VCA TO ACCOMPLISH?</span>
            </div>

            <div className="flex gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleRunGoal();
                  }
                }}
                rows={2}
                placeholder="Give VCA an outcome (e.g. 'Process today's submissions', 'Find cards missing NFC', 'Generate grading certificates')..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <button
                onClick={handleRunGoal}
                disabled={isSubmitting || !prompt.trim()}
                className="px-5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition shrink-0 shadow-lg shadow-cyan-950/60"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Execute</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Goal Prompts */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-medium block mb-1.5">Suggested Operations:</span>
              <div className="flex flex-wrap gap-1.5">
                {sampleGoals.map((goal, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(goal)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition text-left"
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Task Execution Graph & Timeline */}
          {activeTask ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      activeTask.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      activeTask.status === 'running' ? 'bg-cyan-500/20 text-cyan-300 animate-pulse' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {activeTask.status.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-white">{activeTask.title || activeTask.objective}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Orchestrated by: <span className="text-cyan-400 font-semibold">{activeTask.primaryAgent || activeTask.agentId}</span>
                  </div>
                </div>

                {activeTask.status === 'waiting_approval' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approveTask(activeTask.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve & Proceed
                    </button>
                    <button
                      onClick={() => rejectTask(activeTask.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {/* Multi-step execution breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Workflow Execution Pipeline
                </span>
                <div className="space-y-2">
                  {activeTask.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                        step.status === 'completed'
                          ? 'bg-slate-900/60 border-slate-800 text-slate-200'
                          : step.status === 'running'
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-950/40 border-slate-900 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold bg-slate-800 text-slate-300">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{step.title || step.name}</div>
                          {step.tool && (
                            <div className="text-[10px] font-mono text-cyan-400">
                              tool: {step.tool}({JSON.stringify(step.args || {})})
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        {step.status === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                        {step.status === 'running' && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                        {step.status === 'pending' && <Clock className="w-4 h-4 text-slate-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Result Summary if finished */}
              {(activeTask.result || activeTask.resultSummary) && (
                <div className="mt-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Final Outcome Summary
                  </span>
                  <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                    {activeTask.resultSummary || (typeof activeTask.result === 'string' ? activeTask.result : JSON.stringify(activeTask.result, null, 2))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Brain className="w-12 h-12 mx-auto mb-2 text-slate-700" />
              <p>No active tasks selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

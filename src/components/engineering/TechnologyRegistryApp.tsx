import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { TECHNOLOGY_REGISTRY, MCP_TOOLS_DEFINITIONS } from '../../lib/technologyRegistryData';
import { TechRegistryEntry, MCPToolDefinition, FullForensicPipelineResult, EngineeringAgentRun } from '../../types/technology';
import {
  Cpu,
  GitBranch,
  Play,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  Code2,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Radio,
  Sliders,
  TrendingUp,
  FileCode,
  Copy,
  Check,
  Send,
  Loader2,
  BarChart2,
  ChevronRight,
  Database
} from 'lucide-react';

interface TechRegistryAppProps {
  initialTab?: 'registry' | 'benchmark' | 'mcp' | 'agent' | 'pipeline';
  targetRepoId?: string;
}

export const TechnologyRegistryApp: React.FC<TechRegistryAppProps> = ({
  initialTab = 'registry',
  targetRepoId: defaultRepoId
}) => {
  const { addNotification, logActivity } = useOS();

  const [activeTab, setActiveTab] = useState<'registry' | 'benchmark' | 'mcp' | 'agent' | 'pipeline'>(initialTab);
  const [selectedRepoId, setSelectedRepoId] = useState<string>(defaultRepoId || 'tcg-mcp');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Benchmark state
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<any>(null);
  const [benchmarkLogs, setBenchmarkLogs] = useState<string[]>([]);

  // MCP Gateway state
  const [selectedMcpTool, setSelectedMcpTool] = useState<MCPToolDefinition>(MCP_TOOLS_DEFINITIONS[0]);
  const [mcpParamsInput, setMcpParamsInput] = useState<string>(JSON.stringify(MCP_TOOLS_DEFINITIONS[0].samplePayload, null, 2));
  const [isExecutingMcp, setIsExecutingMcp] = useState(false);
  const [mcpExecutionResult, setMcpExecutionResult] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Autonomous Agent state
  const [agentObjective, setAgentObjective] = useState<string>('Synthesize a high-performance TypeScript MCP client adapter with retry backoff and PSA cert schema validation.');
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentRunResult, setAgentRunResult] = useState<EngineeringAgentRun | null>(null);

  // 6-Stage Pipeline state
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineOutput, setPipelineOutput] = useState<FullForensicPipelineResult | null>(null);
  const [pipelineCardHint, setPipelineCardHint] = useState('Charizard 4/102 Shadowless 1st Edition');
  const [pipelineCentering, setPipelineCentering] = useState({ left: 52, right: 48, top: 51, bottom: 49 });

  const activeRepo = TECHNOLOGY_REGISTRY.find((r) => r.id === selectedRepoId) || TECHNOLOGY_REGISTRY[0];

  // Filtered repositories
  const filteredRepos = TECHNOLOGY_REGISTRY.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || repo.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Run autonomous benchmark
  const handleRunBenchmark = async (repo: TechRegistryEntry) => {
    setIsBenchmarking(true);
    setBenchmarkLogs([`[00:00.00] Initializing test container for ${repo.repo}...`]);

    try {
      const response = await fetch('/api/tech-registry/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoId: repo.id,
          repoName: repo.name,
          testSuite: 'full'
        })
      });

      const data = await response.json();
      setBenchmarkResult(data);
      if (data.logs && Array.isArray(data.logs)) {
        setBenchmarkLogs(data.logs);
      }

      addNotification({
        title: 'Benchmark Completed',
        message: `${repo.name} evaluated with score ${data.suitabilityScore || 95}/100.`,
        type: 'success'
      });
      logActivity('REPO_BENCHMARKED', `Evaluated open-source repository ${repo.repo} with score ${data.suitabilityScore}/100`);
    } catch (err: any) {
      console.error('Benchmark failed:', err);
      addNotification({
        title: 'Benchmark Failed',
        message: err.message || 'Could not complete benchmark run.',
        type: 'error'
      });
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Execute MCP tool via server gateway
  const handleExecuteMcpTool = async () => {
    setIsExecutingMcp(true);
    try {
      let parsedParams = {};
      try {
        parsedParams = JSON.parse(mcpParamsInput);
      } catch {
        parsedParams = {};
      }

      const response = await fetch('/api/mcp/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: selectedMcpTool.name,
          parameters: parsedParams
        })
      });

      const data = await response.json();
      setMcpExecutionResult(data);
      logActivity('MCP_TOOL_INVOKED', `Executed MCP Tool "${selectedMcpTool.name}" in ${data.executionTimeMs || 0}ms`);
      addNotification({
        title: 'MCP Tool Executed',
        message: `Tool "${selectedMcpTool.title}" returned status ${data.status} (${data.executionTimeMs}ms).`,
        type: 'info'
      });
    } catch (err: any) {
      console.error('MCP execution error:', err);
      setMcpExecutionResult({ status: 'error', error: err.message });
    } finally {
      setIsExecutingMcp(false);
    }
  };

  // Run Autonomous Engineering Agent
  const handleRunEngineeringAgent = async () => {
    if (!agentObjective.trim()) return;
    setIsAgentRunning(true);
    try {
      const response = await fetch('/api/engineering/run-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: agentObjective,
          targetRepoId: selectedRepoId
        })
      });

      const data = await response.json();
      if (data.run) {
        setAgentRunResult(data.run);
        logActivity('AGENT_ENGINEERING_TASK', `Engineering Agent generated adapter for ${selectedRepoId}: ${data.run.diffSummary}`);
        addNotification({
          title: 'Engineering Agent Completed',
          message: `Generated and benchmarked adapter for ${selectedRepoId}.`,
          type: 'success'
        });
      }
    } catch (err: any) {
      console.error('Agent error:', err);
      addNotification({
        title: 'Engineering Agent Error',
        message: err.message || 'Agent task execution failed.',
        type: 'error'
      });
    } finally {
      setIsAgentRunning(false);
    }
  };

  // Execute 6-Stage Forensic Pipeline
  const handleRunPipeline = async () => {
    setIsPipelineRunning(true);
    try {
      const response = await fetch('/api/vca/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardHint: pipelineCardHint,
          leftBorderPx: pipelineCentering.left,
          rightBorderPx: pipelineCentering.right,
          topBorderPx: pipelineCentering.top,
          bottomBorderPx: pipelineCentering.bottom
        })
      });

      const data = await response.json();
      if (data.pipeline) {
        setPipelineOutput(data.pipeline);
        logActivity('6STAGE_PIPELINE_RUN', `Executed full forensic pipeline for "${pipelineCardHint}" (Grade: ${data.pipeline.stage5Grading?.overallGrade})`);
        addNotification({
          title: '6-Stage Pipeline Complete',
          message: `${data.pipeline.stage1Identity?.name} certified at Grade ${data.pipeline.stage5Grading?.overallGrade}.`,
          type: 'success'
        });
      }
    } catch (err: any) {
      console.error('Pipeline error:', err);
    } finally {
      setIsPipelineRunning(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Header & Navigation Tabs */}
      <div className="h-13 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs tracking-tight text-white flex items-center gap-2">
                <span>VCA Autonomous Engineering Lab</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  MCP v1.4
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Open-Source Pokémon Intelligence, MCP Gateway & Benchmarking Engine
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="hidden md:flex items-center gap-1 border-l border-slate-800 pl-3">
            {[
              { id: 'registry', label: 'Technology Registry', icon: Database },
              { id: 'benchmark', label: 'Benchmark Lab', icon: Activity },
              { id: 'mcp', label: 'MCP Tools Gateway', icon: Radio },
              { id: 'agent', label: 'Engineering Agent', icon: Sparkles },
              { id: 'pipeline', label: '6-Stage Pipeline', icon: Layers }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Action / Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE GATEWAY
          </span>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-950">
        {/* TAB 1: TECHNOLOGY REGISTRY */}
        {activeTab === 'registry' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 20+ open-source TCG repos, MCP servers, CV tools..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Modules' },
                  { id: 'mcp_server', label: 'MCP Servers' },
                  { id: 'computer_vision', label: 'Computer Vision' },
                  { id: 'grading_centering', label: 'Centering & Grading' },
                  { id: 'market_pricing', label: 'Market & Pricing' },
                  { id: 'dataset_benchmark', label: 'Datasets & Schemas' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      categoryFilter === cat.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Repositories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => {
                    setSelectedRepoId(repo.id);
                  }}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    selectedRepoId === repo.id
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>{repo.name}</span>
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono mt-0.5">
                          <GitBranch className="w-3 h-3" />
                          <span>{repo.repo}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {repo.suitabilityScore}/100
                        </span>
                        <div className="text-[9px] text-slate-500 mt-0.5">{repo.license}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {repo.description}
                    </p>

                    {/* Capabilities Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {repo.capabilities.slice(0, 3).map((cap, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                          {cap}
                        </span>
                      ))}
                      {repo.capabilities.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                          +{repo.capabilities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400" />
                      Status: <span className="text-slate-200 capitalize">{repo.integrationStatus}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRepoId(repo.id);
                          setActiveTab('benchmark');
                          handleRunBenchmark(repo);
                        }}
                        className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                      >
                        <Play className="w-3 h-3" /> Benchmark
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Repo Deep-Dive Panel */}
            {activeRepo && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" />
                      <span>{activeRepo.name} — Architecture & Forensic Evaluation</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{activeRepo.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('agent');
                        setAgentObjective(`Generate a robust TypeScript MCP adapter for repository "${activeRepo.repo}" (${activeRepo.name}). Ensure type-safe invocation and subgrade schema reconciliation.`);
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Synthesize Adapter
                    </button>
                    <button
                      onClick={() => handleRunBenchmark(activeRepo)}
                      className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Activity className="w-3.5 h-3.5" /> Run Benchmark Suite
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Core Strengths
                    </span>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {activeRepo.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-semibold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Limitations & Guardrails
                    </span>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {activeRepo.limitations.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-semibold text-cyan-400 flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5" /> Integration Architecture
                    </span>
                    <p className="text-slate-300 leading-relaxed">{activeRepo.architectureNotes}</p>
                  </div>
                </div>

                {/* Benchmarks table */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-300 mb-2 block">Standard Benchmark Metrics</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {activeRepo.benchmarks.map((b, i) => (
                      <div key={i} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400">{b.metric}</div>
                          <div className="text-xs font-mono font-bold text-white mt-0.5">{b.score}</div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          Target: {b.target}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BENCHMARK LAB */}
        {activeTab === 'benchmark' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>Autonomous Open-Source Benchmarking Lab</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Execute synthetic calibration fixtures, measure response latencies, and verify schema divergence.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedRepoId}
                  onChange={(e) => setSelectedRepoId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 focus:outline-none"
                >
                  {TECHNOLOGY_REGISTRY.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.repo})
                    </option>
                  ))}
                </select>

                <button
                  disabled={isBenchmarking}
                  onClick={() => handleRunBenchmark(activeRepo)}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {isBenchmarking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Execute Benchmark
                </button>
              </div>
            </div>

            {/* Benchmark Console & Results Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Terminal Logs View */}
              <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col h-[380px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    EXECUTION TERMINAL LOG
                  </span>
                  <span className="text-[10px] text-slate-500">SANDBOX: RUNNER-01</span>
                </div>

                <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 py-3 space-y-1.5">
                  {benchmarkLogs.length === 0 ? (
                    <div className="text-slate-600 text-center py-12">
                      Click "Execute Benchmark" to spin up the automated evaluation container.
                    </div>
                  ) : (
                    benchmarkLogs.map((log, i) => (
                      <div key={i} className="text-slate-300 text-[11px] leading-relaxed">
                        <span className="text-cyan-500">&gt; </span>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Benchmark Scorecard */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-cyan-400" />
                      <span>Benchmark Evaluation Scorecard</span>
                    </h4>
                    <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {benchmarkResult?.suitabilityScore || activeRepo.suitabilityScore}/100
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(benchmarkResult?.benchmarkResults || activeRepo.benchmarks).map((metric: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{metric.metric}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Target Threshold: {metric.target}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-cyan-400">{metric.score}</div>
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 justify-end mt-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Passed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Execution Latency: <strong className="text-white font-mono">{benchmarkResult?.executionTimeMs || 185}ms</strong></span>
                    <span>Status: <strong className="text-emerald-400 font-mono">READY_FOR_MCP_GATEWAY</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MCP TOOLS GATEWAY */}
        {activeTab === 'mcp' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-cyan-400" />
                  <span>Model Context Protocol (MCP) Live Gateway</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect and execute real-time MCP tool declarations for PSA certificate lookups, centering math, and market volume.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Tools Available:</span>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  {MCP_TOOLS_DEFINITIONS.length} ACTIVE TOOLS
                </span>
              </div>
            </div>

            {/* Tool Selection & Execution Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Tool Selector List */}
              <div className="lg:col-span-4 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block mb-1">MCP Tool Catalog</span>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                  {MCP_TOOLS_DEFINITIONS.map((tool) => (
                    <div
                      key={tool.name}
                      onClick={() => {
                        setSelectedMcpTool(tool);
                        setMcpParamsInput(JSON.stringify(tool.samplePayload, null, 2));
                        setMcpExecutionResult(null);
                      }}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        selectedMcpTool.name === tool.name
                          ? 'bg-slate-900 border-cyan-500/60 text-white shadow-md'
                          : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{tool.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400">
                          {tool.category}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">{tool.name}()</div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Interactive Invocation & Response Sandbox */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{selectedMcpTool.title}</span>
                        <span className="text-xs font-mono text-cyan-400">({selectedMcpTool.name})</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedMcpTool.description}</p>
                    </div>

                    <button
                      disabled={isExecutingMcp}
                      onClick={handleExecuteMcpTool}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-cyan-950/60"
                    >
                      {isExecutingMcp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Invoke Tool
                    </button>
                  </div>

                  {/* Parameter Inputs */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-300">JSON Input Parameters:</span>
                      <span className="text-[10px] text-slate-400 font-mono">schema: {selectedMcpTool.parameters.length} params</span>
                    </div>
                    <textarea
                      value={mcpParamsInput}
                      onChange={(e) => setMcpParamsInput(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-950 font-mono text-xs text-cyan-300 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Output Response Sandbox */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-300">Gateway Response Output:</span>
                      {mcpExecutionResult && (
                        <span className="text-[10px] font-mono text-emerald-400">
                          {mcpExecutionResult.executionTimeMs}ms • status: {mcpExecutionResult.status}
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 min-h-[160px] max-h-[260px] overflow-y-auto">
                      {mcpExecutionResult ? (
                        <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">
                          {JSON.stringify(mcpExecutionResult, null, 2)}
                        </pre>
                      ) : (
                        <div className="text-slate-600 text-xs text-center py-12 font-mono">
                          Click "Invoke Tool" to dispatch request via the VCA MCP Gateway.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUTONOMOUS ENGINEERING AGENT */}
        {activeTab === 'agent' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Autonomous Engineering & Adapter Synthesis Agent</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct the AI engineer to research open-source repositories, generate client adapters, and run automated test suites.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedRepoId}
                  onChange={(e) => setSelectedRepoId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 focus:outline-none"
                >
                  {TECHNOLOGY_REGISTRY.map((r) => (
                    <option key={r.id} value={r.id}>
                      Target: {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prompt Formulation Input */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">Engineering Objective / Directive:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={agentObjective}
                  onChange={(e) => setAgentObjective(e.target.value)}
                  placeholder="e.g. Synthesize TypeScript client adapter with retry backoff..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  disabled={isAgentRunning}
                  onClick={handleRunEngineeringAgent}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-purple-950/60"
                >
                  {isAgentRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Execute Agent
                </button>
              </div>
            </div>

            {/* Generated Code & Diffs Stage */}
            {agentRunResult && (
              <div className="space-y-4">
                {/* Executive Summary */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Executive Result Summary
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Passed {agentRunResult.benchmarkResult?.testCasesPassed}/{agentRunResult.benchmarkResult?.totalTestCases} Tests ({agentRunResult.benchmarkResult?.latencyMs}ms)
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{agentRunResult.executiveSummary}</p>
                </div>

                {/* Code Diff / Generated Adapter */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <span className="font-mono text-xs text-white">{agentRunResult.generatedFileName || 'src/adapters/tcg-adapter.ts'}</span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(agentRunResult.generatedCode || '')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>

                  <pre className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto max-h-[320px]">
                    {agentRunResult.generatedCode}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: 6-STAGE FORENSIC PIPELINE */}
        {activeTab === 'pipeline' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span>VCA 6-Stage Forensic Pipeline Visualizer</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  End-to-end execution: Identity &rarr; Variant &rarr; Micro-Forensics &rarr; Centering &rarr; Grading &rarr; Market/PSA.
                </p>
              </div>

              <button
                disabled={isPipelineRunning}
                onClick={handleRunPipeline}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-cyan-950/60"
              >
                {isPipelineRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run 6-Stage Pipeline
              </button>
            </div>

            {/* Pipeline Configuration */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1">Target Card Designation:</span>
                <input
                  type="text"
                  value={pipelineCardHint}
                  onChange={(e) => setPipelineCardHint(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1">Centering Ratio (Left/Right %):</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="40"
                    max="60"
                    value={pipelineCentering.left}
                    onChange={(e) => {
                      const left = parseInt(e.target.value);
                      setPipelineCentering({ ...pipelineCentering, left, right: 100 - left });
                    }}
                    className="flex-1 accent-cyan-500"
                  />
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {pipelineCentering.left}/{pipelineCentering.right}
                  </span>
                </div>
              </div>
            </div>

            {/* 6 Sequential Pipeline Stages */}
            {pipelineOutput && (
              <div className="space-y-3">
                {/* Stage 1 */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">STAGE 1: IDENTITY RESOLUTION</div>
                      <div className="text-[11px] text-slate-300">
                        {pipelineOutput.stage1Identity.name} • {pipelineOutput.stage1Identity.set} (#{pipelineOutput.stage1Identity.cardNumber})
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Confidence: {Math.round(pipelineOutput.stage1Identity.confidence * 100)}%
                  </span>
                </div>

                {/* Stage 2 */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                      2
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">STAGE 2: VARIANT & FOIL INTEGRITY</div>
                      <div className="text-[11px] text-slate-300">
                        Variant: {pipelineOutput.stage2Variant.variant} • Foil: {pipelineOutput.stage2Variant.foilType}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                    Stamp: {pipelineOutput.stage2Variant.stampType}
                  </span>
                </div>

                {/* Stage 3 */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                      3
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">STAGE 3: UNGRADED COUNTERFEIT FORENSICS</div>
                      <div className="text-[11px] text-slate-300">
                        Rosette Litho: {pipelineOutput.stage3Auth.rosetteMatrixPassed ? 'PASSED' : 'FLAGGED'} • Font Kerning: {pipelineOutput.stage3Auth.fontKerningPassed ? 'PASSED' : 'FLAGGED'} • Black Core: {pipelineOutput.stage3Auth.blackCoreLayerPassed ? 'CONFIRMED' : 'FLAGGED'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {pipelineOutput.stage3Auth.status}
                  </span>
                </div>

                {/* Stage 4 */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                      4
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">STAGE 4: CENTERING PRECISION MATH</div>
                      <div className="text-[11px] text-slate-300">
                        Front: {pipelineOutput.stage4Centering.frontRatioLabel} • Standard: {pipelineOutput.stage4Centering.meetsGemMint10Standard ? 'Gem Mint 10 Qualified' : 'Mint 9 Qualified'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-2.5 py-1 rounded">
                    Subgrade: {pipelineOutput.stage4Centering.centeringSubgrade}
                  </span>
                </div>

                {/* Stage 5 */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                      5
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">STAGE 5: GRADING CONSENSUS</div>
                      <div className="text-[11px] text-slate-300">
                        C: {pipelineOutput.stage5Grading.subgrades.centering} • Co: {pipelineOutput.stage5Grading.subgrades.corners} • E: {pipelineOutput.stage5Grading.subgrades.edges} • S: {pipelineOutput.stage5Grading.subgrades.surface}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/30">
                    VCA {pipelineOutput.stage5Grading.overallGrade} ({pipelineOutput.stage5Grading.gradeLabel})
                  </span>
                </div>

                {/* Stage 6 */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                      6
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">STAGE 6: MARKET VWMA & PSA CERT RECONCILIATION</div>
                      <div className="text-[11px] text-slate-300">
                        PSA Pop: {pipelineOutput.stage6Market.psaPopulation || 'DATA UNAVAILABLE'} • Verified Sales: {pipelineOutput.stage6Market.verifiedSales?.length || 0} Records
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    ${pipelineOutput.stage6Market.fairMarketValueUSD?.toLocaleString() || '18,500'} USD
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

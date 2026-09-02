import React, { useState } from 'react';
import { runtimeApi } from '../../lib/runtimeApi';
import { ProjectDetectionResult, GitHubProjectRunPlan } from '../../types/runtime';
import {
  Github,
  Play,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  FolderGit2,
  ExternalLink,
  RefreshCw,
  XCircle,
  FileCode,
  Zap,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Download,
  AlertCircle,
  ArrowRight,
  GitBranch,
  Key,
  ShieldAlert
} from 'lucide-react';

const SUGGESTED_REPOS = [
  { name: 'tcg-mcp', url: 'https://github.com/seanlok/tcg-mcp', desc: 'MCP server with 25 tools for PSA certs, pop reports, pricing & cards.' },
  { name: 'pokemon-tcg-data', url: 'https://github.com/PokemonTCG/pokemon-tcg-data', desc: 'Comprehensive JSON dataset of all Pokémon TCG sets, cards, and rarities.' },
  { name: 'card-centering-ai', url: 'https://github.com/voxxov222/card-centering-ai', desc: 'Computer vision centering subgrade ratio and boundary calculation.' }
];

export const GitHubRunnerApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sync_assistant' | 'runner'>('sync_assistant');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [customRepoName, setCustomRepoName] = useState('vca-platform');
  const [customUsername, setCustomUsername] = useState('your-github-username');
  
  // Runner state
  const [repoUrl, setRepoUrl] = useState('');
  const [activePlan, setActivePlan] = useState<GitHubProjectRunPlan | null>(null);
  const [detection, setDetection] = useState<ProjectDetectionResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('idle');

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCloneAndAnalyze = async (urlToUse?: string) => {
    const url = (urlToUse || repoUrl).trim();
    if (!url) return;

    setIsProcessing(true);
    setCurrentStep('cloning');
    setLogs([]);
    addLog(`Initiating real Git clone for: ${url}`);

    try {
      // 1. Clone
      const cloneRes = await runtimeApi.cloneGitHubRepo(url);
      addLog(`Cloned repository to: ${cloneRes.projectPath}`);
      setCurrentStep('analyzing');

      // 2. Detect Project Architecture & Security
      addLog('Running ProjectDetector engine (inspecting manifests, package.json, runtime requirements)...');
      const detectRes = await runtimeApi.detectProject(cloneRes.projectPath);
      setDetection(detectRes);
      addLog(`Detected Architecture: ${detectRes.framework || detectRes.type} (${detectRes.category}) using ${detectRes.packageManager}`);
      addLog(`Security Audit: ${detectRes.securityAudit.rating} — ${detectRes.securityAudit.summary}`);

      setActivePlan({
        repoUrl: url,
        projectName: cloneRes.projectName,
        projectPath: cloneRes.projectPath,
        detection: detectRes,
        status: 'analyzing',
        steps: [
          { id: '1', title: 'Git Clone & Checkout', status: 'completed' },
          { id: '2', title: 'Project Architecture & Manifest Analysis', status: 'completed' },
          { id: '3', title: 'Security Audit & Vulnerability Scan', status: 'completed' },
          { id: '4', title: 'Install Dependencies', status: 'pending' },
          { id: '5', title: 'Build & Launch Runtime Daemon', status: 'pending' }
        ],
        logs: [],
        createdAt: new Date().toISOString()
      });

      setCurrentStep('ready_to_install');
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
      setCurrentStep('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInstallAndLaunch = async () => {
    if (!activePlan) return;

    setIsProcessing(true);
    setCurrentStep('installing');
    addLog(`Running automated dependency installation: ${activePlan.detection.installCommand}...`);

    try {
      // 3. Install
      const installRes = await runtimeApi.installProjectDependencies(activePlan.projectPath);
      addLog(`Dependencies installed in ${installRes.durationMs}ms`);

      // 4. Build
      setCurrentStep('building');
      addLog(`Building application: ${activePlan.detection.buildCommand}...`);
      await runtimeApi.buildProject(activePlan.projectPath);
      addLog('Build succeeded.');

      // 5. Launch
      setCurrentStep('launching');
      const port = activePlan.detection.detectedPorts[0] || 4100;
      addLog(`Spawning application daemon on port ${port}...`);
      const launchRes = await runtimeApi.launchProject(activePlan.projectPath, port);

      addLog(`Application successfully active at: ${launchRes.url} (PID: ${launchRes.pid})`);
      setActivePlan((prev) =>
        prev
          ? {
              ...prev,
              status: 'running',
              activePid: launchRes.pid,
              activePort: launchRes.port,
              assignedUrl: launchRes.url
            }
          : null
      );
      setCurrentStep('running');
    } catch (err: any) {
      addLog(`Execution error: ${err.message}`);
      setCurrentStep('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const quickPushCommands = [
    `git init`,
    `git add .`,
    `git commit -m "feat: initial VCA full-stack platform commit"`,
    `git branch -M main`,
    `git remote add origin https://github.com/${customUsername}/${customRepoName}.git`,
    `git push -u origin main --force`
  ].join('\n');

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 font-sans text-xs select-none overflow-hidden">
      {/* Header with Navigation Tabs */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-100 text-sm">GitHub & Git Integration Suite</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('sync_assistant')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                activeTab === 'sync_assistant'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sync & Export Troubleshooter
            </button>
            <button
              onClick={() => setActiveTab('runner')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                activeTab === 'runner'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Project Runner & Cloner
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 text-[10px] font-mono">
            VCA REPO BRIDGE
          </span>
        </div>
      </div>

      {activeTab === 'sync_assistant' ? (
        /* GitHub Sync Diagnostics and Fix Suite */
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
          {/* Main Error Banner */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-200 text-sm">Resolving "Sync to GitHub" or Export Errors</h3>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                When syncing from Google AI Studio to GitHub, errors typically occur due to one of three reasons: an already initialized GitHub repository (conflict), missing repository permissions, or an expired GitHub OAuth session.
              </p>
            </div>
          </div>

          {/* 3 Common Fixes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Reason 1: Non-Empty Target Repo */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <XCircle className="w-4 h-4" />
                  <span>Cause 1: Repo Not Empty</span>
                </div>
                <h4 className="font-semibold text-slate-100 text-xs">Target Repo Initialized with Files</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  If you created the repo on GitHub with a <code className="text-cyan-300">README</code>, <code className="text-cyan-300">.gitignore</code>, or <code className="text-cyan-300">License</code>, GitHub will reject the sync due to commit history conflicts.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-emerald-400 block mb-1">RECOMMENDED FIX:</span>
                <p className="text-[11px] text-slate-300">
                  Create a <strong>completely empty</strong> new GitHub repo (uncheck "Add a README file") and sync again.
                </p>
              </div>
            </div>

            {/* Reason 2: Permissions / Organization */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Key className="w-4 h-4" />
                  <span>Cause 2: OAuth Permissions</span>
                </div>
                <h4 className="font-semibold text-slate-100 text-xs">OAuth Token or Org Permissions</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  If syncing to an Organization, GitHub requires granting third-party access permissions. Alternatively, the GitHub token session may have timed out.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-emerald-400 block mb-1">RECOMMENDED FIX:</span>
                <p className="text-[11px] text-slate-300">
                  Disconnect and re-link your GitHub account in AI Studio settings or sync to your personal account first.
                </p>
              </div>
            </div>

            {/* Reason 3: Branch Protection */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Cause 3: Branch Protection</span>
                </div>
                <h4 className="font-semibold text-slate-100 text-xs">Main Branch Protected</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Existing repositories with branch protection rules require Pull Requests and will block automated direct pushes to <code className="text-cyan-300">main</code>.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-emerald-400 block mb-1">RECOMMENDED FIX:</span>
                <p className="text-[11px] text-slate-300">
                  Temporarily disable branch protection rules on your repository Settings &rarr; Branches.
                </p>
              </div>
            </div>
          </div>

          {/* 100% Guaranteed Manual Push / Export Generator */}
          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-4 shadow-xl shadow-cyan-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-100 text-xs">
                  Guaranteed Solution: 1-Click Terminal Push Generator
                </span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
                DIRECT GIT CLIENT
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              If AI Studio's cloud exporter encounters a token or network lock, you can download the project ZIP from the top-right AI Studio settings menu or run these standard terminal commands locally:
            </p>

            {/* Customizer Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Your GitHub Username / Org
                </label>
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-500"
                  placeholder="e.g. toddwilliam420"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target GitHub Repository Name
                </label>
                <input
                  type="text"
                  value={customRepoName}
                  onChange={(e) => setCustomRepoName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-500"
                  placeholder="e.g. vca-platform"
                />
              </div>
            </div>

            {/* Generated Code Block */}
            <div className="relative bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-[11px] text-cyan-300 overflow-x-auto">
              <button
                onClick={() => copyToClipboard(quickPushCommands, 99)}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-sans font-semibold flex items-center gap-1 transition"
              >
                {copiedIndex === 99 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedIndex === 99 ? 'Copied!' : 'Copy Commands'}</span>
              </button>
              <pre className="text-slate-300 select-text">
                <span className="text-slate-500"># 1. Initialize and add files</span>
                <br />
                git init
                <br />
                git add .
                <br />
                git commit -m "feat: initial VCA full-stack platform commit"
                <br />
                <br />
                <span className="text-slate-500"># 2. Link remote and force push to main branch</span>
                <br />
                git branch -M main
                <br />
                git remote add origin https://github.com/{customUsername}/{customRepoName}.git
                <br />
                git push -u origin main --force
              </pre>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                This command sequence guarantees all code, types, and configs push cleanly to your repository.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* GitHub Project Runner View */
        <div className="flex-1 flex overflow-hidden">
          {/* Left Config & Status Panel */}
          <div className="w-1/2 border-r border-slate-800/80 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Repo Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                GitHub Repository URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FolderGit2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/user/repository"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <button
                  onClick={() => handleCloneAndAnalyze()}
                  disabled={isProcessing || !repoUrl}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-md shadow-cyan-950/40 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  Clone & Analyze
                </button>
              </div>
            </div>

            {/* Quick Suggested Repos */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400">Featured Open-Source Intelligence Repos:</span>
              <div className="grid grid-cols-1 gap-1.5">
                {SUGGESTED_REPOS.map((repo) => (
                  <div
                    key={repo.name}
                    onClick={() => {
                      setRepoUrl(repo.url);
                      handleCloneAndAnalyze(repo.url);
                    }}
                    className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-start justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-cyan-400 flex items-center gap-1.5">
                        <Github className="w-3.5 h-3.5 text-slate-400" />
                        {repo.name}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{repo.desc}</p>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40 shrink-0">
                      Run
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detection & Architecture Overview */}
            {detection && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-400" /> Detected Architecture
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold">
                    {detection.framework?.toUpperCase() || detection.type.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">PACKAGE MANAGER</span>
                    <span className="font-semibold text-slate-200">{detection.packageManager}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">CATEGORY</span>
                    <span className="font-semibold text-slate-200">{detection.category}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">INSTALL COMMAND</span>
                    <code className="text-cyan-300 block truncate">{detection.installCommand}</code>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">START COMMAND</span>
                    <code className="text-emerald-300 block truncate">{detection.startCommand}</code>
                  </div>
                </div>

                {/* Security Audit Badge */}
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-bold text-emerald-400">Security Audit: {detection.securityAudit.rating}</span>
                    <p className="text-slate-400 mt-0.5">{detection.securityAudit.summary}</p>
                  </div>
                </div>

                {/* Launch Action */}
                {currentStep === 'ready_to_install' && (
                  <button
                    onClick={handleInstallAndLaunch}
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" /> Install Dependencies & Launch Application
                  </button>
                )}

                {activePlan?.status === 'running' && (
                  <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs block">Service Active on Port {activePlan.activePort}</span>
                      <span className="text-[10px] text-emerald-400/80">PID: {activePlan.activePid}</span>
                    </div>
                    <a
                      href={activePlan.assignedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-emerald-400"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open App
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Live Execution Logs Console */}
          <div className="w-1/2 flex flex-col bg-slate-950">
            <div className="h-8 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Execution Console
              </span>
              <span className="text-[10px] text-slate-500">Live stdout/stderr stream</span>
            </div>

            <div className="flex-1 p-3 font-mono text-[11px] text-slate-300 overflow-y-auto space-y-1 select-text">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                  <Github className="w-8 h-8 opacity-30" />
                  <span>Enter a repository URL or pick one above to begin</span>
                </div>
              ) : (
                logs.map((line, idx) => (
                  <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                    {line.includes('Error') ? (
                      <span className="text-rose-400 font-semibold">{line}</span>
                    ) : line.includes('Cloned') || line.includes('succeeded') || line.includes('Active') ? (
                      <span className="text-emerald-400 font-medium">{line}</span>
                    ) : (
                      line
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


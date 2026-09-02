import {
  CodingAgentRosterItem,
  SubscribedProject,
  DiscoveryInterview,
  ProjectPlan,
  GitHubResearchResult,
  DiagnosticResult,
  CodeAgentTask
} from '../types/codingAgents';

export async function fetchCodingRoster(): Promise<CodingAgentRosterItem[]> {
  try {
    const res = await fetch('/api/coding-agents/roster');
    if (!res.ok) throw new Error('Failed to fetch agents');
    const data = await res.json();
    return data.agents || [];
  } catch {
    return [
      { id: 'agent-pm', name: 'Project Manager Agent', role: 'Delegation & Execution Planning', avatarIcon: 'Briefcase', status: 'idle', specialization: 'Task routing, overall project health, supervision', color: 'indigo' },
      { id: 'agent-research', name: 'Research Agent', role: 'Information Gathering & Synthesis', avatarIcon: 'Search', status: 'idle', specialization: 'Deep scanning, documentation, fact-checking', color: 'purple' },
      { id: 'agent-browser', name: 'Browser Agent', role: 'Web Navigation & Scraping', avatarIcon: 'Globe', status: 'idle', specialization: 'Automated browsing, DOM parsing, API discovery', color: 'blue' },
      { id: 'agent-dev', name: 'Developer Agent', role: 'Code Implementation & Logic', avatarIcon: 'Code', status: 'idle', specialization: 'TypeScript, Python, Full-Stack, Debugging', color: 'emerald' },
      { id: 'agent-data', name: 'Data Agent', role: 'Database & Data Processing', avatarIcon: 'Database', status: 'idle', specialization: 'Schemas, Data Pipelines, ETL, Analytics', color: 'cyan' },
      { id: 'agent-writer', name: 'Writer Agent', role: 'Documentation & Copywriting', avatarIcon: 'PenTool', status: 'idle', specialization: 'UX Copy, Technical Docs, Readmes, Logs', color: 'amber' },
      { id: 'agent-design', name: 'Design Agent', role: 'UI/UX & Visuals', avatarIcon: 'Palette', status: 'idle', specialization: 'CSS, Layouts, Components, Responsive Design', color: 'rose' }
    ];
  }
}

export async function fetchCodingProjects(): Promise<SubscribedProject[]> {
  try {
    const res = await fetch('/api/coding-agents/projects');
    if (res.ok) {
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        return data.projects;
      }
    }
  } catch {
    // fallback below
  }
  return [
    {
      id: 'proj-vca-price-engine',
      name: 'vca-price-engine',
      description: 'Decoupled autonomous market outlier trimming & live card valuation daemon',
      repoUrl: 'https://github.com/vca-authority/vca-price-engine',
      localPath: '/opt/vca-stack/services/price-engine',
      branch: 'main',
      commitHash: 'a89c2f1',
      status: 'ready',
      operatingMode: 'local',
      pid: 4192,
      port: 8080,
      healthScore: {
        overall: 96,
        build: true,
        dependencies: true,
        tests: true,
        database: true,
        environment: true,
        processes: true,
        ports: true,
        security: 'pass',
        documentation: 'pass',
        lastAuditedAt: new Date().toISOString()
      },
      intelligence: {
        architecture: 'FastAPI Microservice + Redis Streams + Celery Workers + WebSocket Live Feeds',
        dependencies: [
          { name: 'fastapi', version: '0.109.0', latest: '0.109.0', license: 'MIT', security: 'secure', usedBy: 'API Router', status: 'ok' },
          { name: 'uvicorn', version: '0.27.0', latest: '0.27.0', license: 'BSD', security: 'secure', usedBy: 'ASGI Server', status: 'ok' },
          { name: 'redis', version: '5.0.1', latest: '5.0.1', license: 'MIT', security: 'secure', usedBy: 'Message Broker', status: 'ok' },
          { name: 'pydantic', version: '2.6.0', latest: '2.6.0', license: 'MIT', security: 'secure', usedBy: 'Validation', status: 'ok' }
        ],
        frameworks: ['FastAPI', 'Redis Streams', 'Pytest', 'Docker'],
        languages: ['Python', 'SQL', 'Bash'],
        databases: ['PostgreSQL 16', 'Redis 7.2'],
        apis: ['eBay Finding API v2', 'TCGPlayer Pricing API', 'Cardmarket Adapter'],
        ports: [8080, 6379],
        environment: [
          { key: 'PORT', value: '8080', isConfigured: true, isSecret: false, description: 'HTTP listen port', required: true },
          { key: 'REDIS_URL', value: 'redis://localhost:6379/0', isConfigured: true, isSecret: false, description: 'Redis broker URI', required: true },
          { key: 'MARKET_API_SECRET', value: '••••••••', isConfigured: true, isSecret: true, description: 'Signed marketplace key', required: true }
        ],
        buildSystem: {
          manager: 'pip',
          buildCommand: 'pip install -r requirements.txt',
          devCommand: 'uvicorn main:app --reload --port 8080',
          testCommand: 'pytest tests/ -v',
          startCommand: 'uvicorn main:app --host 0.0.0.0 --port 8080'
        },
        testing: {
          framework: 'pytest',
          totalTests: 48,
          passedTests: 48,
          failedTests: 0,
          coveragePercent: 94
        },
        deployment: {
          recommendedTarget: 'Docker Container / Uvicorn Daemon',
          dockerReady: true,
          ciCdConfigured: true
        },
        knownIssues: [],
        openTasks: ['Decouple price websocket', 'Pin Redis driver']
      },
      memory: {
        previousFailures: [
          { error: 'Port collision on 8080', fixApplied: 'Killed dead orphan daemon', fixedAt: '1 hour ago' }
        ],
        agentDecisions: [
          { timestamp: '3 hours ago', agent: 'Solution Architect', decision: 'Redis In-Memory Streams', rationale: '<2ms latency required for real-time live auction bid valuation' },
          { timestamp: '1 hour ago', agent: 'VCA Developer', decision: 'Interquartile Range (IQR) with 1.5x Multiplier', rationale: 'Prevents fake shill bids from skewing fair market value' }
        ],
        userRequirements: ['Real-time valuation', 'High availability'],
        importantFiles: ['main.py', 'requirements.txt', 'services/pricing.py'],
        checkpoints: [
          { id: 'cp-1', name: 'Initial Decoupled Scaffold', timestamp: '2 hours ago', commitHash: '7e2a90b', description: 'Separated WebSocket listener from HTTP pricing REST handlers', filesSnapshotted: 14 },
          { id: 'cp-2', name: 'Redis PubSub Integration', timestamp: '45 mins ago', commitHash: 'a89c2f1', description: 'Pinned stable redis driver and added backoff retry loop', filesSnapshotted: 16 }
        ]
      },
      history: [
        { id: 'h-1', timestamp: '14:32:00', agent: 'Debugger & Diagnostics Agent', action: 'PORT_SCAN', details: 'Confirmed port 8080 open with zero collisions', status: 'success' },
        { id: 'h-2', timestamp: '14:30:15', agent: 'VCA Developer', action: 'CODE_PATCH', details: 'Patched trimming.py zero division guard', status: 'success' }
      ],
      watchStatus: {
        isWatching: true,
        lastCheckedAt: new Date().toISOString(),
        unmergedCommits: 0,
        potentialBreakingChanges: []
      }
    }
  ];
}

export async function subscribeToRepository(repoUrl: string): Promise<{ success: boolean; project: SubscribedProject; logs: string }> {
  const res = await fetch('/api/coding-agents/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoUrl })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to subscribe to repository');
  }
  return res.json();
}

export async function conductDiscoveryInterview(objective: string, answers: Record<string, any> = {}): Promise<{ objective: string; completed: boolean; questions?: any[]; plan?: ProjectPlan; message?: string }> {
  const res = await fetch('/api/coding-agents/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objective, answers })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to execute discovery interview');
  }
  return res.json();
}

export async function researchGitHub(query: string): Promise<GitHubResearchResult> {
  const res = await fetch('/api/coding-agents/github-research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to research GitHub');
  }
  return res.json();
}

export async function runDiagnostics(projectId: string, logs: string = '', errorSnippet?: string): Promise<DiagnosticResult> {
  const res = await fetch('/api/coding-agents/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, logs, errorSnippet })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to run diagnostics');
  }
  return res.json();
}

export async function executeAutoRepair(projectId: string, fixAction?: string): Promise<{ success: boolean; project: SubscribedProject; attempts: any[]; message: string }> {
  const res = await fetch('/api/coding-agents/repair', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, fixAction })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to execute auto-repair');
  }
  return res.json();
}

export async function executeMakeItWork(projectId: string): Promise<{ success: boolean; project: SubscribedProject; steps: any[]; summary: string }> {
  const res = await fetch('/api/coding-agents/make-it-work', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to execute Make It Work loop');
  }
  return res.json();
}

export async function createProjectCheckpoint(projectId: string, name?: string, description?: string): Promise<{ success: boolean; checkpoint: any; project: SubscribedProject }> {
  const res = await fetch('/api/coding-agents/checkpoints/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, name, description })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create checkpoint');
  }
  return res.json();
}

export async function restoreProjectCheckpoint(projectId: string, checkpointId: string): Promise<{ success: boolean; message: string; project: SubscribedProject }> {
  const res = await fetch('/api/coding-agents/checkpoints/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, checkpointId })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to restore checkpoint');
  }
  return res.json();
}

export async function bindProjectWidget(projectId: string): Promise<{ success: boolean; widget: any; message: string }> {
  const res = await fetch('/api/coding-agents/widget-bind', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to bind desktop widget');
  }
  return res.json();
}

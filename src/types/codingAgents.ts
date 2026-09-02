export interface CodingAgentRosterItem {
  id: string;
  name: string;
  role: string;
  avatarIcon: string;
  status: 'idle' | 'analyzing' | 'coding' | 'testing' | 'operating' | 'diagnosing';
  currentTask?: string;
  specialization: string;
  color: string;
}

export interface DependencyItem {
  name: string;
  version: string;
  latest: string;
  license: string;
  security: 'secure' | 'warning' | 'critical';
  usedBy: string;
  status: 'ok' | 'outdated' | 'vulnerable' | 'missing';
}

export interface EnvVariableItem {
  key: string;
  value?: string;
  isConfigured: boolean;
  isSecret: boolean;
  description: string;
  required: boolean;
}

export interface ProjectHealthScore {
  overall: number;
  build: boolean;
  dependencies: boolean;
  tests: boolean;
  database: boolean;
  environment: boolean;
  processes: boolean;
  ports: boolean;
  security: 'pass' | 'warn' | 'fail';
  documentation: 'pass' | 'warn' | 'fail';
  lastAuditedAt: string;
}

export interface ProjectCheckpoint {
  id: string;
  name: string;
  timestamp: string;
  commitHash: string;
  description: string;
  filesSnapshotted: number;
}

export interface ProjectHistoryItem {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  details: string;
  filesChanged?: string[];
  status: 'success' | 'warning' | 'error';
}

export interface SubscribedProject {
  id: string;
  name: string;
  description: string;
  repoUrl?: string;
  localPath: string;
  branch: string;
  commitHash: string;
  status: 'ready' | 'building' | 'running' | 'degraded' | 'error' | 'stopped';
  operatingMode: 'dev' | 'prod' | 'docker' | 'local' | 'background';
  pid?: number;
  port?: number;
  healthScore: ProjectHealthScore;
  intelligence: {
    architecture: string;
    dependencies: DependencyItem[];
    frameworks: string[];
    languages: string[];
    databases: string[];
    apis: string[];
    ports: number[];
    environment: EnvVariableItem[];
    buildSystem: {
      manager: string;
      buildCommand: string;
      devCommand: string;
      testCommand: string;
      startCommand: string;
    };
    testing: {
      framework: string;
      totalTests: number;
      passedTests: number;
      failedTests: number;
      coveragePercent: number;
    };
    deployment: {
      recommendedTarget: string;
      dockerReady: boolean;
      ciCdConfigured: boolean;
    };
    knownIssues: string[];
    openTasks: string[];
  };
  memory: {
    previousFailures: Array<{ error: string; fixApplied: string; fixedAt: string }>;
    agentDecisions: Array<{ timestamp: string; agent: string; decision: string; rationale: string }>;
    userRequirements: string[];
    importantFiles: string[];
    checkpoints: ProjectCheckpoint[];
  };
  history: ProjectHistoryItem[];
  watchStatus: {
    isWatching: boolean;
    lastCheckedAt: string;
    unmergedCommits: number;
    potentialBreakingChanges: string[];
  };
}

export interface DiscoveryQuestion {
  id: string;
  question: string;
  description?: string;
  type: 'single_choice' | 'multi_choice' | 'text';
  options?: string[];
  selectedAnswer?: any;
}

export interface DiscoveryInterview {
  id: string;
  objective: string;
  currentStep: number;
  questions: DiscoveryQuestion[];
  completed: boolean;
  resultingPlan?: ProjectPlan;
}

export interface ArchitectureOption {
  id: string;
  title: string;
  stack: string;
  pros: string[];
  cons: string[];
  reliabilityScore: number;
  complexityScore: number;
  performanceScore: number;
  costScore: number;
  maintainabilityScore: number;
  scalabilityScore: number;
  isRecommended: boolean;
}

export interface ProjectPlan {
  objective: string;
  architecture: string;
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    storage: string;
    aiServices: string;
    integrations: string[];
  };
  recommendationReason: string;
  optionsComparison: ArchitectureOption[];
  steps: Array<{
    id: string;
    title: string;
    agent: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    tool?: string;
    output?: string;
  }>;
}

export interface GitHubCandidate {
  name: string;
  repoUrl: string;
  stars: number;
  lastUpdated: string;
  license: string;
  language: string;
  maintenanceScore: number;
  securityStatus: string;
  description: string;
  recommendation: 'USE_EXISTING_LIBRARY' | 'CREATE_ADAPTER' | 'BUILD_CUSTOM';
  adapterSnippet?: string;
}

export interface GitHubResearchResult {
  query: string;
  candidates: GitHubCandidate[];
  primaryRecommendation: string;
  rationale: string;
}

export interface DiagnosticResult {
  timestamp: string;
  rootCause: string;
  evidence: string[];
  recommendedFix: string;
  confidence: number;
  fixAttempts: Array<{
    attemptNumber: number;
    action: string;
    result: 'success' | 'failed';
    logs: string;
  }>;
  status: 'diagnosed' | 'repairing' | 'fixed' | 'unresolved';
}

export interface CodeAgentTask {
  id: string;
  title: string;
  category: 'BUILD' | 'RUNNING' | 'WAITING' | 'FAILED' | 'COMPLETED';
  status: 'pending' | 'in_progress' | 'waiting_approval' | 'failed' | 'completed';
  agent: string;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  filesChanged: string[];
  commandsExecuted: string[];
  logs: string[];
  resultMessage?: string;
}

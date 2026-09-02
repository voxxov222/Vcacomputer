/**
 * VCA Agent Runtime (VAR) - Universal Tool Contract & Type System
 * 
 * Defines the environment-agnostic universal contract between Agent Brains (LLMs)
 * and Agent Hands (Execution Runtimes: WebContainer, Local CLI, Docker, Cloud Worker, Serverless).
 */

export type RuntimeType = 'webcontainer' | 'local' | 'docker' | 'remote_worker' | 'serverless' | 'byor_bridge';

export interface EnvironmentDescriptor {
  platform: 'web' | 'linux' | 'darwin' | 'win32' | 'container' | 'serverless';
  runtime: RuntimeType;
  hostName: string;
  node: boolean;
  nodeVersion?: string;
  python: boolean;
  pythonVersion?: string;
  git: boolean;
  gitVersion?: string;
  docker: boolean;
  dockerVersion?: string;
  filesystem: boolean;
  filesystemWritable: boolean;
  shell: boolean;
  shellType?: 'bash' | 'zsh' | 'sh' | 'webcontainer_sh';
  network: boolean;
  persistentProcess: boolean;
  gpu: boolean;
  packageManagers: ('npm' | 'pnpm' | 'yarn' | 'bun' | 'pip' | 'cargo')[];
  memoryMbTotal: number;
  memoryMbFree: number;
  cpuCores: number;
  uptimeSeconds: number;
  activePorts: number[];
}

export interface RuntimeCapabilityMap {
  runtime: RuntimeType;
  displayName: string;
  status: 'available' | 'degraded' | 'unavailable' | 'connected';
  supportedTools: string[];
  capabilities: {
    nodeExecution: boolean;
    pythonExecution: boolean;
    gitOperations: boolean;
    containerIsolation: boolean;
    rawShellAccess: boolean;
    inBrowserPreview: boolean;
    persistentDaemons: boolean;
    gpuCompute: boolean;
    nfcHardware: boolean;
  };
  limitations: string[];
  recommendedUseCases: string[];
}

export type ToolCategory =
  | 'filesystem'
  | 'process'
  | 'shell'
  | 'package'
  | 'git'
  | 'github'
  | 'browser'
  | 'http'
  | 'database'
  | 'agent'
  | 'runtime'
  | 'diagnostics'
  | 'nfc';

export type PermissionLevel = 'safe' | 'prompt' | 'sensitive' | 'denied';

export interface ToolDefinition {
  name: string;
  category: ToolCategory;
  description: string;
  permissionLevel: PermissionLevel;
  requiredCapabilities: (keyof RuntimeCapabilityMap['capabilities'])[];
  parametersSchema: Record<string, any>;
}

export interface ToolCall {
  id: string;
  tool: string;
  args: Record<string, any>;
  timestamp: string;
  requestedRuntime?: RuntimeType;
}

export interface ToolResult {
  callId: string;
  tool: string;
  success: boolean;
  executedOnRuntime: RuntimeType;
  data?: any;
  error?: string;
  executionTimeMs: number;
  stdout?: string;
  stderr?: string;
}

export type LifecycleStage =
  | 'PLAN'
  | 'DISCOVER'
  | 'SELECT_TOOLS'
  | 'SELECT_RUNTIME'
  | 'EXECUTE'
  | 'OBSERVE'
  | 'DIAGNOSE'
  | 'REPAIR'
  | 'VERIFY'
  | 'REPORT';

export interface LifecycleStepState {
  stage: LifecycleStage;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  output?: any;
  substeps?: string[];
  error?: string;
}

export interface UniversalExecutionPlan {
  id: string;
  goal: string;
  primaryAgent: string;
  targetRuntime: RuntimeType;
  fallbackRuntime?: RuntimeType;
  currentStage: LifecycleStage;
  steps: LifecycleStepState[];
  selectedTools: string[];
  detectedEnvironment: EnvironmentDescriptor;
  toolHistory: { call: ToolCall; result: ToolResult }[];
  diagnosisHistory: DoctorDiagnosis[];
  createdAt: string;
  updatedAt: string;
  status: 'planning' | 'running' | 'waiting_approval' | 'repaired' | 'completed' | 'failed';
  finalResult?: any;
}

export interface DoctorDiagnosis {
  id: string;
  timestamp: string;
  component: string;
  severity: 'info' | 'warning' | 'error' | 'fatal';
  issue: string;
  rootCause: string;
  prescribedFix: {
    action: string;
    tool: string;
    args: Record<string, any>;
    automated: boolean;
  };
  applied: boolean;
  resolved: boolean;
}

export interface DoctorReport {
  overallHealthScore: number;
  checkedAt: string;
  environment: EnvironmentDescriptor;
  runtimes: RuntimeCapabilityMap[];
  diagnoses: DoctorDiagnosis[];
  openPorts: number[];
  diskHealth: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    writable: boolean;
  };
  securityAudit: {
    permissionLevel: 'strict' | 'standard' | 'open';
    unrestrictedShell: boolean;
    isolatedSandboxes: boolean;
  };
}

export interface SecurityGateRule {
  toolPattern: string;
  policy: 'allow' | 'require_human_approval' | 'deny';
  reason?: string;
}

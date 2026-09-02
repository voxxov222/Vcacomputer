// VCA OS — Real Local Computing Runtime Types

export type ExecutionEnvironment = 'REAL_LOCAL' | 'SANDBOXED_CONTAINER' | 'REMOTE_WEB' | 'SIMULATED_FALLBACK';

export interface RuntimeSystemInfo {
  status: 'online' | 'offline' | 'degraded';
  environment: ExecutionEnvironment;
  platform: string; // 'linux' | 'darwin' | 'win32'
  osType: string;
  osRelease: string;
  arch: string;
  hostname: string;
  uptimeSeconds: number;
  nodeVersion: string;
  currentWorkingDirectory: string;
  homeDirectory: string;
  tempDirectory: string;
  user: {
    username: string;
    uid?: number;
    gid?: number;
    shell?: string;
  };
  cpu: {
    model: string;
    cores: number;
    speedMhz: number;
    loadAverage: number[];
  };
  memory: {
    totalBytes: number;
    freeBytes: number;
    usedBytes: number;
    usagePercent: number;
    processRssBytes: number;
    totalMB?: number;
    usedMB?: number;
    freeMB?: number;
  };
  availableTools: {
    bash: boolean;
    sh: boolean;
    zsh: boolean;
    powershell: boolean;
    cmd: boolean;
    node: boolean;
    npm: boolean;
    npx: boolean;
    pnpm: boolean;
    yarn: boolean;
    python: boolean;
    python3: boolean;
    pip: boolean;
    pip3: boolean;
    git: boolean;
    docker: boolean;
    curl: boolean;
    wget: boolean;
    unzip: boolean;
    tar: boolean;
    zip: boolean;
    apt?: boolean;
    brew?: boolean;
    winget?: boolean;
  };
}

export interface TerminalExecutionRequest {
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
}

export interface TerminalExecutionResult {
  command: string;
  cwd: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  pid?: number;
  timestamp: string;
  environment: ExecutionEnvironment;
}

export interface TerminalSessionInfo {
  id: string;
  title: string;
  shell: string;
  cwd: string;
  createdAt: string;
  activePid?: number;
  isRunning: boolean;
  history: string[];
}

export interface RealProcessItem {
  pid: number;
  ppid?: number;
  name: string;
  command: string;
  cpuPercent: number;
  memoryBytes: number;
  memoryPercent: number;
  status: 'running' | 'sleeping' | 'stopped' | 'zombie';
  user: string;
  startedAt: string;
  cwd?: string;
  port?: number;
  applicationName?: string;
  associatedAgent?: string;
  isManagedByVCA?: boolean;
}

export interface PortBindingInfo {
  port: number;
  pid: number;
  protocol: 'tcp' | 'udp' | 'http';
  processName: string;
  state: 'LISTEN' | 'ESTABLISHED' | 'ACTIVE';
  associatedApp?: string;
  url?: string;
}

export interface RealFileItem {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  sizeBytes: number;
  createdAt: string;
  modifiedAt: string;
  extension: string;
  mimeType?: string;
  isHidden: boolean;
  isSymlink?: boolean;
  permissions?: string;
  readable: boolean;
  writable: boolean;
}

export interface SecurityAuditReport {
  rating: 'SAFE' | 'LOW_RISK' | 'REQUIRES_CONFIRMATION' | 'HIGH_RISK';
  summary: string;
  flags: {
    severity: 'info' | 'warning' | 'critical';
    category: 'install_script' | 'privileged_command' | 'credential_access' | 'destructive_fs' | 'network' | 'unknown_binary' | 'obfuscation';
    description: string;
    fileOrCommand?: string;
  }[];
  requiresUserApproval: boolean;
  recommendedAction: string;
}

export interface ProjectDetectionResult {
  repoUrl?: string;
  projectPath: string;
  type: 'node' | 'python' | 'rust' | 'go' | 'java' | 'docker' | 'static' | 'unknown';
  framework?: string; // 'nextjs' | 'vite' | 'react' | 'express' | 'fastapi' | 'flask' | 'django' | 'actix' | 'gin' | 'vanilla'
  category: 'frontend' | 'backend' | 'fullstack' | 'cli' | 'library' | 'microservice';
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'pip' | 'poetry' | 'cargo' | 'go' | 'gradle' | 'maven' | 'none';
  runtime: 'node' | 'python' | 'rust' | 'go' | 'java' | 'docker' | 'deno' | 'bun';
  runtimeVersionRequired?: string;
  installedRuntimeVersion?: string;
  runtimeVersionMatch?: boolean;
  installCommand: string;
  buildCommand?: string;
  devCommand?: string;
  startCommand: string;
  detectedPorts: number[];
  environmentVariables: { name: string; required: boolean; description?: string; defaultValue?: string }[];
  detectedFiles: string[];
  readmeSummary?: string;
  confidence: number;
  securityAudit: SecurityAuditReport;
}

export interface GitHubProjectRunPlan {
  repoUrl: string;
  projectName: string;
  projectPath: string;
  detection: ProjectDetectionResult;
  status: 'idle' | 'cloning' | 'analyzing' | 'waiting_approval' | 'installing' | 'building' | 'launching' | 'running' | 'failed' | 'stopped';
  activePid?: number;
  activePort?: number;
  assignedUrl?: string;
  steps: {
    id: string;
    title: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    output?: string;
    durationMs?: number;
    error?: string;
  }[];
  logs: string[];
  createdAt: string;
  startedAt?: string;
}

export interface InstalledApplication {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'system' | 'development' | 'productivity' | 'project' | 'utility';
  executable?: string;
  launchCommand?: string;
  workingDirectory: string;
  env?: Record<string, string>;
  version?: string;
  source: 'system' | 'github' | 'package_manager' | 'vca_agent' | 'user_custom';
  status: 'installed' | 'running' | 'stopped' | 'error';
  lastLaunched?: string;
  pid?: number;
  port?: number;
  url?: string;
  isProject?: boolean;
}

export interface DynamicWidgetConfig {
  id: string;
  title: string;
  type:
    | 'system_monitor'
    | 'process_monitor'
    | 'port_monitor'
    | 'github_runner'
    | 'terminal_live'
    | 'app_launcher'
    | 'website_embed'
    | 'video_player'
    | 'file_preview'
    | 'agent_activity'
    | 'api_stream'
    | 'notes_scratchpad'
    | 'weather'
    | 'clock';
  size: 'small' | 'medium' | 'large' | 'wide' | 'full';
  position: { x: number; y: number };
  x?: number;
  y?: number;
  description?: string;
  gridSpan?: { colSpan: number; rowSpan: number };
  refreshIntervalMs?: number;
  isPinned: boolean;
  isLocked: boolean;
  opacity?: number;
  theme?: 'dark' | 'glass' | 'cyber' | 'minimal';
  dataSource?: {
    url?: string;
    endpoint?: string;
    pollIntervalMs?: number;
    headers?: Record<string, string>;
    method?: 'GET' | 'POST';
    body?: any;
  };
  props: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ToolRegistryItem {
  id: string;
  name: string;
  category: 'filesystem' | 'terminal' | 'process' | 'git' | 'project' | 'package' | 'archive' | 'app' | 'widget' | 'browser' | 'security';
  description: string;
  permissionLevel: 'READ_ONLY' | 'USER_APPROVAL' | 'TRUSTED' | 'SYSTEM';
  inputSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
  isDangerous?: boolean;
}

export interface SecurityApprovalRequest {
  id: string;
  timestamp: string;
  agentName: string;
  action: string;
  toolId: string;
  commandOrPayload: string;
  reason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'pending' | 'approved' | 'rejected';
}

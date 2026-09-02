import { ToolDefinition, ToolCall, ToolResult } from '../types';
import { defaultRuntimeManager } from '../runtimes/RuntimeManager';
import { defaultPermissionBroker } from '../security/PermissionBroker';

/**
 * Universal Tool Registry
 * 
 * Defines all universal tools conforming to the VCA Universal Tool Contract.
 * Every agent uses this single interface without depending on host specifics.
 */
export const UNIVERSAL_TOOL_DEFINITIONS: ToolDefinition[] = [
  // Filesystem Tools
  {
    name: 'filesystem.read',
    category: 'filesystem',
    description: 'Read file content from current workspace or virtual filesystem.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { path: { type: 'string', required: true } }
  },
  {
    name: 'filesystem.write',
    category: 'filesystem',
    description: 'Write or update file content.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { path: { type: 'string', required: true }, content: { type: 'string', required: true } }
  },
  {
    name: 'filesystem.list',
    category: 'filesystem',
    description: 'List contents of a workspace directory.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { path: { type: 'string', default: '/' } }
  },
  {
    name: 'filesystem.delete',
    category: 'filesystem',
    description: 'Delete a file or directory.',
    permissionLevel: 'prompt',
    requiredCapabilities: [],
    parametersSchema: { path: { type: 'string', required: true } }
  },

  // Process & Shell Tools
  {
    name: 'shell.execute',
    category: 'shell',
    description: 'Execute command in active runtime shell (Bash or WebContainer WASM).',
    permissionLevel: 'safe',
    requiredCapabilities: ['rawShellAccess'],
    parametersSchema: { command: { type: 'string', required: true }, cwd: { type: 'string' } }
  },
  {
    name: 'process.start',
    category: 'process',
    description: 'Spawn background service or development server.',
    permissionLevel: 'safe',
    requiredCapabilities: ['nodeExecution'],
    parametersSchema: { name: { type: 'string' }, port: { type: 'number' }, command: { type: 'string' } }
  },
  {
    name: 'process.stop',
    category: 'process',
    description: 'Stop active daemon or dev server.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { port: { type: 'number' }, pid: { type: 'number' } }
  },
  {
    name: 'process.status',
    category: 'process',
    description: 'Query status of active background processes and ports.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: {}
  },

  // Package & Dependencies
  {
    name: 'package.install',
    category: 'package',
    description: 'Install npm/pip dependencies.',
    permissionLevel: 'safe',
    requiredCapabilities: ['nodeExecution'],
    parametersSchema: { packageName: { type: 'string' }, isDev: { type: 'boolean' } }
  },
  {
    name: 'package.detect',
    category: 'package',
    description: 'Analyze installed packages and detect missing dependencies.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: {}
  },

  // Git & GitHub
  {
    name: 'git.clone',
    category: 'git',
    description: 'Clone repository into runtime workspace.',
    permissionLevel: 'safe',
    requiredCapabilities: ['gitOperations'],
    parametersSchema: { repoUrl: { type: 'string', required: true }, destination: { type: 'string' } }
  },
  {
    name: 'git.pull',
    category: 'git',
    description: 'Pull latest commits from remote origin.',
    permissionLevel: 'safe',
    requiredCapabilities: ['gitOperations'],
    parametersSchema: { branch: { type: 'string' } }
  },
  {
    name: 'git.commit',
    category: 'git',
    description: 'Commit changes with message.',
    permissionLevel: 'safe',
    requiredCapabilities: ['gitOperations'],
    parametersSchema: { message: { type: 'string', required: true } }
  },
  {
    name: 'github.search',
    category: 'github',
    description: 'Search GitHub repositories, issues, and code.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { query: { type: 'string', required: true } }
  },
  {
    name: 'github.read',
    category: 'github',
    description: 'Read repository metadata, files, branches and commits.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { repo: { type: 'string' }, path: { type: 'string' } }
  },

  // Browser & HTTP
  {
    name: 'browser.open',
    category: 'browser',
    description: 'Open URL in sandboxed web browser window.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { url: { type: 'string', required: true } }
  },
  {
    name: 'browser.navigate',
    category: 'browser',
    description: 'Navigate browser to destination.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { url: { type: 'string', required: true } }
  },
  {
    name: 'browser.extract',
    category: 'browser',
    description: 'Extract clean DOM and text content from web page.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { url: { type: 'string' }, selector: { type: 'string' } }
  },
  {
    name: 'http.request',
    category: 'http',
    description: 'Make HTTP REST or GraphQL request.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { url: { type: 'string', required: true }, method: { type: 'string' }, body: { type: 'any' } }
  },

  // Database
  {
    name: 'database.query',
    category: 'database',
    description: 'Execute query on SQLite / in-memory / relational database.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { sql: { type: 'string', required: true } }
  },

  // Multi-Agent Collaboration
  {
    name: 'agent.spawn',
    category: 'agent',
    description: 'Spawn specialized subagent (e.g. Solution Architect, DevOps, Diagnostics, QA).',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { role: { type: 'string', required: true }, task: { type: 'string' } }
  },
  {
    name: 'agent.delegate',
    category: 'agent',
    description: 'Delegate sub-goal to another agent in the swarm.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { targetAgentId: { type: 'string' }, goal: { type: 'string' } }
  },

  // Runtime & Diagnostics
  {
    name: 'runtime.detect',
    category: 'runtime',
    description: 'Detect host environment, languages, runtimes, and compute resources.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: {}
  },
  {
    name: 'runtime.capabilities',
    category: 'runtime',
    description: 'Return full capability matrix across WebContainer, Local, Docker, and Cloud.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: {}
  },
  {
    name: 'runtime.health',
    category: 'runtime',
    description: 'Perform deep diagnostic checkup and return health score.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: {}
  },
  {
    name: 'diagnostics.inspect',
    category: 'diagnostics',
    description: 'Inspect runtime errors, build failures, and port conflicts.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { context: { type: 'string' } }
  },
  {
    name: 'diagnostics.repair',
    category: 'diagnostics',
    description: 'Apply automated self-repair prescriptions.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { diagnosisId: { type: 'string' } }
  },

  // Hardware NFC & Card Verification
  {
    name: 'nfc.read',
    category: 'nfc',
    description: 'Read cryptographic NFC slab tag UID and physical signature.',
    permissionLevel: 'safe',
    requiredCapabilities: ['nfcHardware'],
    parametersSchema: {}
  },
  {
    name: 'nfc.verify',
    category: 'nfc',
    description: 'Verify cryptographic authenticity of collectible card slab.',
    permissionLevel: 'safe',
    requiredCapabilities: [],
    parametersSchema: { cardId: { type: 'string' }, tagUid: { type: 'string' } }
  }
];

export class UniversalToolRegistry {
  private static instance: UniversalToolRegistry;

  public static getInstance(): UniversalToolRegistry {
    if (!UniversalToolRegistry.instance) {
      UniversalToolRegistry.instance = new UniversalToolRegistry();
    }
    return UniversalToolRegistry.instance;
  }

  public getToolDefinitions(): ToolDefinition[] {
    return UNIVERSAL_TOOL_DEFINITIONS;
  }

  public getTool(name: string): ToolDefinition | undefined {
    return UNIVERSAL_TOOL_DEFINITIONS.find((t) => t.name === name);
  }

  public async invoke(call: ToolCall): Promise<ToolResult> {
    // 1. Check permissions
    const auth = defaultPermissionBroker.checkAuthorization(call);
    if (!auth.authorized) {
      return {
        callId: call.id,
        tool: call.tool,
        success: false,
        executedOnRuntime: 'local',
        error: auth.requiresApproval
          ? `Authorization required: ${auth.reason || 'Human approval needed before executing'}`
          : `Permission denied: ${auth.reason || 'Blocked by security policy'}`,
        executionTimeMs: 0
      };
    }

    // 2. Dispatch via Runtime Manager
    return await defaultRuntimeManager.executeTool(call);
  }
}

export const defaultToolRegistry = UniversalToolRegistry.getInstance();

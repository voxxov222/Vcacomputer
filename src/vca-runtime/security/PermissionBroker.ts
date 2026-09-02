import { PermissionLevel, SecurityGateRule, ToolCall } from '../types';

/**
 * VCA Permission Broker
 * 
 * Enforces least-privilege security boundaries between Agent LLMs and host compute.
 * Prevents arbitrary destructive host-level actions while enabling safe autonomy.
 */
export class PermissionBroker {
  private rules: SecurityGateRule[] = [
    { toolPattern: 'filesystem.read', policy: 'allow', reason: 'Safe read-only inspection' },
    { toolPattern: 'filesystem.list', policy: 'allow', reason: 'Safe directory listing' },
    { toolPattern: 'filesystem.stat', policy: 'allow', reason: 'Safe metadata lookup' },
    { toolPattern: 'filesystem.write', policy: 'allow', reason: 'Controlled sandboxed code authoring' },
    { toolPattern: 'filesystem.delete', policy: 'require_human_approval', reason: 'Destructive file removal' },
    { toolPattern: 'process.status', policy: 'allow', reason: 'Process telemetry' },
    { toolPattern: 'process.list', policy: 'allow', reason: 'Process discovery' },
    { toolPattern: 'process.start', policy: 'allow', reason: 'Starting managed microservices' },
    { toolPattern: 'process.stop', policy: 'allow', reason: 'Stopping managed processes' },
    { toolPattern: 'shell.execute', policy: 'allow', reason: 'Controlled shell commands inside container/sandbox' },
    { toolPattern: 'package.*', policy: 'allow', reason: 'Package dependency management' },
    { toolPattern: 'git.*', policy: 'allow', reason: 'Version control operations' },
    { toolPattern: 'github.search', policy: 'allow', reason: 'Repository intelligence' },
    { toolPattern: 'github.read', policy: 'allow', reason: 'Code exploration' },
    { toolPattern: 'github.create', policy: 'require_human_approval', reason: 'Pushing changes to remote GitHub' },
    { toolPattern: 'browser.*', policy: 'allow', reason: 'Web scraping and research' },
    { toolPattern: 'http.request', policy: 'allow', reason: 'Safe API querying' },
    { toolPattern: 'database.query', policy: 'allow', reason: 'Read/Write query execution' },
    { toolPattern: 'database.drop', policy: 'deny', reason: 'Destructive database purge forbidden' },
    { toolPattern: 'runtime.*', policy: 'allow', reason: 'Runtime inspection and diagnostics' },
    { toolPattern: 'diagnostics.*', policy: 'allow', reason: 'Self-repair checks' },
    { toolPattern: 'nfc.*', policy: 'allow', reason: 'Cryptographic tag authentication' }
  ];

  private grantedApprovals: Set<string> = new Set();
  private strictMode: boolean = false;

  constructor(strictMode: boolean = false) {
    this.strictMode = strictMode;
  }

  public checkAuthorization(call: ToolCall): {
    authorized: boolean;
    requiresApproval: boolean;
    reason?: string;
  } {
    const { tool } = call;

    // Check if already approved manually
    if (this.grantedApprovals.has(call.id) || this.grantedApprovals.has(tool)) {
      return { authorized: true, requiresApproval: false, reason: 'Approved by human operator' };
    }

    // Match rules in priority order
    for (const rule of this.rules) {
      if (this.matchesPattern(tool, rule.toolPattern)) {
        if (rule.policy === 'deny') {
          return { authorized: false, requiresApproval: false, reason: `Policy denied: ${rule.reason || 'Forbidden capability'}` };
        }
        if (rule.policy === 'require_human_approval') {
          return { authorized: false, requiresApproval: true, reason: rule.reason };
        }
        return { authorized: true, requiresApproval: false, reason: rule.reason };
      }
    }

    // In strict mode, unknown tools require sign-off
    if (this.strictMode) {
      return { authorized: false, requiresApproval: true, reason: 'Strict mode: unknown tool requires operator approval' };
    }

    return { authorized: true, requiresApproval: false };
  }

  public grantApproval(callIdOrTool: string): void {
    this.grantedApprovals.add(callIdOrTool);
  }

  public revokeApproval(callIdOrTool: string): void {
    this.grantedApprovals.delete(callIdOrTool);
  }

  public addRule(rule: SecurityGateRule): void {
    this.rules.unshift(rule);
  }

  public getRules(): SecurityGateRule[] {
    return [...this.rules];
  }

  private matchesPattern(tool: string, pattern: string): boolean {
    if (pattern === tool) return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return tool.startsWith(prefix);
    }
    return false;
  }
}

export const defaultPermissionBroker = new PermissionBroker();

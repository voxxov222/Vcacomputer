import { RuntimeAdapter } from './RuntimeAdapter';
import { RuntimeCapabilityMap, RuntimeType, ToolCall, ToolResult } from '../types';

/**
 * Local Host / Linux Container Runtime Adapter
 * 
 * Interacts with the real host environment (Linux VM, Cloud Run container, or local machine)
 * via the server API endpoints.
 */
export class LocalHostRuntime extends RuntimeAdapter {
  public readonly type: RuntimeType = 'local';
  public readonly name: string = 'Local Host / Linux Container CLI';

  public async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch('/api/runtime/detect');
      return res.ok;
    } catch {
      return false;
    }
  }

  public async getCapabilities(): Promise<RuntimeCapabilityMap> {
    return {
      runtime: this.type,
      displayName: this.name,
      status: 'available',
      supportedTools: [
        'filesystem.read', 'filesystem.write', 'filesystem.list', 'filesystem.delete', 'filesystem.stat',
        'process.start', 'process.stop', 'process.status', 'process.list',
        'shell.execute',
        'package.install', 'package.detect', 'package.remove',
        'git.clone', 'git.pull', 'git.commit', 'git.status', 'git.branch',
        'github.search', 'github.read', 'github.create',
        'browser.open', 'browser.navigate', 'browser.extract',
        'http.request',
        'database.query',
        'agent.spawn', 'agent.delegate',
        'runtime.detect', 'runtime.capabilities', 'runtime.health', 'runtime.repair',
        'diagnostics.inspect', 'diagnostics.repair',
        'nfc.read', 'nfc.verify'
      ],
      capabilities: {
        nodeExecution: true,
        pythonExecution: true,
        gitOperations: true,
        containerIsolation: false,
        rawShellAccess: true,
        inBrowserPreview: false,
        persistentDaemons: true,
        gpuCompute: true,
        nfcHardware: true
      },
      limitations: [
        'Requires local backend daemon running'
      ],
      recommendedUseCases: [
        'Python Computer Vision & AI Models',
        'Persistent background microservices',
        'Real Linux package management and compilation'
      ]
    };
  }

  public async executeTool(call: ToolCall): Promise<ToolResult> {
    const startTime = Date.now();
    const { tool, args } = call;

    try {
      if (tool === 'shell.execute') {
        const cmd = args.command || 'pwd';
        const res = await fetch('/api/terminal/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd, cwd: args.cwd })
        });
        const data = await res.json();
        return this.createSuccessResult(call, data, data.stdout || data.output, startTime);
      }

      if (tool.startsWith('filesystem.')) {
        if (tool === 'filesystem.read') {
          const res = await fetch(`/api/files/read?path=${encodeURIComponent(args.path || args.filePath || '')}`);
          const data = await res.json();
          return this.createSuccessResult(call, data, data.content, startTime);
        }
        if (tool === 'filesystem.write') {
          const res = await fetch('/api/files/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: args.path, content: args.content })
          });
          const data = await res.json();
          return this.createSuccessResult(call, data, 'File written', startTime);
        }
        if (tool === 'filesystem.list') {
          const res = await fetch(`/api/files/list?path=${encodeURIComponent(args.path || '')}`);
          const data = await res.json();
          return this.createSuccessResult(call, data, JSON.stringify(data.files, null, 2), startTime);
        }
      }

      if (tool.startsWith('git.') || tool.startsWith('github.')) {
        const res = await fetch('/api/github/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: tool, ...args })
        });
        const data = await res.json();
        return this.createSuccessResult(call, data, data.message || 'Git operation complete', startTime);
      }

      if (tool.startsWith('process.')) {
        const res = await fetch('/api/processes', {
          method: 'GET'
        });
        const data = await res.json();
        return this.createSuccessResult(call, data, `Active processes: ${data.processes?.length || 0}`, startTime);
      }

      if (tool.startsWith('runtime.') || tool.startsWith('diagnostics.')) {
        const res = await fetch('/api/runtime/health');
        const data = await res.json();
        return this.createSuccessResult(call, data, 'Health audit nominal', startTime);
      }

      // Default fallback invocation
      const res = await fetch('/api/mcp/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName: tool, parameters: args })
      });
      const data = await res.json();
      return this.createSuccessResult(call, data.data || data, JSON.stringify(data), startTime);
    } catch (err: any) {
      return this.createErrorResult(call, err.message || 'Local execution failed', undefined, startTime);
    }
  }
}

import { RuntimeAdapter } from './RuntimeAdapter';
import { WebContainerRuntime } from './WebContainerRuntime';
import { LocalHostRuntime } from './LocalHostRuntime';
import { DockerRuntime, CloudWorkerRuntime } from './DockerRuntime';
import { BYORuntimeBridge } from './BYORuntimeBridge';
import { RuntimeCapabilityMap, RuntimeType, ToolCall, ToolResult } from '../types';

/**
 * VCA Runtime Manager & Capability Detector
 * 
 * Manages all execution adapters, detects active capabilities, and dynamically
 * routes agent tool calls to the optimal execution environment with automatic fallback.
 */
export class RuntimeManager {
  private static instance: RuntimeManager;

  private adapters: Map<RuntimeType, RuntimeAdapter> = new Map();
  private primaryRuntime: RuntimeType = 'local';

  private constructor() {
    this.registerAdapter(new WebContainerRuntime());
    this.registerAdapter(new LocalHostRuntime());
    this.registerAdapter(new DockerRuntime());
    this.registerAdapter(new CloudWorkerRuntime());
    this.registerAdapter(new BYORuntimeBridge());
  }

  public static getInstance(): RuntimeManager {
    if (!RuntimeManager.instance) {
      RuntimeManager.instance = new RuntimeManager();
    }
    return RuntimeManager.instance;
  }

  public registerAdapter(adapter: RuntimeAdapter): void {
    this.adapters.set(adapter.type, adapter);
  }

  public getAdapter(type: RuntimeType): RuntimeAdapter | undefined {
    return this.adapters.get(type);
  }

  public setPrimaryRuntime(type: RuntimeType): void {
    if (this.adapters.has(type)) {
      this.primaryRuntime = type;
    }
  }

  public getPrimaryRuntime(): RuntimeType {
    return this.primaryRuntime;
  }

  /**
   * Selects the best runtime based on capability requirements.
   * E.g. If Python or CUDA is needed, prefers Local or Cloud Worker.
   * If pure client/Node preview is needed, prefers WebContainer.
   */
  public async selectBestRuntime(requirements: {
    needPython?: boolean;
    needNode?: boolean;
    needGit?: boolean;
    needDocker?: boolean;
    needPersistent?: boolean;
    needGpu?: boolean;
    needNfcHardware?: boolean;
  }): Promise<RuntimeType> {
    const byor = this.adapters.get('byor_bridge');
    if (requirements.needNfcHardware && byor && await byor.isAvailable()) {
      return 'byor_bridge';
    }

    if (requirements.needDocker) {
      const docker = this.adapters.get('docker');
      if (docker && await docker.isAvailable()) return 'docker';
    }

    if (requirements.needGpu) {
      return 'remote_worker';
    }

    if (requirements.needPython) {
      const local = this.adapters.get('local');
      if (local && await local.isAvailable()) return 'local';
      return 'remote_worker';
    }

    // Default to WebContainer or Local
    const local = this.adapters.get('local');
    if (local && await local.isAvailable()) {
      return 'local';
    }

    return 'webcontainer';
  }

  /**
   * Universal Dispatch with Autonomous Fallback:
   * 1. Tries target runtime
   * 2. If unsupported or error, seamlessly falls back to alternative adapter
   */
  public async executeTool(call: ToolCall): Promise<ToolResult> {
    const targetType = call.requestedRuntime || this.primaryRuntime;
    const targetAdapter = this.adapters.get(targetType);

    if (targetAdapter && await targetAdapter.isAvailable()) {
      const result = await targetAdapter.executeTool(call);
      if (result.success) return result;
      // If failed due to capability limitation, trigger fallback
    }

    // Fallback order: local -> webcontainer -> remote_worker
    const fallbackTypes: RuntimeType[] = ['local', 'webcontainer', 'remote_worker'];
    for (const fbType of fallbackTypes) {
      if (fbType === targetType) continue;
      const fbAdapter = this.adapters.get(fbType);
      if (fbAdapter && await fbAdapter.isAvailable()) {
        try {
          const fbResult = await fbAdapter.executeTool(call);
          if (fbResult.success) {
            fbResult.data = {
              ...fbResult.data,
              fallbackNotice: `Executed via automatic runtime fallback from ${targetType} to ${fbType}`
            };
            return fbResult;
          }
        } catch {}
      }
    }

    return {
      callId: call.id,
      tool: call.tool,
      success: false,
      executedOnRuntime: targetType,
      error: `All available runtimes failed to execute tool ${call.tool}`,
      executionTimeMs: 0
    };
  }

  public async getAllCapabilities(): Promise<RuntimeCapabilityMap[]> {
    const maps: RuntimeCapabilityMap[] = [];
    for (const adapter of this.adapters.values()) {
      maps.push(await adapter.getCapabilities());
    }
    return maps;
  }
}

export const defaultRuntimeManager = RuntimeManager.getInstance();

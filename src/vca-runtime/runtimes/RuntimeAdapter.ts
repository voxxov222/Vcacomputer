import { RuntimeCapabilityMap, RuntimeType, ToolCall, ToolResult } from '../types';

/**
 * Abstract Base Runtime Adapter
 * 
 * Every execution runtime (WebContainer, Local, Docker, Remote VM, Serverless, BYOR)
 * implements this same interface.
 */
export abstract class RuntimeAdapter {
  public abstract readonly type: RuntimeType;
  public abstract readonly name: string;

  public abstract isAvailable(): Promise<boolean>;
  public abstract getCapabilities(): Promise<RuntimeCapabilityMap>;

  public abstract executeTool(call: ToolCall): Promise<ToolResult>;

  protected createSuccessResult(call: ToolCall, data: any, stdout?: string, startTime = Date.now()): ToolResult {
    return {
      callId: call.id,
      tool: call.tool,
      success: true,
      executedOnRuntime: this.type,
      data,
      stdout: stdout || (typeof data === 'string' ? data : undefined),
      executionTimeMs: Date.now() - startTime
    };
  }

  protected createErrorResult(call: ToolCall, error: string, stderr?: string, startTime = Date.now()): ToolResult {
    return {
      callId: call.id,
      tool: call.tool,
      success: false,
      executedOnRuntime: this.type,
      error,
      stderr: stderr || error,
      executionTimeMs: Date.now() - startTime
    };
  }
}

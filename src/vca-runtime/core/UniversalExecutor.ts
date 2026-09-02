import { AgentOrchestrator } from './AgentOrchestrator';
import { UniversalExecutionPlan } from '../types';

/**
 * VCA Universal Executor
 * 
 * First-class engine that accepts any high-level objective (e.g. "Clone this GitHub repo and get it running")
 * and produces the execution plan, runtime selection, tool calls, diagnostics, auto-repair, and verified preview.
 */
export class UniversalExecutor {
  private orchestrator = new AgentOrchestrator();

  public async execute(
    goal: string,
    onProgress?: (plan: UniversalExecutionPlan) => void
  ): Promise<UniversalExecutionPlan> {
    return await this.orchestrator.executeAutonomousLoop(goal, 'Universal Executor', onProgress);
  }
}

export const defaultUniversalExecutor = new UniversalExecutor();

'use server';

import { Orchestrator, type OrchestratorResponse } from './orchestrator';
import { SubagentExecutor } from './subagent-executor';
import { getAgent, listAgents } from './registry';
import { z } from 'zod';

// ─── Input/Output Schemas ───────────────────────────────────────────────────

const RunWorkflowInputSchema = z.object({
  request: z.string().min(1, 'Request is required'),
  userId: z.string().optional(),
  mode: z.enum(['orchestrated', 'single']).default('orchestrated'),
  agentId: z.string().optional(),
});

export type RunWorkflowInput = z.infer<typeof RunWorkflowInputSchema>;

const SubtaskResultSchema = z.object({
  agentId: z.string(),
  agentName: z.string(),
  persona: z.string(),
  task: z.string(),
  result: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
  model: z.string(),
});

const WorkflowResultSchema = z.object({
  analysis: z.string(),
  subtasks: z.array(SubtaskResultSchema),
  finalOutput: z.string(),
  totalTokensUsed: z.number(),
  totalCostUsd: z.number(),
  executionTimeMs: z.number(),
});

export type WorkflowResult = z.infer<typeof WorkflowResultSchema>;

// ─── Main Server Action ─────────────────────────────────────────────────────

/**
 * Multi-Agent Workflow Execution
 *
 * Usage:
 *   - mode: "orchestrated" → Decomposes request, runs parallel subagents, aggregates
 *   - mode: "single" → Runs a single specified agent
 */
export async function runMultiAgentWorkflow(input: RunWorkflowInput): Promise<WorkflowResult> {
  const validated = RunWorkflowInputSchema.parse(input);
  const startTime = Date.now();

  if (validated.mode === 'single' && validated.agentId) {
    return runSingleAgent(validated.agentId, validated.request, validated.userId);
  }

  // Orchestrated mode
  const orchestrator = new Orchestrator();
  const response = await orchestrator.run(validated.request, validated.userId);

  return formatOrchestratorResponse(response, Date.now() - startTime);
}

// ─── Single Agent Execution ─────────────────────────────────────────────────

async function runSingleAgent(
  agentId: string,
  prompt: string,
  userId?: string,
): Promise<WorkflowResult> {
  const executor = new SubagentExecutor();
  const execution = await executor.run(agentId, prompt, userId);
  const agent = getAgent(agentId);

  return {
    analysis: `Running single agent: ${agent?.name || agentId}`,
    subtasks: [
      {
        agentId,
        agentName: agent?.name || agentId,
        persona: agent?.persona || 'Unknown',
        task: prompt,
        result: execution.response,
        success: execution.success,
        error: execution.error,
        model: execution.model,
      },
    ],
    finalOutput: execution.response,
    totalTokensUsed: execution.tokensUsed,
    totalCostUsd: execution.costUsd,
    executionTimeMs: 0,
  };
}

// ─── List Available Agents ──────────────────────────────────────────────────

export async function listAvailableAgents(): Promise<Array<{
  id: string;
  name: string;
  persona: string;
  description: string;
  capabilities: string[];
}>> {
  return listAgents()
    .filter(a => a.id !== 'orchestrator')
    .map(a => ({
      id: a.id,
      name: a.name,
      persona: a.persona,
      description: a.description,
      capabilities: a.capabilities,
    }));
}

// ─── Quick Agent Calls ──────────────────────────────────────────────────────

/**
 * Convenience function: Marketing copy only
 */
export async function runMarketingAgent(
  businessDescription: string,
  contentType: string,
  userId?: string,
): Promise<string> {
  const executor = new SubagentExecutor();
  const result = await executor.run(
    'marketing_copywriter',
    `Generate ${contentType} for this business:\n\n${businessDescription}`,
    userId,
  );
  return result.response;
}

/**
 * Convenience function: Financial projection only
 */
export async function runFinancialAgent(
  businessDescription: string,
  projectionType: string,
  userId?: string,
): Promise<string> {
  const executor = new SubagentExecutor();
  const result = await executor.run(
    'financial_advisor',
    `Create a ${projectionType} for this business:\n\n${businessDescription}`,
    userId,
  );
  return result.response;
}

/**
 * Convenience function: SWOT analysis only
 */
export async function runSwotAgent(
  businessDescription: string,
  businessName: string,
  userId?: string,
): Promise<string> {
  const executor = new SubagentExecutor();
  const result = await executor.run(
    'swot_analyst',
    `Perform a comprehensive SWOT analysis for ${businessName}:\n\n${businessDescription}`,
    userId,
  );
  return result.response;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatOrchestratorResponse(
  response: OrchestratorResponse,
  executionTimeMs: number,
): WorkflowResult {
  return {
    analysis: response.plan.analysis,
    subtasks: response.results.map(r => {
      const agent = getAgent(r.agentId);
      return {
        agentId: r.agentId,
        agentName: agent?.name || r.agentId,
        persona: agent?.persona || 'Unknown',
        task: r.task,
        result: r.result,
        success: r.success,
        error: r.error,
        model: r.model,
      };
    }),
    finalOutput: response.finalOutput,
    totalTokensUsed: response.totalTokensUsed,
    totalCostUsd: response.totalCostUsd,
    executionTimeMs,
  };
}

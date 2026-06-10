'use server';

import { Orchestrator, type OrchestratorResponse, type ProgressEvent } from './orchestrator';
import { SubagentExecutor } from './subagent-executor';
import { getAgent, listAgents } from './registry';
import { checkAndDecrementUsage } from '@/services/feature-gate';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { z } from 'zod';

// ─── Input/Output Schemas ───────────────────────────────────────────────────

const RunWorkflowInputSchema = z.object({
  request: z.string().min(1, 'Request is required'),
  userId: z.string().optional(),
  mode: z.enum(['orchestrated', 'single']).default('orchestrated'),
  agentId: z.string().optional(),
  threadId: z.string().optional(),
  businessContext: z.object({
    businessName: z.string().optional(),
    industry: z.string().optional(),
    businessDescription: z.string().optional(),
  }).optional(),
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

// ─── Business Context Builder ───────────────────────────────────────────────

function buildContextBlock(ctx?: RunWorkflowInput['businessContext']): string {
  if (!ctx) return '';
  return [
    ctx.businessName && `Business: ${ctx.businessName}`,
    ctx.industry && `Industry: ${ctx.industry}`,
    ctx.businessDescription && `Description: ${ctx.businessDescription}`,
  ].filter(Boolean).join(' | ');
}

// ─── Thread Persistence ─────────────────────────────────────────────────────

async function saveThreadMessage(
  userId: string,
  threadId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const msgCol = adminDb
      .collection('agent_threads')
      .doc(userId)
      .collection('threads')
      .doc(threadId)
      .collection('messages');

    await msgCol.add({
      role,
      content,
      metadata: metadata || {},
      createdAt: new Date(),
    });

    await adminDb
      .collection('agent_threads')
      .doc(userId)
      .collection('threads')
      .doc(threadId)
      .set({ updatedAt: new Date() }, { merge: true });
  } catch { /* non-critical */ }
}

async function getThreadHistory(
  userId: string,
  threadId: string,
  limit = 10,
): Promise<Array<{ role: string; content: string }>> {
  try {
    const snap = await adminDb
      .collection('agent_threads')
      .doc(userId)
      .collection('threads')
      .doc(threadId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snap.docs.map(d => d.data()).reverse() as Array<{ role: string; content: string }>;
  } catch {
    return [];
  }
}

// ─── Main Server Action ─────────────────────────────────────────────────────

export async function runMultiAgentWorkflow(input: RunWorkflowInput): Promise<WorkflowResult> {
  const validated = RunWorkflowInputSchema.parse(input);
  const startTime = Date.now();

  // Credit gate
  if (validated.userId) {
    const access = await checkAndDecrementUsage(validated.userId, 'multiAgentWorkflow');
    if (!access.success) {
      return {
        analysis: '',
        subtasks: [],
        finalOutput: access.message,
        totalTokensUsed: 0,
        totalCostUsd: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  // Build enriched request with business context and thread history
  let enrichedRequest = validated.request;

  if (validated.businessContext) {
    const ctx = buildContextBlock(validated.businessContext);
    if (ctx) enrichedRequest = `Business Profile: ${ctx}\n\nRequest: ${enrichedRequest}`;
  }

  if (validated.userId && validated.threadId) {
    const history = await getThreadHistory(validated.userId, validated.threadId);
    if (history.length > 0) {
      const historyBlock = history.map(m => `${m.role}: ${m.content}`).join('\n');
      enrichedRequest = `Previous conversation:\n${historyBlock}\n\nCurrent request: ${enrichedRequest}`;
    }
  }

  // Execute
  let result: WorkflowResult = {
    analysis: '',
    subtasks: [],
    finalOutput: '',
    totalTokensUsed: 0,
    totalCostUsd: 0,
    executionTimeMs: 0,
  };

  if (validated.mode === 'single' && validated.agentId) {
    result = await runSingleAgent(validated.agentId, enrichedRequest, validated.userId);
  } else {
    const orchestrator = new Orchestrator();
    const response = await orchestrator.run(enrichedRequest, validated.userId);
    result = formatOrchestratorResponse(response, Date.now() - startTime);
  }

  // Persist to thread
  if (validated.userId && validated.threadId) {
    await saveThreadMessage(validated.userId, validated.threadId, 'user', validated.request);
    await saveThreadMessage(validated.userId, validated.threadId, 'assistant', result.finalOutput, {
      subtasks: result.subtasks.map((s: { agentId: string; success: boolean }) => ({ agentId: s.agentId, success: s.success })),
      tokensUsed: result.totalTokensUsed,
    });
  }

  return result;
}

// ─── Streaming Server Action ────────────────────────────────────────────────

export async function streamMultiAgentWorkflow(
  input: RunWorkflowInput,
  onEvent: (event: ProgressEvent & { type: string }) => void,
): Promise<WorkflowResult> {
  const validated = RunWorkflowInputSchema.parse(input);
  const startTime = Date.now();

  // Credit gate
  if (validated.userId) {
    const access = await checkAndDecrementUsage(validated.userId, 'multiAgentWorkflow');
    if (!access.success) {
      return {
        analysis: '',
        subtasks: [],
        finalOutput: access.message,
        totalTokensUsed: 0,
        totalCostUsd: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  let enrichedRequest = validated.request;
  if (validated.businessContext) {
    const ctx = buildContextBlock(validated.businessContext);
    if (ctx) enrichedRequest = `Business Profile: ${ctx}\n\nRequest: ${enrichedRequest}`;
  }

  const orchestrator = new Orchestrator();
  orchestrator.onProgress((event) => onEvent(event));

  const response = await orchestrator.run(enrichedRequest, validated.userId);
  const result = formatOrchestratorResponse(response, Date.now() - startTime);

  if (validated.userId && validated.threadId) {
    await saveThreadMessage(validated.userId, validated.threadId, 'user', validated.request);
    await saveThreadMessage(validated.userId, validated.threadId, 'assistant', result.finalOutput);
  }

  return result;
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

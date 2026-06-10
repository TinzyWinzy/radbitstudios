import { type AIGateway, aiGateway } from '@/services/ai/ai-gateway';
import { AGENT_REGISTRY, getAgent } from './registry';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Subtask {
  agentId: string;
  task: string;
  params: Record<string, string>;
  dependsOn?: string[];
}

export interface DecompositionPlan {
  analysis: string;
  subtasks: Subtask[];
  expectedOutput: string;
}

export interface SubtaskResult {
  agentId: string;
  task: string;
  result: string;
  success: boolean;
  error?: string;
  tokensUsed: number;
  costUsd: number;
  model: string;
}

export interface OrchestratorResponse {
  plan: DecompositionPlan;
  results: SubtaskResult[];
  finalOutput: string;
  totalTokensUsed: number;
  totalCostUsd: number;
}

// ─── Progress Events ────────────────────────────────────────────────────────

export type ProgressEventType =
  | 'decompose:start'
  | 'decompose:complete'
  | 'execute:start'
  | 'execute:subtask:start'
  | 'execute:subtask:complete'
  | 'execute:subtask:error'
  | 'execute:level:complete'
  | 'aggregate:start'
  | 'aggregate:complete'
  | 'error';

export interface ProgressEvent {
  type: ProgressEventType;
  timestamp: number;
  data?: Record<string, unknown>;
}

export type ProgressListener = (event: ProgressEvent) => void;

// ─── Decomposition Plan Cache ───────────────────────────────────────────────

interface CachedPlan {
  plan: DecompositionPlan;
  expiry: number;
}

const planCache = new Map<string, CachedPlan>();
const PLAN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function cacheKey(request: string): string {
  let hash = 0;
  for (let i = 0; i < request.length; i++) {
    hash = ((hash << 5) - hash) + request.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

// ─── Compact Agent List ─────────────────────────────────────────────────────

function buildCompactAgentList(): string {
  return Object.values(AGENT_REGISTRY)
    .filter(a => a.id !== 'orchestrator')
    .map(a => `${a.id}[${a.capabilities.slice(0, 3).join(',')}]`)
    .join(', ');
}

// ─── Orchestrator ───────────────────────────────────────────────────────────

const DECOMPOSITION_SYSTEM_PROMPT = `You are a task decomposition engine. Analyze the request and create a plan.

MUST respond with valid JSON only. No markdown, no explanation outside the JSON.

{
  "analysis": "Brief understanding",
  "subtasks": [
    {
      "agentId": "agent_id",
      "task": "Specific task description",
      "params": {},
      "dependsOn": []
    }
  ],
  "expectedOutput": "What the final output should look like"
}

Rules:
- agentId must be from the available agents list
- Keep subtasks to 2-4 maximum
- dependsOn: [] = parallel, ["other_agent"] = sequential
- Each task must be self-contained`;

export class Orchestrator {
  private gateway: AIGateway;
  private listeners: ProgressListener[] = [];

  constructor() {
    this.gateway = aiGateway;
  }

  onProgress(listener: ProgressListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(type: ProgressEventType, data?: Record<string, unknown>): void {
    const event: ProgressEvent = { type, timestamp: Date.now(), data };
    for (const listener of this.listeners) {
      try { listener(event); } catch { /* swallow */ }
    }
  }

  /**
   * Step 1: Decompose user request into subtasks
   */
  async decompose(userRequest: string, userId?: string): Promise<DecompositionPlan> {
    // Check cache
    const key = cacheKey(userRequest);
    const cached = planCache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.plan;
    }

    this.emit('decompose:start');

    const agentList = buildCompactAgentList();

    const decompositionPrompt = `Available agents: ${agentList}

User request: ${userRequest}

Break this into 2-4 subtasks. Assign each to the best agent. Use dependsOn: [] for parallel, ["id"] for sequential. Respond with JSON only.`;

    const response = await this.gateway.generate({
      prompt: decompositionPrompt,
      systemPrompt: DECOMPOSITION_SYSTEM_PROMPT,
      difficulty: 'complex',
      jsonMode: true,
      maxTokens: 1024,
      userId,
    });

    let plan: DecompositionPlan;
    try {
      const parsed = JSON.parse(response.content);
      plan = {
        analysis: parsed.analysis || '',
        subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : [],
        expectedOutput: parsed.expectedOutput || '',
      };
    } catch {
      plan = {
        analysis: 'Could not decompose. Treating as single task.',
        subtasks: [{ agentId: 'orchestrator', task: userRequest, params: { prompt: userRequest } }],
        expectedOutput: userRequest,
      };
    }

    // Cache the plan
    planCache.set(key, { plan, expiry: Date.now() + PLAN_CACHE_TTL });

    this.emit('decompose:complete', { subtaskCount: plan.subtasks.length });
    return plan;
  }

  /**
   * Step 2: Execute subtasks (respecting dependencies, with concurrency limits)
   */
  async executeSubtasks(
    plan: DecompositionPlan,
    userId?: string,
  ): Promise<SubtaskResult[]> {
    this.emit('execute:start', { subtaskCount: plan.subtasks.length });

    const results: SubtaskResult[] = [];
    const completed = new Set<string>();
    const levels = this.topologicalSort(plan.subtasks);

    for (const level of levels) {
      const promises = level.map(subtask => {
        this.emit('execute:subtask:start', { agentId: subtask.agentId, task: subtask.task });
        return this.executeSingleSubtask(subtask, userId, results);
      });

      const levelResults = await Promise.allSettled(promises);

      for (const r of levelResults) {
        if (r.status === 'fulfilled') {
          results.push(r.value);
          completed.add(r.value.agentId);
          this.emit(
            r.value.success ? 'execute:subtask:complete' : 'execute:subtask:error',
            { agentId: r.value.agentId, success: r.value.success, error: r.value.error },
          );
        } else {
          const failResult: SubtaskResult = {
            agentId: 'unknown',
            task: 'Failed subtask',
            result: '',
            success: false,
            error: r.reason?.message || 'Unknown error',
            tokensUsed: 0,
            costUsd: 0,
            model: 'error',
          };
          results.push(failResult);
          this.emit('execute:subtask:error', { error: failResult.error });
        }
      }

      this.emit('execute:level:complete', { levelSize: level.length });
    }

    return results;
  }

  /**
   * Step 3: Aggregate results into final output
   */
  async aggregate(
    plan: DecompositionPlan,
    results: SubtaskResult[],
    userId?: string,
  ): Promise<string> {
    this.emit('aggregate:start');

    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) {
      return 'All subtasks failed. Please try again later.';
    }

    if (successfulResults.length === 1) {
      return successfulResults[0].result;
    }

    const resultSummaries = successfulResults.map((r, i) => {
      const agent = getAgent(r.agentId);
      return `### ${i + 1}. ${agent?.name || r.agentId} (${agent?.persona || 'Unknown'}):\n${r.result}`;
    }).join('\n\n');

    const aggregatePrompt = `## Original Request
${plan.analysis}

## Specialist Results
${resultSummaries}

## Instructions
Combine these specialist outputs into a single, coherent, actionable response.
${plan.expectedOutput ? `Expected output: ${plan.expectedOutput}` : ''}
Keep strengths of each contribution. Remove redundancy. Format in clear markdown.`;

    const response = await this.gateway.generate({
      prompt: aggregatePrompt,
      systemPrompt: 'You are a senior business advisor. Combine specialist outputs into one clear, actionable response for a Zimbabwean SME owner. Be concise but thorough.',
      difficulty: 'creative',
      maxTokens: 3000,
      userId,
    });

    this.emit('aggregate:complete');
    return response.content;
  }

  /**
   * Full pipeline: decompose → execute → aggregate
   */
  async run(userRequest: string, userId?: string): Promise<OrchestratorResponse> {
    try {
      const plan = await this.decompose(userRequest, userId);
      const results = await this.executeSubtasks(plan, userId);
      const finalOutput = await this.aggregate(plan, results, userId);

      return {
        plan,
        results,
        finalOutput,
        totalTokensUsed: results.reduce((sum, r) => sum + r.tokensUsed, 0),
        totalCostUsd: results.reduce((sum, r) => sum + r.costUsd, 0),
      };
    } catch (error: unknown) {
      this.emit('error', { error: error instanceof Error ? error.message : String(error) });

      // Fallback: run as single agent
      return this.fallbackRun(userRequest, userId);
    }
  }

  /**
   * Fallback: if orchestration fails, route to business_mentor directly
   */
  private async fallbackRun(userRequest: string, userId?: string): Promise<OrchestratorResponse> {
    const agent = getAgent('business_mentor') || getAgent('orchestrator');
    if (!agent) {
      return {
        plan: { analysis: 'Fallback failed', subtasks: [], expectedOutput: '' },
        results: [],
        finalOutput: 'Unable to process your request. Please try again later.',
        totalTokensUsed: 0,
        totalCostUsd: 0,
      };
    }

    const response = await this.gateway.generate({
      prompt: userRequest,
      systemPrompt: agent.systemPrompt,
      difficulty: agent.model as any,
      maxTokens: agent.maxTokens,
      temperature: agent.temperature,
      userId,
    });

    return {
      plan: { analysis: 'Fallback to single agent', subtasks: [{ agentId: agent.id, task: userRequest, params: {} }], expectedOutput: '' },
      results: [{
        agentId: agent.id,
        task: userRequest,
        result: response.content,
        success: !response.error,
        error: response.error,
        tokensUsed: response.tokensUsed,
        costUsd: response.costUsd,
        model: response.model,
      }],
      finalOutput: response.content,
      totalTokensUsed: response.tokensUsed,
      totalCostUsd: response.costUsd,
    };
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private async executeSingleSubtask(
    subtask: Subtask,
    userId?: string,
    priorResults?: SubtaskResult[],
  ): Promise<SubtaskResult> {
    const agent = getAgent(subtask.agentId);
    if (!agent) {
      return {
        agentId: subtask.agentId,
        task: subtask.task,
        result: '',
        success: false,
        error: `Unknown agent: ${subtask.agentId}`,
        tokensUsed: 0,
        costUsd: 0,
        model: 'error',
      };
    }

    let enrichedTask = subtask.task;
    if (subtask.dependsOn && subtask.dependsOn.length > 0 && priorResults) {
      const deps = priorResults
        .filter(r => subtask.dependsOn!.includes(r.agentId))
        .map(r => `[${r.agentId}]: ${r.result}`)
        .join('\n\n');
      enrichedTask = `${subtask.task}\n\nPrior results:\n${deps}`;
    }

    const paramText = Object.entries(subtask.params || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const prompt = paramText
      ? `${paramText}\n\nTask:\n${enrichedTask}`
      : enrichedTask;

    try {
      const response = await this.gateway.generate({
        prompt,
        systemPrompt: agent.systemPrompt,
        difficulty: agent.model as any,
        maxTokens: agent.maxTokens,
        temperature: agent.temperature,
        userId,
      });

      return {
        agentId: agent.id,
        task: subtask.task,
        result: response.content,
        success: !response.error,
        error: response.error,
        tokensUsed: response.tokensUsed,
        costUsd: response.costUsd,
        model: response.model,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return {
        agentId: agent.id,
        task: subtask.task,
        result: '',
        success: false,
        error: msg,
        tokensUsed: 0,
        costUsd: 0,
        model: 'error',
      };
    }
  }

  private topologicalSort(subtasks: Subtask[]): Subtask[][] {
    const levels: Subtask[][] = [];
    const remaining = [...subtasks];
    const completed = new Set<string>();

    while (remaining.length > 0) {
      const level = remaining.filter(st =>
        !st.dependsOn || st.dependsOn.every(dep => completed.has(dep))
      );

      if (level.length === 0) {
        levels.push(remaining.splice(0));
        break;
      }

      levels.push(level);
      for (const st of level) {
        completed.add(st.agentId);
        const idx = remaining.indexOf(st);
        if (idx !== -1) remaining.splice(idx, 1);
      }
    }

    return levels;
  }
}

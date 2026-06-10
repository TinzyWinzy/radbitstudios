import { AIGateway } from '@/services/ai/ai-gateway';
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

// ─── Orchestrator ───────────────────────────────────────────────────────────

const DECOMPOSITION_SYSTEM_PROMPT = `You are a task decomposition engine. Analyze the user request and create a plan.

You MUST respond with valid JSON only. No markdown, no explanation outside the JSON.

Response format:
{
  "analysis": "Brief understanding of the request",
  "subtasks": [
    {
      "agentId": "agent_id",
      "task": "Specific task description for this agent",
      "params": {},
      "dependsOn": []
    }
  ],
  "expectedOutput": "What the final output should look like"
}

Rules:
- agentId must be one of the registered agents listed below
- Keep subtasks to 2-4 maximum
- Use dependsOn for sequential tasks that need prior results
- Use empty dependsOn [] for tasks that can run in parallel
- Each task should be self-contained with clear input/output`;

export class Orchestrator {
  private gateway: AIGateway;

  constructor() {
    this.gateway = new AIGateway();
  }

  /**
   * Step 1: Decompose user request into subtasks
   */
  async decompose(userRequest: string, userId?: string): Promise<DecompositionPlan> {
    const agentList = Object.values(AGENT_REGISTRY)
      .filter(a => a.id !== 'orchestrator')
      .map(a => `- ${a.id}: ${a.description} | Capabilities: ${a.capabilities.join(', ')}`)
      .join('\n');

    const decompositionPrompt = `## Available Agents
${agentList}

## User Request
${userRequest}

## Instructions
Break this request into 2-4 subtasks. Assign each to the best specialist agent.
Determine which tasks can run in parallel (no dependencies) vs sequential (needs prior result).

Respond with JSON only.`;

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
      // Fallback: single task, no decomposition
      plan = {
        analysis: 'Could not decompose. Treating as single task.',
        subtasks: [{ agentId: 'orchestrator', task: userRequest, params: { prompt: userRequest } }],
        expectedOutput: userRequest,
      };
    }

    return plan;
  }

  /**
   * Step 2: Execute subtasks (respecting dependencies)
   */
  async executeSubtasks(
    plan: DecompositionPlan,
    userId?: string,
  ): Promise<SubtaskResult[]> {
    const results: SubtaskResult[] = [];
    const completed = new Set<string>();

    // Group by dependency level (topological sort, simplified)
    const levels = this.topologicalSort(plan.subtasks);

    for (const level of levels) {
      // Execute all tasks in this level in parallel
      const promises = level.map(subtask =>
        this.executeSingleSubtask(subtask, userId, results)
      );
      const levelResults = await Promise.allSettled(promises);

      for (const r of levelResults) {
        if (r.status === 'fulfilled') {
          results.push(r.value);
          completed.add(r.value.agentId);
        } else {
          results.push({
            agentId: 'unknown',
            task: 'Failed subtask',
            result: '',
            success: false,
            error: r.reason?.message || 'Unknown error',
            tokensUsed: 0,
            costUsd: 0,
            model: 'error',
          });
        }
      }
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
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) {
      return 'All subtasks failed. Please try again later.';
    }

    if (successfulResults.length === 1) {
      return successfulResults[0].result;
    }

    // Multiple results: aggregate with LLM
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
${plan.expectedOutput ? `The expected output should be: ${plan.expectedOutput}` : ''}
Keep the strengths of each specialist's contribution. Remove redundancy.
Format in clear markdown with sections.`;

    const response = await this.gateway.generate({
      prompt: aggregatePrompt,
      systemPrompt: 'You are a senior business advisor. Combine specialist outputs into one clear, actionable response for a Zimbabwean SME owner. Be concise but thorough.',
      difficulty: 'creative',
      maxTokens: 3000,
      userId,
    });

    return response.content;
  }

  /**
   * Full pipeline: decompose → execute → aggregate
   */
  async run(userRequest: string, userId?: string): Promise<OrchestratorResponse> {
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

    // Inject prior results if this task depends on others
    let enrichedTask = subtask.task;
    if (subtask.dependsOn && subtask.dependsOn.length > 0 && priorResults) {
      const deps = priorResults
        .filter(r => subtask.dependsOn!.includes(r.agentId))
        .map(r => `[${r.agentId} output]: ${r.result}`)
        .join('\n\n');
      enrichedTask = `${subtask.task}\n\n## Prior Results from Dependencies:\n${deps}`;
    }

    // Build prompt with agent-specific params
    const paramText = Object.entries(subtask.params || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const prompt = paramText
      ? `${paramText}\n\n## Task:\n${enrichedTask}`
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
        // Circular dependency or unknown dep — push all remaining
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

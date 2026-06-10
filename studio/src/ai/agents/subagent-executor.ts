import { type AIGateway, aiGateway } from '@/services/ai/ai-gateway';
import { getAgent, getToolsForAgent, builtInTools } from './registry';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ToolCall {
  tool: string;
  params: Record<string, string>;
}

export interface AgentExecution {
  agentId: string;
  prompt: string;
  response: string;
  toolCalls: ToolCall[];
  toolResults: string[];
  tokensUsed: number;
  costUsd: number;
  model: string;
  success: boolean;
  error?: string;
}

export interface SubagentConfig {
  maxToolCalls: number;
  maxRetries: number;
  timeoutMs: number;
  concurrency: number;
}

const DEFAULT_CONFIG: SubagentConfig = {
  maxToolCalls: 3,
  maxRetries: 2,
  timeoutMs: 30_000,
  concurrency: 3,
};

// ─── Semaphore ──────────────────────────────────────────────────────────────

class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    const next = this.waitQueue.shift();
    if (next) {
      next();
    } else {
      this.permits++;
    }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function extractJsonBlocks(text: string): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];

  // Try ```json blocks
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed && typeof parsed === 'object') results.push(parsed);
    } catch { /* skip */ }
  }

  // Try inline JSON objects
  const inlineRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  while ((match = inlineRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed && typeof parsed === 'object' && parsed.tool) {
        results.push(parsed);
      }
    } catch { /* skip */ }
  }

  return results;
}

// ─── Subagent Executor ──────────────────────────────────────────────────────

export class SubagentExecutor {
  private gateway: AIGateway;
  private config: SubagentConfig;
  private semaphore: Semaphore;

  constructor(config?: Partial<SubagentConfig>) {
    this.gateway = aiGateway;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.semaphore = new Semaphore(this.config.concurrency);
  }

  /**
   * Run a single agent with the given prompt.
   * Supports tool-calling loop, timeout, and concurrency limits.
   */
  async run(
    agentId: string,
    prompt: string,
    userId?: string,
    context?: Record<string, string>,
  ): Promise<AgentExecution> {
    const agent = getAgent(agentId);
    if (!agent) {
      return this.errorExecution(agentId, prompt, `Agent not found: ${agentId}`);
    }

    await this.semaphore.acquire();

    const execution: AgentExecution = {
      agentId,
      prompt,
      response: '',
      toolCalls: [],
      toolResults: [],
      tokensUsed: 0,
      costUsd: 0,
      model: '',
      success: false,
    };

    try {
      const tools = getToolsForAgent(agentId);
      const toolBlock = this.buildToolBlock(tools);
      const contextBlock = this.buildContextBlock(context);

      let currentPrompt = prompt + toolBlock + contextBlock;
      let toolCallCount = 0;

      // Tool-calling loop with timeout
      while (toolCallCount < this.config.maxToolCalls) {
        const response = await withTimeout(
          this.gateway.generate({
            prompt: currentPrompt,
            systemPrompt: agent.systemPrompt,
            difficulty: agent.model as any,
            maxTokens: agent.maxTokens,
            temperature: agent.temperature,
            userId,
          }),
          this.config.timeoutMs,
          `Agent ${agentId}`,
        );

        execution.tokensUsed += response.tokensUsed;
        execution.costUsd += response.costUsd;
        execution.model = response.model;

        if (response.error) {
          execution.error = response.error;
          break;
        }

        // Check for tool calls using structured extraction
        const toolCall = this.extractToolCall(response.content, tools.map(t => t.name));
        if (!toolCall) {
          execution.response = response.content;
          execution.success = true;
          break;
        }

        // Execute the tool
        const tool = builtInTools[toolCall.tool];
        if (!tool) {
          execution.response = response.content;
          execution.error = `Unknown tool: ${toolCall.tool}`;
          break;
        }

        execution.toolCalls.push(toolCall);

        try {
          const toolResult = await withTimeout(
            tool.execute(toolCall.params),
            10_000,
            `Tool ${toolCall.tool}`,
          );
          execution.toolResults.push(toolResult);
          currentPrompt = `${currentPrompt}\n\n## Tool Response (${toolCall.tool}):\n${toolResult}\n\nNow provide your final response based on this tool result.`;
          toolCallCount++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          execution.toolResults.push(`Error: ${msg}`);
          currentPrompt = `${currentPrompt}\n\n## Tool Error (${toolCall.tool}):\n${msg}\n\nPlease provide your response without this tool.`;
          toolCallCount++;
        }
      }

      if (!execution.response && !execution.error) {
        execution.response = 'Tool call limit reached. Partial results may be available.';
        execution.success = execution.toolResults.length > 0;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      execution.error = msg;
      execution.success = false;
    } finally {
      this.semaphore.release();
    }

    return execution;
  }

  /**
   * Run multiple agents in parallel with concurrency limits.
   */
  async runMany(
    tasks: Array<{ agentId: string; prompt: string; context?: Record<string, string> }>,
    userId?: string,
  ): Promise<AgentExecution[]> {
    const promises = tasks.map(t => this.run(t.agentId, t.prompt, userId, t.context));
    const results = await Promise.allSettled(promises);

    return results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return this.errorExecution(tasks[i].agentId, tasks[i].prompt, r.reason?.message || 'Execution failed');
    });
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private buildToolBlock(tools: Array<{ name: string; description: string }>): string {
    if (tools.length === 0) return '';
    return `\n\n## Available Tools\nYou have access to these tools. To use a tool, respond with ONLY a JSON block:\n\`\`\`json\n{"tool": "tool_name", "params": {"param": "value"}}\n\`\`\`\n\nTools:\n${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}\n\nIf you don't need a tool, respond normally with your analysis. Do not include tool calls in regular text.`;
  }

  private buildContextBlock(context?: Record<string, string>): string {
    if (!context || Object.keys(context).length === 0) return '';
    return `\n\n## Context\n${Object.entries(context).map(([k, v]) => `${k}: ${v}`).join('\n')}`;
  }

  /**
   * Extract tool call from LLM response.
   * Tries structured JSON extraction first, then falls back to regex.
   */
  private extractToolCall(text: string, validTools: string[]): ToolCall | null {
    // Strategy 1: Find all JSON blocks and look for tool calls
    const jsonBlocks = extractJsonBlocks(text);
    for (const block of jsonBlocks) {
      if (typeof block.tool === 'string' && validTools.includes(block.tool)) {
        return {
          tool: block.tool,
          params: (block.params && typeof block.params === 'object')
            ? block.params as Record<string, string>
            : {},
        };
      }
    }

    // Strategy 2: Look for a standalone JSON object with "tool" key at start/end of text
    const trimmed = text.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.tool && validTools.includes(parsed.tool)) {
          return { tool: parsed.tool, params: parsed.params || {} };
        }
      } catch { /* skip */ }
    }

    // Strategy 3: Last-line JSON (LLM often puts tool call on its own line)
    const lines = text.split('\n').filter(l => l.trim());
    const lastLine = lines[lines.length - 1]?.trim();
    if (lastLine?.startsWith('{') && lastLine.endsWith('}')) {
      try {
        const parsed = JSON.parse(lastLine);
        if (parsed.tool && validTools.includes(parsed.tool)) {
          return { tool: parsed.tool, params: parsed.params || {} };
        }
      } catch { /* skip */ }
    }

    return null;
  }

  private errorExecution(agentId: string, prompt: string, error: string): AgentExecution {
    return {
      agentId,
      prompt,
      response: '',
      toolCalls: [],
      toolResults: [],
      tokensUsed: 0,
      costUsd: 0,
      model: 'error',
      success: false,
      error,
    };
  }
}

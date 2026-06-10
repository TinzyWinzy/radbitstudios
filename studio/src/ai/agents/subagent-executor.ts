import { AIGateway } from '@/services/ai/ai-gateway';
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
}

const DEFAULT_CONFIG: SubagentConfig = {
  maxToolCalls: 3,
  maxRetries: 2,
};

// ─── Subagent Executor ──────────────────────────────────────────────────────

/**
 * Executes a single subagent with optional tool-calling loop.
 *
 * Flow:
 *   1. Send prompt to agent's LLM with tool definitions
 *   2. If LLM responds with a tool call → execute tool → feed result back
 *   3. Repeat until LLM gives a final text response (or maxToolCalls reached)
 */
export class SubagentExecutor {
  private gateway: AIGateway;
  private config: SubagentConfig;

  constructor(config?: Partial<SubagentConfig>) {
    this.gateway = new AIGateway();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Run a single agent with the given prompt.
   * Optionally allow tool calls.
   */
  async run(
    agentId: string,
    prompt: string,
    userId?: string,
    context?: Record<string, string>,
  ): Promise<AgentExecution> {
    const agent = getAgent(agentId);
    if (!agent) {
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
        error: `Agent not found: ${agentId}`,
      };
    }

    const tools = getToolsForAgent(agentId);
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

    // Build tool descriptions for the prompt
    const toolDescriptions = tools.length > 0
      ? `\n\n## Available Tools\nYou have access to these tools. To use a tool, respond with a JSON block:\n\`\`\`json\n{"tool": "tool_name", "params": {"param": "value"}}\n\`\`\`\n\nTools:\n${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}\n\nIf you don't need a tool, just respond normally with your analysis.`
      : '';

    // Inject context if provided
    const contextBlock = context && Object.keys(context).length > 0
      ? `\n\n## Context\n${Object.entries(context).map(([k, v]) => `${k}: ${v}`).join('\n')}`
      : '';

    let currentPrompt = prompt + toolDescriptions + contextBlock;
    let toolCallCount = 0;

    // Tool-calling loop
    while (toolCallCount < this.config.maxToolCalls) {
      const response = await this.gateway.generate({
        prompt: currentPrompt,
        systemPrompt: agent.systemPrompt,
        difficulty: agent.model as any,
        maxTokens: agent.maxTokens,
        temperature: agent.temperature,
        userId,
      });

      execution.tokensUsed += response.tokensUsed;
      execution.costUsd += response.costUsd;
      execution.model = response.model;

      if (response.error) {
        execution.error = response.error;
        break;
      }

      // Check if response contains a tool call
      const toolCall = this.extractToolCall(response.content);
      if (!toolCall) {
        // No tool call — this is the final response
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
        const toolResult = await tool.execute(toolCall.params);
        execution.toolResults.push(toolResult);

        // Feed tool result back into the conversation
        currentPrompt = `${currentPrompt}\n\n## Tool Response (${toolCall.tool}):\n${toolResult}\n\nNow provide your final response based on this tool result.`;
        toolCallCount++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        execution.toolResults.push(`Error: ${msg}`);
        currentPrompt = `${currentPrompt}\n\n## Tool Error (${toolCall.tool}):\n${msg}\n\nPlease provide your response without this tool.`;
        toolCallCount++;
      }
    }

    // If we exhausted tool calls without a final response
    if (!execution.response && !execution.error) {
      execution.response = 'Tool call limit reached. Partial results may be available.';
      execution.success = execution.toolResults.length > 0;
    }

    return execution;
  }

  /**
   * Run multiple agents in parallel.
   */
  async runMany(
    tasks: Array<{ agentId: string; prompt: string; context?: Record<string, string> }>,
    userId?: string,
  ): Promise<AgentExecution[]> {
    const promises = tasks.map(t => this.run(t.agentId, t.prompt, userId, t.context));
    const results = await Promise.allSettled(promises);

    return results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return {
        agentId: tasks[i].agentId,
        prompt: tasks[i].prompt,
        response: '',
        toolCalls: [],
        toolResults: [],
        tokensUsed: 0,
        costUsd: 0,
        model: 'error',
        success: false,
        error: r.reason?.message || 'Execution failed',
      };
    });
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  /**
   * Extract a tool call from LLM response text.
   * Looks for JSON blocks with "tool" key.
   */
  private extractToolCall(text: string): ToolCall | null {
    // Try JSON code blocks first
    const jsonBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonBlockMatch) {
      try {
        const parsed = JSON.parse(jsonBlockMatch[1]);
        if (parsed.tool && typeof parsed.tool === 'string') {
          return { tool: parsed.tool, params: parsed.params || {} };
        }
      } catch { /* fall through */ }
    }

    // Try inline JSON
    const inlineMatch = text.match(/\{"tool"\s*:\s*"([^"]+)"(?:,\s*"params"\s*:\s*(\{[^}]*\}))?\}/);
    if (inlineMatch) {
      try {
        const params = inlineMatch[2] ? JSON.parse(inlineMatch[2]) : {};
        return { tool: inlineMatch[1], params };
      } catch { /* fall through */ }
    }

    // Try a more relaxed pattern for multi-line tool calls
    const relaxedMatch = text.match(/\{\s*"tool"\s*:\s*"([^"]+)"[\s\S]*?"params"\s*:\s*\{([\s\S]*?)\}/);
    if (relaxedMatch) {
      try {
        // Try to extract key-value pairs from the params block
        const paramsBlock = relaxedMatch[2];
        const params: Record<string, string> = {};
        const kvPairs = paramsBlock.matchAll(/"(\w+)"\s*:\s*"([^"]*)"/g);
        for (const kv of kvPairs) {
          params[kv[1]] = kv[2];
        }
        return { tool: relaxedMatch[1], params };
      } catch { /* fall through */ }
    }

    return null;
  }
}

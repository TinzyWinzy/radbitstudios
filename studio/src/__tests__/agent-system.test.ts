import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setupMockAIGateway,
  resetMock,
  setMockContent,
  setMockError,
} from '@/__tests__/helpers/mock-ai-gateway';

setupMockAIGateway();

beforeEach(() => {
  resetMock();
  vi.restoreAllMocks();
});

// ── Registry Tests ──────────────────────────────────────────────────────────

describe('Agent Registry', () => {
  it('lists all agents including orchestrator', async () => {
    const { listAgents } = await import('@/ai/agents/registry');
    const agents = listAgents();
    expect(agents.length).toBeGreaterThan(10);
  });

  it('returns correct agent by id', async () => {
    const { getAgent } = await import('@/ai/agents/registry');
    const agent = getAgent('marketing_copywriter');
    expect(agent).toBeDefined();
    expect(agent?.name).toBe('Marketing Copywriter');
    expect(agent?.persona).toBe('Nyasha');
  });

  it('returns undefined for unknown agent', async () => {
    const { getAgent } = await import('@/ai/agents/registry');
    expect(getAgent('nonexistent')).toBeUndefined();
  });

  it('returns tools for agent with tools', async () => {
    const { getToolsForAgent } = await import('@/ai/agents/registry');
    const tools = getToolsForAgent('swot_analyst');
    expect(tools.length).toBe(1);
    expect(tools[0].name).toBe('generate_swot');
  });

  it('returns empty tools for agent without tools', async () => {
    const { getToolsForAgent } = await import('@/ai/agents/registry');
    const tools = getToolsForAgent('orchestrator');
    expect(tools).toEqual([]);
  });

  it('all agents have required fields', async () => {
    const { listAgents } = await import('@/ai/agents/registry');
    const agents = listAgents();
    for (const agent of agents) {
      expect(agent.id).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.persona).toBeTruthy();
      expect(agent.systemPrompt).toBeTruthy();
      expect(agent.capabilities.length).toBeGreaterThan(0);
    }
  });
});

// ── SubagentExecutor Tests ──────────────────────────────────────────────────

describe('SubagentExecutor', () => {
  it('executes a single agent successfully', async () => {
    const { SubagentExecutor } = await import('@/ai/agents/subagent-executor');
    setMockContent('Marketing plan for your business');

    const executor = new SubagentExecutor();
    const result = await executor.run('marketing_copywriter', 'Create a marketing plan');

    expect(result.success).toBe(true);
    expect(result.response).toBe('Marketing plan for your business');
    expect(result.agentId).toBe('marketing_copywriter');
  });

  it('returns error for unknown agent', async () => {
    const { SubagentExecutor } = await import('@/ai/agents/subagent-executor');

    const executor = new SubagentExecutor();
    const result = await executor.run('nonexistent_agent', 'test');

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('handles gateway errors gracefully', async () => {
    const { SubagentExecutor } = await import('@/ai/agents/subagent-executor');
    setMockError('API rate limited');

    const executor = new SubagentExecutor();
    const result = await executor.run('marketing_copywriter', 'test');

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('passes correct prompt to gateway', async () => {
    const { SubagentExecutor } = await import('@/ai/agents/subagent-executor');
    setMockContent('ok');

    const executor = new SubagentExecutor();
    await executor.run('swot_analyst', 'Analyze strengths and weaknesses');

    const { getLastGenerateCall } = await import('@/__tests__/helpers/mock-ai-gateway');
    const call = getLastGenerateCall();
    expect(call?.prompt).toContain('Analyze strengths and weaknesses');
  });
});

// ── Tool Tests ──────────────────────────────────────────────────────────────

describe('Built-in Tools', () => {
  it('swot tool returns AI response', async () => {
    const { builtInTools } = await import('@/ai/agents/registry');
    setMockContent('SWOT analysis complete');

    const result = await builtInTools.generate_swot.execute({
      query: 'Analyze my business',
      businessName: 'TestCo',
    });

    expect(result).toBe('SWOT analysis complete');
  });

  it('tax tool returns AI response', async () => {
    const { builtInTools } = await import('@/ai/agents/registry');
    setMockContent('Tax guidance for your business');

    const result = await builtInTools.generate_tax_guidance.execute({
      query: 'What are my tax obligations?',
      businessName: 'TestCo',
    });

    expect(result).toBe('Tax guidance for your business');
  });

  it('mentor tool returns AI response', async () => {
    const { builtInTools } = await import('@/ai/agents/registry');
    setMockContent('Business mentoring advice');

    const result = await builtInTools.mentor_chat.execute({
      query: 'How do I grow my business?',
    });

    expect(result).toBe('Business mentoring advice');
  });
});

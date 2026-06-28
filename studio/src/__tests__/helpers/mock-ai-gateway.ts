import type { AIGatewayRequest, AIGatewayResponse } from '@/services/ai/ai-gateway';

export type MockResponse = Partial<AIGatewayResponse>;

let nextResponse: MockResponse = { content: 'mock response' };
let nextError: string | null = null;
let callHistory: AIGatewayRequest[] = [];

export function resetMock(): void {
  nextResponse = { content: 'mock response' };
  nextError = null;
  callHistory = [];
}

export function setMockContent(content: string): void {
  nextResponse = { content };
  nextError = null;
}

export function setMockJsonResponse(data: Record<string, unknown>): void {
  nextResponse = { content: JSON.stringify(data) };
  nextError = null;
}

export function setMockError(error: string): void {
  nextError = error;
  nextResponse = { content: '' };
}

export function getGenerateCalls(): AIGatewayRequest[] {
  return callHistory;
}

export function getLastGenerateCall(): AIGatewayRequest | undefined {
  return callHistory[callHistory.length - 1];
}

export class MockAIGateway {
  constructor() {
    // no-op
  }

  async generate(request: AIGatewayRequest): Promise<AIGatewayResponse> {
    callHistory.push({ ...request });
    if (nextError) {
      return {
        content: '',
        model: 'test-mock',
        tokensUsed: 0,
        costUsd: 0,
        cached: false,
        error: nextError,
      };
    }
    return {
      content: nextResponse.content ?? '',
      model: 'test-mock',
      tokensUsed: 0,
      costUsd: 0,
      cached: false,
    };
  }

  selectRoute(
    _difficulty: string,
    _tier: number,
    keys: Record<string, boolean>,
  ): { model: string; provider: 'gemini' | 'openai' | 'anthropic'; costPer1kInput: number; costPer1kOutput: number; minTier: number } | null {
    if (!keys.gemini && !keys.openai && !keys.anthropic) return null;
    return { model: 'test-model', provider: 'gemini', costPer1kInput: 0, costPer1kOutput: 0, minTier: 0 };
  }
}

/**
 * Call at top level of test files to mock @/services/ai/ai-gateway.
 * Note: this must be called at the top level of the module (not inside test hooks)
 * so that vitest can hoist the vi.mock call correctly.
 */
export function setupMockAIGateway(): void {
  // state init only — the actual vi.mock call must be in the test file's top level
  resetMock();
}

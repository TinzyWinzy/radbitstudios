import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIGateway } from '@/services/ai/ai-gateway';

vi.mock('@/services/ai/rag', () => ({
  searchRelevantContext: vi.fn().mockResolvedValue([]),
  buildRAGContext: vi.fn().mockReturnValue(''),
}));

vi.mock('@/services/ai/embeddings', () => ({
  generateEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  cosineSimilarity: vi.fn().mockReturnValue(0.5),
  generateEmbeddingsBatch: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
}));

describe('AIGateway.selectRoute', () => {
  let gateway: AIGateway;

  beforeEach(() => {
    gateway = new AIGateway();
  });

  it('returns cheapest route available for user tier', () => {
    const allKeys = { gemini: true, openai: true, anthropic: true };
    const route = gateway.selectRoute('simple', 0, allKeys);
    expect(route).not.toBeNull();
    expect(route!.provider).toBe('gemini');
    expect(route!.model).toBe('gemini-2.0-flash');
  });

  it('returns null when no keys available', () => {
    const noKeys = { gemini: false, openai: false, anthropic: false };
    const route = gateway.selectRoute('simple', 2, noKeys);
    expect(route).toBeNull();
  });

  it('selects GPT-4o-mini when tier >= 1 and gemini is unavailable', () => {
    const noGemini = { gemini: false, openai: true, anthropic: false };
    const route = gateway.selectRoute('simple', 1, noGemini);
    expect(route).not.toBeNull();
    expect(route!.provider).toBe('openai');
    expect(route!.model).toBe('gpt-4o-mini');
  });

  it('blocks high-tier models for Free users (tier 0)', () => {
    const allKeys = { gemini: true, openai: true, anthropic: true };
    const route = gateway.selectRoute('complex', 0, allKeys);
    expect(route).not.toBeNull();
    expect(route!.model).toBe('gemini-2.0-flash');
    expect(route!.model).not.toBe('gemini-1.5-pro');
    expect(route!.model).not.toBe('gpt-4o');
  });

  it('allows Pro users (tier 2) to access GPT-4o', () => {
    const allKeys = { gemini: true, openai: true, anthropic: true };
    const route = gateway.selectRoute('complex', 2, allKeys);
    expect(route).not.toBeNull();
    expect(route!.provider).toBe('gemini');
  });

  it('routes creative tasks to cheapest available model', () => {
    const allKeys = { gemini: true, openai: true, anthropic: true };
    const route = gateway.selectRoute('creative', 2, allKeys);
    expect(route).not.toBeNull();
    expect(route!.provider).toBe('gemini');
  });
});

describe('AIGateway.generate', () => {
  let gateway: AIGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.mocked(fetch).mockRejectedValue(new Error('API unreachable'));
    gateway = new AIGateway();
  });

  it('returns fallback-no-key when no API keys configured at all', async () => {
    vi.stubEnv('GOOGLE_GENAI_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');

    const result = await gateway.generate({ prompt: 'hello' });
    expect(result.model).toBe('fallback-no-key');
    expect(result.content).toContain('unavailable');
    expect(result.error).toBe('AI service not configured (missing API key).');
  });

  it('validates gemini key via GEMINI_API_KEY fallback', async () => {
    vi.stubEnv('GOOGLE_GENAI_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'hello' }] } }] }),
    } as Response);

    const result = await gateway.generate({ prompt: 'test' });
    expect(result.model).not.toBe('fallback-no-key');
    expect(result.content).toBe('hello');
  });

  it('returns fallback response when primary model fails', async () => {
    vi.stubEnv('GOOGLE_GENAI_API_KEY', 'fake-key');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');

    const result = await gateway.generate({ prompt: 'trigger-failure', difficulty: 'simple' });
    expect(result.model).toBe('fallback');
    expect(result.error).toBeTruthy();
  });

  it('respects difficulty-based fallback messages', async () => {
    vi.stubEnv('GOOGLE_GENAI_API_KEY', 'fake-key');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');

    const result = await gateway.generate({ prompt: 'x', difficulty: 'complex' });
    expect(result.content).toContain('unavailable');
  });

  it('passes rate limit check before processing', async () => {
    const { checkRateLimit } = await import('@/services/rate-limiter');
    vi.mocked(checkRateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, retryAfterSeconds: 10, limit: 30 });

    const result = await gateway.generate({ prompt: 'hello' });
    expect(result.model).toBe('rate-limited');
    expect(result.error).toBe('Too many requests. Please slow down.');

    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true, remaining: 29, limit: 30 });
  });
});

export type TaskDifficulty = 'simple' | 'complex' | 'creative';

export interface AIGatewayRequest {
  prompt: string;
  systemPrompt?: string;
  difficulty?: TaskDifficulty;
  maxTokens?: number;
  temperature?: number;
  userId?: string;
  jsonMode?: boolean;
}

export interface AIGatewayResponse {
  content: string;
  model: string;
  tokensUsed: number;
  costUsd: number;
  cached: boolean;
  error?: string;
}

const MODEL_ROUTES: Record<TaskDifficulty, { model: string; provider: 'openai' | 'anthropic'; costPer1kInput: number; costPer1kOutput: number }[]> = {
  simple: [
    { model: 'gpt-4o-mini', provider: 'openai', costPer1kInput: 0.00015, costPer1kOutput: 0.0006 },
    { model: 'claude-3-haiku', provider: 'anthropic', costPer1kInput: 0.00025, costPer1kOutput: 0.00125 },
  ],
  complex: [
    { model: 'gpt-4o', provider: 'openai', costPer1kInput: 0.0025, costPer1kOutput: 0.01 },
    { model: 'claude-3.5-sonnet', provider: 'anthropic', costPer1kInput: 0.003, costPer1kOutput: 0.015 },
  ],
  creative: [
    { model: 'gpt-4o', provider: 'openai', costPer1kInput: 0.005, costPer1kOutput: 0.015 },
  ],
};

const REQUEST_TIMEOUT_MS = 25_000;
const MAX_RETRIES = 2;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

class SemanticCache {
  private cache = new Map<string, { response: AIGatewayResponse; expiry: number }>();

  get(key: string): AIGatewayResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) { this.cache.delete(key); return null; }
    return { ...entry.response, cached: true };
  }

  set(key: string, response: AIGatewayResponse, ttlMs = 86400000): void {
    this.cache.set(key, { response, expiry: Date.now() + ttlMs });
  }
}

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function sanitizeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const sensitive = ['sk-', 'Bearer ', 'AIza', 'api-key', 'x-api-key', 'authorization'];
  for (const s of sensitive) {
    if (msg.toLowerCase().includes(s.toLowerCase())) return 'AI service error (details suppressed)';
  }
  return msg;
}

export class AIGateway {
  private cache = new SemanticCache();
  private userBudgets = new Map<string, { used: number; limit: number }>();
  private requestLog: number[] = [];

  private checkRateLimit(): boolean {
    const now = Date.now();
    this.requestLog = this.requestLog.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (this.requestLog.length >= MAX_REQUESTS_PER_WINDOW) return false;
    this.requestLog.push(now);
    return true;
  }

  private validateApiKeys(): { openai: boolean; anthropic: boolean } {
    return {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
    };
  }

  setUserBudget(userId: string, limitUsd: number): void {
    this.userBudgets.set(userId, { used: 0, limit: limitUsd });
  }

  async generate(request: AIGatewayRequest): Promise<AIGatewayResponse> {
    const difficulty = request.difficulty || 'simple';

    if (!this.checkRateLimit()) {
      return { content: '', model: 'rate-limited', tokensUsed: 0, costUsd: 0, cached: false, error: 'Too many requests. Please slow down.' };
    }

    const keys = this.validateApiKeys();
    if (!keys.openai) {
      return { content: this.getFallbackResponse(difficulty), model: 'fallback-no-key', tokensUsed: 0, costUsd: 0, cached: false, error: 'AI service not configured (missing API key).' };
    }

    if (request.userId) {
      const budget = this.userBudgets.get(request.userId);
      if (budget && budget.used >= budget.limit) {
        return { content: '', model: 'budget-limit', tokensUsed: 0, costUsd: 0, cached: false, error: 'AI usage limit reached for this billing period.' };
      }
    }

    const cacheKey = `${request.systemPrompt ?? ''}|${request.prompt}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const route = MODEL_ROUTES[difficulty];
    const selected = route[0];
    const estimatedTokens = Math.ceil((request.prompt.length + (request.systemPrompt?.length ?? 0)) / 4);
    const estimatedCost = (estimatedTokens / 1000) * (selected.costPer1kInput + selected.costPer1kOutput);

    if (request.userId) {
      const budget = this.userBudgets.get(request.userId);
      if (budget && budget.used + estimatedCost > budget.limit) {
        return { content: '', model: 'budget-limit', tokensUsed: 0, costUsd: 0, cached: false, error: 'This request exceeds your remaining AI budget.' };
      }
    }

    let lastError: string = '';

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const content = await this.callModel(selected.provider, selected.model, request);

        if (!content) {
          lastError = 'Empty response from AI model';
          if (attempt < MAX_RETRIES) continue;
          break;
        }

        const response: AIGatewayResponse = {
          content, model: selected.model,
          tokensUsed: estimatedTokens, costUsd: estimatedCost, cached: false,
        };

        this.cache.set(cacheKey, response);
        if (request.userId) {
          const budget = this.userBudgets.get(request.userId);
          if (budget) budget.used += estimatedCost;
        }
        return response;
      } catch (error: any) {
        lastError = sanitizeError(error);

        if (error instanceof DOMException && error.name === 'AbortError') {
          lastError = 'AI request timed out';
        }

        if (attempt < MAX_RETRIES) {
          console.warn(`AI call attempt ${attempt + 1} failed: ${lastError}, retrying...`);
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
      }
    }

    if (route.length > 1) {
      try {
        const fallback = route[1];
        const content = await this.callModel(fallback.provider, fallback.model, request);
        return {
          content, model: fallback.model,
          tokensUsed: estimatedTokens, costUsd: estimatedCost, cached: false,
          error: `Primary model failed. Used fallback.`,
        };
      } catch {
        return {
          content: this.getFallbackResponse(difficulty), model: 'fallback',
          tokensUsed: 0, costUsd: 0, cached: false,
          error: lastError || 'AI service unavailable after fallback.',
        };
      }
    }

    return {
      content: this.getFallbackResponse(difficulty), model: 'fallback',
      tokensUsed: 0, costUsd: 0, cached: false,
      error: lastError || 'AI service unavailable.',
    };
  }

  private async callModel(provider: string, model: string, request: AIGatewayRequest): Promise<string> {
    if (provider === 'openai') return this.callOpenAI(model, request);
    if (provider === 'anthropic') return this.callAnthropic(model, request);
    throw new Error(`Unknown provider: ${provider}`);
  }

  private async callOpenAI(model: string, request: AIGatewayRequest): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');

    const body: any = {
      model,
      messages: [
        ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
        { role: 'user', content: request.prompt },
      ],
      max_tokens: request.maxTokens || 2048,
      temperature: request.temperature ?? 0.7,
    };
    if (request.jsonMode) {
      body.response_format = { type: 'json_object' };
      if (!request.systemPrompt) {
        body.messages.unshift({ role: 'system', content: 'You are a helpful assistant that always responds with valid JSON.' });
      }
    }

    const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, REQUEST_TIMEOUT_MS);

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `OpenAI API error (${res.status})`);
    return data.choices?.[0]?.message?.content || '';
  }

  private async callAnthropic(model: string, request: AIGatewayRequest): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

    const body: any = {
      model,
      max_tokens: request.maxTokens || 2048,
      messages: [{ role: 'user', content: request.prompt }],
    };
    if (request.systemPrompt) body.system = request.systemPrompt;

    const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, REQUEST_TIMEOUT_MS);

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `Anthropic API error (${res.status})`);
    return data.content?.[0]?.text || '';
  }

  private getFallbackResponse(difficulty: TaskDifficulty): string {
    switch (difficulty) {
      case 'complex': return 'This feature is temporarily unavailable. Please try again later.';
      case 'creative': return 'This feature is not available right now.';
      default: return 'This feature is currently unavailable. Please try again later.';
    }
  }
}

// AI Gateway — multi-model routing with cost optimization
// Routes: simple → GPT-4o-mini, complex → GPT-4o, images → DALL-E 3

export type TaskDifficulty = 'simple' | 'complex' | 'creative';

export interface AIGatewayRequest {
  prompt: string;
  systemPrompt?: string;
  difficulty?: TaskDifficulty;
  maxTokens?: number;
  temperature?: number;
  userId?: string;
}

export interface AIGatewayResponse {
  content: string;
  model: string;
  tokensUsed: number;
  costUsd: number;
  cached: boolean;
  citations?: { source: string; text: string }[];
}

const MODEL_ROUTES: Record<TaskDifficulty, { model: string; costPer1kInput: number; costPer1kOutput: number }[]> = {
  simple: [
    { model: 'gpt-4o-mini', costPer1kInput: 0.00015, costPer1kOutput: 0.0006 },
    { model: 'claude-3-haiku', costPer1kInput: 0.00025, costPer1kOutput: 0.00125 },
  ],
  complex: [
    { model: 'gpt-4o', costPer1kInput: 0.0025, costPer1kOutput: 0.01 },
    { model: 'claude-3.5-sonnet', costPer1kInput: 0.003, costPer1kOutput: 0.015 },
  ],
  creative: [
    { model: 'gpt-4o', costPer1kInput: 0.005, costPer1kOutput: 0.015 },
    { model: 'claude-3.5-sonnet', costPer1kInput: 0.003, costPer1kOutput: 0.015 },
  ],
};

// Simple in-memory semantic cache (TTL: 24h)
class SemanticCache {
  private cache = new Map<string, { response: AIGatewayResponse; expiry: number; embedding: number[] }>();

  async get(prompt: string): Promise<AIGatewayResponse | null> {
    const promptEmbedding = await this.embed(prompt);
    for (const [key, entry] of this.cache) {
      if (Date.now() > entry.expiry) { this.cache.delete(key); continue; }
      const similarity = this.cosineSimilarity(promptEmbedding, entry.embedding);
      if (similarity > 0.92) return { ...entry.response, cached: true };
    }
    return null;
  }

  async set(prompt: string, response: AIGatewayResponse): Promise<void> {
    this.cache.set(prompt, { response, expiry: Date.now() + 86400000, embedding: await this.embed(prompt) });
  }

  private async embed(text: string): Promise<number[]> {
    // In production: use OpenAI/text-embedding-3-small via API
    // Simplified: use character-code based hash for local dev
    const dims = 128;
    const vec = new Array(dims).fill(0);
    for (let i = 0; i < text.length; i++) vec[i % dims] += text.charCodeAt(i);
    const magnitude = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    return vec.map(v => v / magnitude);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((s, v, i) => s + v * b[i], 0);
    return dot;
  }
}

export class AIGateway {
  private cache = new SemanticCache();
  private userBudgets = new Map<string, { used: number; limit: number }>();

  constructor() {
    // User budgets would be loaded from Firestore in production
  }

  setUserBudget(userId: string, limitUsd: number): void {
    this.userBudgets.set(userId, { used: 0, limit: limitUsd });
  }

  async generate(request: AIGatewayRequest): Promise<AIGatewayResponse> {
    const difficulty = request.difficulty || 'simple';

    // Check budget
    if (request.userId) {
      const budget = this.userBudgets.get(request.userId);
      if (budget && budget.used >= budget.limit) {
        return { content: 'You have reached your AI usage limit for this month.', model: 'budget-limit', tokensUsed: 0, costUsd: 0, cached: false };
      }
    }

    // Check semantic cache
    const cached = await this.cache.get(request.prompt);
    if (cached) return cached;

    // Route to cheapest adequate model
    const route = MODEL_ROUTES[difficulty];
    const selected = route[0];
    const estimatedTokens = Math.ceil(request.prompt.length / 4);
    const estimatedCost = (estimatedTokens / 1000) * (selected.costPer1kInput + selected.costPer1kOutput);

    // Check if budget allows
    if (request.userId) {
      const budget = this.userBudgets.get(request.userId);
      if (budget && budget.used + estimatedCost > budget.limit) {
        return { content: 'This request exceeds your remaining AI budget.', model: 'budget-limit', tokensUsed: 0, costUsd: 0, cached: false };
      }
    }

    try {
      const content = await this.callModel(selected.model, request);
      const response: AIGatewayResponse = {
        content,
        model: selected.model,
        tokensUsed: estimatedTokens,
        costUsd: estimatedCost,
        cached: false,
      };

      // Cache for future use
      await this.cache.set(request.prompt, response);

      // Deduct from budget
      if (request.userId) {
        const budget = this.userBudgets.get(request.userId);
        if (budget) budget.used += estimatedCost;
      }

      return response;
    } catch (error: any) {
      // Fallback to second model if first fails
      if (route.length > 1) {
        console.warn(`${selected.model} failed, falling back to ${route[1].model}`);
        try {
          const content = await this.callModel(route[1].model, request);
          return { content, model: route[1].model, tokensUsed: estimatedTokens, costUsd: estimatedCost, cached: false };
        } catch (e) {
          return { content: this.getFallbackResponse(difficulty), model: 'fallback', tokensUsed: 0, costUsd: 0, cached: false };
        }
      }
      return { content: this.getFallbackResponse(difficulty), model: 'fallback', tokensUsed: 0, costUsd: 0, cached: false };
    }
  }

  private async callModel(model: string, request: AIGatewayRequest): Promise<string> {
    const apiKey = model.startsWith('gpt') ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error(`No API key for ${model}`);

    if (model.startsWith('gpt')) {
      return this.callOpenAI(model, request, apiKey);
    } else if (model.startsWith('claude')) {
      return this.callAnthropic(model, request, apiKey);
    }
    throw new Error(`Unknown model: ${model}`);
  }

  private async callOpenAI(model: string, request: AIGatewayRequest, apiKey: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          ...(request.systemPrompt ? [{ role: 'system' as const, content: request.systemPrompt }] : []),
          { role: 'user' as const, content: request.prompt },
        ],
        max_tokens: request.maxTokens || 1024,
        temperature: request.temperature ?? 0.7,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private async callAnthropic(model: string, request: AIGatewayRequest, apiKey: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        max_tokens: request.maxTokens || 1024,
        system: request.systemPrompt || undefined,
        messages: [{ role: 'user' as const, content: request.prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  private getFallbackResponse(difficulty: TaskDifficulty): string {
    switch (difficulty) {
      case 'complex': return 'AI service is temporarily unavailable. Please check your connection and try again, or try again later.';
      case 'creative': return 'Image generation service is not available right now. Please try again later.';
      default: return 'AI generation is currently unavailable. This feature will be available once connectivity is restored.';
    }
  }

  getBudgetUsage(userId: string): { used: number; limit: number } | null {
    return this.userBudgets.get(userId) || null;
  }
}

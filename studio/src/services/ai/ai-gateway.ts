import * as Sentry from '@sentry/nextjs';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { generateEmbedding, cosineSimilarity } from './embeddings';
import { searchRelevantContext, buildRAGContext } from './rag.server';
import { checkRateLimit, RateLimits } from '@/services/rate-limiter';
import { withCircuitBreaker } from '@/lib/circuit-breaker';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'AIGateway' });

export type TaskDifficulty = 'simple' | 'complex' | 'creative';

export interface AIGatewayRequest {
  prompt: string;
  systemPrompt?: string;
  difficulty?: TaskDifficulty;
  maxTokens?: number;
  temperature?: number;
  userId?: string;
  jsonMode?: boolean;
  enableRAG?: boolean;
  ragCategory?: string;
  enableNews?: boolean;
}

export interface AIGatewayResponse {
  content: string;
  model: string;
  tokensUsed: number;
  costUsd: number;
  cached: boolean;
  error?: string;
}

interface ModelRoute {
  model: string;
  provider: 'gemini' | 'openai' | 'anthropic';
  costPer1kInput: number;
  costPer1kOutput: number;
  minTier: number;
}

const TIER_ORDER = ['Free', 'Growth', 'Pro', 'Enterprise'];

const MODEL_ROUTES: Record<TaskDifficulty, ModelRoute[]> = {
  simple: [
    { model: 'gemini-2.5-flash', provider: 'gemini', costPer1kInput: 0, costPer1kOutput: 0, minTier: 0 },
    { model: 'gpt-4o-mini', provider: 'openai', costPer1kInput: 0.00015, costPer1kOutput: 0.0006, minTier: 1 },
    { model: 'claude-3-haiku', provider: 'anthropic', costPer1kInput: 0.00025, costPer1kOutput: 0.00125, minTier: 2 },
  ],
  complex: [
    { model: 'gemini-2.5-flash', provider: 'gemini', costPer1kInput: 0, costPer1kOutput: 0, minTier: 0 },
    { model: 'gemini-2.5-pro', provider: 'gemini', costPer1kInput: 0, costPer1kOutput: 0, minTier: 2 },
    { model: 'gpt-4o', provider: 'openai', costPer1kInput: 0.0025, costPer1kOutput: 0.01, minTier: 2 },
    { model: 'claude-3.5-sonnet', provider: 'anthropic', costPer1kInput: 0.003, costPer1kOutput: 0.015, minTier: 3 },
  ],
  creative: [
    { model: 'gemini-2.5-flash', provider: 'gemini', costPer1kInput: 0, costPer1kOutput: 0, minTier: 0 },
    { model: 'gpt-4o', provider: 'openai', costPer1kInput: 0.005, costPer1kOutput: 0.015, minTier: 2 },
    { model: 'claude-3.5-sonnet', provider: 'anthropic', costPer1kInput: 0.003, costPer1kOutput: 0.015, minTier: 3 },
  ],
};

const REQUEST_TIMEOUT_MS = 25_000;
const MAX_RETRIES = 2;
const TOKEN_ESTIMATE_FACTOR = 4;

/**
 * Auto-classify prompt complexity based on heuristics.
 * Used when difficulty is not explicitly specified by the caller.
 */
function classifyComplexity(prompt: string, systemPrompt?: string): TaskDifficulty {
  const text = `${prompt} ${systemPrompt || ''}`.toLowerCase();
  const promptLength = prompt.length;

  // Complex indicators: analysis, strategy, multi-step, research, comparison
  const complexPatterns = [
    /analy(s|z)e/i, /strateg(y|ies|ic)/i, /compar(e|ison|ing)/i,
    /research/i, /multi.?step/i, /step.?by.?step/i, /detailed/i,
    /comprehensive/i, /in.?depth/i, /report/i, /plan(ning)?/i,
    /evaluat(e|ion)/i, /assess(ment)?/i, /architect/i, /design/i,
    /integrat(e|ion)/i, /migrat(e|ion)/i, /optimiz(e|ation)/i,
    /swot/i, /financial/i, /projection/i, /forecast/i, /compliance/i,
    /legal/i, /regulat(ion|ory)/i, /tax/i, /audit/i,
  ];

  // Creative indicators: write, generate, create, brainstorm
  const creativePatterns = [
    /writ(e|ing)/i, /generat(e|ing)/i, /creat(e|ing)/i,
    /brainstorm/i, /ideat(e|ion)/i, /draft/i, /compos(e|ing)/i,
    /slogan/i, /tagline/i, /copy/i, /content/i, /blog/i,
    /story/i, /narrative/i, /brand/i, /marketing/i, /pitch/i,
    /email/i, /letter/i, /proposal/i, /essay/i,
  ];

  const complexScore = complexPatterns.filter(p => p.test(text)).length;
  const creativeScore = creativePatterns.filter(p => p.test(text)).length;

  // Long prompts with multi-part questions tend to be complex
  const hasMultipleParts = /\d+[\.\)]\s/.test(prompt) || /firstly|secondly|thirdly|finally/i.test(prompt);
  const isLongPrompt = promptLength > 500;

  if (complexScore >= 3 || (complexScore >= 2 && (hasMultipleParts || isLongPrompt))) {
    return 'complex';
  }
  if (creativeScore >= 2 || (creativeScore >= 1 && promptLength > 200)) {
    return 'creative';
  }
  return 'simple';
}

interface CacheEntry {
  response: AIGatewayResponse;
  embedding: number[];
  systemPrompt: string;
  prompt: string;
  promptHash: string;
  expiry: number;
}

/**
 * Two-tier semantic cache:
 *   Tier 1: In-memory LRU (fast, per-instance)
 *   Tier 2: Firestore (persistent across cold starts)
 *
 * On cache miss, both tiers are populated.
 * On cache hit from Tier 1, skip Tier 2.
 * On cache hit from Tier 2, promote to Tier 1.
 */
class SemanticCache {
  private entries: CacheEntry[] = [];
  private readonly MAX_MEMORY_ENTRIES = 100;
  private readonly Firestore_Collection = 'ai_semantic_cache';
  private readonly TTL_MS = 86_400_000; // 24h
  private readonly SIMILARITY_THRESHOLD = 0.92;

  hasMemoryEntries(): boolean {
    const now = Date.now();
    this.entries = this.entries.filter(e => now < e.expiry);
    return this.entries.length > 0;
  }

  async find(query: string, systemPrompt: string, queryEmbedding?: number[]): Promise<AIGatewayResponse | null> {
    const now = Date.now();
    this.entries = this.entries.filter(e => now < e.expiry);

    if (this.entries.length > 0) {
      const embedding = queryEmbedding ?? await generateEmbedding(query);
      if (embedding.length > 0) {
        let bestScore = 0;
        let bestEntry: CacheEntry | null = null;

        for (const entry of this.entries) {
          if (entry.systemPrompt !== systemPrompt) continue;
          const score = cosineSimilarity(embedding, entry.embedding);
          if (score > bestScore) {
            bestScore = score;
            bestEntry = entry;
          }
        }

        if (bestEntry && bestScore >= this.SIMILARITY_THRESHOLD) {
          return { ...bestEntry.response, cached: true };
        }
      }
    }

    // Tier 2: Firestore lookup (only if we have an embedding)
    const embedding = queryEmbedding ?? (await generateEmbedding(query).catch(() => []));
    if (embedding.length === 0) return null;

    try {
      const snap = await adminDb.collection(this.Firestore_Collection)
        .where('systemPrompt', '==', systemPrompt)
        .where('expiry', '>', now)
        .limit(50)
        .get();

      let bestScore = 0;
      let bestDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;

      for (const doc of snap.docs) {
        const data = doc.data();
        if (!data.embedding || !Array.isArray(data.embedding)) continue;
        const score = cosineSimilarity(embedding, data.embedding);
        if (score > bestScore) {
          bestScore = score;
          bestDoc = doc;
        }
      }

      if (bestDoc && bestScore >= this.SIMILARITY_THRESHOLD) {
        const data = bestDoc.data();
        const response: AIGatewayResponse = {
          content: data.responseContent,
          model: data.responseModel,
          tokensUsed: data.responseTokensUsed || 0,
          costUsd: 0,
          cached: true,
        };

        // Promote to memory cache
        this.addToMemory(data.systemPrompt, data.prompt, response, embedding);
        return response;
      }
    } catch {
      // Firestore unavailable — fall through
    }

    return null;
  }

  async store(systemPrompt: string, prompt: string, response: AIGatewayResponse, queryEmbedding?: number[]): Promise<void> {
    const embedding = queryEmbedding ?? await generateEmbedding(prompt);
    if (embedding.length === 0) return;

    this.addToMemory(systemPrompt, prompt, response, embedding);

    // Persist to Firestore (fire-and-forget)
    adminDb.collection(this.Firestore_Collection).add({
      systemPrompt,
      prompt,
      promptHash: this.hashPrompt(prompt),
      responseContent: response.content,
      responseModel: response.model,
      responseTokensUsed: response.tokensUsed,
      embedding,
      expiry: Date.now() + this.TTL_MS,
      createdAt: new Date(),
    }).catch(() => {});
  }

  private addToMemory(systemPrompt: string, prompt: string, response: AIGatewayResponse, embedding: number[]): void {
    if (this.entries.length >= this.MAX_MEMORY_ENTRIES) {
      this.entries.sort((a, b) => a.expiry - b.expiry);
      this.entries = this.entries.slice(0, Math.floor(this.MAX_MEMORY_ENTRIES / 2));
    }

    this.entries.push({
      response,
      embedding,
      systemPrompt,
      prompt,
      promptHash: this.hashPrompt(prompt),
      expiry: Date.now() + this.TTL_MS,
    });
  }

  private hashPrompt(prompt: string): string {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString(36);
  }
}

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function sanitizeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const sensitive = ['sk-', 'Bearer ', 'AIza', 'api-key', 'x-api-key', 'authorization', 'key='];
  for (const s of sensitive) {
    if (msg.toLowerCase().includes(s.toLowerCase())) return 'AI service error (details suppressed)';
  }
  return msg;
}

function extractJsonFromResponse(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) return jsonMatch[1].trim();
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0];
  return text;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / TOKEN_ESTIMATE_FACTOR);
}

async function buildNewsContext(query: string, queryEmbedding?: number[]): Promise<string> {
  try {
    const { searchRelevantContext, buildRAGContext } = await import('./rag.server');
    const results = await searchRelevantContext(query, 3, 0.5, 'news', undefined, undefined, queryEmbedding);
    if (results.length === 0) return '';
    const dated = results.map(r => {
      const freshness = r.metadata.freshness || r.metadata.freshness;
      const date = freshness ? ` (${freshness})` : '';
      return `${r.content}${date}`;
    });
    return buildRAGContext(results.map((r, i) => ({ ...r, content: dated[i] })));
  } catch {
    return '';
  }
}

export class AIGateway {
  private cache = new SemanticCache();

  private validateApiKeys(): { gemini: boolean; openai: boolean; anthropic: boolean } {
    return {
      gemini: !!(process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY),
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
    };
  }

  private async getUserPlan(userId: string): Promise<{ tier: number; planName: string } | null> {
    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (!userDoc.exists) return null;
      const data = userDoc.data()!;
      const planName: string = (data.plan as string) || 'Free';
      const tier = TIER_ORDER.indexOf(planName);
      return { tier: tier >= 0 ? tier : 0, planName };
    } catch (err) {
      Sentry.captureException(err, { tags: { domain: 'ai-gateway', operation: 'getUserPlan' }, extra: { userId } });
      return null;
    }
  }

  selectRoute(
    difficulty: TaskDifficulty,
    userTier: number,
    availableKeys: { gemini: boolean; openai: boolean; anthropic: boolean },
  ): ModelRoute | null {
    const routes = MODEL_ROUTES[difficulty];

    const priority: Record<string, number> = { gemini: 0, openai: 1, anthropic: 2 };

    const scored = routes
      .filter(r => r.minTier <= userTier)
      .filter(r =>
        r.provider === 'gemini' && availableKeys.gemini ||
        r.provider === 'openai' && availableKeys.openai ||
        r.provider === 'anthropic' && availableKeys.anthropic
      )
      .sort((a, b) => {
        if (a.costPer1kInput !== b.costPer1kInput) return a.costPer1kInput - b.costPer1kInput;
        return (priority[a.provider] ?? 99) - (priority[b.provider] ?? 99);
      });

    return scored[0] || null;
  }

  private async fetchAndBudget(
    userId: string | undefined,
    estimatedCost: number,
  ): Promise<{ allowed: boolean; error?: string }> {
    if (!userId) return { allowed: true };

    try {
      const userDocRef = adminDb.collection('users').doc(userId);
      const result = await adminDb.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists) return { allowed: true };

        const data = userDoc.data()!;
        const usage: { used?: number; limit?: number } = data.aiBudget || { used: 0, limit: 10 };
        const limit = usage.limit ?? 10;
        const used = usage.used ?? 0;

        if (used >= limit) {
          return { allowed: false, error: 'AI usage limit reached for this billing period.' };
        }

        if (used + estimatedCost > limit) {
          return { allowed: false, error: 'This request exceeds your remaining AI budget.' };
        }

        transaction.update(userDocRef, {
          'aiBudget.used': used + estimatedCost,
        });

        return { allowed: true };
      });

      return result;
    } catch (err) {
      Sentry.captureException(err, { tags: { domain: 'ai-gateway', operation: 'fetchAndBudget' }, extra: { userId } });
      return { allowed: true };
    }
  }

  async generate(request: AIGatewayRequest): Promise<AIGatewayResponse> {
    const difficulty = request.difficulty || classifyComplexity(request.prompt, request.systemPrompt);

    const rateKey = request.userId ? `ai:${request.userId}` : 'ai:anonymous';
    const rateResult = await checkRateLimit(rateKey, RateLimits.aiGenerate);
    if (!rateResult.allowed) {
      return { content: '', model: 'rate-limited', tokensUsed: 0, costUsd: 0, cached: false, error: 'Too many requests. Please slow down.' };
    }

    const keys = this.validateApiKeys();
    const hasAnyKey = keys.gemini || keys.openai || keys.anthropic;
    if (!hasAnyKey) {
      Sentry.captureMessage('AI gateway: no API keys configured', {
        level: 'error',
        tags: { domain: 'ai-gateway', operation: 'generate' },
      });
      return { content: this.getFallbackResponse(difficulty), model: 'fallback-no-key', tokensUsed: 0, costUsd: 0, cached: false, error: 'AI service not configured (missing API key).' };
    }

    const userPlan = request.userId ? await this.getUserPlan(request.userId) : null;
    const userTier = userPlan?.tier ?? 0;

    const route = this.selectRoute(difficulty, userTier, keys);
    if (!route) {
      return { content: this.getFallbackResponse(difficulty), model: 'no-route', tokensUsed: 0, costUsd: 0, cached: false, error: 'No suitable AI model available for your plan.' };
    }

    let cacheHit: AIGatewayResponse | null = null;
    // Only generate an embedding if RAG/news is enabled or the in-memory cache may have a match.
    // If neither is true, we skip the cache lookup embedding entirely on cold starts.
    const mayNeedEmbedding = request.enableRAG || request.enableNews || this.cache.hasMemoryEntries();
    let queryEmbedding: number[] | undefined;
    if (mayNeedEmbedding) {
      queryEmbedding = await generateEmbedding(request.prompt).catch(() => []);
    }
    try {
      cacheHit = await this.cache.find(request.prompt, request.systemPrompt ?? '', queryEmbedding);
    } catch {
      // Cache unavailable — proceed directly to model
    }
    if (cacheHit) return cacheHit;

    const [ragContext, newsContext] = await Promise.all([
      request.enableRAG
        ? buildRAGContext(await searchRelevantContext(request.prompt, 5, 0.5, request.ragCategory, undefined, undefined, queryEmbedding))
        : Promise.resolve(''),
      request.enableNews
        ? buildNewsContext(request.prompt, queryEmbedding)
        : Promise.resolve(''),
    ]);

    const parts = [request.prompt];
    if (ragContext) {
      parts.unshift(`Reference information:\n${ragContext}`);
    }
    if (newsContext) {
      parts.unshift(`Recent business news (time-sensitive):\n${newsContext}`);
    }
    const augmentedPrompt = parts.length > 1
      ? `Use the following information to answer the user's question.\n\n${parts.join('\n\n')}`
      : request.prompt;

    const estimatedInputTokens = estimateTokens(augmentedPrompt) + estimateTokens(request.systemPrompt ?? '');
    const estimatedOutputTokens = request.maxTokens || 2048;
    const estimatedCost = (estimatedInputTokens / 1000) * route.costPer1kInput + (estimatedOutputTokens / 1000) * route.costPer1kOutput;

    const budgetCheck = await this.fetchAndBudget(request.userId, estimatedCost);
    if (!budgetCheck.allowed) {
      return { content: '', model: 'budget-limit', tokensUsed: 0, costUsd: 0, cached: false, error: budgetCheck.error || 'Budget limit reached.' };
    }

    let lastError = '';

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await this.callModel(route.provider, route.model, {
          ...request,
          prompt: augmentedPrompt,
        });

        if (!result.content) {
          lastError = 'Empty response from AI model';
          if (attempt < MAX_RETRIES) continue;
          break;
        }

        const actualInputTokens = result.inputTokens || estimatedInputTokens;
        const actualOutputTokens = result.outputTokens || estimateTokens(result.content);
        const actualCost = (actualInputTokens / 1000) * route.costPer1kInput + (actualOutputTokens / 1000) * route.costPer1kOutput;

        const response: AIGatewayResponse = {
          content: result.content,
          model: route.model,
          tokensUsed: actualInputTokens + actualOutputTokens,
          costUsd: actualCost,
          cached: false,
        };

        this.cache.store(request.systemPrompt ?? '', request.prompt, response, queryEmbedding).catch(() => {});
        return response;
      } catch (error: unknown) {
        lastError = sanitizeError(error);

        if (error instanceof DOMException && error.name === 'AbortError') {
          lastError = 'AI request timed out';
        }

        const modelHasNoKey =
          (route.provider === 'gemini' && !keys.gemini) ||
          (route.provider === 'openai' && !keys.openai) ||
          (route.provider === 'anthropic' && !keys.anthropic);
        if (modelHasNoKey) break;

        if (attempt < MAX_RETRIES) {
          log.warn(`AI call attempt ${attempt + 1} failed: ${lastError}, retrying...`);
          Sentry.captureException(error, {
            tags: { domain: 'ai-gateway', operation: 'callModel', attempt: String(attempt + 1), model: route.model, provider: route.provider },
            extra: { lastError, userId: request.userId },
          });
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    Sentry.captureMessage(`AI gateway exhausted retries for ${route.provider}/${route.model}`, {
      level: 'error',
      tags: { domain: 'ai-gateway', operation: 'generate' },
      extra: { lastError, userId: request.userId, difficulty },
    });

    const fallbackRoute = MODEL_ROUTES[difficulty]
      .filter(r => r.model !== route.model)
      .filter(r => r.minTier <= userTier)
      .find(r =>
        (r.provider === 'gemini' && keys.gemini) ||
        (r.provider === 'openai' && keys.openai) ||
        (r.provider === 'anthropic' && keys.anthropic)
      );

    if (fallbackRoute) {
      try {
        const result = await this.callModel(fallbackRoute.provider, fallbackRoute.model, request);
        const actualInputTokens = result.inputTokens || estimatedInputTokens;
        const actualOutputTokens = result.outputTokens || estimateTokens(result.content);
        const actualCost = (actualInputTokens / 1000) * fallbackRoute.costPer1kInput + (actualOutputTokens / 1000) * fallbackRoute.costPer1kOutput;
        return {
          content: result.content, model: fallbackRoute.model,
          tokensUsed: actualInputTokens + actualOutputTokens, costUsd: actualCost, cached: false,
          error: `Primary model failed. Used fallback.`,
        };
      } catch (err) {
        Sentry.captureException(err, {
          tags: { domain: 'ai-gateway', operation: 'fallback', model: fallbackRoute.model, provider: fallbackRoute.provider },
          extra: { primaryError: lastError, userId: request.userId },
        });
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

  private async callModel(provider: string, model: string, request: AIGatewayRequest): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
    const circuitName = `ai-${provider}`;
    const fallbackModels: Record<string, string> = {
      'gemini-2.5-flash': 'gemini-2.5-pro',
      'gemini-2.5-pro': 'gemini-2.5-flash',
      'gpt-4o': 'gpt-4o-mini',
      'gpt-4o-mini': 'gpt-4o',
      'claude-3-haiku': 'claude-3-sonnet',
      'claude-3-sonnet': 'claude-3-haiku',
    };

    try {
      return await withCircuitBreaker(circuitName, async () => {
        if (provider === 'gemini') return this.callGemini(model, request);
        if (provider === 'openai') return this.callOpenAI(model, request);
        if (provider === 'anthropic') return this.callAnthropic(model, request);
        throw new Error(`Unknown provider: ${provider}`);
      }, {
        failureThreshold: 3,
        resetTimeoutMs: 60000,
        successThreshold: 2,
        onStateChange: (name, from, to) => {
          log.warn(`[AIGateway] Circuit ${name}: ${from} → ${to}`);
          Sentry.captureMessage(`AI circuit ${name}: ${from} → ${to}`, {
            level: to === 'open' ? 'warning' : 'info',
            tags: { domain: 'ai-gateway', circuit: name },
          });
        },
      });
    } catch (error: unknown) {
      // If circuit is open, try fallback model within same provider
      const circuitState = (error as Error)?.message?.includes('Circuit');
      if (circuitState && fallbackModels[model]) {
        log.warn(`[AIGateway] Circuit open for ${provider}, trying fallback model ${fallbackModels[model]}`);
        if (provider === 'gemini') return this.callGemini(fallbackModels[model], request);
        if (provider === 'openai') return this.callOpenAI(fallbackModels[model], request);
        if (provider === 'anthropic') return this.callAnthropic(fallbackModels[model], request);
      }
      throw error;
    }
  }

  private async callGemini(model: string, request: AIGatewayRequest): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key not set (set GOOGLE_GENAI_API_KEY or GEMINI_API_KEY)');

    const modelName = model.includes('/') ? model : `models/${model}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

    const body: Record<string, unknown> = {
      contents: [{ parts: [{ text: request.prompt }] }],
      generationConfig: {
        maxOutputTokens: request.maxTokens || 2048,
        temperature: request.temperature ?? 0.7,
      },
    };
    if (request.systemPrompt) {
      body.systemInstruction = { parts: [{ text: request.systemPrompt }] };
    }
    if (request.jsonMode) {
      (body.generationConfig as Record<string, unknown>).responseMimeType = 'application/json';
    }

    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, REQUEST_TIMEOUT_MS);

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `Gemini API error (${res.status})`);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const inputTokens = data.usageMetadata?.promptTokenCount
      ?? estimateTokens(request.prompt) + estimateTokens(request.systemPrompt ?? '');
    const outputTokens = data.usageMetadata?.candidatesTokenCount
      ?? estimateTokens(text);

    return {
      content: request.jsonMode ? extractJsonFromResponse(text) : text,
      inputTokens,
      outputTokens,
    };
  }

  private async callOpenAI(model: string, request: AIGatewayRequest): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');

    const body: Record<string, unknown> = {
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
        (body.messages as Array<Record<string, unknown>>).unshift({ role: 'system', content: 'You are a helpful assistant that always responds with valid JSON.' });
      }
    }

    const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, REQUEST_TIMEOUT_MS);

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `OpenAI API error (${res.status})`);

    const text = data.choices?.[0]?.message?.content || '';
    const inputTokens = data.usage?.prompt_tokens
      ?? estimateTokens(request.prompt) + estimateTokens(request.systemPrompt ?? '');
    const outputTokens = data.usage?.completion_tokens
      ?? estimateTokens(text);

    return { content: text, inputTokens, outputTokens };
  }

  private async callAnthropic(model: string, request: AIGatewayRequest): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

    const body: Record<string, unknown> = {
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

    const text = data.content?.[0]?.text || '';
    const inputTokens = data.usage?.input_tokens
      ?? estimateTokens(request.prompt) + estimateTokens(request.systemPrompt ?? '');
    const outputTokens = data.usage?.output_tokens
      ?? estimateTokens(text);

    return { content: text, inputTokens, outputTokens };
  }

  private getFallbackResponse(difficulty: TaskDifficulty): string {
    switch (difficulty) {
      case 'complex': return 'This feature is temporarily unavailable. Please try again later.';
      case 'creative': return 'This feature is not available right now.';
      default: return 'This feature is currently unavailable. Please try again later.';
    }
  }
}

export const aiGateway = new AIGateway();

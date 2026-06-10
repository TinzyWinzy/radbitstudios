const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 768;
const EMBEDDING_BATCH_SIZE = 100;
const API_VERSION = 'v1beta';
const MAX_RETRIES = 2;
const CACHE_MAX_SIZE = 100;

// ─── In-memory LRU cache ────────────────────────────────────────────────────

const embeddingCache = new Map<string, number[]>();

function getCachedEmbedding(text: string): number[] | null {
  return embeddingCache.get(text) ?? null;
}

function setCachedEmbedding(text: string, embedding: number[]): void {
  if (embeddingCache.size >= CACHE_MAX_SIZE) {
    const firstKey = embeddingCache.keys().next().value;
    if (firstKey) embeddingCache.delete(firstKey);
  }
  embeddingCache.set(text, embedding);
}

// ─── HTTP helper ────────────────────────────────────────────────────────────

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// ─── Core embedding generation ──────────────────────────────────────────────

async function callEmbeddingAPI(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_GENAI_API_KEY or GEMINI_API_KEY not set for embeddings');

  const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`;

  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      outputDimensionality: EMBEDDING_DIMENSIONS,
    }),
  }, 10_000);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Embedding API error (${res.status})`);
  return data.embedding?.values as number[];
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const cached = getCachedEmbedding(text);
  if (cached) return cached;

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const embedding = await callEmbeddingAPI(text);
      setCachedEmbedding(text, embedding);
      return embedding;
    } catch (err: unknown) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        const delay = Math.min(300 * Math.pow(2, attempt) + Math.random() * 200, 2000);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);
    const batchResults = await Promise.allSettled(batch.map(t => generateEmbedding(t)));
    for (const r of batchResults) {
      results.push(r.status === 'fulfilled' ? r.value : []);
    }
  }
  return results;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

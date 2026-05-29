const RETRYABLE_CODES = new Set([
  'permission-denied',
  'unavailable',
  'deadline-exceeded',
  'resource-exhausted',
  'aborted',
  'internal',
]);

const RETRYABLE_MESSAGES = [
  'Missing or insufficient permissions',
  'network',
  'timeout',
  'offline',
  'retry',
  'server error',
  'rate limit',
  'too many requests',
  'Failed to fetch',
];

export function isRetryable(error: unknown): boolean {
  if (!error) return false;
  const code = (error as any)?.code;
  if (code && RETRYABLE_CODES.has(code)) return true;
  const message = error instanceof Error ? error.message : String(error);
  return RETRYABLE_MESSAGES.some((m) => message.toLowerCase().includes(m));
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      if (i === retries) break;
      if (!isRetryable(err)) throw err;
      const delay = Math.min(300 * Math.pow(2, i) + Math.random() * 200, 10000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries) throw err;
      if (err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions')) {
        await new Promise(r => setTimeout(r, 300 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('unreachable');
}

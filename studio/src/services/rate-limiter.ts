const windows = new Map<string, number[]>();

export function rateLimit(
  key: string,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 30, windowMs: 60000 }
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const timestamps = windows.get(key) ?? [];

  const valid = timestamps.filter(t => now - t < options.windowMs);

  if (valid.length >= options.maxRequests) {
    const oldest = valid[0];
    const retryAfter = Math.ceil((oldest + options.windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  valid.push(now);
  windows.set(key, valid);
  return { allowed: true };
}

// Periodic cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of windows) {
      const valid = timestamps.filter(t => now - t < 60000);
      if (valid.length === 0) {
        windows.delete(key);
      } else {
        windows.set(key, valid);
      }
    }
  }, 300000);
}

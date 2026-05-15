// A simple in-memory cache service with a Time-to-Live (TTL) feature.

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class CacheService<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number; // TTL in seconds

  /**
   * @param ttlInSeconds The time-to-live for cache entries, in seconds.
   */
  constructor(ttlInSeconds: number) {
    this.ttl = ttlInSeconds * 1000; // Convert to milliseconds
  }

  /**
   * Stores a value in the cache.
   * @param key The cache key.
   * @param value The value to store.
   */
  set(key: string, value: T): void {
    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { data: value, expiry });
  }

  /**
   * Retrieves a value from the cache. Returns null if the key is not found or the entry has expired.
   * @param key The cache key.
   * @returns The cached value or null.
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key); // Clean up expired entry
      return null;
    }

    return entry.data;
  }

  /**
   * Deletes a value from the cache.
   * @param key The cache key to delete.
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears the entire cache.
   */
  clear(): void {
    this.cache.clear();
  }
}

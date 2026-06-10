'use client';

import { openDB, type IDBPDatabase } from 'idb';

// ─── Shared IndexedDB Cache ─────────────────────────────────────────────────

const DB_NAME = 'radbit-cache';
const DB_VERSION = 1;

interface CacheEntry<T> {
  key: string;
  data: T;
  fetchedAt: number;
  ttl: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create stores on first access
        const storeNames = Array.from(db.objectStoreNames);
        if (!storeNames.includes('query-results')) {
          db.createObjectStore('query-results', { keyPath: 'key' });
        }
        if (!storeNames.includes('user-docs')) {
          db.createObjectStore('user-docs', { keyPath: 'uid' });
        }
      },
    });
  }
  return dbPromise;
}

// ─── Query Cache (replaces query-cache.ts) ─────────────────────────────────

const QUERY_STORE = 'query-results';

export function buildQueryKey(collection: string, ...clauses: (string | undefined)[]): string {
  return `q:${collection}:${clauses.filter(Boolean).join(':')}`;
}

export async function getCachedQuery<T>(key: string): Promise<T | null> {
  try {
    const db = await getDb();
    const entry: CacheEntry<T> | undefined = await db.get(QUERY_STORE, key);
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > entry.ttl) {
      await db.delete(QUERY_STORE, key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function setCachedQuery<T>(key: string, data: T, ttlMs: number): Promise<void> {
  try {
    const db = await getDb();
    await db.put(QUERY_STORE, { key, data, fetchedAt: Date.now(), ttl: ttlMs } as CacheEntry<T>);
  } catch { /* non-critical */ }
}

export async function invalidateQuery(key: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(QUERY_STORE, key);
  } catch { /* non-critical */ }
}

// ─── User Cache (replaces user-cache.ts) ───────────────────────────────────

const USER_STORE = 'user-docs';
const USER_CACHE_TTL = 4 * 60 * 60 * 1000;

interface UserCacheEntry {
  uid: string;
  data: Record<string, unknown>;
  fetchedAt: number;
}

export async function getCachedUser(uid: string): Promise<Record<string, unknown> | null> {
  try {
    const db = await getDb();
    const entry: UserCacheEntry | undefined = await db.get(USER_STORE, uid);
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > USER_CACHE_TTL) {
      await db.delete(USER_STORE, uid);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function setCachedUser(uid: string, data: Record<string, unknown>): Promise<void> {
  try {
    const db = await getDb();
    await db.put(USER_STORE, { uid, data, fetchedAt: Date.now() });
  } catch { /* non-critical */ }
}

export async function invalidateUserCache(uid?: string): Promise<void> {
  try {
    const db = await getDb();
    if (uid) {
      await db.delete(USER_STORE, uid);
    } else {
      await db.clear(USER_STORE);
    }
  } catch { /* non-critical */ }
}

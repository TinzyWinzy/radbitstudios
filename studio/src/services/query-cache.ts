'use client';

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'radbit-cache';
const DB_VERSION = 1;
const STORE_NAME = 'query-results';

interface QueryCacheEntry {
  key: string;
  data: unknown;
  fetchedAt: number;
  ttl: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

function buildQueryKey(collection: string, ...clauses: (string | undefined)[]): string {
  return `q:${collection}:${clauses.filter(Boolean).join(':')}`;
}

export { buildQueryKey };

export async function getCachedQuery<T>(key: string): Promise<T | null> {
  try {
    const db = await getDb();
    const entry: QueryCacheEntry | undefined = await db.get(STORE_NAME, key);
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > entry.ttl) {
      await db.delete(STORE_NAME, key);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

export async function setCachedQuery<T>(key: string, data: T, ttlMs: number): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE_NAME, { key, data, fetchedAt: Date.now(), ttl: ttlMs });
  } catch {
    // Cache failure is non-critical
  }
}

export async function invalidateQuery(key: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE_NAME, key);
  } catch {
    // Cache failure is non-critical
  }
}

'use client';

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'radbit-cache';
const DB_VERSION = 1;
const STORE_NAME = 'user-docs';
const USER_CACHE_TTL = 4 * 60 * 60 * 1000;

interface UserCacheEntry {
  uid: string;
  data: Record<string, unknown>;
  fetchedAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'uid' });
        }
      },
    });
  }
  return dbPromise;
}

export async function getCachedUser(uid: string): Promise<Record<string, unknown> | null> {
  try {
    const db = await getDb();
    const entry: UserCacheEntry | undefined = await db.get(STORE_NAME, uid);
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > USER_CACHE_TTL) {
      await db.delete(STORE_NAME, uid);
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
    await db.put(STORE_NAME, { uid, data, fetchedAt: Date.now() });
  } catch {
    // Cache failure is non-critical
  }
}

export async function invalidateUserCache(uid?: string): Promise<void> {
  try {
    const db = await getDb();
    if (uid) {
      await db.delete(STORE_NAME, uid);
    } else {
      await db.clear(STORE_NAME);
    }
  } catch {
    // Cache failure is non-critical
  }
}

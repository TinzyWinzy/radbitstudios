// Offline Assessment Engine — IndexedDB persistence
// Saves assessment progress every 30s, supports crash recovery

import { openDB, type IDBPDatabase } from 'idb';

interface AssessmentDraft {
  id: string;
  userId: string;
  currentStep: number;
  answers: Record<number, { answer: string; score: number }>;
  startedAt: number;
  lastSavedAt: number;
  completed: boolean;
}

export interface PendingSync {
  id: string;
  type: 'assessment' | 'community-post' | 'ai-request';
  data: unknown;
  createdAt: number;
  retryCount: number;
}

export interface OfflineMutation {
  id: string;
  idempotencyKey: string;
  userId: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers: Record<string, string>;
  body: string | null;
  createdAt: number;
  updatedAt: number;
  nextAttemptAt: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'failed' | 'conflict';
  lastError?: string;
}

const DB_NAME = 'radbit-offline';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (oldVersion < 1) {
          db.createObjectStore('assessment-drafts', { keyPath: 'id' });
          db.createObjectStore('pending-sync', { keyPath: 'id' });
          db.createObjectStore('tenders-cache', { keyPath: 'id' });
          db.createObjectStore('community-cache', { keyPath: 'id' });
          db.createObjectStore('dashboard-cache', { keyPath: 'id' });
        }
        if (oldVersion < 2) {
          const drafts = transaction.objectStore('assessment-drafts');
          drafts.createIndex('userId', 'userId', { unique: false });
          drafts.createIndex('lastSavedAt', 'lastSavedAt', { unique: false });
        }
        if (oldVersion < 3) {
          const mutations = db.createObjectStore('mutation-queue', { keyPath: 'id' });
          mutations.createIndex('userId', 'userId', { unique: false });
          mutations.createIndex('status', 'status', { unique: false });
          mutations.createIndex('nextAttemptAt', 'nextAttemptAt', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

// ============================================
// ASSESSMENT DRAFT MANAGEMENT
// ============================================

export async function saveAssessmentDraft(draft: AssessmentDraft): Promise<void> {
  const db = await getDb();
  draft.lastSavedAt = Date.now();
  await db.put('assessment-drafts', draft);
}

export async function getAssessmentDraft(userId: string): Promise<AssessmentDraft | undefined> {
  const db = await getDb();
  const index = db.transaction('assessment-drafts').store.index('userId');
  const drafts = await index.getAll(userId);
  // Return the most recently saved draft
  return drafts.sort((a, b) => b.lastSavedAt - a.lastSavedAt)[0];
}

export async function deleteAssessmentDraft(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('assessment-drafts', id);
}

export async function getAllDrafts(): Promise<AssessmentDraft[]> {
  const db = await getDb();
  return db.getAll('assessment-drafts');
}

// ============================================
// PENDING SYNC QUEUE (for Background Sync)
// ============================================

export async function queueForSync(type: PendingSync['type'], data: unknown): Promise<void> {
  const db = await getDb();
  const entry: PendingSync = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    data,
    createdAt: Date.now(),
    retryCount: 0,
  };
  await db.add('pending-sync', entry);

  // Register Background Sync if available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.sync.register(`sync-${type}`);
    } catch {
      console.warn('Background Sync registration failed, will retry on next page load');
    }
  }
}

export async function getPendingSyncItems(): Promise<PendingSync[]> {
  const db = await getDb();
  return db.getAll('pending-sync');
}

export async function removePendingSyncItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('pending-sync', id);
}

// ============================================
// DURABLE HTTP MUTATION QUEUE
// ============================================

function emitSyncState(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('radbit-sync-state'));
}

function createMutationId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `mutation-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function queueHttpMutation(input: {
  userId: string;
  url: string;
  method: OfflineMutation['method'];
  body?: unknown;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  maxRetries?: number;
}): Promise<OfflineMutation> {
  const db = await getDb();
  const now = Date.now();
  const idempotencyKey = input.idempotencyKey || createMutationId();
  const mutation: OfflineMutation = {
    id: idempotencyKey,
    idempotencyKey,
    userId: input.userId,
    url: input.url,
    method: input.method,
    headers: { 'Content-Type': 'application/json', ...input.headers },
    body: input.body === undefined ? null : JSON.stringify(input.body),
    createdAt: now,
    updatedAt: now,
    nextAttemptAt: now,
    retryCount: 0,
    maxRetries: input.maxRetries ?? 7,
    status: 'pending',
  };
  await db.put('mutation-queue', mutation);
  emitSyncState();
  return mutation;
}

export async function listHttpMutations(userId: string): Promise<OfflineMutation[]> {
  const db = await getDb();
  return db.getAllFromIndex('mutation-queue', 'userId', userId);
}

export async function getHttpMutationSummary(userId: string): Promise<{ pending: number; failed: number; conflicts: number }> {
  const mutations = await listHttpMutations(userId);
  return {
    pending: mutations.filter(item => item.status === 'pending' || item.status === 'syncing').length,
    failed: mutations.filter(item => item.status === 'failed').length,
    conflicts: mutations.filter(item => item.status === 'conflict').length,
  };
}

export async function retryHttpMutation(id: string): Promise<void> {
  const db = await getDb();
  const mutation = await db.get('mutation-queue', id) as OfflineMutation | undefined;
  if (!mutation) return;
  await db.put('mutation-queue', { ...mutation, status: 'pending', retryCount: 0, nextAttemptAt: Date.now(), updatedAt: Date.now(), lastError: undefined });
  emitSyncState();
}

export async function discardHttpMutation(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('mutation-queue', id);
  emitSyncState();
}

export async function syncHttpMutations(userId: string): Promise<{ sent: number; remaining: number }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { sent: 0, remaining: (await listHttpMutations(userId)).length };
  const db = await getDb();
  const now = Date.now();
  const queued = (await listHttpMutations(userId))
    .filter(item => item.status === 'pending' && item.nextAttemptAt <= now)
    .sort((a, b) => a.createdAt - b.createdAt);
  let sent = 0;

  for (const mutation of queued) {
    await db.put('mutation-queue', { ...mutation, status: 'syncing', updatedAt: Date.now() });
    try {
      const response = await fetch(mutation.url, {
        method: mutation.method,
        headers: { ...mutation.headers, 'Idempotency-Key': mutation.idempotencyKey },
        body: mutation.body,
        credentials: 'include',
      });
      if (response.ok) {
        await db.delete('mutation-queue', mutation.id);
        sent++;
        continue;
      }
      if (response.status === 409 || response.status === 412) {
        await db.put('mutation-queue', { ...mutation, status: 'conflict', updatedAt: Date.now(), lastError: `Conflict (${response.status})` });
        continue;
      }
      if (response.status >= 400 && response.status < 500) {
        await db.put('mutation-queue', { ...mutation, status: 'failed', updatedAt: Date.now(), lastError: `Rejected (${response.status})` });
        continue;
      }
      throw new Error(`Server unavailable (${response.status})`);
    } catch (error) {
      const retryCount = mutation.retryCount + 1;
      const exhausted = retryCount >= mutation.maxRetries;
      const delay = getMutationRetryDelay(retryCount);
      await db.put('mutation-queue', {
        ...mutation,
        status: exhausted ? 'failed' : 'pending',
        retryCount,
        nextAttemptAt: Date.now() + delay,
        updatedAt: Date.now(),
        lastError: error instanceof Error ? error.message : 'Network failure',
      });
      if (typeof navigator !== 'undefined' && !navigator.onLine) break;
    }
  }
  emitSyncState();
  return { sent, remaining: (await listHttpMutations(userId)).length };
}

export function getMutationRetryDelay(retryCount: number): number {
  return Math.min(30 * 60_000, 2 ** Math.max(0, retryCount) * 5_000);
}

export async function resilientMutation(input: Parameters<typeof queueHttpMutation>[0]): Promise<{ status: 'sent' | 'queued'; idempotencyKey: string }> {
  const mutation = await queueHttpMutation(input);
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    await syncHttpMutations(input.userId);
    const remaining = await listHttpMutations(input.userId);
    if (!remaining.some(item => item.id === mutation.id)) return { status: 'sent', idempotencyKey: mutation.idempotencyKey };
  }
  return { status: 'queued', idempotencyKey: mutation.idempotencyKey };
}

// ============================================
// TENDERS OFFLINE CACHE
// ============================================

export async function cacheTenders(tenders: Array<{ id: string; [key: string]: unknown }>): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('tenders-cache', 'readwrite');
  for (const tender of tenders) {
    await tx.store.put(tender);
  }
  await tx.done;
}

export async function getCachedTenders(): Promise<Array<{ id: string; [key: string]: unknown }>> {
  const db = await getDb();
  return db.getAll('tenders-cache');
}

export async function getCachedTender(id: string): Promise<{ id: string; [key: string]: unknown } | undefined> {
  const db = await getDb();
  return db.get('tenders-cache', id);
}

// ============================================
// DASHBOARD CACHE
// ============================================

export async function cacheDashboardData(userId: string, data: unknown): Promise<void> {
  const db = await getDb();
  await db.put('dashboard-cache', { id: userId, data, cachedAt: Date.now() });
}

export async function getCachedDashboardData(userId: string): Promise<{ data: unknown; cachedAt: number } | undefined> {
  const db = await getDb();
  return db.get('dashboard-cache', userId);
}

// ============================================
// AUTO-SAVE HOOK (use in assessment page)
// ============================================

export function createAutoSave(
  saveFn: () => Promise<void>,
  intervalMs = 30000
): { start: () => void; stop: () => void; saveNow: () => Promise<void> } {
  let timerId: ReturnType<typeof setInterval> | null = null;

  const saveNow = async () => {
    try {
      await saveFn();
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  return {
    start: () => {
      if (timerId) return;
      // Save immediately, then every intervalMs
      saveNow();
      timerId = setInterval(saveNow, intervalMs);
    },
    stop: () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    },
    saveNow,
  };
}

// ============================================
// NETWORK STATUS DETECTION
// ============================================

export function getNetworkStatus(): { isOnline: boolean; effectiveType: string | undefined; saveData: boolean } {
  const conn = (navigator as any).connection;
  return {
    isOnline: navigator.onLine,
    effectiveType: conn?.effectiveType,
    saveData: conn?.saveData ?? false,
  };
}

export function watchNetworkStatus(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

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

interface PendingSync {
  id: string;
  type: 'assessment' | 'community-post' | 'ai-request';
  data: unknown;
  createdAt: number;
  retryCount: number;
}

const DB_NAME = 'radbit-offline';
const DB_VERSION = 2;

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

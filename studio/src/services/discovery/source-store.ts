import { adminDb } from '@/lib/firebase/firebase-admin';
import type { DiscoveredSource } from './source-crawler';

export interface ActiveSource {
  id: string;
  url: string;
  feedUrl: string;
  name: string;
  region: string;
  category?: string;
  industryMapping?: Record<string, string[]>;
  enabled: boolean;
  addedAt: string;
  lastFetchedAt?: string;
  failureCount?: number;
}

export async function saveDiscoveredSources(sources: DiscoveredSource[]): Promise<void> {
  const batch = adminDb.batch();
  const col = adminDb.collection('discovered_sources');
  for (const s of sources) {
    batch.set(col.doc(s.id), s, { merge: true });
  }
  await batch.commit();
}

export async function getPendingSources(): Promise<DiscoveredSource[]> {
  const snap = await adminDb.collection('discovered_sources')
    .where('status', '==', 'pending')
    .orderBy('discoveredAt', 'desc')
    .limit(50)
    .get();
  return snap.docs.map(d => d.data() as DiscoveredSource);
}

export async function getActiveSources(): Promise<ActiveSource[]> {
  const snap = await adminDb.collection('active_sources')
    .where('enabled', '==', true)
    .get();

  if (snap.empty) return [];

  return snap.docs.map(d => d.data() as ActiveSource);
}

export async function addActiveSource(source: DiscoveredSource, feedUrl: string): Promise<void> {
  const active: ActiveSource = {
    id: source.id,
    url: source.url,
    feedUrl,
    name: source.name,
    region: source.region,
    enabled: true,
    addedAt: new Date().toISOString(),
  };
  await adminDb.collection('active_sources').doc(source.id).set(active);

  await adminDb.collection('discovered_sources').doc(source.id).update({
    status: 'approved',
    reviewedAt: new Date().toISOString(),
  });
}

export async function rejectSource(sourceId: string): Promise<void> {
  await adminDb.collection('discovered_sources').doc(sourceId).update({
    status: 'rejected',
    reviewedAt: new Date().toISOString(),
  });
}

export async function getSourceHealth(): Promise<Array<{ id: string; name: string; lastFetchedAt: string | null; failureCount: number }>> {
  const snap = await adminDb.collection('source_health').limit(50).get();
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
  } as { id: string; name: string; lastFetchedAt: string | null; failureCount: number }));
}

export async function recordSourceFetch(sourceId: string, success: boolean): Promise<void> {
  const ref = adminDb.collection('source_health').doc(sourceId);
  const snap = await ref.get();

  if (!snap.exists) {
    await ref.set({
      id: sourceId,
      lastFetchedAt: new Date().toISOString(),
      failureCount: success ? 0 : 1,
    });
  } else {
    const data = snap.data()!;
    await ref.update({
      lastFetchedAt: new Date().toISOString(),
      failureCount: success ? 0 : (data.failureCount || 0) + 1,
    });
  }
}

import { adminDb } from '@/lib/firebase/firebase-admin';

export interface ScoredItem {
  contentId: string;
  contentType: 'news' | 'tender';
  impactScore: number;
  urgencyScore: number;
  confidenceScore: number;
  reasoning: string;
  scoredAt: string;
}

export async function saveScores(scores: ScoredItem[]): Promise<void> {
  try {
    const batch = adminDb.batch();
    const col = adminDb.collection('scored_items');
    for (const s of scores) {
      batch.set(col.doc(s.contentId), s, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.warn('[ScoredItems] Firestore write failed:', err);
  }
}

export async function loadScores(contentIds: string[]): Promise<Map<string, ScoredItem>> {
  if (contentIds.length === 0) return new Map();

  try {
    const ids = [...new Set(contentIds)];
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 30) {
      chunks.push(ids.slice(i, i + 30));
    }

    const result = new Map<string, ScoredItem>();
    for (const chunk of chunks) {
      const snapshot = await adminDb.collection('scored_items')
        .where('__name__', 'in', chunk)
        .get();
      for (const doc of snapshot.docs) {
        result.set(doc.id, doc.data() as ScoredItem);
      }
    }
    return result;
  } catch {
    return new Map();
  }
}

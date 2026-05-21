import { adminDb } from '@/lib/firebase/firebase-admin';
import { generateEmbedding, cosineSimilarity } from '@/services/ai/embeddings';

const CACHE = new Map<string, { embedding: number[]; expiresAt: number }>();
const CACHE_TTL = 30 * 60 * 1000;

async function getProfileEmbedding(userId: string): Promise<number[] | null> {
  const cacheKey = `profile:${userId}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) return cached.embedding;

  const userSnap = await adminDb.doc(`users/${userId}`).get();
  if (!userSnap.exists) return null;

  const data = userSnap.data()!;
  const profileText = [
    data.businessName || '',
    data.industry || '',
    data.businessDescription || '',
  ].filter(Boolean).join('. ');

  if (!profileText) return null;

  try {
    const embedding = await generateEmbedding(profileText);
    CACHE.set(cacheKey, { embedding, expiresAt: Date.now() + CACHE_TTL });
    return embedding;
  } catch {
    return null;
  }
}

export async function computeRelevance(
  userId: string,
  contentTitle: string,
  contentSummary: string,
): Promise<number> {
  const profileEmbedding = await getProfileEmbedding(userId);
  if (!profileEmbedding) return 50;

  const contentText = `${contentTitle}. ${contentSummary}`.slice(0, 1000);

  try {
    const contentEmbedding = await generateEmbedding(contentText);
    const similarity = cosineSimilarity(profileEmbedding, contentEmbedding);
    return Math.max(0, Math.min(100, Math.round((similarity + 1) * 50)));
  } catch {
    return 50;
  }
}

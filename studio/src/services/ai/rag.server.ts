import { adminDb } from '@/lib/firebase/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { generateEmbedding, cosineSimilarity } from './embeddings';

const CHUNK_SIZE = 512;

function chunkText(text: string, overlap = 32): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  const step = CHUNK_SIZE - overlap;
  for (let i = 0; i < words.length; i += step) {
    chunks.push(words.slice(i, i + CHUNK_SIZE).join(' '));
  }
  return chunks.length ? chunks : [text];
}

export async function indexDocument(
  title: string,
  content: string,
  source: string,
  category: string,
  locale = 'en',
): Promise<string> {
  const docRef = await adminDb.collection('rag_documents').add({
    title, content, source, category, locale,
    createdAt: Timestamp.now(),
  });

  const chunks = chunkText(`${title}\n\n${content}`);
  const embeddings = await Promise.allSettled(chunks.map(c => generateEmbedding(c)));

  const batchItems: any[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const emb = embeddings[i];
    if (emb.status !== 'fulfilled' || emb.value.length === 0) continue;
    batchItems.push({
      documentId: docRef.id,
      chunkIndex: i,
      content: chunks[i],
      embedding: emb.value,
      metadata: { title, source, category, locale },
    });
  }

  for (const item of batchItems) {
    await adminDb.collection('rag_chunks').add(item);
  }

  return docRef.id;
}

export async function searchRelevantContext(
  searchQuery: string,
  topK = 5,
  minScore = 0.5,
  category?: string,
  locale?: string,
): Promise<{ content: string; score: number; metadata: Record<string, string> }[]> {
  const queryEmbedding = await generateEmbedding(searchQuery);
  if (queryEmbedding.length === 0) return [];

  let query = adminDb.collection('rag_chunks') as any;
  if (category) query = query.where('metadata.category', '==', category);
  if (locale) query = query.where('metadata.locale', '==', locale);
  query = query.limit(200);

  const snapshot = await query.get();

  const scored: { doc: any; score: number }[] = [];
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (!data.embedding || !Array.isArray(data.embedding)) continue;
    const score = cosineSimilarity(queryEmbedding, data.embedding);
    if (score >= minScore) {
      scored.push({ doc: data, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => ({
    content: s.doc.content,
    score: s.score,
    metadata: s.doc.metadata || {},
  }));
}

export async function removeDocument(docId: string): Promise<void> {
  const chunksSnap = await adminDb.collection('rag_chunks').where('documentId', '==', docId).get();
  const deletions = chunksSnap.docs.map(d => adminDb.doc(`rag_chunks/${d.id}`).delete());
  await Promise.all(deletions);
  await adminDb.doc(`rag_documents/${docId}`).delete();
}

export async function getDocumentCount(): Promise<number> {
  const snap = await adminDb.collection('rag_documents').get();
  return snap.size;
}

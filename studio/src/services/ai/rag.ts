import { db } from '@/lib/firebase/firebase';
import {
  collection, doc, getDocs, deleteDoc,
  query, where, limit as firestoreLimit, Timestamp, addDoc,
} from 'firebase/firestore';
import { generateEmbedding, cosineSimilarity } from './embeddings';

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  locale: string;
  embedding?: number[];
  createdAt: Date;
}

export interface RAGChunk {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  metadata: Record<string, string>;
}

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
  const docRef = await addDoc(collection(db, 'rag_documents'), {
    title, content, source, category, locale,
    createdAt: Timestamp.now(),
  });

  const chunks = chunkText(`${title}\n\n${content}`);
  const embeddings = await Promise.allSettled(chunks.map(c => generateEmbedding(c)));

  const batch: any[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const emb = embeddings[i];
    if (emb.status !== 'fulfilled' || emb.value.length === 0) continue;
    batch.push({
      documentId: docRef.id,
      chunkIndex: i,
      content: chunks[i],
      embedding: emb.value,
      metadata: { title, source, category, locale },
    });
  }

  for (const item of batch) {
    await addDoc(collection(db, 'rag_chunks'), item);
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

  let constraints: any[] = [];
  if (category) constraints.push(where('metadata.category', '==', category));
  if (locale) constraints.push(where('metadata.locale', '==', locale));

  const snapshot = await getDocs(
    query(collection(db, 'rag_chunks'), ...constraints, firestoreLimit(200)),
  );

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
  const chunksSnap = await getDocs(
    query(collection(db, 'rag_chunks'), where('documentId', '==', docId)),
  );
  const deletions = chunksSnap.docs.map(d => deleteDoc(doc(db, 'rag_chunks', d.id)));
  await Promise.all(deletions);
  await deleteDoc(doc(db, 'rag_documents', docId));
}

export async function getDocumentCount(): Promise<number> {
  const snap = await getDocs(collection(db, 'rag_documents'));
  return snap.size;
}

export function buildRAGContext(results: { content: string; score: number; metadata: Record<string, string> }[]): string {
  if (results.length === 0) return '';
  return results.map((r, i) =>
    `[Source ${i + 1}] (${r.metadata.source || 'unknown'}, relevance: ${(r.score * 100).toFixed(0)}%)\n${r.content}`
  ).join('\n\n');
}

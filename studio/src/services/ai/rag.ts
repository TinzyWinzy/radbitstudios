import { db } from '@/lib/firebase/firebase';
import {
  collection, getDocs,
  query, where, limit as firestoreLimit,
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

export function buildRAGContext(results: { content: string; score: number; metadata: Record<string, string> }[]): string {
  if (results.length === 0) return '';
  return results.map((r, i) =>
    `[Source ${i + 1}] (${r.metadata.source || 'unknown'}, relevance: ${(r.score * 100).toFixed(0)}%)\n${r.content}`
  ).join('\n\n');
}

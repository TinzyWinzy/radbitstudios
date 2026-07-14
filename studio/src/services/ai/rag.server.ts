import { getPool, initSchema } from '@/lib/sqlite';
import { generateEmbedding } from './embeddings';

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
  trustTier?: string,
  freshness?: string,
): Promise<string> {
  const pool = getPool();
  await initSchema();

  const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await pool.query(
    `INSERT INTO rag_documents (id, title, content, source, category, locale, trust_tier, freshness)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, title, content, source, category, locale, trustTier ?? null, freshness ?? null],
  );

  const chunks = chunkText(`${title}\n\n${content}`);
  const embeddings = await Promise.allSettled(chunks.map(c => generateEmbedding(c)));

  let storedCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    const emb = embeddings[i];
    if (emb.status !== 'fulfilled' || emb.value.length === 0) continue;

    await pool.query(
      `INSERT INTO rag_chunks (document_id, chunk_index, content, embedding, metadata)
       VALUES ($1, $2, $3, $4::vector, $5::jsonb)`,
      [
        id,
        i,
        chunks[i],
        `[${emb.value.join(',')}]`,
        JSON.stringify({ title, source, category, locale, trustTier, freshness }),
      ],
    );
    storedCount++;
  }

  await pool.query('UPDATE rag_documents SET chunk_count = $1 WHERE id = $2', [storedCount, id]);

  return id;
}

export async function searchRelevantContext(
  searchQuery: string,
  topK = 5,
  minScore = 0.5,
  category?: string,
  locale?: string,
  minTrustTier?: string,
): Promise<{ content: string; score: number; metadata: Record<string, string> }[]> {
  const queryEmbedding = await generateEmbedding(searchQuery);
  if (queryEmbedding.length === 0) return [];

  const pool = getPool();
  await initSchema();
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  const TIER_ORDER = ['derived-summary', 'public-notices', 'tourism-reference', 'sector-report', 'official-web-extract', 'official-guidance', 'official-register', 'technical-specification', 'official-report', 'primary-policy', 'primary'];

  let sql = `
    SELECT
      rc.content,
      1 - (rc.embedding <=> $1::vector) AS score,
      rc.metadata,
      rd.trust_tier
    FROM rag_chunks rc
    JOIN rag_documents rd ON rc.document_id = rd.id
    WHERE 1=1
  `;
  const params: any[] = [embeddingStr];
  let p = 2;

  if (category) {
    sql += ` AND rc.metadata->>'category' = $${p++}`;
    params.push(category);
  }
  if (locale) {
    sql += ` AND rc.metadata->>'locale' = $${p++}`;
    params.push(locale);
  }
  if (minTrustTier) {
    const minIdx = TIER_ORDER.indexOf(minTrustTier);
    if (minIdx >= 0) {
      const tiers = TIER_ORDER.slice(minIdx);
      sql += ` AND rd.trust_tier = ANY($${p++}::text[])`;
      params.push(tiers);
    }
  }

  sql += ` ORDER BY rc.embedding <=> $1::vector LIMIT $${p++}`;
  params.push(topK * 3);

  const { rows } = await pool.query(sql, params);

  return rows
    .filter((r: Record<string, unknown>) => (r.score as number) >= minScore)
    .slice(0, topK)
    .map((r: Record<string, unknown>) => {
      const meta = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : (r.metadata || {});
      if (r.trust_tier) meta.trustTier = r.trust_tier as string;
      return {
        content: r.content as string,
        score: r.score as number,
        metadata: meta,
      };
    });
}

export async function removeDocument(docId: string): Promise<void> {
  const pool = getPool();
  await initSchema();
  await pool.query('DELETE FROM rag_chunks WHERE document_id = $1', [docId]);
  await pool.query('DELETE FROM rag_documents WHERE id = $1', [docId]);
}

export async function getDocumentCount(): Promise<number> {
  const pool = getPool();
  await initSchema();
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM rag_documents');
  return (rows[0]?.count as number) ?? 0;
}

export function buildRAGContext(results: { content: string; score: number; metadata: Record<string, string> }[]): string {
  if (results.length === 0) return '';
  return results.map((r, i) =>
    `[Source ${i + 1}] (${r.metadata.source || 'unknown'}, relevance: ${(r.score * 100).toFixed(0)}%)\n${r.content}`
  ).join('\n\n');
}

export async function createIndex(): Promise<void> {
  const pool = getPool();
  await initSchema();
  try {
    await pool.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rag_chunks_embedding
      ON rag_chunks USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);
  } catch {
    console.warn('[RAG] IVFFlat index creation skipped (need at least 100 rows)');
  }
}

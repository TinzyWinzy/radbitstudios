import { getPool } from '@/lib/sqlite';
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
): Promise<string> {
  const pool = getPool();

  const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await pool.query(
    `INSERT INTO rag_documents (id, title, content, source, category, locale)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, title, content, source, category, locale],
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
        JSON.stringify({ title, source, category, locale }),
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
): Promise<{ content: string; score: number; metadata: Record<string, string> }[]> {
  const queryEmbedding = await generateEmbedding(searchQuery);
  if (queryEmbedding.length === 0) return [];

  const pool = getPool();
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  let sql = `
    SELECT
      rc.content,
      1 - (rc.embedding <=> $1::vector) AS score,
      rc.metadata
    FROM rag_chunks rc
    JOIN rag_documents rd ON rc.document_id = rd.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [embeddingStr];
  let p = 2;

  if (category) {
    sql += ` AND rc.metadata->>'category' = $${p++}`;
    params.push(category);
  }
  if (locale) {
    sql += ` AND rc.metadata->>'locale' = $${p++}`;
    params.push(locale);
  }

  sql += ` ORDER BY rc.embedding <=> $1::vector LIMIT $${p++}`;
  params.push(topK * 3);

  const { rows } = await pool.query(sql, params);

  return rows
    .filter((r: Record<string, unknown>) => (r.score as number) >= minScore)
    .slice(0, topK)
    .map((r: Record<string, unknown>) => ({
      content: r.content as string,
      score: r.score as number,
      metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : (r.metadata || {}),
    }));
}

export async function removeDocument(docId: string): Promise<void> {
  const pool = getPool();
  await pool.query('DELETE FROM rag_chunks WHERE document_id = $1', [docId]);
  await pool.query('DELETE FROM rag_documents WHERE id = $1', [docId]);
}

export async function getDocumentCount(): Promise<number> {
  const pool = getPool();
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM rag_documents');
  return (rows[0]?.count as number) ?? 0;
}

export async function createIndex(): Promise<void> {
  const pool = getPool();
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

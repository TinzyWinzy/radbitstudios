/**
 * Firestore → PostgreSQL (pgvector) RAG migration script.
 *
 * Usage:  npx tsx src/scripts/migrate-rag-to-pgvector.ts
 *
 * Prerequisites:
 *   - DATABASE_URL set in .env (Supabase PostgreSQL)
 *   - Firebase Admin credentials set (FIREBASE_SERVICE_ACCOUNT_KEY or ADC)
 *   - pgvector extension enabled (run once via Supabase SQL editor):
 *       CREATE EXTENSION IF NOT EXISTS vector;
 */

import 'dotenv/config';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { getPool } from '@/lib/sqlite';
import { generateEmbedding } from '@/services/ai/embeddings';

const EMBEDDING_DIM = 768;

async function ensurePgvectorExtension(pool: ReturnType<typeof getPool>) {
  await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
  console.log('[migration] pgvector extension ensured');
}

async function ensureSchema(pool: ReturnType<typeof getPool>) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rag_documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT,
      category TEXT,
      locale TEXT DEFAULT 'en',
      chunk_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS rag_chunks (
      id SERIAL PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
      chunk_index INTEGER NOT NULL,
      content TEXT NOT NULL,
      embedding vector(${EMBEDDING_DIM}),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc_id ON rag_chunks(document_id);
    CREATE INDEX IF NOT EXISTS idx_rag_chunks_metadata_category ON rag_chunks((metadata->>'category'));
    CREATE INDEX IF NOT EXISTS idx_rag_chunks_metadata_locale ON rag_chunks((metadata->>'locale'));
  `);
  console.log('[migration] Schema ensured');
}

function chunkText(text: string, chunkSize = 512, overlap = 32): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  const step = chunkSize - overlap;
  for (let i = 0; i < words.length; i += step) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks.length ? chunks : [text];
}

async function migrateDocuments(pool: ReturnType<typeof getPool>) {
  console.log('[migration] Fetching Firestore rag_documents...');
  const docsSnap = await adminDb.collection('rag_documents').get();
  console.log(`[migration] Found ${docsSnap.size} documents in Firestore`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const docSnap of docsSnap.docs) {
    const data = docSnap.data();
    const pgId = `fs_${docSnap.id}`; // prefix to avoid ID collisions

    try {
      // Check if already migrated
      const existing = await pool.query('SELECT id FROM rag_documents WHERE id = $1', [pgId]);
      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }

      const title = data.title || '';
      const content = data.content || '';
      const source = data.source || '';
      const category = data.category || '';
      const locale = data.locale || 'en';

      // Insert document
      await pool.query(
        `INSERT INTO rag_documents (id, title, content, source, category, locale)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [pgId, title, content, source, category, locale],
      );

      // Chunk and embed
      const chunks = chunkText(`${title}\n\n${content}`);
      let storedCount = 0;

      for (let i = 0; i < chunks.length; i++) {
        try {
          const embedding = await generateEmbedding(chunks[i]);
          if (embedding.length === 0) continue;

          await pool.query(
            `INSERT INTO rag_chunks (document_id, chunk_index, content, embedding, metadata)
             VALUES ($1, $2, $3, $4::vector, $5::jsonb)`,
            [
              pgId,
              i,
              chunks[i],
              `[${embedding.join(',')}]`,
              JSON.stringify({ title, source, category, locale }),
            ],
          );
          storedCount++;
        } catch (err) {
          console.warn(`[migration] Chunk ${i} embedding failed for doc ${pgId}: ${err}`);
        }
      }

      await pool.query('UPDATE rag_documents SET chunk_count = $1 WHERE id = $2', [storedCount, pgId]);
      migrated++;

      if (migrated % 10 === 0) {
        console.log(`[migration] Progress: ${migrated}/${docsSnap.size} documents migrated`);
      }
    } catch (err) {
      errors++;
      console.error(`[migration] Failed to migrate doc ${docSnap.id}: ${err}`);
    }
  }

  console.log(`[migration] Complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
  return { migrated, skipped, errors };
}

async function createIvfflatIndex(pool: ReturnType<typeof getPool>) {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM rag_chunks');
  const count = (rows[0]?.count as number) ?? 0;

  if (count >= 100) {
    console.log(`[migration] Creating IVFFlat index (${count} chunks)...`);
    await pool.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rag_chunks_embedding
      ON rag_chunks USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);
    console.log('[migration] IVFFlat index created');
  } else {
    console.log(`[migration] Only ${count} chunks — skipping IVFFlat index (need ≥100)`);
  }
}

async function main() {
  console.log('=== Firestore → pgvector RAG Migration ===\n');

  const pool = getPool();

  try {
    await ensurePgvectorExtension(pool);
    await ensureSchema(pool);
    const result = await migrateDocuments(pool);
    await createIvfflatIndex(pool);

    console.log('\n=== Migration Summary ===');
    console.log(`Documents migrated: ${result.migrated}`);
    console.log(`Documents skipped:  ${result.skipped}`);
    console.log(`Errors:             ${result.errors}`);
    console.log('\nDone!');
  } catch (err) {
    console.error('[migration] Fatal error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

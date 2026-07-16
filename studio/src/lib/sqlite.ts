import { Pool, PoolClient } from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/* ═══════════════════════════════════════════════════════════════════════════════
 * Exported helpers for RAG fallback
 * ═══════════════════════════════════════════════════════════════════════════════ */

export { isPgAvailable, getLocalDb, ensureLocalSchema };

/* ═══════════════════════════════════════════════════════════════════════════════
 * PostgreSQL (Supabase) — primary connection
 * ═══════════════════════════════════════════════════════════════════════════════ */

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Add it to your .env to connect to Supabase PostgreSQL.',
    );
  }

  const g = globalThis as unknown as { __radbitPgPool?: Pool };
  if (g.__radbitPgPool) return g.__radbitPgPool;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 5,
  });

  pool.on('error', (err) => {
    console.error('[PostgreSQL] Unexpected pool error:', err);
  });

  g.__radbitPgPool = pool;
  return pool;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * Local SQLite — fallback when Supabase is unreachable
 * ═══════════════════════════════════════════════════════════════════════════════ */

const LOCAL_DB_PATH = process.env.LOCAL_DB_PATH || path.join(process.cwd(), 'data', 'radbit-local.db');

function getLocalDb(): Database.Database {
  const g = globalThis as unknown as { __radbitLocalDb?: Database.Database };
  if (g.__radbitLocalDb) return g.__radbitLocalDb;

  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(LOCAL_DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  g.__radbitLocalDb = db;
  return db;
}

function initLocalSchema(): void {
  const db = getLocalDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS tenders (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      organization TEXT,
      sourceUrl TEXT,
      sourceName TEXT,
      publishedAt TEXT,
      closingDate TEXT,
      value TEXT,
      category TEXT,
      sector TEXT,
      region TEXT,
      requirements TEXT,
      status TEXT DEFAULT 'open',
      synced INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
    CREATE INDEX IF NOT EXISTS idx_tenders_sector ON tenders(sector);
    CREATE INDEX IF NOT EXISTS idx_tenders_region ON tenders(region);
    CREATE INDEX IF NOT EXISTS idx_tenders_publishedAt ON tenders(publishedAt DESC);

    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT,
      sourceUrl TEXT,
      sourceName TEXT,
      publishedAt TEXT,
      category TEXT DEFAULT 'general',
      industryTags TEXT,
      region TEXT,
      synced INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
    CREATE INDEX IF NOT EXISTS idx_news_region ON news(region);
    CREATE INDEX IF NOT EXISTS idx_news_publishedAt ON news(publishedAt DESC);

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      records_synced INTEGER,
      status TEXT,
      error TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rag_documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT,
      category TEXT,
      locale TEXT DEFAULT 'en',
      trust_tier TEXT,
      freshness TEXT,
      chunk_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rag_chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
      chunk_index INTEGER NOT NULL,
      content TEXT NOT NULL,
      embedding TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc_id ON rag_chunks(document_id);
  `);

  // FTS5 virtual table for keyword search fallback
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS rag_chunks_fts USING fts5(
      content,
      document_id UNINDEXED,
      chunk_index UNINDEXED,
      metadata UNINDEXED
    );
  `);
}

let localSchemaInitDone = false;

function ensureLocalSchema(): void {
  if (!localSchemaInitDone) {
    initLocalSchema();
    localSchemaInitDone = true;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * Health check — detect pg availability with cached result
 * ═══════════════════════════════════════════════════════════════════════════════ */

let pgHealthCache: { available: boolean; checkedAt: number } | null = null;
const PG_HEALTH_TTL_MS = 60_000; // re-check every 60s

async function isPgAvailable(): Promise<boolean> {
  if (pgHealthCache && Date.now() - pgHealthCache.checkedAt < PG_HEALTH_TTL_MS) {
    return pgHealthCache.available;
  }

  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    pgHealthCache = { available: true, checkedAt: Date.now() };
    if (!pgHealthCache.available) {
      console.log('[DB] PostgreSQL connection restored');
    }
    return true;
  } catch (err) {
    const wasAvailable = pgHealthCache?.available ?? true;
    pgHealthCache = { available: false, checkedAt: Date.now() };
    if (wasAvailable) {
      console.warn('[DB] PostgreSQL unreachable, falling back to local SQLite:', (err as Error)?.message);
    }
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * Schema migration (pg only — SQLite schema is handled separately)
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function ensureSchema(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tenders (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      organization TEXT,
      sourceUrl TEXT,
      sourceName TEXT,
      publishedAt TEXT,
      closingDate TEXT,
      value TEXT,
      category TEXT,
      sector TEXT,
      region TEXT,
      requirements TEXT,
      status TEXT DEFAULT 'open',
      synced INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (NOW()::TEXT),
      updatedAt TEXT DEFAULT (NOW()::TEXT)
    );

    CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
    CREATE INDEX IF NOT EXISTS idx_tenders_sector ON tenders(sector);
    CREATE INDEX IF NOT EXISTS idx_tenders_region ON tenders(region);
    CREATE INDEX IF NOT EXISTS idx_tenders_publishedAt ON tenders(publishedAt DESC);

    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT,
      sourceUrl TEXT,
      sourceName TEXT,
      publishedAt TEXT,
      category TEXT DEFAULT 'general',
      industryTags TEXT,
      region TEXT,
      synced INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (NOW()::TEXT),
      updatedAt TEXT DEFAULT (NOW()::TEXT)
    );

    CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
    CREATE INDEX IF NOT EXISTS idx_news_region ON news(region);
    CREATE INDEX IF NOT EXISTS idx_news_publishedAt ON news(publishedAt DESC);

    CREATE TABLE IF NOT EXISTS sync_log (
      id SERIAL PRIMARY KEY,
      table_name TEXT NOT NULL,
      records_synced INTEGER,
      status TEXT,
      error TEXT,
      createdAt TEXT DEFAULT (NOW()::TEXT)
    );

    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE IF NOT EXISTS rag_documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT,
      category TEXT,
      locale TEXT DEFAULT 'en',
      trust_tier TEXT,
      freshness TEXT,
      chunk_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS rag_chunks (
      id SERIAL PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
      chunk_index INTEGER NOT NULL,
      content TEXT NOT NULL,
      embedding vector(768),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc_id ON rag_chunks(document_id);
    CREATE INDEX IF NOT EXISTS idx_rag_chunks_metadata_category ON rag_chunks((metadata->>'category'));
    CREATE INDEX IF NOT EXISTS idx_rag_chunks_metadata_locale ON rag_chunks((metadata->>'locale'));
    CREATE INDEX IF NOT EXISTS idx_rag_documents_trust_tier ON rag_documents(trust_tier);
  `);
}

/* ── ensure schema on first import ───────────────────────────────────────── */
let schemaPromise: Promise<void> | null = null;
export function initSchema(): Promise<void> {
  if (!schemaPromise) schemaPromise = ensureSchema();
  return schemaPromise;
}

/* ── helper: run queries inside a transaction (pg) ──────────────────────── */
async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool();
  await initSchema();
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * Exported interfaces (unchanged)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface TenderRecord {
  id: string;
  title: string;
  description: string | null;
  organization: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  publishedAt: string | null;
  closingDate: string | null;
  value: string | null;
  category: string | null;
  sector: string | null;
  region: string | null;
  requirements: string | null;
  status: string;
  synced: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewsRecord {
  id: string;
  title: string;
  summary: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  publishedAt: string | null;
  category: string;
  industryTags: string | null;
  region: string | null;
  synced: number;
  createdAt: string;
  updatedAt: string;
}

/* ─── Tender Operations ──────────────────────────────────────────────────── */

export async function upsertTenders(
  tenders: Array<{
    id: string;
    title: string;
    description?: string;
    organization?: string;
    sourceUrl?: string;
    sourceName?: string;
    publishedAt?: Date;
    closingDate?: Date | null;
    value?: string | null;
    category?: string;
    sector?: string;
    region?: string;
    requirements?: string[];
    status?: string;
  }>,
): Promise<number> {
  if (await isPgAvailable()) {
    return withClient(async (client) => {
      const text = `
        INSERT INTO tenders (id, title, description, organization, sourceUrl, sourceName,
          publishedAt, closingDate, value, category, sector, region, requirements, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          organization = EXCLUDED.organization,
          sourceUrl = EXCLUDED.sourceUrl,
          sourceName = EXCLUDED.sourceName,
          publishedAt = EXCLUDED.publishedAt,
          closingDate = EXCLUDED.closingDate,
          value = EXCLUDED.value,
          category = EXCLUDED.category,
          sector = EXCLUDED.sector,
          region = EXCLUDED.region,
          requirements = EXCLUDED.requirements,
          status = EXCLUDED.status,
          updatedAt = NOW()::TEXT
      `;
      let count = 0;
      await client.query('BEGIN');
      try {
        for (const tender of tenders) {
          await client.query(text, [
            tender.id,
            tender.title,
            tender.description ?? null,
            tender.organization ?? null,
            tender.sourceUrl ?? null,
            tender.sourceName ?? null,
            tender.publishedAt?.toISOString() ?? null,
            tender.closingDate?.toISOString() ?? null,
            tender.value ?? null,
            tender.category ?? null,
            tender.sector ?? null,
            tender.region ?? null,
            tender.requirements ? JSON.stringify(tender.requirements) : null,
            tender.status ?? 'open',
          ]);
          count++;
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
      return count;
    });
  }

  // SQLite fallback
  ensureLocalSchema();
  const db = getLocalDb();
  const stmt = db.prepare(`
    INSERT INTO tenders (id, title, description, organization, sourceUrl, sourceName,
      publishedAt, closingDate, value, category, sector, region, requirements, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      organization = excluded.organization,
      sourceUrl = excluded.sourceUrl,
      sourceName = excluded.sourceName,
      publishedAt = excluded.publishedAt,
      closingDate = excluded.closingDate,
      value = excluded.value,
      category = excluded.category,
      sector = excluded.sector,
      region = excluded.region,
      requirements = excluded.requirements,
      status = excluded.status,
      updatedAt = datetime('now')
  `);

  const insertAll = db.transaction(() => {
    let count = 0;
    for (const tender of tenders) {
      stmt.run(
        tender.id,
        tender.title,
        tender.description ?? null,
        tender.organization ?? null,
        tender.sourceUrl ?? null,
        tender.sourceName ?? null,
        tender.publishedAt?.toISOString() ?? null,
        tender.closingDate?.toISOString() ?? null,
        tender.value ?? null,
        tender.category ?? null,
        tender.sector ?? null,
        tender.region ?? null,
        tender.requirements ? JSON.stringify(tender.requirements) : null,
        tender.status ?? 'open',
      );
      count++;
    }
    return count;
  });
  return insertAll();
}

export async function getTenders(
  options: {
    limit?: number;
    offset?: number;
    status?: string;
    sector?: string;
    region?: string;
  } = {},
): Promise<TenderRecord[]> {
  if (await isPgAvailable()) {
    return withClient(async (client) => {
      const { limit = 50, offset = 0, status, sector, region } = options;
      let sql = 'SELECT * FROM tenders WHERE 1=1';
      const params: (string | number)[] = [];
      let p = 1;
      if (status) {
        sql += ` AND status = $${p++}`;
        params.push(status);
      }
      if (sector) {
        sql += ` AND (sector ILIKE $${p++} OR title ILIKE $${p++})`;
        params.push(`%${sector}%`, `%${sector}%`);
      }
      if (region && region !== 'Africa') {
        sql += ` AND region = $${p++}`;
        params.push(region);
      }
      sql += ` ORDER BY publishedAt DESC LIMIT $${p++} OFFSET $${p++}`;
      params.push(limit, offset);
      const { rows } = await client.query(sql, params);
      return rows as TenderRecord[];
    });
  }

  ensureLocalSchema();
  const db = getLocalDb();
  const { limit = 50, offset = 0, status, sector, region } = options;
  let sql = 'SELECT * FROM tenders WHERE 1=1';
  const params: (string | number)[] = [];
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (sector) {
    sql += ' AND (sector LIKE ? OR title LIKE ?)';
    params.push(`%${sector}%`, `%${sector}%`);
  }
  if (region && region !== 'Africa') {
    sql += ' AND region = ?';
    params.push(region);
  }
  sql += ' ORDER BY publishedAt DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  return db.prepare(sql).all(...params) as TenderRecord[];
}

export async function getTenderCount(
  options: { status?: string } = {},
): Promise<number> {
  if (await isPgAvailable()) {
    return withClient(async (client) => {
      const { status } = options;
      let sql = 'SELECT COUNT(*)::int AS count FROM tenders WHERE 1=1';
      const params: string[] = [];
      if (status) {
        sql += ' AND status = $1';
        params.push(status);
      }
      const { rows } = await client.query(sql, params);
      return (rows[0]?.count as number) ?? 0;
    });
  }

  ensureLocalSchema();
  const db = getLocalDb();
  const { status } = options;
  let sql = 'SELECT COUNT(*) AS count FROM tenders WHERE 1=1';
  const params: string[] = [];
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  return (db.prepare(sql).get(...params) as { count: number })?.count ?? 0;
}

export async function getUnsyncedTenders(): Promise<TenderRecord[]> {
  if (await isPgAvailable()) {
    return withClient(async (client) => {
      const { rows } = await client.query(
        'SELECT * FROM tenders WHERE synced = 0 ORDER BY createdAt ASC',
      );
      return rows as TenderRecord[];
    });
  }

  ensureLocalSchema();
  const db = getLocalDb();
  return db.prepare('SELECT * FROM tenders WHERE synced = 0 ORDER BY createdAt ASC').all() as TenderRecord[];
}

export async function markTendersSynced(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  if (await isPgAvailable()) {
    return withClient(async (client) => {
      await client.query('BEGIN');
      try {
        for (const id of ids) {
          await client.query(
            "UPDATE tenders SET synced = 1, updatedAt = NOW()::TEXT WHERE id = $1",
            [id],
          );
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    });
  }

  ensureLocalSchema();
  const db = getLocalDb();
  const stmt = db.prepare("UPDATE tenders SET synced = 1, updatedAt = datetime('now') WHERE id = ?");
  const updateAll = db.transaction(() => {
    for (const id of ids) stmt.run(id);
  });
  updateAll();
}

/* ─── News Operations ────────────────────────────────────────────────────── */

export async function upsertNewsBatch(
  articles: Array<{
    id: string;
    title: string;
    summary?: string;
    sourceUrl?: string;
    sourceName?: string;
    publishedAt?: Date;
    category?: string;
    industryTags?: string[];
    region?: string;
  }>,
): Promise<number> {
  if (await isPgAvailable()) {
    return withClient(async (client) => {
      const text = `
        INSERT INTO news (id, title, summary, sourceUrl, sourceName, publishedAt,
          category, industryTags, region)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          sourceUrl = EXCLUDED.sourceUrl,
          sourceName = EXCLUDED.sourceName,
          publishedAt = EXCLUDED.publishedAt,
          category = EXCLUDED.category,
          industryTags = EXCLUDED.industryTags,
          region = EXCLUDED.region,
          updatedAt = NOW()::TEXT
      `;
      let count = 0;
      await client.query('BEGIN');
      try {
        for (const article of articles) {
          await client.query(text, [
            article.id,
            article.title,
            article.summary ?? null,
            article.sourceUrl ?? null,
            article.sourceName ?? null,
            article.publishedAt?.toISOString() ?? null,
            article.category ?? 'general',
            article.industryTags ? JSON.stringify(article.industryTags) : null,
            article.region ?? null,
          ]);
          count++;
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
      return count;
    });
  }

  ensureLocalSchema();
  const db = getLocalDb();
  const stmt = db.prepare(`
    INSERT INTO news (id, title, summary, sourceUrl, sourceName, publishedAt,
      category, industryTags, region)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      sourceUrl = excluded.sourceUrl,
      sourceName = excluded.sourceName,
      publishedAt = excluded.publishedAt,
      category = excluded.category,
      industryTags = excluded.industryTags,
      region = excluded.region,
      updatedAt = datetime('now')
  `);

  const insertAll = db.transaction(() => {
    let count = 0;
    for (const article of articles) {
      stmt.run(
        article.id,
        article.title,
        article.summary ?? null,
        article.sourceUrl ?? null,
        article.sourceName ?? null,
        article.publishedAt?.toISOString() ?? null,
        article.category ?? 'general',
        article.industryTags ? JSON.stringify(article.industryTags) : null,
        article.region ?? null,
      );
      count++;
    }
    return count;
  });
  return insertAll();
}

export async function getNews(
  options: {
    limit?: number;
    offset?: number;
    category?: string;
    region?: string;
  } = {},
): Promise<NewsRecord[]> {
  if (await isPgAvailable()) {
    return withClient(async (client) => {
      const { limit = 50, offset = 0, category, region } = options;
      let sql = 'SELECT * FROM news WHERE 1=1';
      const params: (string | number)[] = [];
      let p = 1;
      if (category && category !== 'all') {
        sql += ` AND category = $${p++}`;
        params.push(category);
      }
      if (region && region !== 'Africa') {
        sql += ` AND region = $${p++}`;
        params.push(region);
      }
      sql += ` ORDER BY publishedAt DESC LIMIT $${p++} OFFSET $${p++}`;
      params.push(limit, offset);
      const { rows } = await client.query(sql, params);
      return rows as NewsRecord[];
    });
  }

  ensureLocalSchema();
  const db = getLocalDb();
  const { limit = 50, offset = 0, category, region } = options;
  let sql = 'SELECT * FROM news WHERE 1=1';
  const params: (string | number)[] = [];
  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (region && region !== 'Africa') {
    sql += ' AND region = ?';
    params.push(region);
  }
  sql += ' ORDER BY publishedAt DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  return db.prepare(sql).all(...params) as NewsRecord[];
}

export async function getNewsCount(): Promise<number> {
  if (await isPgAvailable()) {
    return withClient(async (client) => {
      const { rows } = await client.query('SELECT COUNT(*)::int AS count FROM news');
      return (rows[0]?.count as number) ?? 0;
    });
  }

  ensureLocalSchema();
  const db = getLocalDb();
  return (db.prepare('SELECT COUNT(*) AS count FROM news').get() as { count: number })?.count ?? 0;
}

export async function getUnsyncedNews(): Promise<NewsRecord[]> {
  if (await isPgAvailable()) {
    return withClient(async (client) => {
      const { rows } = await client.query(
        'SELECT * FROM news WHERE synced = 0 ORDER BY createdAt ASC',
      );
      return rows as NewsRecord[];
    });
  }

  ensureLocalSchema();
  const db = getLocalDb();
  return db.prepare('SELECT * FROM news WHERE synced = 0 ORDER BY createdAt ASC').all() as NewsRecord[];
}

export async function markNewsSynced(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  if (await isPgAvailable()) {
    return withClient(async (client) => {
      await client.query('BEGIN');
      try {
        for (const id of ids) {
          await client.query(
            "UPDATE news SET synced = 1, updatedAt = NOW()::TEXT WHERE id = $1",
            [id],
          );
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    });
  }

  ensureLocalSchema();
  const db = getLocalDb();
  const stmt = db.prepare("UPDATE news SET synced = 1, updatedAt = datetime('now') WHERE id = ?");
  const updateAll = db.transaction(() => {
    for (const id of ids) stmt.run(id);
  });
  updateAll();
}

/* ─── Sync Log ───────────────────────────────────────────────────────────── */

export async function logSync(
  tableName: string,
  recordsSynced: number,
  status: string,
  error?: string,
): Promise<void> {
  if (await isPgAvailable()) {
    return withClient(async (client) => {
      await client.query(
        'INSERT INTO sync_log (table_name, records_synced, status, error) VALUES ($1, $2, $3, $4)',
        [tableName, recordsSynced, status, error ?? null],
      );
    });
  }

  ensureLocalSchema();
  const db = getLocalDb();
  db.prepare(
    'INSERT INTO sync_log (table_name, records_synced, status, error) VALUES (?, ?, ?, ?)',
  ).run(tableName, recordsSynced, status, error ?? null);
}

/* ─── Stats ────────────────────────────────────────────────────────────── */

export async function getDbStats(): Promise<{
  tenders: number;
  news: number;
  unsyncedTenders: number;
  unsyncedNews: number;
  dbSize: string;
}> {
  if (await isPgAvailable()) {
    return withClient(async (client) => {
      const tRows = (await client.query('SELECT COUNT(*)::int AS count FROM tenders')).rows;
      const nRows = (await client.query('SELECT COUNT(*)::int AS count FROM news')).rows;
      const utRows = (await client.query('SELECT COUNT(*)::int AS count FROM tenders WHERE synced = 0')).rows;
      const unRows = (await client.query('SELECT COUNT(*)::int AS count FROM news WHERE synced = 0')).rows;
      const sizeRows = (await client.query(
        "SELECT pg_size_pretty(pg_database_size(current_database())) AS size"
      )).rows;
      return {
        tenders: (tRows[0]?.count as number) ?? 0,
        news: (nRows[0]?.count as number) ?? 0,
        unsyncedTenders: (utRows[0]?.count as number) ?? 0,
        unsyncedNews: (unRows[0]?.count as number) ?? 0,
        dbSize: (sizeRows[0]?.size as string) ?? 'N/A',
      };
    });
  }

  ensureLocalSchema();
  const db = getLocalDb();
  const stats = {
    tenders: (db.prepare('SELECT COUNT(*) AS count FROM tenders').get() as { count: number })?.count ?? 0,
    news: (db.prepare('SELECT COUNT(*) AS count FROM news').get() as { count: number })?.count ?? 0,
    unsyncedTenders: (db.prepare('SELECT COUNT(*) AS count FROM tenders WHERE synced = 0').get() as { count: number })?.count ?? 0,
    unsyncedNews: (db.prepare('SELECT COUNT(*) AS count FROM news WHERE synced = 0').get() as { count: number })?.count ?? 0,
    dbSize: 'local',
  };
  return stats;
}

/* ─── Utility ────────────────────────────────────────────────────────────── */

export function tenderFromDb(record: TenderRecord): any {
  return {
    ...record,
    requirements: record.requirements ? JSON.parse(record.requirements) : [],
    publishedAt: record.publishedAt ? new Date(record.publishedAt) : new Date(),
    closingDate: record.closingDate ? new Date(record.closingDate) : null,
    processedAt: new Date(record.updatedAt || record.createdAt),
    scrapedAt: new Date(record.createdAt),
  };
}

export function newsFromDb(record: NewsRecord): any {
  return {
    ...record,
    industryTags: record.industryTags ? JSON.parse(record.industryTags) : [],
    publishedAt: record.publishedAt ? new Date(record.publishedAt) : new Date(),
    processedAt: new Date(record.updatedAt || record.createdAt),
    scrapedAt: new Date(record.createdAt),
  };
}

export async function closeDb(): Promise<void> {
  const g = globalThis as unknown as { __radbitPgPool?: Pool };
  if (g.__radbitPgPool) {
    await g.__radbitPgPool.end();
    g.__radbitPgPool = undefined;
  }
  const lg = globalThis as unknown as { __radbitLocalDb?: Database.Database };
  if (lg.__radbitLocalDb) {
    lg.__radbitLocalDb.close();
    lg.__radbitLocalDb = undefined;
  }
  pgHealthCache = null;
}

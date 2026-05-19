import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'radbit.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log(`[SQLite] Initializing database at ${DB_PATH}`);
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = -64000');
  db.pragma('foreign_keys = ON');

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
    CREATE INDEX IF NOT EXISTS idx_tenders_synced ON tenders(synced);

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
    CREATE INDEX IF NOT EXISTS idx_news_synced ON news(synced);

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      records_synced INTEGER,
      status TEXT,
      error TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}

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

// ─── Tender Operations ──────────────────────────────────────────────────────

export function upsertTender(tender: {
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
}): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO tenders (id, title, description, organization, sourceUrl, sourceName,
      publishedAt, closingDate, value, category, sector, region, requirements, status)
    VALUES (@id, @title, @description, @organization, @sourceUrl, @sourceName,
      @publishedAt, @closingDate, @value, @category, @sector, @region, @requirements, @status)
    ON CONFLICT(id) DO UPDATE SET
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

  stmt.run({
    id: tender.id,
    title: tender.title,
    description: tender.description || null,
    organization: tender.organization || null,
    sourceUrl: tender.sourceUrl || null,
    sourceName: tender.sourceName || null,
    publishedAt: tender.publishedAt?.toISOString() || null,
    closingDate: tender.closingDate?.toISOString() || null,
    value: tender.value || null,
    category: tender.category || null,
    sector: tender.sector || null,
    region: tender.region || null,
    requirements: tender.requirements ? JSON.stringify(tender.requirements) : null,
    status: tender.status || 'open',
  });
}

export function upsertTenders(tenders: Array<{
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
}>): number {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO tenders (id, title, description, organization, sourceUrl, sourceName,
      publishedAt, closingDate, value, category, sector, region, requirements, status)
    VALUES (@id, @title, @description, @organization, @sourceUrl, @sourceName,
      @publishedAt, @closingDate, @value, @category, @sector, @region, @requirements, @status)
    ON CONFLICT(id) DO UPDATE SET
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

  const insertMany = db.transaction((items) => {
    let count = 0;
    for (const item of items) {
      insert.run({
        id: item.id,
        title: item.title,
        description: item.description || null,
        organization: item.organization || null,
        sourceUrl: item.sourceUrl || null,
        sourceName: item.sourceName || null,
        publishedAt: item.publishedAt?.toISOString() || null,
        closingDate: item.closingDate?.toISOString() || null,
        value: item.value || null,
        category: item.category || null,
        sector: item.sector || null,
        region: item.region || null,
        requirements: item.requirements ? JSON.stringify(item.requirements) : null,
        status: item.status || 'open',
      });
      count++;
    }
    return count;
  });

  return insertMany(tenders);
}

export function getTenders(options: {
  limit?: number;
  offset?: number;
  status?: string;
  sector?: string;
  region?: string;
} = {}): TenderRecord[] {
  const db = getDb();
  const { limit = 50, offset = 0, status, sector, region } = options;

  let sql = 'SELECT * FROM tenders WHERE 1=1';
  const params: any[] = [];

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

  const rows = db.prepare(sql).all(...params) as TenderRecord[];
  return rows;
}

export function getTenderCount(options: {
  status?: string;
} = {}): number {
  const db = getDb();
  const { status } = options;

  let sql = 'SELECT COUNT(*) as count FROM tenders WHERE 1=1';
  const params: any[] = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  const row = db.prepare(sql).get(...params) as { count: number };
  return row.count;
}

export function getUnsyncedTenders(): TenderRecord[] {
  const db = getDb();
  return db.prepare('SELECT * FROM tenders WHERE synced = 0 ORDER BY createdAt ASC').all() as TenderRecord[];
}

export function markTendersSynced(ids: string[]): void {
  if (ids.length === 0) return;
  const db = getDb();
  const stmt = db.prepare('UPDATE tenders SET synced = 1, updatedAt = datetime(\'now\') WHERE id = ?');
  const updateMany = db.transaction((items: string[]) => {
    for (const id of items) {
      stmt.run(id);
    }
  });
  updateMany(ids);
}

// ─── News Operations ────────────────────────────────────────────────────────

export function upsertNews(article: {
  id: string;
  title: string;
  summary?: string;
  sourceUrl?: string;
  sourceName?: string;
  publishedAt?: Date;
  category?: string;
  industryTags?: string[];
  region?: string;
}): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO news (id, title, summary, sourceUrl, sourceName, publishedAt,
      category, industryTags, region)
    VALUES (@id, @title, @summary, @sourceUrl, @sourceName, @publishedAt,
      @category, @industryTags, @region)
    ON CONFLICT(id) DO UPDATE SET
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

  stmt.run({
    id: article.id,
    title: article.title,
    summary: article.summary || null,
    sourceUrl: article.sourceUrl || null,
    sourceName: article.sourceName || null,
    publishedAt: article.publishedAt?.toISOString() || null,
    category: article.category || 'general',
    industryTags: article.industryTags ? JSON.stringify(article.industryTags) : null,
    region: article.region || null,
  });
}

export function upsertNewsBatch(articles: Array<{
  id: string;
  title: string;
  summary?: string;
  sourceUrl?: string;
  sourceName?: string;
  publishedAt?: Date;
  category?: string;
  industryTags?: string[];
  region?: string;
}>): number {
  console.log(`[SQLite] upsertNewsBatch called with ${articles.length} articles`);
  const db = getDb();
  console.log(`[SQLite] Database initialized, path: ${DB_PATH}`);
  const insert = db.prepare(`
    INSERT INTO news (id, title, summary, sourceUrl, sourceName, publishedAt,
      category, industryTags, region)
    VALUES (@id, @title, @summary, @sourceUrl, @sourceName, @publishedAt,
      @category, @industryTags, @region)
    ON CONFLICT(id) DO UPDATE SET
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

  let count = 0;
  console.log(`[SQLite] Inserting ${articles.length} news articles`);
  for (const item of articles) {
    try {
      insert.run({
        id: item.id,
        title: item.title,
        summary: item.summary || null,
        sourceUrl: item.sourceUrl || null,
        sourceName: item.sourceName || null,
        publishedAt: item.publishedAt?.toISOString() || null,
        category: item.category || 'general',
        industryTags: item.industryTags ? JSON.stringify(item.industryTags) : null,
        region: item.region || null,
      });
      count++;
    } catch (err: any) {
      console.error(`[SQLite] Failed to insert news ${item.id}:`, err.message);
      console.error(`[SQLite] Item data:`, JSON.stringify({ id: item.id, title: item.title?.slice(0, 50), category: item.category, publishedAt: item.publishedAt }));
    }
  }
  console.log(`[SQLite] Successfully inserted ${count}/${articles.length} news articles`);
  return count;
}

export function getNews(options: {
  limit?: number;
  offset?: number;
  category?: string;
  region?: string;
} = {}): NewsRecord[] {
  const db = getDb();
  const { limit = 50, offset = 0, category, region } = options;

  let sql = 'SELECT * FROM news WHERE 1=1';
  const params: any[] = [];

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

  const rows = db.prepare(sql).all(...params) as NewsRecord[];
  return rows;
}

export function getNewsCount(): number {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) as count FROM news').get() as { count: number };
  return row.count;
}

export function getUnsyncedNews(): NewsRecord[] {
  const db = getDb();
  return db.prepare('SELECT * FROM news WHERE synced = 0 ORDER BY createdAt ASC').all() as NewsRecord[];
}

export function markNewsSynced(ids: string[]): void {
  if (ids.length === 0) return;
  const db = getDb();
  const stmt = db.prepare('UPDATE news SET synced = 1, updatedAt = datetime(\'now\') WHERE id = ?');
  const updateMany = db.transaction((items: string[]) => {
    for (const id of items) {
      stmt.run(id);
    }
  });
  updateMany(ids);
}

// ─── Sync Log ───────────────────────────────────────────────────────────────

export function logSync(tableName: string, recordsSynced: number, status: string, error?: string): void {
  const db = getDb();
  db.prepare('INSERT INTO sync_log (table_name, records_synced, status, error) VALUES (?, ?, ?, ?)').run(
    tableName, recordsSynced, status, error || null
  );
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export function getDbStats(): {
  tenders: number;
  news: number;
  unsyncedTenders: number;
  unsyncedNews: number;
  dbSize: string;
} {
  const db = getDb();
  const tenderCount = (db.prepare('SELECT COUNT(*) as count FROM tenders').get() as { count: number }).count;
  const newsCount = (db.prepare('SELECT COUNT(*) as count FROM news').get() as { count: number }).count;
  const unsyncedTenders = (db.prepare('SELECT COUNT(*) as count FROM tenders WHERE synced = 0').get() as { count: number }).count;
  const unsyncedNews = (db.prepare('SELECT COUNT(*) as count FROM news WHERE synced = 0').get() as { count: number }).count;

  let dbSize = '0 KB';
  try {
    const stats = fs.statSync(DB_PATH);
    const bytes = stats.size;
    if (bytes < 1024) dbSize = `${bytes} B`;
    else if (bytes < 1024 * 1024) dbSize = `${(bytes / 1024).toFixed(1)} KB`;
    else dbSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } catch {
    dbSize = 'N/A';
  }

  return {
    tenders: tenderCount,
    news: newsCount,
    unsyncedTenders,
    unsyncedNews,
    dbSize,
  };
}

// ─── Utility ────────────────────────────────────────────────────────────────

export function tenderFromDb(record: TenderRecord): any {
  return {
    ...record,
    requirements: record.requirements ? JSON.parse(record.requirements) : [],
    publishedAt: record.publishedAt ? new Date(record.publishedAt) : new Date(),
    closingDate: record.closingDate ? new Date(record.closingDate) : null,
    processedAt: new Date(record.updatedAt),
    scrapedAt: new Date(record.createdAt),
  };
}

export function newsFromDb(record: NewsRecord): any {
  return {
    ...record,
    industryTags: record.industryTags ? JSON.parse(record.industryTags) : [],
    publishedAt: record.publishedAt ? new Date(record.publishedAt) : new Date(),
    processedAt: new Date(record.updatedAt),
    scrapedAt: new Date(record.createdAt),
  };
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

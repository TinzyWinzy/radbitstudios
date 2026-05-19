import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'radbit.db');

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

async function initDb(): Promise<Database> {
  if (db) return db;

  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
    });
  }

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL(buffer);
  } else {
    db = new SQL();
  }

  db.run(`
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
  `);

  saveDb();
  return db;
}

function saveDb(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
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

export async function upsertTenders(tenders: Array<{
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
}>): Promise<number> {
  const database = await initDb();

  const stmt = database.prepare(`
    INSERT INTO tenders (id, title, description, organization, sourceUrl, sourceName,
      publishedAt, closingDate, value, category, sector, region, requirements, status)
    VALUES ($id, $title, $description, $organization, $sourceUrl, $sourceName,
      $publishedAt, $closingDate, $value, $category, $sector, $region, $requirements, $status)
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

  let count = 0;
  for (const tender of tenders) {
    stmt.run({
      $id: tender.id,
      $title: tender.title,
      $description: tender.description || null,
      $organization: tender.organization || null,
      $sourceUrl: tender.sourceUrl || null,
      $sourceName: tender.sourceName || null,
      $publishedAt: tender.publishedAt?.toISOString() || null,
      $closingDate: tender.closingDate?.toISOString() || null,
      $value: tender.value || null,
      $category: tender.category || null,
      $sector: tender.sector || null,
      $region: tender.region || null,
      $requirements: tender.requirements ? JSON.stringify(tender.requirements) : null,
      $status: tender.status || 'open',
    });
    count++;
  }
  stmt.free();
  saveDb();
  return count;
}

export async function getTenders(options: {
  limit?: number;
  offset?: number;
  status?: string;
  sector?: string;
  region?: string;
} = {}): Promise<TenderRecord[]> {
  const database = await initDb();
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

  const stmt = database.prepare(sql);
  const rows: TenderRecord[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as TenderRecord);
  }
  stmt.free();
  return rows;
}

export async function getTenderCount(options: {
  status?: string;
} = {}): Promise<number> {
  const database = await initDb();
  const { status } = options;

  let sql = 'SELECT COUNT(*) as count FROM tenders WHERE 1=1';
  const params: any[] = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  const stmt = database.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() as { count: number } : { count: 0 };
  stmt.free();
  return row.count;
}

export async function getUnsyncedTenders(): Promise<TenderRecord[]> {
  const database = await initDb();
  const stmt = database.prepare('SELECT * FROM tenders WHERE synced = 0 ORDER BY createdAt ASC');
  const rows: TenderRecord[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as TenderRecord);
  }
  stmt.free();
  return rows;
}

export async function markTendersSynced(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const database = await initDb();
  const stmt = database.prepare('UPDATE tenders SET synced = 1, updatedAt = datetime(\'now\') WHERE id = ?');
  for (const id of ids) {
    stmt.run([id]);
  }
  stmt.free();
  saveDb();
}

// ─── News Operations ────────────────────────────────────────────────────────

export async function upsertNewsBatch(articles: Array<{
  id: string;
  title: string;
  summary?: string;
  sourceUrl?: string;
  sourceName?: string;
  publishedAt?: Date;
  category?: string;
  industryTags?: string[];
  region?: string;
}>): Promise<number> {
  const database = await initDb();

  const stmt = database.prepare(`
    INSERT INTO news (id, title, summary, sourceUrl, sourceName, publishedAt,
      category, industryTags, region)
    VALUES ($id, $title, $summary, $sourceUrl, $sourceName, $publishedAt,
      $category, $industryTags, $region)
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
  for (const article of articles) {
    try {
      stmt.run({
        $id: article.id,
        $title: article.title,
        $summary: article.summary || null,
        $sourceUrl: article.sourceUrl || null,
        $sourceName: article.sourceName || null,
        $publishedAt: article.publishedAt?.toISOString() || null,
        $category: article.category || 'general',
        $industryTags: article.industryTags ? JSON.stringify(article.industryTags) : null,
        $region: article.region || null,
      });
      count++;
    } catch (err: any) {
      console.error(`[SQLite] Failed to insert news ${article.id}:`, err.message);
    }
  }
  stmt.free();
  saveDb();
  return count;
}

export async function getNews(options: {
  limit?: number;
  offset?: number;
  category?: string;
  region?: string;
} = {}): Promise<NewsRecord[]> {
  const database = await initDb();
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

  const stmt = database.prepare(sql);
  const rows: NewsRecord[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as NewsRecord);
  }
  stmt.free();
  return rows;
}

export async function getNewsCount(): Promise<number> {
  const database = await initDb();
  const stmt = database.prepare('SELECT COUNT(*) as count FROM news');
  const row = stmt.step() ? stmt.getAsObject() as { count: number } : { count: 0 };
  stmt.free();
  return row.count;
}

export async function getUnsyncedNews(): Promise<NewsRecord[]> {
  const database = await initDb();
  const stmt = database.prepare('SELECT * FROM news WHERE synced = 0 ORDER BY createdAt ASC');
  const rows: NewsRecord[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as NewsRecord);
  }
  stmt.free();
  return rows;
}

export async function markNewsSynced(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const database = await initDb();
  const stmt = database.prepare('UPDATE news SET synced = 1, updatedAt = datetime(\'now\') WHERE id = ?');
  for (const id of ids) {
    stmt.run([id]);
  }
  stmt.free();
  saveDb();
}

// ─── Sync Log ───────────────────────────────────────────────────────────────

export async function logSync(tableName: string, recordsSynced: number, status: string, error?: string): Promise<void> {
  const database = await initDb();
  database.run('INSERT INTO sync_log (table_name, records_synced, status, error) VALUES (?, ?, ?, ?)', [
    tableName, recordsSynced, status, error || null,
  ]);
  saveDb();
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export async function getDbStats(): Promise<{
  tenders: number;
  news: number;
  unsyncedTenders: number;
  unsyncedNews: number;
  dbSize: string;
}> {
  const database = await initDb();

  const getTenderCount = database.prepare('SELECT COUNT(*) as count FROM tenders');
  const tenderCount = getTenderCount.step() ? (getTenderCount.getAsObject() as { count: number }).count : 0;
  getTenderCount.free();

  const getNewsCount = database.prepare('SELECT COUNT(*) as count FROM news');
  const newsCount = getNewsCount.step() ? (getNewsCount.getAsObject() as { count: number }).count : 0;
  getNewsCount.free();

  const getUnsyncedTenders = database.prepare('SELECT COUNT(*) as count FROM tenders WHERE synced = 0');
  const unsyncedTenders = getUnsyncedTenders.step() ? (getUnsyncedTenders.getAsObject() as { count: number }).count : 0;
  getUnsyncedTenders.free();

  const getUnsyncedNews = database.prepare('SELECT COUNT(*) as count FROM news WHERE synced = 0');
  const unsyncedNews = getUnsyncedNews.step() ? (getUnsyncedNews.getAsObject() as { count: number }).count : 0;
  getUnsyncedNews.free();

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

export async function closeDb(): Promise<void> {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}

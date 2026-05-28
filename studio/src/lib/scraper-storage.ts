import { adminDb } from '@/lib/firebase/firebase-admin';
import fs from 'fs';
import path from 'path';
import {
  getTenders as sqliteGetTenders,
  upsertTenders as sqliteUpsertTenders,
  getNews as sqliteGetNews,
  upsertNewsBatch as sqliteUpsertNews,
  logSync as sqliteLogSync,
  getUnsyncedTenders,
  getUnsyncedNews,
  markTendersSynced,
  markNewsSynced,
} from '@/lib/sqlite';

// ── Local JSON file fallback (used when DB + Firestore both unavailable) ────
const DATA_DIR = path.join(process.cwd(), 'data');
const TENDERS_CACHE_FILE = path.join(DATA_DIR, 'tenders-cache.json');
const NEWS_CACHE_FILE = path.join(DATA_DIR, 'news-cache.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonCache<T>(filePath: string): T[] {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T[];
    }
  } catch { /* corrupt cache — ignore */ }
  return [];
}

function writeJsonCache<T extends { id: string }>(filePath: string, incoming: T[]): void {
  ensureDataDir();
  const existing = readJsonCache<T>(filePath);
  const map = new Map(existing.map(r => [r.id, r]));
  for (const r of incoming) map.set(r.id, r);
  fs.writeFileSync(filePath, JSON.stringify(Array.from(map.values()), null, 2), 'utf-8');
}

let firestoreAvailable: boolean | null = null;

async function checkFirestore(): Promise<boolean> {
  if (firestoreAvailable !== null) return firestoreAvailable;
  try {
    await adminDb.collection('scraper_sync_log').limit(1).get();
    firestoreAvailable = true;
  } catch {
    console.warn('[ScraperStorage] Firestore Admin not available, using database only');
    firestoreAvailable = false;
  }
  return firestoreAvailable;
}

async function firestoreUpsertTenders(
  tenders: Array<{
    id: string; title: string; description?: string; organization?: string;
    sourceUrl?: string; sourceName?: string; publishedAt?: Date;
    closingDate?: Date | null; value?: string | null; category?: string;
    sector?: string; region?: string; requirements?: string[]; status?: string;
  }>
): Promise<number> {
  const batch = adminDb.batch();
  const col = adminDb.collection('scraper_tenders');
  for (const t of tenders) {
    batch.set(col.doc(t.id), {
      id: t.id,
      title: t.title,
      description: t.description || null,
      organization: t.organization || null,
      sourceUrl: t.sourceUrl || null,
      sourceName: t.sourceName || null,
      publishedAt: t.publishedAt?.toISOString() || null,
      closingDate: t.closingDate?.toISOString() || null,
      value: t.value || null,
      category: t.category || null,
      sector: t.sector || null,
      region: t.region || null,
      requirements: t.requirements || [],
      status: t.status || 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
  await batch.commit();
  return tenders.length;
}

async function firestoreGetTenders(options: {
  limit?: number; offset?: number; status?: string; sector?: string; region?: string;
} = {}): Promise<any[]> {
  const { limit = 50, offset = 0, status, sector, region } = options;

  let query: FirebaseFirestore.Query = adminDb.collection('scraper_tenders');

  if (status) {
    query = query.where('status', '==', status);
  }
  if (region && region !== 'Africa') {
    query = query.where('region', '==', region);
  }
  query = query.orderBy('publishedAt', 'desc');
  if (offset > 0) query = query.offset(offset);
  query = query.limit(limit);

  let snapshot = await query.get();

  let docs = snapshot.docs.map(d => ({ ...d.data() }));

  if (sector) {
    docs = docs.filter(d =>
      (d.sector || '').toLowerCase().includes(sector.toLowerCase()) ||
      (d.title || '').toLowerCase().includes(sector.toLowerCase())
    );
  }

  return docs;
}

async function firestoreUpsertNews(
  articles: Array<{
    id: string; title: string; summary?: string; sourceUrl?: string;
    sourceName?: string; publishedAt?: Date; category?: string;
    industryTags?: string[]; region?: string;
  }>
): Promise<number> {
  const batch = adminDb.batch();
  const col = adminDb.collection('scraper_news');
  for (const a of articles) {
    batch.set(col.doc(a.id), {
      id: a.id,
      title: a.title,
      summary: a.summary || null,
      sourceUrl: a.sourceUrl || null,
      sourceName: a.sourceName || null,
      publishedAt: a.publishedAt?.toISOString() || null,
      category: a.category || 'general',
      industryTags: a.industryTags || [],
      region: a.region || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
  await batch.commit();
  return articles.length;
}

async function firestoreGetNews(options: {
  limit?: number; offset?: number; category?: string; region?: string;
} = {}): Promise<any[]> {
  const { limit = 50, offset = 0, category, region } = options;

  let query: FirebaseFirestore.Query = adminDb.collection('scraper_news');

  if (category && category !== 'all') {
    query = query.where('category', '==', category);
  }
  if (region && region !== 'Africa') {
    query = query.where('region', '==', region);
  }
  query = query.orderBy('publishedAt', 'desc');
  if (offset > 0) query = query.offset(offset);
  query = query.limit(limit);

  const snapshot = await query.get();
  return snapshot.docs.map(d => ({ ...d.data() }));
}

async function firestoreSyncLog(
  tableName: string, recordsSynced: number, status: string, error?: string
): Promise<void> {
  await adminDb.collection('scraper_sync_log').add({
    tableName,
    recordsSynced,
    status,
    error: error || null,
    createdAt: new Date().toISOString(),
  });
}

export async function saveTenders(
  tenders: Array<{
    id: string; title: string; description?: string; organization?: string;
    sourceUrl?: string; sourceName?: string; publishedAt?: Date;
    closingDate?: Date | null; value?: string | null; category?: string;
    sector?: string; region?: string; requirements?: string[]; status?: string;
  }>
): Promise<number> {
  try {
    const count = await sqliteUpsertTenders(tenders);
    return count;
  } catch (dbErr: any) {
    console.warn('[ScraperStorage] Database tenders write failed, falling back to Firestore:', dbErr.message);
    if (await checkFirestore()) {
      return firestoreUpsertTenders(tenders);
    }
    // Last resort: persist to local JSON file so data survives restarts
    console.warn('[ScraperStorage] Firestore also unavailable — persisting tenders to local JSON cache');
    try {
      writeJsonCache(TENDERS_CACHE_FILE, tenders as Array<{ id: string } & typeof tenders[0]>);
      return tenders.length;
    } catch (fsErr: any) {
      console.error('[ScraperStorage] JSON cache write failed:', fsErr.message);
      throw dbErr;
    }
  }
}

export async function saveNews(
  articles: Array<{
    id: string; title: string; summary?: string; sourceUrl?: string;
    sourceName?: string; publishedAt?: Date; category?: string;
    industryTags?: string[]; region?: string;
  }>
): Promise<number> {
  try {
    const count = await sqliteUpsertNews(articles);
    return count;
  } catch (dbErr: any) {
    console.warn('[ScraperStorage] Database news write failed, falling back to Firestore:', dbErr.message);
    if (await checkFirestore()) {
      return firestoreUpsertNews(articles);
    }
    // Last resort: persist to local JSON file
    console.warn('[ScraperStorage] Firestore also unavailable — persisting news to local JSON cache');
    try {
      writeJsonCache(NEWS_CACHE_FILE, articles as Array<{ id: string } & typeof articles[0]>);
      return articles.length;
    } catch (fsErr: any) {
      console.error('[ScraperStorage] JSON cache write failed:', fsErr.message);
      throw dbErr;
    }
  }
}

export async function loadTenders(options: {
  limit?: number; offset?: number; status?: string; sector?: string; region?: string;
} = {}): Promise<any[]> {
  try {
    const rows = await sqliteGetTenders(options);
    if (rows.length > 0) return rows;
    // DB returned nothing — try JSON cache as supplement
    const cached = readJsonCache<any>(TENDERS_CACHE_FILE);
    if (cached.length > 0) {
      console.log(`[ScraperStorage] DB empty — serving ${cached.length} tenders from local JSON cache`);
      return cached.slice(0, options.limit || 50);
    }
    return rows;
  } catch {
    if (await checkFirestore()) {
      return firestoreGetTenders(options);
    }
    // DB and Firestore both down — try JSON cache
    const cached = readJsonCache<any>(TENDERS_CACHE_FILE);
    if (cached.length > 0) {
      console.log(`[ScraperStorage] DB+Firestore unavailable — serving ${cached.length} tenders from local JSON cache`);
      return cached.slice(0, options.limit || 50);
    }
    return [];
  }
}

export async function loadNews(options: {
  limit?: number; offset?: number; category?: string; region?: string;
} = {}): Promise<any[]> {
  try {
    const rows = await sqliteGetNews(options);
    if (rows.length > 0) return rows;
    // DB returned nothing — try JSON cache
    const cached = readJsonCache<any>(NEWS_CACHE_FILE);
    if (cached.length > 0) {
      console.log(`[ScraperStorage] DB empty — serving ${cached.length} news from local JSON cache`);
      return cached.slice(0, options.limit || 50);
    }
    return rows;
  } catch {
    if (await checkFirestore()) {
      return firestoreGetNews(options);
    }
    // DB and Firestore both down — try JSON cache
    const cached = readJsonCache<any>(NEWS_CACHE_FILE);
    if (cached.length > 0) {
      console.log(`[ScraperStorage] DB+Firestore unavailable — serving ${cached.length} news from local JSON cache`);
      return cached.slice(0, options.limit || 50);
    }
    return [];
  }
}

export async function saveLog(
  tableName: string, recordsSynced: number, status: string, error?: string
): Promise<void> {
  try {
    await sqliteLogSync(tableName, recordsSynced, status, error);
  } catch {
    if (await checkFirestore()) {
      await firestoreSyncLog(tableName, recordsSynced, status, error);
    }
  }
}

export function safeTenderFromDb(record: any): any {
  return {
    ...record,
    requirements: Array.isArray(record.requirements)
      ? record.requirements
      : (record.requirements ? JSON.parse(record.requirements) : []),
    publishedAt: record.publishedAt ? new Date(record.publishedAt) : new Date(),
    closingDate: record.closingDate ? new Date(record.closingDate) : null,
    processedAt: new Date(record.updatedAt || record.createdAt),
    scrapedAt: new Date(record.createdAt),
  };
}

export function safeNewsFromDb(record: any): any {
  return {
    ...record,
    industryTags: Array.isArray(record.industryTags)
      ? record.industryTags
      : (record.industryTags ? JSON.parse(record.industryTags) : []),
    publishedAt: record.publishedAt ? new Date(record.publishedAt) : new Date(),
    processedAt: new Date(record.updatedAt || record.createdAt),
    scrapedAt: new Date(record.createdAt),
  };
}

export { getUnsyncedTenders, getUnsyncedNews, markTendersSynced, markNewsSynced };

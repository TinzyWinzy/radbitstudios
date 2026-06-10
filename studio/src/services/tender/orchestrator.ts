import { getCached, setCached } from '@/lib/scraper-cache';
import { saveTenders, loadTenders, safeTenderFromDb, saveLog } from '@/lib/scraper-storage';
import { scoreBatch } from '@/services/scoring/content-scorer';
import { saveScores, loadScores } from '@/services/scoring/scored-items-store';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { scrapeAllEntities, storeEntityTenders } from '@/services/tender/entity-scraper';
import { generateContentId } from '@/lib/content-classification';
import {
  type Tender,
  MOCK_TENDERS,
  enrichTender,
  isQualityTender,
} from './types';
import { scrapeSource } from './scrape-engine';
import { TENDER_SOURCES } from './configs';

export type { Tender } from './types';

export async function scrapeAllTenders(): Promise<{ scraped: number; errors: number; tenders: Tender[] }> {
  const cacheKey = 'tenders:scrape:all_run';
  const cached = getCached<{ scraped: number; errors: number; tenders: Tender[] }>(cacheKey);
  if (cached) return cached;

  const results = { scraped: 0, errors: 0 };
  const allTenders: Tender[] = [];

  // Run all sources in parallel via Promise.allSettled
  const settled = await Promise.allSettled(
    TENDER_SOURCES.map(config => scrapeSource(config))
  );

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      allTenders.push(...result.value);
    }
  }

  if (allTenders.length === 0) {
    console.log('[TenderScraper] All sources failed — falling back to mock data');
    allTenders.push(...MOCK_TENDERS.map(raw => enrichTender({ ...raw, region: 'Zimbabwe' })));
  } else {
    console.log(`[TenderScraper] Total scraped from all sources: ${allTenders.length}`);
  }

  // Deduplicate
  const uniqueTenders = Array.from(
    new Map(allTenders.map(t => [t.id, t])).values()
  );

  // Quality filter
  const qualityTenders = uniqueTenders.filter(t => isQualityTender(t.title, t.description));
  const removedCount = uniqueTenders.length - qualityTenders.length;
  if (removedCount > 0) {
    console.log(`[TenderScraper] Filtered out ${removedCount} non-tender items`);
  }

  // Entity scraper
  try {
    const entityTenders = await scrapeAllEntities();
    if (entityTenders.length > 0) {
      console.log(`[TenderScraper] Entity scraper: ${entityTenders.length} tenders found`);
      await storeEntityTenders(entityTenders);
    }
  } catch (error: unknown) {
    console.warn(`[TenderScraper] Entity scraper failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }

  // Save + score
  if (qualityTenders.length > 0) {
    try {
      await saveTenders(qualityTenders);
      results.scraped = qualityTenders.length;
      results.errors = 0;
      console.log(`[TenderScraper] Saved ${results.scraped} tenders`);

      scoreBatch(qualityTenders.map(t => ({
        id: t.id,
        title: t.title,
        summary: t.description || '',
        sourceUrl: t.sourceUrl,
        publishedAt: t.publishedAt,
        closingDate: t.closingDate,
        category: t.category,
        type: 'tender' as const,
      }))).then(scored => {
        saveScores(scored.map(s => ({
          contentId: s.id,
          contentType: 'tender' as const,
          impactScore: s.scores.impactScore,
          urgencyScore: s.scores.urgencyScore,
          confidenceScore: s.scores.confidenceScore,
          reasoning: s.scores.reasoning,
          scoredAt: new Date().toISOString(),
        }))).catch(e => console.warn('[TenderScraper] Score save failed:', e));
      }).catch(e => console.warn('[TenderScraper] Score generation failed:', e));

      try { await saveLog('tenders', results.scraped, 'success'); } catch { /* saveLog failed, ignore */ }
    } catch (error: unknown) {
      results.errors = qualityTenders.length;
      console.error('[TenderScraper] Write error:', error);
      try { await saveLog('tenders', 0, 'error', (error instanceof Error ? error.message : String(error))); } catch { /* saveLog failed, ignore */ }
    }
  }

  const result = { ...results, tenders: qualityTenders.slice(0, 20) };
  setCached(cacheKey, result, 30 * 60 * 1000);
  return result;
}

export async function getLatestTenders(options: {
  limit?: number;
  sector?: string;
  region?: string;
  status?: Tender['status'];
} = {}): Promise<Tender[]> {
  const { limit: n = 50, sector, region, status } = options;

  const cacheKey = `tenders:list:${sector || 'all'}:${region || 'all'}:${status || 'all'}:${n}`;
  const cached = getCached<Tender[]>(cacheKey);
  if (cached) return cached;

  const records = await loadTenders({
    limit: 200,
    status,
    sector,
    region,
  });

  let tenders: Tender[] = records.map(safeTenderFromDb);

  // Merge entity-scraped tenders from Firestore
  try {
    const entitySnap = await adminDb.collection('scraped_items')
      .orderBy('publishedAt', 'desc')
      .limit(50)
      .get();

    const seenIds = new Set(tenders.map(t => t.id));
    for (const d of entitySnap.docs) {
      const data = d.data();
      const id = generateContentId(data.title + data.sourceUrl);
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      tenders.push({
        id,
        title: data.title || '',
        description: data.description || data.summary || '',
        organization: data.organization || data.source || '',
        sourceUrl: data.sourceUrl || '',
        sourceName: data.sourceName || data.source || 'Entity Scraper',
        publishedAt: data.publishedAt?.toDate?.() || new Date(data.publishedAt || Date.now()),
        closingDate: data.closingDate?.toDate?.() || (data.closingDate ? new Date(data.closingDate) : null),
        value: data.value || null,
        category: data.category || 'Tender',
        sector: data.sector || 'General Services',
        region: data.region || 'Zimbabwe',
        requirements: data.requirements || [],
        status: data.status || 'open',
        processedAt: data.processedAt?.toDate?.() || new Date(),
        scrapedAt: data.scrapedAt?.toDate?.() || new Date(),
      });
    }
  } catch (error: unknown) {
    console.warn(`[TenderScraper] Firestore merge failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }

  // Enrich any missing fields
  tenders = tenders.map(t => {
    if (!t.sector || t.sector === 'General') {
      return { ...t, sector: (t as Tender).sector || 'General Services' };
    }
    return t;
  });

  // Filter by sector/region/status
  if (sector) tenders = tenders.filter(t => t.sector === sector);
  if (region) tenders = tenders.filter(t => t.region === region);
  if (status) tenders = tenders.filter(t => t.status === status);

  // Sort by publishedAt desc, limit
  tenders.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  tenders = tenders.slice(0, n);

  setCached(cacheKey, tenders, 15 * 60 * 1000);
  return tenders;
}

export async function getTendersForUser(userId: string): Promise<Tender[]> {
  const cacheKey = `tenders:user:${userId}`;
  const cached = getCached<Tender[]>(cacheKey);
  if (cached) return cached;

  const records = await loadTenders({ limit: 100 });
  let tenders = records
    .map(safeTenderFromDb)
    .filter((t: Tender) => t.status !== 'closed');

  const scores = await loadScores(tenders.map((t: Tender) => t.id));
  for (const t of tenders) {
    const s = scores.get(t.id);
    if (s) { t.impactScore = s.impactScore; t.urgencyScore = s.urgencyScore; t.confidenceScore = s.confidenceScore; }
  }

  setCached(cacheKey, tenders, 10 * 60 * 1000);
  return tenders;
}

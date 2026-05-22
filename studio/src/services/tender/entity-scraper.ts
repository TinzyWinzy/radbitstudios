import { PROCURING_ENTITIES, type ProcuringEntity } from '@/data/procuring-entities';
import { withRateLimit } from '@/lib/scraper-cache';
import { adminDb } from '@/lib/firebase/firebase-admin';

export interface ScrapedTender {
  title: string;
  description: string;
  sourceEntityId: string;
  sourceEntityName: string;
  sourceUrl: string;
  deadline?: string;
  category?: string;
  region?: string;
  publishedAt: Date;
}

function extractLinks(html: string, baseUrl: string): { text: string; href: string }[] {
  const results: { text: string; href: string }[] = [];
  const regex = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1].startsWith('http') ? match[1] : `${baseUrl.replace(/\/$/, '')}/${match[1].replace(/^\//, '')}`;
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    if (text && href) results.push({ text, href });
  }
  return results;
}

async function scrapeEntityHtml(entity: ProcuringEntity): Promise<ScrapedTender[]> {
  if (!entity.tenderUrl) return [];

  try {
    const response = await fetch(entity.tenderUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RadbitSME/1.0)' },
    });

    if (!response.ok) return [];
    const html = await response.text();

    const tenders: ScrapedTender[] = [];
    const links = extractLinks(html, entity.tenderUrl);

    for (const link of links) {
      const hasKeyword = !entity.keywords || entity.keywords.some(k =>
        link.text.toLowerCase().includes(k.toLowerCase()),
      );
      if (hasKeyword) {
        tenders.push({
          title: link.text,
          description: '',
          sourceEntityId: entity.id,
          sourceEntityName: entity.name,
          sourceUrl: link.href,
          publishedAt: new Date(),
          region: entity.location || 'Zimbabwe',
        });
      }
    }

    return tenders;
  } catch {
    return [];
  }
}

async function scrapePrazFeed(entity: ProcuringEntity): Promise<ScrapedTender[]> {
  try {
    const response = await fetch('https://proc.gov.zw/api/tenders', {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return [];
    const data = await response.json();
    const tenders: ScrapedTender[] = [];
    const items = Array.isArray(data) ? data : data?.tenders || data?.data || [];
    const nameLower = entity.name.toLowerCase();
    const keywords = entity.keywords?.map(k => k.toLowerCase()) || [];

    for (const item of items) {
      const title = (item.title || item.description || '').toLowerCase();
      const desc = (item.description || item.details || '').toLowerCase();
      const matchesEntity = keywords.some(k => title.includes(k) || desc.includes(k));
      if (matchesEntity || title.includes(nameLower) || desc.includes(nameLower)) {
        tenders.push({
          title: item.title || item.description || 'Untitled Tender',
          description: item.description || item.details || '',
          sourceEntityId: entity.id,
          sourceEntityName: entity.name,
          sourceUrl: item.url || entity.tenderUrl || 'https://proc.gov.zw',
          deadline: item.deadline || item.closing_date,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
          region: entity.location || 'Zimbabwe',
        });
      }
    }
    return tenders;
  } catch {
    return [];
  }
}

async function scrapeSingleEntity(entity: ProcuringEntity): Promise<ScrapedTender[]> {
  return withRateLimit(
    `entity_scraper:${entity.id}`,
    'tender',
    async () => {
      switch (entity.scraperMethod) {
        case 'html':
          return scrapeEntityHtml(entity);
        case 'praz_feed':
          return scrapePrazFeed(entity);
        default:
          return [];
      }
    },
    [],
  );
}

export async function scrapeAllEntities(): Promise<ScrapedTender[]> {
  const allTenders: ScrapedTender[] = [];
  const activeEntities = PROCURING_ENTITIES.filter(e => e.active);

  const results = await Promise.allSettled(
    activeEntities.map(entity => scrapeSingleEntity(entity)),
  );

  for (let i = 0; i < activeEntities.length; i++) {
    if (results[i].status === 'fulfilled') {
      allTenders.push(...(results[i] as PromiseFulfilledResult<ScrapedTender[]>).value);
    }
  }

  return allTenders;
}

export async function storeEntityTenders(tenders: ScrapedTender[]): Promise<void> {
  const batch = adminDb.batch();
  const now = new Date();

  for (const tender of tenders) {
    const docId = `${tender.sourceEntityId}_${now.getTime()}_${Math.random().toString(36).slice(2, 6)}`;
    const ref = adminDb.collection('scraped_items').doc(docId);
    batch.set(ref, {
      ...tender,
      publishedAt: tender.publishedAt,
      fetchedAt: now,
    });
  }

  await batch.commit();
}

import { adminDb } from '@/lib/firebase/firebase-admin';
import { logger } from '@/lib/logger';
import { generateThreatAssessment, type ThreatAssessmentInput } from '@/ai/flows/generate-threat-assessment';

const log = logger.child({ module: 'RETIMonitor' });

const RETI_COLLECTION = 'threat_assessments';
const MONITOR_COLLECTION = 'reti_monitor_sources';

interface MonitorSource {
  id: string;
  name: string;
  feedUrl: string;
  category: ThreatAssessmentInput['triggerCategory'];
  lastChecked: Date | null;
  active: boolean;
  keywords: string[];
}

interface ThreatAssessmentDoc {
  holon: unknown;
  triggerEvent: string;
  triggerSource: string;
  triggerDate: string;
  riskLevel: string;
  generatedAt: Date;
  slug: string;
  published: boolean;
  viewCount: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80);
}

function extractRiskLevel(title: string, summary: string): ThreatAssessmentInput['triggerCategory'] {
  const text = `${title} ${summary}`.toLowerCase();
  if (text.includes('praz') || text.includes('egp') || text.includes('procurement')) return 'praz';
  if (text.includes('sadc') || text.includes('summit') || text.includes('cross-border')) return 'sadc';
  if (text.includes('ai strategy') || text.includes('computational sovereignty') || text.includes('pangolin')) return 'ai_strategy';
  if (text.includes('afcfta') || text.includes('continental trade')) return 'afcfta';
  if (text.includes('zimra') || text.includes('tax') || text.includes('vat')) return 'zimra';
  if (text.includes('rbz') || text.includes('reserve bank') || text.includes('forex')) return 'rbz';
  if (text.includes('nssa')) return 'nssa';
  return 'general';
}

export async function initializeMonitorSources(): Promise<MonitorSource[]> {
  const sources: Omit<MonitorSource, 'id'>[] = [
    {
      name: 'PRAZ Zimbabwe',
      feedUrl: 'https://www.praz.org.zw/feed/',
      category: 'praz',
      lastChecked: null,
      active: true,
      keywords: ['eGP', 'procurement', 'compliance', 'threshold', 'supplier', 'tender', 'PRAZ Act', 'procurement regulations', 'disqualification', 'electronic government procurement'],
    },
    {
      name: 'Zimbabwe AI Strategy',
      feedUrl: 'https://www.techzim.co.zw/tag/artificial-intelligence/feed/',
      category: 'ai_strategy',
      lastChecked: null,
      active: true,
      keywords: ['AI strategy', 'computational sovereignty', 'Project Pangolin', 'data localization', 'AI policy', 'artificial intelligence', 'digital sovereignty'],
    },
    {
      name: 'SADC Secretariat',
      feedUrl: 'https://www.sadc.int/latest-news/rss.xml',
      category: 'sadc',
      lastChecked: null,
      active: true,
      keywords: ['SADC', 'summit', 'digital transformation', 'cross-border', 'trade harmonization', 'AfCFTA', 'protocol'],
    },
    {
      name: 'ZIMRA Updates',
      feedUrl: 'https://www.zimra.co.zw/rss/',
      category: 'zimra',
      lastChecked: null,
      active: true,
      keywords: ['tax', 'VAT', 'PAYE', 'ITF263', 'filing', 'compliance', 'digital tax', 'e-filing'],
    },
    {
      name: 'Reserve Bank of Zimbabwe',
      feedUrl: 'https://www.rbz.co.zw/rss/',
      category: 'rbz',
      lastChecked: null,
      active: true,
      keywords: ['forex', 'currency', 'monetary policy', 'ZiG', 'RBZ', 'digital currency', 'repatriation'],
    },
    {
      name: 'AfCFTA Secretariat',
      feedUrl: 'https://www.tralac.org/rss/',
      category: 'afcfta',
      lastChecked: null,
      active: true,
      keywords: ['AfCFTA', 'rules of origin', 'tariff', 'continental trade', 'market access', 'trade protocol'],
    },
  ];

  const created: MonitorSource[] = [];
  for (const src of sources) {
    const existing = await adminDb.collection(MONITOR_COLLECTION)
      .where('name', '==', src.name)
      .limit(1)
      .get();

    if (existing.empty) {
      const docRef = await adminDb.collection(MONITOR_COLLECTION).add({
        ...src,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      created.push({ ...src, id: docRef.id });
    }
  }

  return created;
}

export async function getActiveSources(): Promise<MonitorSource[]> {
  const snap = await adminDb.collection(MONITOR_COLLECTION)
    .where('active', '==', true)
    .get();

  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MonitorSource));
}

export async function checkForThreatEvents(): Promise<number> {
  const sources = await getActiveSources();
  let assessmentsGenerated = 0;

  for (const source of sources) {
    try {
      const fetched = await fetchSourceContent(source);
      if (!fetched) continue;

      for (const item of fetched) {
        const matchScore = scoreKeywordMatch(item.title + ' ' + item.summary, source.keywords);
        if (matchScore < 2) continue;

        const exists = await adminDb.collection(RETI_COLLECTION)
          .where('triggerEvent', '==', item.title)
          .limit(1)
          .get();

        if (!exists.empty) continue;

        const category = extractRiskLevel(item.title, item.summary);
        const assessment = await generateThreatAssessment({
          triggerTitle: item.title,
          triggerSummary: item.summary.slice(0, 400),
          triggerSource: source.name,
          triggerDate: item.date || new Date().toISOString(),
          triggerCategory: category,
        });

        const slug = slugify(item.title);
        const doc: ThreatAssessmentDoc = {
          holon: assessment.holon,
          triggerEvent: item.title,
          triggerSource: source.name,
          triggerDate: item.date || new Date().toISOString(),
          riskLevel: assessment.holon.metadata.risk_level,
          generatedAt: new Date(),
          slug,
          published: true,
          viewCount: 0,
        };

        await adminDb.collection(RETI_COLLECTION).doc(slug).set(doc);
        assessmentsGenerated++;

        log.info(`RETI generated threat assessment: "${item.title}" (${assessment.holon.metadata.risk_level})`);
      }

      await adminDb.collection(MONITOR_COLLECTION).doc(source.id).update({
        lastChecked: new Date(),
      });
    } catch (err) {
      log.error({ err, source: source.name }, 'RETI monitor failed for source');
    }
  }

  return assessmentsGenerated;
}

function scoreKeywordMatch(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter(k => lower.includes(k.toLowerCase())).length;
}

interface FetchedItem {
  title: string;
  summary: string;
  date: string | null;
  url: string;
}

async function fetchSourceContent(source: MonitorSource): Promise<FetchedItem[] | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(source.feedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RadbitRETI/1.0 (Epistemic Trend Interceptor; +https://radbitstudios.co.zw)',
      },
    });
    clearTimeout(timer);

    if (!res.ok) return null;

    const xml = await res.text();
    const items: FetchedItem[] = [];

    const titleMatches = xml.matchAll(/<title[^>]*>([^<]+)<\/title>/gi);
    const linkMatches = xml.matchAll(/<link[^>]*>([^<]+)<\/link>/gi);
    const descMatches = xml.matchAll(/<description[^>]*><!\[CDATA\[([^\]]+)\]\]><\/description>|<description[^>]*>([^<]+)<\/description>/gi);
    const dateMatches = xml.matchAll(/<pubDate[^>]*>([^<]+)<\/pubDate>|<dc:date[^>]*>([^<]+)<\/dc:date>|<updated[^>]*>([^<]+)<\/updated>/gi);

    const titles: string[] = [];
    const links: string[] = [];
    const descriptions: string[] = [];
    const dates: (string | null)[] = [];

    for (const m of titleMatches) titles.push(m[1].trim());
    for (const m of linkMatches) links.push(m[1].trim());
    for (const m of descMatches) descriptions.push((m[1] || m[2] || '').trim());
    for (const m of dateMatches) dates.push((m[1] || m[2] || m[3] || null));

    for (let i = 0; i < titles.length; i++) {
      if (i === 0) continue;
      const title = titles[i];
      if (!title || title.length < 10 || title === titles[0]) continue;

      const summary = descriptions[i] || '';
      const cleanSummary = summary.replace(/<[^>]*>/g, '').slice(0, 500);

      items.push({
        title,
        summary: cleanSummary,
        date: dates[i] || dates[i - 1] || null,
        url: links[i] || '',
      });
    }

    return items.slice(0, 10);
  } catch {
    log.warn({ source: source.name }, 'Failed to fetch RETI source feed');
    return null;
  }
}

export async function getThreatAssessment(slug: string): Promise<ThreatAssessmentDoc | null> {
  try {
    const doc = await adminDb.collection(RETI_COLLECTION).doc(slug).get();
    if (!doc.exists) return null;

    const data = doc.data() as ThreatAssessmentDoc;
    await adminDb.collection(RETI_COLLECTION).doc(slug).update({
      viewCount: (data.viewCount || 0) + 1,
    });

    return data;
  } catch {
    return null;
  }
}

export async function listThreatAssessments(limit = 20): Promise<(ThreatAssessmentDoc & { id: string })[]> {
  const snap = await adminDb.collection(RETI_COLLECTION)
    .where('published', '==', true)
    .orderBy('generatedAt', 'desc')
    .limit(limit)
    .get();

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as ThreatAssessmentDoc & { id: string }));
}

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
  if (text.includes('ai strategy') || text.includes('computational sovereignty') || text.includes('pangolin') || text.includes('mugove fund') || text.includes('innovation crucible') || text.includes('nzwisiso')) return 'ai_strategy';
  if (text.includes('afcfta') || text.includes('continental trade')) return 'afcfta';
  if (text.includes('zimra') || text.includes('tax') || text.includes('vat')) return 'zimra';
  if (text.includes('rbz') || text.includes('reserve bank') || text.includes('forex')) return 'rbz';
  if (text.includes('nssa')) return 'nssa';
  if (text.includes('potraz') || text.includes('data protection') || text.includes('data controller') || text.includes('personal information') || text.includes('data breach') || text.includes('cyber and data')) return 'data_protection';
  if (text.includes('zesa') || text.includes('load shedding') || text.includes('power outage') || text.includes('energy regulation') || text.includes('grid stability')) return 'energy_grid';
  if (text.includes('mining') || text.includes('lithium') || text.includes('royalty') || text.includes('critical mineral') || text.includes('beneficiation') || text.includes('mine and minerals')) return 'mining';
  if (text.includes('digital services tax') || text.includes('streaming tax') || text.includes('e-commerce regulation') || text.includes('digital regulation')) return 'digital_regulation';
  if (text.includes('customs clearance') || text.includes('digital customs') || text.includes('certificate of origin') || text.includes('rules of origin')) return 'afcfta_customs';
  if (text.includes('industrialisation') || text.includes('industrialization') || text.includes('regional value chain') || text.includes('manufacturing')) return 'sadc_industry';
  if (text.includes('nds2') || text.includes('national development strategy') || text.includes('vision 2030') || text.includes('education 5.0') || text.includes('upper middle income') || text.includes('innovation hub') || text.includes('industrial park') || text.includes('special economic zone') || text.includes('devolution') || text.includes('rural industrialization')) return 'nds2';
  if (text.includes('constitution') || text.includes('constitutional court') || text.includes('declaration of rights') || text.includes('fundamental rights') || text.includes('chapter 2') || text.includes('chapter 4') || text.includes('rule of law') || text.includes('human rights commission') || text.includes('anti-corruption') || text.includes('ZEC') || text.includes('independent commission')) return 'constitutional';
  if (text.includes('fiscal device') || text.includes('fiscalisation') || text.includes('FDG') || text.includes('fiscal day') || text.includes('zimra receipt') || text.includes('e-invoicing') || text.includes('tax clearance') || text.includes('digital tax') || text.includes('presumptive tax')) return 'zimra_fiscal';
  if ((text.includes('zig') || text.includes('zimbabwe gold') || text.includes('exchange rate') || text.includes('currency')) && (text.includes('rbz') || text.includes('reserve bank') || text.includes('monetary policy') || text.includes('forex'))) return 'rbz_currency';
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
    {
      name: 'POTRAZ Data Protection',
      feedUrl: 'https://www.potraz.gov.zw/feed/',
      category: 'data_protection',
      lastChecked: null,
      active: true,
      keywords: ['data protection', 'POTRAZ', 'data controller', 'license', 'DPO', 'data breach', 'personal information', 'privacy', 'Cyber and Data Protection Act', 'mandatory'],
    },
    {
      name: 'ZESA / Energy Regulation',
      feedUrl: 'https://www.zesa.co.zw/feed/',
      category: 'energy_grid',
      lastChecked: null,
      active: true,
      keywords: ['load shedding', 'power outage', 'ZESA', 'tariff', 'grid stability', 'energy regulation', 'electricity', 'generation', 'ZETDC'],
    },
    {
      name: 'Chamber of Mines Zimbabwe',
      feedUrl: 'https://www.chamines.co.zw/feed/',
      category: 'mining',
      lastChecked: null,
      active: true,
      keywords: ['mining', 'lithium', 'royalty', 'critical mineral', 'beneficiation', 'Mine and Minerals Act', 'exploration', 'mineral', 'mine'],
    },
    {
      name: 'Zimbabwe Digital Regulation',
      feedUrl: 'https://www.techzim.co.zw/feed/',
      category: 'digital_regulation',
      lastChecked: null,
      active: true,
      keywords: ['digital tax', 'streaming tax', 'e-commerce', 'regulation', 'digital services tax', 'social media tax', 'platform'],
    },
    {
      name: 'AfCFTA Digital Customs',
      feedUrl: 'https://www.tralac.org/rss/',
      category: 'afcfta_customs',
      lastChecked: null,
      active: true,
      keywords: ['digital customs', 'certificate of origin', 'customs clearance', 'rules of origin', 'trade platform', 'border digitization', 'cross-border'],
    },
    {
      name: 'SADC Industrialisation',
      feedUrl: 'https://www.sadc.int/latest-news/rss.xml',
      category: 'sadc_industry',
      lastChecked: null,
      active: true,
      keywords: ['industrialisation', 'industrialization', 'regional value chain', 'manufacturing', 'economic integration', 'industrial development', 'value addition'],
    },
    {
      name: 'NDS2 Implementation Monitor',
      feedUrl: 'https://www.theopc.gov.zw/feed/',
      category: 'nds2',
      lastChecked: null,
      active: true,
      keywords: ['NDS2', 'National Development Strategy', 'Vision 2030', 'upper middle income', 'SME development', 'MSME', 'devolution', 'digital economy', 'Education 5.0', 'innovation hub', 'industrial park', 'value chain', 'beneficiation', 'special economic zone', 'youth employment', 'diaspora engagement', 'public procurement', 'e-government', 'productive economy', 'inclusive growth', 'rural industrialization'],
    },
    {
      name: 'Constitution of Zimbabwe Compliance',
      feedUrl: 'https://www.veritaszim.net/rss/',
      category: 'constitutional',
      lastChecked: null,
      active: true,
      keywords: ['Constitution', 'constitutional', 'Declaration of Rights', 'fundamental rights', 'human rights', 'Constitutional Court', 'Supreme Court', 'rule of law', 'Chapter 2', 'national objectives', 'Chapter 4', 'Chapter 17', 'procurement', 'Parliament', 'legislative', 'amendment', 'Public Service', 'independent commission', 'Zimbabwe Human Rights Commission', 'Anti-Corruption Commission', 'Zimbabwe Electoral Commission', 'devolution', 'Chapter 14', 'local government', 'provincial council'],
    },
    {
      name: 'ZIMRA Fiscal Device & ZiG Updates',
      feedUrl: 'https://www.zimra.co.zw/rss/',
      category: 'zimra_fiscal',
      lastChecked: null,
      active: true,
      keywords: ['fiscal device', 'fiscalisation', 'FDG', 'Fiscal Device Gateway', 'ZIMRA receipt', 'fiscal day', 'invoice submission', 'tax receipt', 'e-invoicing', 'ZiG', 'Zimbabwe Gold', 'currency transition', 'PAYE tax table', 'ZWL to ZiG', 'tax conversion', 'ZIMRA Notice', 'Public Notice', 'ITF263', 'ITF263A', 'VAT filing', 'digital tax', 'e-filing', 'tax table', 'withholding tax', 'presumptive tax', 'fiscal compliance', 'tax clearance'],
    },
    {
      name: 'RBZ Currency & Monetary Policy',
      feedUrl: 'https://www.rbz.co.zw/rss/',
      category: 'rbz_currency',
      lastChecked: null,
      active: true,
      keywords: ['ZiG', 'Zimbabwe Gold', 'exchange rate', 'monetary policy', 'currency reform', 'RBZ directive', 'forex', 'foreign currency', 'reserve bank', 'interest rate', 'inflation', 'money supply', 'digital currency', 'mobile money', 'RTGS', 'bond note', 'ZWL', 'ZiG rate', 'gold-backed', 'repatriation', 'export proceeds', 'surrender requirement', 'banking', 'microfinance', 'lending rate', 'deposit rate', 'Treasury bill', 'open market operation', 'statutory reserve'],
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

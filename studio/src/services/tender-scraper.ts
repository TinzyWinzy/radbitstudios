import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { getCached, setCached, checkRateLimit } from '@/lib/scraper-cache';
import { upsertTenders, getTenders, tenderFromDb, logSync } from '@/lib/sqlite';

export interface Tender {
  id: string;
  title: string;
  description: string;
  organization: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
  closingDate: Date | null;
  value: string | null;
  category: string;
  sector: string;
  region: string;
  requirements: string[];
  status: 'open' | 'closing_soon' | 'closed' | 'awarded';
  processedAt: Date;
  scrapedAt: Date;
}

const SECTOR_KEYWORDS: Record<string, string[]> = {
  'Construction & Engineering': ['construction', 'building', 'civil', 'infrastructure', 'road', 'bridge', 'electrical', 'mechanical', 'architect', 'works'],
  'Information Technology': ['IT', 'software', 'hardware', 'network', 'cyber', 'data', 'cloud', 'digital', 'computer', 'system', 'ICT'],
  'Agriculture & Agribusiness': ['agriculture', 'farming', 'crop', 'livestock', 'agro', 'food', 'seed', 'fertilizer', 'irrigation'],
  'Healthcare': ['medical', 'health', 'pharmaceutical', 'hospital', 'equipment', 'medicine', 'clinical'],
  'Professional Services': ['consulting', 'legal', 'audit', 'accounting', 'management', 'research', 'survey'],
  'Energy & Utilities': ['energy', 'power', 'solar', 'generator', 'electricity', 'water', 'renewable', 'battery'],
  'Transportation & Logistics': ['transport', 'logistics', 'freight', 'vehicle', 'shipping', 'courier', 'fuel'],
  'Telecommunications': ['telecom', 'fiber', 'communication', 'broadband', 'antenna', 'satellite'],
  'Education & Training': ['education', 'training', 'school', 'university', 'curriculum', 'books', 'stationery'],
  'Manufacturing': ['manufacturing', 'production', 'factory', 'assembly', 'textile', 'processing'],
  'Retail & Wholesale': ['retail', 'wholesale', 'supplies', 'procurement', 'inventory', 'distribution'],
  'Financial Services': ['banking', 'insurance', 'finance', 'investment', 'credit', 'leasing'],
};

const MOCK_TENDERS: Omit<Tender, 'id' | 'sourceName' | 'publishedAt' | 'status' | 'processedAt' | 'scrapedAt' | 'region'>[] = [
  {
    title: 'Supply and Delivery of Agricultural Inputs - Mbire District',
    description: 'Ministry of Agriculture inviting bids for seeds, fertilizers, and farming equipment to smallholder farmers in Mbire District. Registered suppliers with valid tax clearance eligible.',
    organization: 'Ministry of Agriculture',
    sourceUrl: 'https://proc.gov.zw/tender/AGR-2026-001',
    closingDate: new Date('2026-06-15'),
    value: '$45,000 USD',
    sector: 'Agriculture & Agribusiness',
    category: 'Supplies',
    requirements: ['Valid tax clearance', 'Business registration', 'NRA compliance'],
  },
  {
    title: 'ICT Equipment and Services for Rural Schools - Phase 2',
    description: 'Ministry of Education seeks providers for computers, projectors, and internet for 50 rural secondary schools in Manicaland and Masvingo. IT SMEs encouraged to apply.',
    organization: 'Ministry of Education',
    sourceUrl: 'https://proc.gov.zw/tender/EDU-2026-042',
    closingDate: new Date('2026-06-28'),
    value: '$180,000 USD',
    sector: 'Information Technology',
    category: 'Services',
    requirements: ['Tax clearance', 'IT industry registration', 'Reference projects'],
  },
  {
    title: 'Civil Works - Rural Road Maintenance (Mashonaland Central)',
    description: 'RIDA invites contractors for routine maintenance of 120km rural roads in Muzarabani and Centenary districts. Road construction experience required.',
    organization: 'RIDA',
    sourceUrl: 'https://proc.gov.zw/tender/INF-2026-018',
    closingDate: new Date('2026-06-30'),
    value: '$220,000 USD',
    sector: 'Construction & Engineering',
    category: 'Works',
    requirements: ['Road construction experience', 'Equipment fleet', 'Tax clearance'],
  },
  {
    title: 'Consultancy Services - SME Market Research Study',
    description: 'Ministry of SMEs requires consultancy for comprehensive market study on informal sector participation in formal economy. Research firm with Zimbabwe experience preferred.',
    organization: 'Ministry of SMEs',
    sourceUrl: 'https://proc.gov.zw/tender/SME-2026-003',
    closingDate: new Date('2026-07-05'),
    value: '$35,000 USD',
    sector: 'Professional Services',
    category: 'Consultancy',
    requirements: ['Research experience', 'SME sector knowledge', 'Tax clearance'],
  },
  {
    title: 'Solar Installation for Health Facilities - Matabeleland North',
    description: 'Ministry of Health seeks contractors for solar PV systems (5kW each) at 30 rural clinics in Binga and Nkayi. Valid electrical contractor license required.',
    organization: 'Ministry of Health',
    sourceUrl: 'https://proc.gov.zw/tender/HEALTH-2026-011',
    closingDate: new Date('2026-07-12'),
    value: '$150,000 USD',
    sector: 'Energy & Utilities',
    category: 'Works',
    requirements: ['Electrical license', 'Solar installation experience', 'Safety certification'],
  },
  {
    title: 'Supply of Safety Equipment for Mining Cooperatives',
    description: 'ZMDF requires suppliers for helmets, reflective vests, boots, and first aid kits for artisanal mining cooperatives in Gwanda. NRA compliance preferred.',
    organization: 'ZMDF',
    sourceUrl: 'https://proc.gov.zw/tender/MIN-2026-007',
    closingDate: new Date('2026-07-08'),
    value: '$28,000 USD',
    sector: 'Manufacturing',
    category: 'Supplies',
    requirements: ['Safety equipment supply experience', 'Business registration', 'NRA compliance'],
  },
  {
    title: 'Supply of Laboratory Equipment - Bulawayo Provincial Hospital',
    description: 'Ministry of Health requires centrifuges, microscopes, and blood analyzers for Bulawayo Provincial Hospital laboratory upgrade. Valid medical equipment certification required.',
    organization: 'Ministry of Health',
    sourceUrl: 'https://proc.gov.zw/tender/HEALTH-2026-015',
    closingDate: new Date('2026-07-18'),
    value: '$95,000 USD',
    sector: 'Healthcare',
    category: 'Supplies',
    requirements: ['Medical equipment certification', 'DEA registration', 'Tax clearance'],
  },
  {
    title: 'Consultancy for Water and Sanitation Assessment',
    description: 'UNDP Zimbabwe requires consultancy to assess water and sanitation needs in 15 rural growth centres across Mashonaland West. Water engineering experience required.',
    organization: 'UNDP Zimbabwe',
    sourceUrl: 'https://proc.gov.zw/tender/ENV-2026-009',
    closingDate: new Date('2026-07-20'),
    value: '$55,000 USD',
    sector: 'Professional Services',
    category: 'Consultancy',
    requirements: ['Water engineering expertise', 'Rural development experience', 'Tax clearance'],
  },
  {
    title: 'Supply of Fertilizer and Seeds - Gokwe South District',
    description: 'Department of Agricultural Technical and Extension Services (Agritex) requires suppliers for compound fertilizers (10:23:21) and maize seed for 5,000 smallholder farmers.',
    organization: 'Agritex',
    sourceUrl: 'https://proc.gov.zw/tender/AGR-2026-022',
    closingDate: new Date('2026-07-10'),
    value: '$62,000 USD',
    sector: 'Agriculture & Agribusiness',
    category: 'Supplies',
    requirements: ['Agricultural inputs supplier registration', 'Quality certification', 'Tax clearance'],
  },
  {
    title: 'Construction of Market Stalls - Chinhoyi Municipal Market',
    description: 'Chinhoyi Municipality invites bids for construction of 40 permanent market stalls with ablution facilities at Chinhoyi Town CBD. Registered contractor required.',
    organization: 'Chinhoyi Municipality',
    sourceUrl: 'https://proc.gov.zw/tender/LOC-2026-003',
    closingDate: new Date('2026-07-25'),
    value: '$85,000 USD',
    sector: 'Construction & Engineering',
    category: 'Works',
    requirements: ['Registered builder', 'Infrastructure construction experience', 'Tax clearance'],
  },
  {
    title: 'Legal Advisory Services for SME Dispute Resolution',
    description: 'Ministry of Justice requires legal firm to provide advisory services for 20 SME contract disputes per quarter. Licensed legal practitioner required.',
    organization: 'Ministry of Justice',
    sourceUrl: 'https://proc.gov.zw/tender/JUS-2026-001',
    closingDate: new Date('2026-08-01'),
    value: '$40,000 USD',
    sector: 'Professional Services',
    category: 'Consultancy',
    requirements: ['Legal practitioner license', 'SME sector experience', 'Tax clearance'],
  },
  {
    title: 'Insurance Brokerage Services for Government Vehicles Fleet',
    description: 'Ministry of Finance requires insurance brokerage for fleet of 200 government vehicles across 6 provinces. Licensed insurance broker with ZIMBRA registration preferred.',
    organization: 'Ministry of Finance',
    sourceUrl: 'https://proc.gov.zw/tender/FIN-2026-005',
    closingDate: new Date('2026-08-10'),
    value: '$30,000 USD',
    sector: 'Financial Services',
    category: 'Services',
    requirements: ['Insurance broker license', 'Fleet experience', 'Tax clearance'],
  },
];

function generateId(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 32);
}

function classifySector(text: string): string {
  const lower = text.toLowerCase();
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return sector;
  }
  return 'General Services';
}

function determineStatus(closingDate: Date | null): Tender['status'] {
  if (!closingDate) return 'open';
  const daysLeft = Math.ceil((closingDate.getTime() - Date.now()) / 86400000);
  if (daysLeft < 0) return 'closed';
  if (daysLeft <= 7) return 'closing_soon';
  return 'open';
}

function enrichTender(raw: Omit<Tender, 'id' | 'sourceName' | 'publishedAt' | 'status' | 'processedAt' | 'scrapedAt'> & { region?: string; sourceName?: string }): Tender {
  const sector = raw.sector || classifySector(raw.title + ' ' + raw.description);
  return {
    ...raw,
    region: raw.region || 'Zimbabwe',
    id: generateId(raw.title + raw.sourceUrl + (raw.closingDate ? raw.closingDate.toISOString() : '')),
    sourceName: raw.sourceName || 'Government Tenders Portal',
    publishedAt: new Date(),
    sector,
    status: determineStatus(raw.closingDate),
    processedAt: new Date(),
    scrapedAt: new Date(),
  };
}

async function tryLiveTenders(): Promise<Tender[]> {
  const { allowed } = checkRateLimit('tender:live', 'tender');
  if (!allowed) return [];

  try {
    const response = await axios.get('https://proc.gov.zw/api/tenders', {
      timeout: 5000,
      headers: { 'User-Agent': 'RadbitSMEHub/1.0', 'Accept': 'application/json' },
    });

    const data = response.data as any;
    const items: any[] = Array.isArray(data) ? data : data?.tenders || data?.items || [];

    return items.slice(0, 20).map((item: any) => enrichTender({
      title: item.title || item.name || item.subject || '',
      description: item.description || item.summary || '',
      organization: item.organization || item.procuringEntity || 'Government of Zimbabwe',
      sourceUrl: item.url || item.link || item.id || '',
      closingDate: (item.closingDate || item.deadline) ? new Date(item.closingDate || item.deadline) : null,
      value: item.estimatedValue || null,
      sector: item.sector || '',
      category: item.category || '',
      requirements: item.requirements || [],
      region: 'Zimbabwe',
    }));
  } catch {
    return [];
  }
}

async function scrapeTendersOnTime(): Promise<Tender[]> {
  const results: Tender[] = [];

  try {
    const r = await axios.get('https://www.tendersontime.com/advance-search/', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    const html = typeof r.data === 'string' ? r.data : JSON.stringify(r.data);
    const $ = cheerio.load(html);

    const seen = new Set<string>();

    $('table tbody tr, table tr').each((_, row) => {
      const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get();
      const link = $(row).find('a[href]').first();
      const linkText = link.text().trim().replace(/\s+/g, ' ');
      const linkHref = link.attr('href') || '';

      if (cells.length < 2 || !linkHref || linkHref === '#' || linkHref === '/') return;

      const title = linkText || cells[0];
      const cleanHref = linkHref.startsWith('http') ? linkHref : `https://www.tendersontime.com${linkHref}`;
      const key = cleanHref.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      let closingDate: Date | null = null;
      for (const cell of cells) {
        const match = cell.match(/(?:close|deadline|due)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
        if (match) {
          try { closingDate = new Date(match[1]); } catch { /* ignore */ }
          break;
        }
      }

      if (title && title.length > 3) {
        results.push(enrichTender({
          title,
          description: cells.join(' | '),
          organization: 'TendersOnTime',
          sourceUrl: cleanHref,
          closingDate,
          value: null,
          sector: classifySector(title),
          category: 'Tender Notice',
          requirements: [],
          region: 'Zimbabwe',
        }));
      }
    });

    if (results.length > 0) {
      console.log(`[TenderScraper] TendersOnTime: scraped ${results.length} tenders`);
    }
  } catch (e: any) {
    console.warn(`[TenderScraper] TendersOnTime failed: ${e.message.slice(0, 100)}`);
  }

  return results;
}

async function scrapeTendersInfo(): Promise<Tender[]> {
  const results: Tender[] = [];

  try {
    const r = await axios.get('https://www.tendersinfo.com/global-zimbabwe-tenders.php', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    const html = typeof r.data === 'string' ? r.data : JSON.stringify(r.data);
    const $ = cheerio.load(html);

    const seen = new Set<string>();

    $('table tbody tr, table tr').each((_, row) => {
      const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get();
      const link = $(row).find('a[href]').first();
      const linkHref = link.attr('href') || '';
      const linkText = link.text().trim();

      if (cells.length < 3) return;

      const title = linkText || cells.find((c, i) => i > 0 && c.length > 10) || cells[0];
      const cleanHref = linkHref.startsWith('http') ? linkHref : `https://www.tendersinfo.com${linkHref}`;
      const key = (cleanHref + title).toLowerCase();
      if (seen.has(key)) return;
      if (cleanHref.includes('/login') || cleanHref === '#' || cleanHref === 'https://www.tendersinfo.com/') return;
      seen.add(key);

      if (title && title.length > 5) {
        results.push(enrichTender({
          title,
          description: cells.join(' | '),
          organization: 'TendersInfo',
          sourceUrl: cleanHref,
          closingDate: null,
          value: null,
          sector: classifySector(title),
          category: 'Tender Notice',
          requirements: [],
          region: 'Zimbabwe',
        }));
      }
    });

    if (results.length > 0) {
      console.log(`[TenderScraper] TendersInfo: scraped ${results.length} tenders`);
    }
  } catch (e: any) {
    console.warn(`[TenderScraper] TendersInfo failed: ${e.message.slice(0, 100)}`);
  }

  return results;
}

async function scrapePRAZ(): Promise<Tender[]> {
  const results: Tender[] = [];

  try {
    const r = await axios.get('https://www.praz.org.zw/tendering/', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    const links = $('a[href]').filter((_, el) => {
      const href = $(el).attr('href') || '';
      return Boolean(href.match(/tender|rfq|bid|procurement|notice/i) && !href.match(/login|register|signin/i));
    }).map((_, el) => ({ text: $(el).text().trim(), href: $(el).attr('href') ?? '' })).get();

    for (const link of links.slice(0, 10)) {
      const fullHref = link.href.startsWith('http') ? link.href : `https://www.praz.org.zw${link.href}`;
      if (link.text && link.text.length > 3) {
        results.push(enrichTender({
          title: link.text,
          description: `PRAZ Tendering: ${link.text}`,
          organization: 'PRAZ',
          sourceUrl: fullHref,
          closingDate: null,
          value: null,
          sector: classifySector(link.text),
          category: 'Public Procurement',
          requirements: [],
          region: 'Zimbabwe',
        }));
      }
    }

    console.log(`[TenderScraper] PRAZ: scraped ${results.length} tender links`);
  } catch (e: any) {
    console.warn(`[TenderScraper] PRAZ failed: ${e.message.slice(0, 100)}`);
  }

  return results;
}

async function scrapeIDBZ(): Promise<Tender[]> {
  const results: Tender[] = [];

  try {
    const r = await axios.get('https://www.idbz.co.zw/about-us/procurement', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    const seen = new Set<string>();

    $('table tbody tr, table tr').each((_, row) => {
      const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get();
      const linkEl = $(row).find('a[href]').first();
      const linkHref = linkEl.attr('href') || '';
      const linkText = linkEl.text().trim();

      if (cells.length < 1) return;

      const title = linkText || cells[0];
      if (!title || title.length < 3) return;

      const fullHref = linkHref.startsWith('http') ? linkHref : `https://www.idbz.co.zw${linkHref}`;
      const key = fullHref.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      results.push(enrichTender({
        title,
        description: `IDBZ Procurement: ${cells.join(' - ')}`,
        organization: 'IDBZ',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: 'Financial Services',
        category: 'Procurement Notice',
        requirements: [],
        region: 'Zimbabwe',
      }));
    });

    if (results.length > 0) {
      console.log(`[TenderScraper] IDBZ: scraped ${results.length} procurement items`);
    }
  } catch (e: any) {
    console.warn(`[TenderScraper] IDBZ failed: ${e.message.slice(0, 100)}`);
  }

  return results;
}

async function scrapeUNDP(): Promise<Tender[]> {
  const results: Tender[] = [];

  try {
    const r = await axios.get('https://www.undp.org/zimbabwe/procurement', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    const categories = $('h3, h4').filter((_, el) => {
      const text = $(el).text().toLowerCase();
      return text.includes('request for') || text.includes('invitation');
    }).map((_, el) => $(el).text().trim()).get();

    const procurementLinks = $('a[href]').filter((_, el) => {
      const href = $(el).attr('href') || '';
      return Boolean(href.match(/rfq|itb|rfp|procurement|tender/i) && !href.match(/login|register/i));
    }).map((_, el) => ({ text: $(el).text().trim(), href: $(el).attr('href') ?? '' })).get();

    for (const cat of categories.slice(0, 5)) {
      results.push(enrichTender({
        title: cat,
        description: `UNDP Zimbabwe procurement category: ${cat}. Categories available: ${categories.join(', ')}`,
        organization: 'UNDP Zimbabwe',
        sourceUrl: 'https://www.undp.org/zimbabwe/procurement',
        closingDate: null,
        value: null,
        sector: 'Professional Services',
        category: 'UN Procurement',
        requirements: ['UN Supplier registration required', 'Anti-fraud policy compliance'],
        region: 'Zimbabwe',
      }));
    }

    for (const link of procurementLinks.slice(0, 5)) {
      const fullHref = link.href.startsWith('http') ? link.href : `https://www.undp.org${link.href}`;
      const title = link.text || 'UNDP Procurement Link';
      results.push(enrichTender({
        title,
        description: `UNDP procurement: ${link.text}`,
        organization: 'UNDP Zimbabwe',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: classifySector(link.text),
        category: 'UN Procurement',
        requirements: [],
        region: 'Zimbabwe',
      }));
    }

    console.log(`[TenderScraper] UNDP: scraped ${results.length} procurement entries`);
  } catch (e: any) {
    console.warn(`[TenderScraper] UNDP failed: ${e.message.slice(0, 100)}`);
  }

  return results;
}

async function scrapeZIMRA(): Promise<Tender[]> {
  const results: Tender[] = [];
  const seen = new Set<string>();

  try {
    for (const path of ['/tenders', '/tenders/category/30-tenders', '/tenders/category/49-rfqs']) {
      try {
        const r = await axios.get(`https://www.zimra.co.zw${path}`, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        });
        const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

        $('table tbody tr, table tr').each((_, row) => {
          const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get().filter(Boolean);
          const linkEl = $(row).find('a[href]').first();
          const linkText = linkEl.text().trim();
          const linkHref = linkEl.attr('href') || '';

          if (!linkHref || linkHref === '#' || linkHref === '/') return;

          const title = linkText || cells[0];
          if (!title || title.length < 3) return;

          const fullHref = linkHref.startsWith('http') ? linkHref : `https://www.zimra.co.zw${linkHref}`;
          const key = fullHref.toLowerCase();
          if (seen.has(key)) return;
          seen.add(key);

          results.push(enrichTender({
            title,
            description: `ZIMRA Procurement: ${cells.join(' - ')}`,
            organization: 'ZIMRA',
            sourceUrl: fullHref,
            closingDate: null,
            value: null,
            sector: 'Professional Services',
            category: path.includes('rfq') ? 'RFQ' : 'Tender',
            requirements: [],
            region: 'Zimbabwe',
          }));
        });
      } catch { /* skip failed page */ }
    }

    console.log(`[TenderScraper] ZIMRA: ${results.length} tender entries`);
  } catch (e: any) {
    console.warn(`[TenderScraper] ZIMRA failed: ${e.message.slice(0, 100)}`);
  }

  return results;
}

async function scrapeStanbicBank(): Promise<Tender[]> {
  const results: Tender[] = [];

  try {
    const r = await axios.get('https://www.stanbicbank.co.zw/', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    const tenderLinks = $('a[href]').filter((_, el) => {
      const href = $(el).attr('href') || '';
      return Boolean(href.match(/tender|procurement|vacancy|opportunity/i));
    }).map((_, el) => ({ text: $(el).text().trim(), href: $(el).attr('href') ?? '' })).get();

    for (const link of tenderLinks.slice(0, 10)) {
      const fullHref = link.href.startsWith('http') ? link.href : `https://www.stanbicbank.co.zw${link.href}`;
      if (link.text && link.text.length > 3 && link.href !== '#') {
        results.push(enrichTender({
          title: link.text,
          description: `Stanbic Bank procurement: ${link.text}`,
          organization: 'Stanbic Bank Zimbabwe',
          sourceUrl: fullHref,
          closingDate: null,
          value: null,
          sector: 'Financial Services',
          category: 'Banking Procurement',
          requirements: [],
          region: 'Zimbabwe',
        }));
      }
    }

    console.log(`[TenderScraper] Stanbic Bank: ${results.length} tender links`);
  } catch (e: any) {
    console.warn(`[TenderScraper] Stanbic Bank failed: ${e.message.slice(0, 100)}`);
  }

  return results;
}

export async function scrapeAllTenders(): Promise<{ scraped: number; errors: number }> {
  const cacheKey = 'tenders:scrape:all_run';
  const cached = getCached<{ scraped: number; errors: number }>(cacheKey);
  if (cached) return cached;

  const results = { scraped: 0, errors: 0 };
  const allTenders: Tender[] = [];

  const live = await tryLiveTenders();
  if (live.length > 0) {
    allTenders.push(...live);
    console.log(`[TenderScraper] proc.gov.zw: ${live.length} tenders`);
  }

const [tot, ti, praz, idbz, undp, zimra, stanbic] = await Promise.allSettled([
    scrapeTendersOnTime(),
    scrapeTendersInfo(),
    scrapePRAZ(),
    scrapeIDBZ(),
    scrapeUNDP(),
    scrapeZIMRA(),
    scrapeStanbicBank(),
  ]);

  if (tot.status === 'fulfilled') allTenders.push(...tot.value);
  if (ti.status === 'fulfilled') allTenders.push(...ti.value);
  if (praz.status === 'fulfilled') allTenders.push(...praz.value);
  if (idbz.status === 'fulfilled') allTenders.push(...idbz.value);
  if (undp.status === 'fulfilled') allTenders.push(...undp.value);
  if (zimra.status === 'fulfilled') allTenders.push(...zimra.value);
  if (stanbic.status === 'fulfilled') allTenders.push(...stanbic.value);

  if (allTenders.length === 0) {
    console.log('[TenderScraper] All sources failed — falling back to mock data');
    allTenders.push(...MOCK_TENDERS.map(raw => enrichTender({ ...raw, region: 'Zimbabwe' })));
  } else {
    console.log(`[TenderScraper] Total scraped from all sources: ${allTenders.length}`);
  }

  const uniqueTenders = Array.from(
    new Map(allTenders.map(t => [t.id, t])).values()
  );

  if (uniqueTenders.length > 0) {
    try {
      upsertTenders(uniqueTenders);
      results.scraped = uniqueTenders.length;
      results.errors = 0;
      console.log(`[TenderScraper] Saved ${results.scraped} tenders to SQLite`);
      logSync('tenders', results.scraped, 'success');
    } catch (err: any) {
      results.errors = uniqueTenders.length;
      console.error('[TenderScraper] SQLite write error:', err);
      logSync('tenders', 0, 'error', err.message);
    }
  }

  setCached(cacheKey, results, 30 * 60 * 1000);
  return results;
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

  const records = getTenders({
    limit: 200,
    status,
    sector,
    region,
  });

  let tenders: Tender[] = records.map(tenderFromDb);

  const result = tenders.slice(0, n);
  setCached(cacheKey, result, 5 * 60 * 1000);
  return result;
}

export async function getTendersForUser(userId: string): Promise<Tender[]> {
  const cacheKey = `tenders:user:${userId}`;
  const cached = getCached<Tender[]>(cacheKey);
  if (cached) return cached;

  const records = getTenders({ limit: 100 });
  let tenders = records
    .map(tenderFromDb)
    .filter((t: Tender) => t.status !== 'closed');

  setCached(cacheKey, tenders, 10 * 60 * 1000);
  return tenders;
}
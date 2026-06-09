import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { getCached, setCached, checkRateLimit } from '@/lib/scraper-cache';
import { saveTenders, loadTenders, safeTenderFromDb, saveLog } from '@/lib/scraper-storage';
import { scoreBatch } from '@/services/scoring/content-scorer';
import { saveScores, loadScores } from '@/services/scoring/scored-items-store';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { scrapeAllEntities, storeEntityTenders } from '@/services/tender/entity-scraper';

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
  impactScore?: number;
  urgencyScore?: number;
  confidenceScore?: number;
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
  'Retail & Wholesale': ['retail', 'wholesale', 'inventory', 'distribution', 'supermarket', 'grocery', 'shop', 'store', 'merchandise'],
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

const NON_TENDER_PATTERNS = [
  'download', 'policy', 'manual', 'guideline', 'procedure', 'handbook',
  'standard bidding', 'procurement policy', 'procurement manual',
  'code of conduct', 'terms of reference', 'appn', 'annual report',
  'newsletter', 'brochure', 'catalogue', 'price list',
];

const NAVIGATION_PATTERNS = [
  'home', 'contact us', 'about us', 'our services', 'sitemap',
  'login', 'register', 'sign in', 'sign up', 'subscribe',
  'procurement', 'tendering', 'tenders', 'rfq', 'rfi', 'eoi',
  'procurement notice', 'current tenders', 'open tenders',
];

function isQualityTender(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  if (title.length < 8) return false;
  if (NON_TENDER_PATTERNS.some(p => text.startsWith(p) || text.includes(` ${p} `))) return false;
  if (NAVIGATION_PATTERNS.some(p => {
    const lower = title.toLowerCase().trim();
    return lower === p || lower.endsWith(` ${p}`) || lower === p.replace(/ /g, ' ');
  })) return false;
  if (title.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i)) return false;
  const mayBeTender = text.match(/(?:tender|bid|rfq|rfi|eoi|invitation|supply|delivery|construction|consultancy|procurement of)/i);
  if (!mayBeTender) return false;
  if (description.length < 10 && title.match(/^(download|view|read|open)/i)) return false;
  return true;
}

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

function enrichTender(raw: Omit<Tender, 'id' | 'sourceName' | 'publishedAt' | 'status' | 'processedAt' | 'scrapedAt'> & { region?: string; sourceName?: string; publishedAt?: Date }): Tender {
  const sector = raw.sector || classifySector(raw.title + ' ' + raw.description);
  return {
    ...raw,
    region: raw.region || 'Zimbabwe',
    id: generateId(raw.title + raw.sourceUrl + (raw.closingDate ? raw.closingDate.toISOString() : '')),
    sourceName: raw.sourceName || 'Government Tenders Portal',
    publishedAt: raw.publishedAt || new Date(),
    sector,
    status: determineStatus(raw.closingDate),
    processedAt: new Date(),
    scrapedAt: new Date(),
  };
}

async function tryLiveTenders(): Promise<Tender[]> {
  const { allowed } = await checkRateLimit('tender:live', 'tender');
  if (!allowed) return [];

  try {
    const response = await axios.get('https://proc.gov.zw/api/tenders', {
      timeout: 5000,
      headers: { 'User-Agent': 'RadbitStudios/1.0', 'Accept': 'application/json' },
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
    const r = await axios.get('https://www.stanbicbank.co.zw/about-us/procurement', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    $('table tbody tr, table tr, .file a[href], a[href$=".pdf"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5 || href === '#') return;
      const fullHref = href.startsWith('http') ? href : `https://www.stanbicbank.co.zw${href}`;
      results.push(enrichTender({
        title: text,
        description: `Stanbic Bank procurement: ${text}`,
        organization: 'Stanbic Bank Zimbabwe',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: 'Financial Services',
        category: 'Banking Procurement',
        requirements: [],
        region: 'Zimbabwe',
      }));
    });

    console.log(`[TenderScraper] Stanbic Bank: ${results.length} procurement items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] Stanbic Bank failed: ${e.message.slice(0, 100)}`);
  }

  return results;
}

async function scrapeSADC(): Promise<Tender[]> {
  const results: Tender[] = [];

  try {
    const r = await axios.get('https://www.sadc.int/procurement-opportunities', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    const links = $('a[href]').filter((_, el) => {
      const href = $(el).attr('href') || '';
      return Boolean(href.match(/procurement|tender|bid|rfq|opportunity/i) && !href.match(/login|register|signin/i));
    }).map((_, el) => ({ text: $(el).text().trim(), href: $(el).attr('href') ?? '' })).get();

    for (const link of links.slice(0, 20)) {
      const fullHref = link.href.startsWith('http') ? link.href : `https://www.sadc.int${link.href}`;
      if (link.text && link.text.length > 3) {
        results.push(enrichTender({
          title: link.text,
          description: `SADC Procurement: ${link.text}`,
          organization: 'SADC',
          sourceUrl: fullHref,
          closingDate: null,
          value: null,
          sector: classifySector(link.text),
          category: 'Tender Notice',
          requirements: [],
          region: 'SADC',
        }));
      }
    }

    console.log(`[TenderScraper] SADC: scraped ${results.length} procurement opportunities`);
  } catch (e: any) {
    console.warn(`[TenderScraper] SADC failed: ${e.message.slice(0, 100)}`);
  }

  return results;
}

async function scrapeSAeTenders(): Promise<Tender[]> {
  const results: Tender[] = [];

  try {
    const r = await axios.get('https://www.etenders.gov.za', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    const seen = new Set<string>();

    $('table tbody tr, table tr, .tender-item, .notice-item').each((_, row) => {
      const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get();
      const link = $(row).find('a[href]').first();
      const linkHref = link.attr('href') || '';
      const linkText = link.text().trim().replace(/\s+/g, ' ');

      if (!linkHref || linkHref === '#' || linkHref === '/') return;

      const title = linkText || cells[0];
      if (!title || title.length < 3) return;

      const fullHref = linkHref.startsWith('http') ? linkHref : `https://www.etenders.gov.za${linkHref}`;
      const key = fullHref.toLowerCase();
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

      results.push(enrichTender({
        title,
        description: cells.join(' | '),
        organization: 'South Africa eTenders',
        sourceUrl: fullHref,
        closingDate,
        value: null,
        sector: classifySector(title),
        category: 'Tender Notice',
        requirements: [],
        region: 'South Africa',
      }));
    });

    const standaloneLinks = $('a[href]').filter((_, el) => {
      const href = $(el).attr('href') || '';
      return Boolean(href.match(/tender|bid|rfq|procurement|notice/i) && !href.match(/login|register|signin|#/i));
    }).map((_, el) => ({ text: $(el).text().trim(), href: $(el).attr('href') ?? '' })).get();

    for (const link of standaloneLinks.slice(0, 10)) {
      const fullHref = link.href.startsWith('http') ? link.href : `https://www.etenders.gov.za${link.href}`;
      const key = fullHref.toLowerCase();
      if (seen.has(key) || !link.text || link.text.length < 3) continue;
      seen.add(key);

      results.push(enrichTender({
        title: link.text,
        description: `South Africa eTenders: ${link.text}`,
        organization: 'South Africa eTenders',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: classifySector(link.text),
        category: 'Tender Notice',
        requirements: [],
        region: 'South Africa',
      }));
    }

    console.log(`[TenderScraper] SA eTenders: scraped ${results.length} tenders`);
  } catch (e: any) {
    console.warn(`[TenderScraper] SA eTenders failed: ${e.message.slice(0, 100)}`);
  }

  return results;
}

async function scrapeAfDB(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.afdb.org/en/projects-and-operations/tenders', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('table tbody tr, table tr, .views-row, .node').each((_, row) => {
      const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get();
      const link = $(row).find('a[href]').first();
      const linkText = link.text().trim();
      const linkHref = link.attr('href') || '';

      if (!linkHref || linkHref === '#' || linkHref === '/') return;
      const title = linkText || cells[0];
      if (!title || title.length < 5) return;

      const fullHref = linkHref.startsWith('http') ? linkHref : `https://www.afdb.org${linkHref}`;
      const key = fullHref.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      let closingDate: Date | null = null;
      for (const cell of cells) {
        const match = cell.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (match) { try { closingDate = new Date(match[1]); } catch { /* ignore */ } break; }
      }

      results.push(enrichTender({
        title,
        description: cells.join(' | ') || `AfDB tender: ${title}`,
        organization: 'African Development Bank',
        sourceUrl: fullHref,
        closingDate,
        value: null,
        sector: classifySector(title),
        category: 'International Development',
        requirements: ['AfDB vendor registration', 'International compliance'],
        region: 'Africa',
      }));
    });

    console.log(`[TenderScraper] AfDB: ${results.length} tenders`);
  } catch (e: any) {
    console.warn(`[TenderScraper] AfDB failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeWorldBank(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.worldbank.org/en/projects/procurement', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('a[href]').filter((_, el) => {
      const href = $(el).attr('href') || '';
      return Boolean(href.match(/procurement|tender|bid|rfq/i) && !href.match(/login|register|signin/i));
    }).each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href') || '';
      if (!text || text.length < 5) return;
      const fullHref = href.startsWith('http') ? href : `https://www.worldbank.org${href}`;
      if (seen.has(fullHref.toLowerCase())) return;
      seen.add(fullHref.toLowerCase());

      results.push(enrichTender({
        title: text,
        description: `World Bank procurement: ${text}`,
        organization: 'World Bank',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: classifySector(text),
        category: 'International Development',
        requirements: ['World Bank vendor registration'],
        region: 'Global',
      }));
    });

    console.log(`[TenderScraper] World Bank: ${results.length} tenders`);
  } catch (e: any) {
    console.warn(`[TenderScraper] World Bank failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeUSAID(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.usaid.gov/zimbabwe/work-with-us/partnership-opportunities', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('a[href]').filter((_, el) => {
      const href = $(el).attr('href') || '';
      return Boolean(href.match(/tender|rfq|rfa|grant|opportunity|procurement/i));
    }).each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href') || '';
      if (!text || text.length < 5) return;
      const fullHref = href.startsWith('http') ? href : `https://www.usaid.gov${href}`;
      if (seen.has(fullHref.toLowerCase())) return;
      seen.add(fullHref.toLowerCase());

      results.push(enrichTender({
        title: text,
        description: `USAID Zimbabwe opportunity: ${text}`,
        organization: 'USAID Zimbabwe',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: classifySector(text),
        category: 'NGO / Development',
        requirements: ['USAID registration', 'DUNS number', 'SAM registration'],
        region: 'Zimbabwe',
      }));
    });

    console.log(`[TenderScraper] USAID: ${results.length} opportunities`);
  } catch (e: any) {
    console.warn(`[TenderScraper] USAID failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeCBZ(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.cbz.co.zw/tenders', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('table tbody tr, table tr, .file a[href], a[href$=".pdf"], .tender-item a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5 || href === '#') return;
      const fullHref = href.startsWith('http') ? href : `https://www.cbz.co.zw${href}`;
      if (seen.has(fullHref.toLowerCase())) return;
      seen.add(fullHref.toLowerCase());
      results.push(enrichTender({
        title: text,
        description: `CBZ Bank procurement: ${text}`,
        organization: 'CBZ Bank',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: 'Financial Services',
        category: 'Banking Procurement',
        requirements: [],
        region: 'Zimbabwe',
      }));
    });

    console.log(`[TenderScraper] CBZ: ${results.length} procurement items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] CBZ failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeEconet(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.econet.co.zw/procurement/', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('table tbody tr, table tr, .file a[href], a[href$=".pdf"], .tender-item a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5 || href === '#') return;
      const fullHref = href.startsWith('http') ? href : `https://www.econet.co.zw${href}`;
      if (seen.has(fullHref.toLowerCase())) return;
      seen.add(fullHref.toLowerCase());
      results.push(enrichTender({
        title: text,
        description: `Econet Wireless procurement: ${text}`,
        organization: 'Econet Wireless',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: 'Telecommunications',
        category: 'Corporate Procurement',
        requirements: [],
        region: 'Zimbabwe',
      }));
    });

    console.log(`[TenderScraper] Econet: ${results.length} procurement items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] Econet failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeNetOne(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.netone.co.zw/procurement', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('table tbody tr, table tr, .file a[href], a[href$=".pdf"], .tender-item a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5 || href === '#') return;
      const fullHref = href.startsWith('http') ? href : `https://www.netone.co.zw${href}`;
      if (seen.has(fullHref.toLowerCase())) return;
      seen.add(fullHref.toLowerCase());
      results.push(enrichTender({
        title: text,
        description: `NetOne procurement: ${text}`,
        organization: 'NetOne',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: 'Telecommunications',
        category: 'Corporate Procurement',
        requirements: [],
        region: 'Zimbabwe',
      }));
    });

    console.log(`[TenderScraper] NetOne: ${results.length} procurement items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] NetOne failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeTelOne(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.telone.co.zw/procurement', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('table tbody tr, table tr, .file a[href], a[href$=".pdf"], .tender-item a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5 || href === '#') return;
      const fullHref = href.startsWith('http') ? href : `https://www.telone.co.zw${href}`;
      if (seen.has(fullHref.toLowerCase())) return;
      seen.add(fullHref.toLowerCase());
      results.push(enrichTender({
        title: text,
        description: `TelOne procurement: ${text}`,
        organization: 'TelOne',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: 'Telecommunications',
        category: 'Corporate Procurement',
        requirements: [],
        region: 'Zimbabwe',
      }));
    });

    console.log(`[TenderScraper] TelOne: ${results.length} procurement items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] TelOne failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeFBC(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.fbc.co.zw/tenders', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('table tbody tr, table tr, .file a[href], a[href$=".pdf"], .tender-item a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5 || href === '#') return;
      const fullHref = href.startsWith('http') ? href : `https://www.fbc.co.zw${href}`;
      if (seen.has(fullHref.toLowerCase())) return;
      seen.add(fullHref.toLowerCase());
      results.push(enrichTender({
        title: text,
        description: `FBC Bank procurement: ${text}`,
        organization: 'FBC Bank',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: 'Financial Services',
        category: 'Banking Procurement',
        requirements: [],
        region: 'Zimbabwe',
      }));
    });

    console.log(`[TenderScraper] FBC: ${results.length} procurement items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] FBC failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeNMB(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.nmbz.co.zw/about/procurement', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('table tbody tr, table tr, .file a[href], a[href$=".pdf"], .tender-item a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5 || href === '#') return;
      const fullHref = href.startsWith('http') ? href : `https://www.nmbz.co.zw${href}`;
      if (seen.has(fullHref.toLowerCase())) return;
      seen.add(fullHref.toLowerCase());
      results.push(enrichTender({
        title: text,
        description: `NMB Bank procurement: ${text}`,
        organization: 'NMB Bank',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: 'Financial Services',
        category: 'Banking Procurement',
        requirements: [],
        region: 'Zimbabwe',
      }));
    });

    console.log(`[TenderScraper] NMB: ${results.length} procurement items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] NMB failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeCABS(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.cabs.co.zw/tenders', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('table tbody tr, table tr, .file a[href], a[href$=".pdf"], .tender-item a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5 || href === '#') return;
      const fullHref = href.startsWith('http') ? href : `https://www.cabs.co.zw${href}`;
      if (seen.has(fullHref.toLowerCase())) return;
      seen.add(fullHref.toLowerCase());
      results.push(enrichTender({
        title: text,
        description: `CABS procurement: ${text}`,
        organization: 'CABS',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: 'Financial Services',
        category: 'Banking Procurement',
        requirements: [],
        region: 'Zimbabwe',
      }));
    });

    console.log(`[TenderScraper] CABS: ${results.length} procurement items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] CABS failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeTendersZimbabwe(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://tenderszimbabwe.co.zw/', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('a[href*="/tender"], a[href*="/rfq"], a[href*="/eoi"], .tender-card, .listing-item, article').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      const href = $(el).attr('href') || '';
      if (!text || text.length < 10) return;
      const fullHref = href.startsWith('http') ? href : `https://tenderszimbabwe.co.zw${href}`;
      const key = (fullHref + text.slice(0, 80)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const title = $(el).find('h2, h3, h4, .title, .card-title').first().text().trim() || text.slice(0, 100);
      const orgMatch = text.match(/(?:by|from|organisation|organization)[:\s]+([A-Z][A-Za-z\s&.]+?)(?:\d|closing|deadline|$)/i);
      const dateMatch = text.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i);
      const daysLeftMatch = text.match(/(\d+)\s*days?\s*left/i);

      let closingDate: Date | null = null;
      if (dateMatch) closingDate = new Date(dateMatch[1]);
      else if (daysLeftMatch) closingDate = new Date(Date.now() + parseInt(daysLeftMatch[1]) * 86400000);

      if (title && title.length > 5) {
        results.push(enrichTender({
          title: title.slice(0, 200),
          description: text.slice(0, 500),
          organization: orgMatch ? orgMatch[1].trim() : 'Tenders Zimbabwe',
          sourceUrl: fullHref || `https://tenderszimbabwe.co.zw/tender/${generateId(title)}`,
          closingDate,
          value: null,
          sector: classifySector(title),
          category: text.includes('Quotation') ? 'RFQ' : text.includes('EOI') ? 'EOI' : 'Tender Notice',
          requirements: [],
          region: 'Zimbabwe',
          sourceName: 'Tenders Zimbabwe',
        }));
      }
    });

    if (results.length > 0) console.log(`[TenderScraper] TendersZimbabwe: ${results.length} items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] TendersZimbabwe failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeGlobalTenders(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.globaltenders.com/zw/zimbabwe-vehicles-engines-tenders', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const html = typeof r.data === 'string' ? r.data : JSON.stringify(r.data);
    const $ = cheerio.load(html);
    const seen = new Set<string>();

    $('div[id*="tender"], div[class*="tender"], tr[class*="tender"], .notice-item, .tender-row').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (!text || text.length < 20) return;

      const summaryMatch = text.match(/Summary:\s*([^\n]+)/i);
      const countryMatch = text.match(/Country:\s*([^\n]+)/i);
      const deadlineMatch = text.match(/Deadline:\s*([^\n]+)/i);
      const noticeMatch = text.match(/Notice Type:\s*([^\n]+)/i);
      const postingMatch = text.match(/Posting Date:\s*([^\n]+)/i);
      const link = $(el).find('a[href]').first();
      const href = link.attr('href') || '';

      const title = summaryMatch?.[1]?.trim() || link.text().trim() || text.slice(0, 100);
      const key = (href + title.slice(0, 60)).toLowerCase();
      if (seen.has(key) || !title || title.length < 5) return;
      seen.add(key);

      const cleanHref = href.startsWith('http') ? href : `https://www.globaltenders.com${href}`;
      let closingDate: Date | null = null;
      if (deadlineMatch) {
        const parsed = new Date(deadlineMatch[1].trim());
        if (!isNaN(parsed.getTime())) closingDate = parsed;
      }

      results.push(enrichTender({
        title: title.slice(0, 200),
        description: text.slice(0, 500),
        organization: countryMatch?.[1]?.trim() || 'GlobalTenders Zimbabwe',
        sourceUrl: cleanHref,
        closingDate,
        value: null,
        sector: classifySector(title),
        category: noticeMatch?.[1]?.trim() || 'Tender Notice',
        requirements: [],
        region: 'Zimbabwe',
        sourceName: 'GlobalTenders',
        publishedAt: postingMatch ? new Date(postingMatch[1].trim()) : undefined,
      }));
    });

    if (results.length > 0) console.log(`[TenderScraper] GlobalTenders: ${results.length} items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] GlobalTenders failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeOnlineTenders(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.onlinetenders.co.za/tenders/zimbabwe', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('table tbody tr, table tr, .tender-item, .listing-row').each((_, row) => {
      const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get();
      const links = $(row).find('a[href]');
      const link = links.first();
      const href = link.attr('href') || '';

      if (cells.length < 2) return;

      const contractNo = cells[0] || '';
      const description = cells[1] || '';
      const closingDateStr = cells[cells.length - 1] || '';
      const key = (href + contractNo + description.slice(0, 40)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const title = description.length > 10 ? description.slice(0, 200) : contractNo;
      const cleanHref = href.startsWith('http') ? href : `https://www.onlinetenders.co.za${href}`;
      let closingDate: Date | null = null;
      const dateMatch = closingDateStr.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) closingDate = new Date(dateMatch[1]);

      if (title && title.length > 5 && !title.toLowerCase().includes('login') && !title.toLowerCase().includes('subscribe')) {
        results.push(enrichTender({
          title,
          description: description.slice(0, 500),
          organization: 'OnlineTenders Zimbabwe',
          sourceUrl: cleanHref,
          closingDate,
          value: null,
          sector: classifySector(title + ' ' + description),
          category: 'Tender Notice',
          requirements: [],
          region: 'Zimbabwe',
          sourceName: 'OnlineTenders',
        }));
      }
    });

    if (results.length > 0) console.log(`[TenderScraper] OnlineTenders: ${results.length} items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] OnlineTenders failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeBidDetail(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.biddetail.com/zimbabwe-tenders', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('.tender-box, .listing-item, .item-row, tr, div[class*="tender"]').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      const link = $(el).find('a[href]').first();
      const href = link.attr('href') || '';
      const linkText = link.text().trim();

      if (!text || text.length < 15) return;
      const key = (href + text.slice(0, 60)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const title = linkText || text.split('.').slice(0, 2).join('.').trim().slice(0, 200);
      const cleanHref = href.startsWith('http') ? href : `https://www.biddetail.com${href}`;
      const dateMatch = text.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i);
      let closingDate: Date | null = null;
      if (dateMatch) closingDate = new Date(dateMatch[1]);

      if (title && title.length > 5 && !title.toLowerCase().includes('login') && !title.toLowerCase().includes('subscribe')) {
        results.push(enrichTender({
          title: title.slice(0, 200),
          description: text.slice(0, 500),
          organization: 'BidDetail Zimbabwe',
          sourceUrl: cleanHref,
          closingDate,
          value: null,
          sector: classifySector(title),
          category: 'Tender Notice',
          requirements: [],
          region: 'Zimbabwe',
          sourceName: 'BidDetail',
        }));
      }
    });

    if (results.length > 0) console.log(`[TenderScraper] BidDetail: ${results.length} items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] BidDetail failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeTenderInfoOrg(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.tenderinfo.org/countries/zimbabwe', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('div[class*="tender"], .notice-item, .row, tr').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      const link = $(el).find('a[href]').first();
      const href = link.attr('href') || '';
      const linkText = link.text().trim();

      if (!text || text.length < 15) return;
      const title = linkText || text.split('(')[0].trim().slice(0, 200);
      const key = (href + title.slice(0, 60)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const cleanHref = href.startsWith('http') ? href : `https://www.tenderinfo.org${href}`;
      const dateMatch = text.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)/i);
      let closingDate: Date | null = null;
      if (dateMatch) closingDate = new Date(dateMatch[1]);

      if (title && title.length > 5) {
        results.push(enrichTender({
          title: title.slice(0, 200),
          description: text.slice(0, 500),
          organization: 'TenderInfo.Org',
          sourceUrl: cleanHref,
          closingDate,
          value: null,
          sector: classifySector(title),
          category: 'RFQ',
          requirements: [],
          region: 'Zimbabwe',
          sourceName: 'TenderInfoOrg',
        }));
      }
    });

    if (results.length > 0) console.log(`[TenderScraper] TenderInfoOrg: ${results.length} items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] TenderInfoOrg failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeTenderLink(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://tenderlink.co.zw/', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('a[href*="tender"], a[href*="rfq"], a[href*="notice"], .post-title a, h2 a, h3 a, .entry-title a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5 || href === '#') return;
      const key = (href + text.slice(0, 60)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const fullHref = href.startsWith('http') ? href : `https://tenderlink.co.zw${href}`;
      results.push(enrichTender({
        title: text.slice(0, 200),
        description: `TenderLink Zimbabwe: ${text}`,
        organization: 'TenderLink Zimbabwe',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: classifySector(text),
        category: 'Tender Notice',
        requirements: [],
        region: 'Zimbabwe',
        sourceName: 'TenderLink',
      }));
    });

    if (results.length > 0) console.log(`[TenderScraper] TenderLink: ${results.length} items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] TenderLink failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeETender(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://etender.co.zw/', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('a[href*="listing"], a[href*="tender"], a[href*="opportunity"], .listing-title a, h2 a, h3 a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5 || href === '#') return;
      const key = (href + text.slice(0, 60)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const fullHref = href.startsWith('http') ? href : `https://etender.co.zw${href}`;
      results.push(enrichTender({
        title: text.slice(0, 200),
        description: `eTender Zimbabwe: ${text}`,
        organization: 'eTender Zimbabwe',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: classifySector(text),
        category: 'Tender Notice',
        requirements: [],
        region: 'Zimbabwe',
        sourceName: 'ETender',
      }));
    });

    if (results.length > 0) console.log(`[TenderScraper] ETender: ${results.length} items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] ETender failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeTenderNoticeboard(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://tendernoticeboard.co.zw/', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('a[href*="tender"], a[href*="project"], a[href*="opportunity"], h2 a, h3 a, .card-title a, .post-title a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5 || href === '#') return;
      const key = (href + text.slice(0, 60)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const fullHref = href.startsWith('http') ? href : `https://tendernoticeboard.co.zw${href}`;
      results.push(enrichTender({
        title: text.slice(0, 200),
        description: `Tender Noticeboard Zimbabwe: ${text}`,
        organization: 'Tender Noticeboard',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: classifySector(text),
        category: 'Tender Notice',
        requirements: [],
        region: 'Zimbabwe',
        sourceName: 'TenderNoticeboard',
      }));
    });

    if (results.length > 0) console.log(`[TenderScraper] TenderNoticeboard: ${results.length} items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] TenderNoticeboard failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

async function scrapeClassifieds(): Promise<Tender[]> {
  const results: Tender[] = [];
  try {
    const r = await axios.get('https://www.classifieds.co.zw/', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = cheerio.load(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    const seen = new Set<string>();

    $('a[href*="tender"], a[href*="contract"], a[href*="procurement"], h2 a, h3 a, .card a, .listing a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5) return;
      if (!text.toLowerCase().includes('tender') && !text.toLowerCase().includes('contract') && !text.toLowerCase().includes('procurement') && !text.toLowerCase().includes('bid') && !text.toLowerCase().includes('supply') && !text.toLowerCase().includes('rfq')) return;
      const key = (href + text.slice(0, 60)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const fullHref = href.startsWith('http') ? href : `https://www.classifieds.co.zw${href}`;
      results.push(enrichTender({
        title: text.slice(0, 200),
        description: `Classifieds Zimbabwe: ${text}`,
        organization: 'Classifieds Zimbabwe',
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: classifySector(text),
        category: 'Tender Notice',
        requirements: [],
        region: 'Zimbabwe',
        sourceName: 'ClassifiedsZW',
      }));
    });

    if (results.length > 0) console.log(`[TenderScraper] Classifieds: ${results.length} items`);
  } catch (e: any) {
    console.warn(`[TenderScraper] Classifieds failed: ${e.message?.slice(0, 100)}`);
  }
  return results;
}

export async function scrapeAllTenders(): Promise<{ scraped: number; errors: number; tenders: any[] }> {
  const cacheKey = 'tenders:scrape:all_run';
  const cached = getCached<{ scraped: number; errors: number; tenders: any[] }>(cacheKey);
  if (cached) return cached;

  const results = { scraped: 0, errors: 0 };
  const allTenders: Tender[] = [];

  const live = await tryLiveTenders();
  if (live.length > 0) {
    allTenders.push(...live);
    console.log(`[TenderScraper] proc.gov.zw: ${live.length} tenders`);
  }

const [tot, ti, praz, idbz, undp, zimra, stanbic, sadc, saet, afdb, wb, usaid, cbz, econet, netone, telone, fbc, nmb, cabs, tzw, gt, ot, bd, tio, tl, et, tnb, cl] = await Promise.allSettled([
    scrapeTendersOnTime(),
    scrapeTendersInfo(),
    scrapePRAZ(),
    scrapeIDBZ(),
    scrapeUNDP(),
    scrapeZIMRA(),
    scrapeStanbicBank(),
    scrapeSADC(),
    scrapeSAeTenders(),
    scrapeAfDB(),
    scrapeWorldBank(),
    scrapeUSAID(),
    scrapeCBZ(),
    scrapeEconet(),
    scrapeNetOne(),
    scrapeTelOne(),
    scrapeFBC(),
    scrapeNMB(),
    scrapeCABS(),
    scrapeTendersZimbabwe(),
    scrapeGlobalTenders(),
    scrapeOnlineTenders(),
    scrapeBidDetail(),
    scrapeTenderInfoOrg(),
    scrapeTenderLink(),
    scrapeETender(),
    scrapeTenderNoticeboard(),
    scrapeClassifieds(),
  ]);

  if (tot.status === 'fulfilled') allTenders.push(...tot.value);
  if (ti.status === 'fulfilled') allTenders.push(...ti.value);
  if (praz.status === 'fulfilled') allTenders.push(...praz.value);
  if (idbz.status === 'fulfilled') allTenders.push(...idbz.value);
  if (undp.status === 'fulfilled') allTenders.push(...undp.value);
  if (zimra.status === 'fulfilled') allTenders.push(...zimra.value);
  if (stanbic.status === 'fulfilled') allTenders.push(...stanbic.value);
  if (sadc.status === 'fulfilled') allTenders.push(...sadc.value);
  if (saet.status === 'fulfilled') allTenders.push(...saet.value);
  if (afdb.status === 'fulfilled') allTenders.push(...afdb.value);
  if (wb.status === 'fulfilled') allTenders.push(...wb.value);
  if (usaid.status === 'fulfilled') allTenders.push(...usaid.value);
  if (cbz.status === 'fulfilled') allTenders.push(...cbz.value);
  if (econet.status === 'fulfilled') allTenders.push(...econet.value);
  if (netone.status === 'fulfilled') allTenders.push(...netone.value);
  if (telone.status === 'fulfilled') allTenders.push(...telone.value);
  if (fbc.status === 'fulfilled') allTenders.push(...fbc.value);
  if (nmb.status === 'fulfilled') allTenders.push(...nmb.value);
  if (cabs.status === 'fulfilled') allTenders.push(...cabs.value);
  if (tzw.status === 'fulfilled') allTenders.push(...tzw.value);
  if (gt.status === 'fulfilled') allTenders.push(...gt.value);
  if (ot.status === 'fulfilled') allTenders.push(...ot.value);
  if (bd.status === 'fulfilled') allTenders.push(...bd.value);
  if (tio.status === 'fulfilled') allTenders.push(...tio.value);
  if (tl.status === 'fulfilled') allTenders.push(...tl.value);
  if (et.status === 'fulfilled') allTenders.push(...et.value);
  if (tnb.status === 'fulfilled') allTenders.push(...tnb.value);
  if (cl.status === 'fulfilled') allTenders.push(...cl.value);

  if (allTenders.length === 0) {
    console.log('[TenderScraper] All sources failed — falling back to mock data');
    allTenders.push(...MOCK_TENDERS.map(raw => enrichTender({ ...raw, region: 'Zimbabwe' })));
  } else {
    console.log(`[TenderScraper] Total scraped from all sources: ${allTenders.length}`);
  }

  const uniqueTenders = Array.from(
    new Map(allTenders.map(t => [t.id, t])).values()
  );

  const qualityTenders = uniqueTenders.filter(t => isQualityTender(t.title, t.description));
  const removedCount = uniqueTenders.length - qualityTenders.length;
  if (removedCount > 0) {
    console.log(`[TenderScraper] Filtered out ${removedCount} non-tender items`);
  }

  // Also scrape entity-specific tenders
  try {
    const entityTenders = await scrapeAllEntities();
    if (entityTenders.length > 0) {
      console.log(`[TenderScraper] Entity scraper: ${entityTenders.length} tenders found`);
      await storeEntityTenders(entityTenders);
    }
  } catch (e: any) {
    console.warn(`[TenderScraper] Entity scraper failed: ${e.message?.slice(0, 100)}`);
  }

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
    } catch (err: any) {
      results.errors = qualityTenders.length;
      console.error('[TenderScraper] Write error:', err);
      try { await saveLog('tenders', 0, 'error', err.message); } catch { /* saveLog failed, ignore */ }
    }
  }

  const result = { ...results, tenders: qualityTenders.slice(0, 20).map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    organization: t.organization,
    sourceUrl: t.sourceUrl,
    sourceName: t.sourceName,
    publishedAt: t.publishedAt,
    closingDate: t.closingDate,
    value: t.value,
    category: t.category,
    sector: t.sector,
    region: t.region,
    requirements: t.requirements,
    status: t.status,
  })) };
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
      const id = crypto.createHash('sha256').update(data.title + data.sourceUrl).digest('hex').slice(0, 32);
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      tenders.push({
        id,
        title: data.title || 'Untitled',
        description: data.description || '',
        organization: data.sourceEntityName || '',
        sourceUrl: data.sourceUrl || '',
        sourceName: data.sourceEntityName || 'Entity Scraper',
        publishedAt: data.publishedAt?.toDate() || new Date(),
        closingDate: data.deadline ? new Date(data.deadline) : null,
        value: null,
        category: data.category || 'General',
        sector: data.sector || 'General Services',
        region: data.region || 'Zimbabwe',
        requirements: [],
        status: data.deadline ? determineStatus(new Date(data.deadline)) : 'open',
        processedAt: new Date(),
        scrapedAt: data.fetchedAt?.toDate() || new Date(),
      });
    }
  } catch {
    // Entity scraper data not available — skip merge
  }

  // Enrich with scores
  const scores = await loadScores(tenders.map(t => t.id));
  for (const t of tenders) {
    const s = scores.get(t.id);
    if (s) {
      t.impactScore = s.impactScore;
      t.urgencyScore = s.urgencyScore;
      t.confidenceScore = s.confidenceScore;
    }
  }

  const result = tenders.slice(0, n);
  setCached(cacheKey, result, 5 * 60 * 1000);
  return result;
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
import { generateContentId } from '@/lib/content-classification';

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

export type ScrapeStrategy = 'html-table' | 'html-links' | 'html-divs' | 'rss' | 'api-json' | 'custom';

export interface TenderSourceConfig {
  name: string;
  displayName: string;
  baseUrl: string;
  url: string;
  strategy: ScrapeStrategy;
  /** CSS selectors for html-table strategy */
  rowSelector?: string;
  cellSelector?: string;
  linkSelector?: string;
  /** CSS selectors for html-links strategy */
  linkFilter?: string;
  /** Base URL for resolving relative hrefs */
  hrefBase?: string;
  /** RSS URL override (for rss strategy) */
  rssUrl?: string;
  /** Organization name to inject */
  organization: string;
  /** Default category */
  category: string;
  /** Default sector (overrides auto-classification) */
  sector?: string;
  /** Default requirements */
  requirements?: string[];
  /** Region override */
  region?: string;
  /** Custom parser key (for custom strategy) */
  customParser?: string;
  /** Request timeout */
  timeout?: number;
}

export const SECTOR_KEYWORDS: Record<string, string[]> = {
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

export const NON_TENDER_PATTERNS = [
  'cookie', 'privacy policy', 'terms of use', 'login', 'sign up', 'register',
  'subscribe', 'newsletter', 'copyright', 'all rights reserved', 'contact us',
  'about us', 'home page', 'site map', 'faq', 'help', 'support',
];

export const NAVIGATION_PATTERNS = [
  'home', 'back', 'next', 'previous', 'page 1', 'page 2', 'page 3',
  'click here', 'read more', 'view all', 'see all', 'show more',
];

export function classifySector(text: string): string {
  const lower = text.toLowerCase();
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return sector;
  }
  return 'General Services';
}

export function determineStatus(closingDate: Date | null): Tender['status'] {
  if (!closingDate) return 'open';
  const daysLeft = Math.ceil((closingDate.getTime() - Date.now()) / 86400000);
  if (daysLeft < 0) return 'closed';
  if (daysLeft <= 7) return 'closing_soon';
  return 'open';
}

export function enrichTender(raw: Omit<Tender, 'id' | 'sourceName' | 'publishedAt' | 'status' | 'processedAt' | 'scrapedAt'> & { region?: string; sourceName?: string; publishedAt?: Date }): Tender {
  const sector = raw.sector || classifySector(raw.title + ' ' + raw.description);
  return {
    ...raw,
    region: raw.region || 'Zimbabwe',
    id: generateContentId(raw.title + raw.sourceUrl + (raw.closingDate ? raw.closingDate.toISOString() : '')),
    sourceName: raw.sourceName || 'Government Tenders Portal',
    publishedAt: raw.publishedAt || new Date(),
    sector,
    status: determineStatus(raw.closingDate),
    processedAt: new Date(),
    scrapedAt: new Date(),
  };
}

export function isQualityTender(title: string, description: string): boolean {
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

export function createLog(tag: string, msg: string): string {
  return `[TenderScraper][${tag}] ${msg}`;
}

export const MOCK_TENDERS: Omit<Tender, 'id' | 'sourceName' | 'publishedAt' | 'status' | 'processedAt' | 'scrapedAt' | 'region'>[] = [
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
];

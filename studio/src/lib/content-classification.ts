import crypto from 'crypto';

// ─── Shared Content ID Generator ────────────────────────────────────────────

export function generateContentId(input: string, algorithm: 'md5' | 'sha256' = 'sha256'): string {
  const hash = crypto.createHash(algorithm).update(input).digest('hex');
  return algorithm === 'sha256' ? hash.slice(0, 32) : hash;
}

// ─── Shared Sector Classification ───────────────────────────────────────────

export const SECTORS = [
  'Agriculture', 'Retail', 'Manufacturing', 'Technology', 'Financial Services',
  'Healthcare', 'Education', 'Hospitality', 'Tourism', 'Transport', 'Construction',
  'Creative', 'Media', 'Professional Services', 'Mining', 'Energy', 'Telecommunications',
] as const;

export type Sector = typeof SECTORS[number];

export const SECTOR_SYNONYMS: Record<Sector, string[]> = {
  Agriculture: ['farming', 'crop', 'livestock', 'agro', 'seed', 'fertilizer', 'farm', 'wheat', 'maize', 'tobacco', 'horticulture'],
  Retail: ['shop', 'store', 'wholesale', 'supermarket', 'grocery', 'mall', 'vendor', 'merchandise'],
  Manufacturing: ['factory', 'production', 'plant', 'processing', 'textile', 'assembly', 'industrial'],
  Technology: ['tech', 'digital', 'software', 'hardware', 'app', 'platform', 'AI', 'startup', 'fintech', 'cyber', 'blockchain', 'SaaS', 'mobile', 'data', 'cloud', 'ICT', 'EcoCash', 'TelOne', 'NetOne', 'internet', 'broadband'],
  'Financial Services': ['bank', 'finance', 'insurance', 'investment', 'fintech', 'RBZ', 'reserve bank', 'forex', 'inflation', 'stock', 'market', 'trading', 'dividend', 'loan', 'credit', 'ZiG', 'ZWG', 'USD', 'deposit', 'interest rate', 'MPU', 'monetary policy'],
  Healthcare: ['health', 'medical', 'hospital', 'clinic', 'pharmaceutical', 'medicine', 'doctor', 'nurse', 'patient', 'disease', 'HIV', 'malaria', 'surgery', 'drug'],
  Education: ['school', 'university', 'college', 'education', 'training', 'student', 'teacher', 'curriculum', 'scholarship', 'academy'],
  Hospitality: ['hotel', 'lodge', 'resort', 'restaurant', 'catering', 'accommodation'],
  Tourism: ['tourism', 'travel', 'tourist', 'safari', 'wildlife', 'conservation', 'national park'],
  Transport: ['transport', 'road', 'railway', 'rail', 'airport', 'aviation', 'bus', 'fleet', 'vehicle', 'logistics', 'freight', 'shipping'],
  Construction: ['construction', 'building', 'infrastructure', 'civil', 'road', 'bridge', 'housing', 'real estate', 'property', 'contractor'],
  Creative: ['creative', 'art', 'design', 'film', 'music', 'photography', 'fashion', 'entertainment'],
  Media: ['media', 'news', 'broadcast', 'television', 'radio', 'publishing', 'journalism', 'press'],
  'Professional Services': ['consulting', 'legal', 'lawyer', 'audit', 'accounting', 'tax', 'advisory', 'survey', 'architect', 'engineering', 'management'],
  Mining: ['mining', 'mine', 'gold', 'mineral', 'lithium', 'coal', 'chrome', 'platinum', 'diamond', 'quarry', 'excavation', 'mercury'],
  Energy: ['energy', 'power', 'solar', 'electricity', 'generator', 'renewable', 'battery', 'grid', 'fuel', 'petrol', 'diesel', 'oil', 'gas', 'hydro'],
  Telecommunications: ['telecom', 'telecommunication', 'mobile', 'network', 'fiber', 'broadband', 'Econet', 'NetOne', 'TelOne', 'Telecel', 'data', 'signal', 'coverage'],
};

export const INDUSTRY_TO_SECTOR: Record<string, Sector[]> = {
  'Retail & Wholesale': ['Retail'],
  'Hospitality & Tourism': ['Hospitality', 'Tourism'],
  'Transport & Logistics': ['Transport'],
  'Creative & Media': ['Creative', 'Media'],
  'Agriculture': ['Agriculture'],
  'Manufacturing': ['Manufacturing'],
  'Technology': ['Technology'],
  'Financial Services': ['Financial Services'],
  'Healthcare': ['Healthcare'],
  'Education': ['Education'],
  'Construction': ['Construction'],
  'Professional Services': ['Professional Services'],
  'Mining': ['Mining'],
  'Energy': ['Energy'],
  'Telecommunications': ['Telecommunications'],
};

export function extractIndustryTags(title: string, content: string): Sector[] {
  const text = `${title} ${content}`.toLowerCase();
  const matched = new Set<Sector>();
  for (const sector of SECTORS) {
    if (text.includes(sector.toLowerCase())) { matched.add(sector); continue; }
    const firstWord = sector.split(' ')[0].toLowerCase();
    if (firstWord !== sector.toLowerCase() && text.includes(firstWord)) { matched.add(sector); continue; }
    const synonyms = SECTOR_SYNONYMS[sector] || [];
    if (synonyms.some(s => text.includes(s.toLowerCase()))) { matched.add(sector); continue; }
  }
  return Array.from(matched);
}

// ─── Shared Content Category Classification ─────────────────────────────────

export type ContentCategory = 'finance' | 'technology' | 'policy' | 'regulatory' | 'business' | 'general';

export const CATEGORY_KEYWORDS: Record<ContentCategory, string[]> = {
  finance: ['bank', 'inflation', 'forex', 'currency', 'ZiG', 'ZWG', 'RBZ', 'reserve bank', 'interest rate', 'monetary policy', 'stock market', 'investment', 'loan', 'credit', 'insurance', 'dividend', 'MPU', 'treasury bill', 'bond', 'imf', 'world bank', 'afdb', 'budget', 'fiscal', 'deficit', 'revenue', 'tax', 'tariff', 'trade deficit', 'balance of payment'],
  technology: ['tech', 'digital', 'software', 'hardware', 'AI', 'artificial intelligence', 'startup', 'cyber', 'blockchain', 'SaaS', 'mobile app', 'internet', 'data breach', 'cloud computing', 'fintech', 'ICT', 'EcoCash', 'TelOne', 'NetOne', 'broadband', 'innovation', 'patent', 'automation'],
  policy: ['government', 'minister', 'parliament', 'cabinet', 'president', 'MP', 'senator', 'policy', 'legislation', 'bill', 'act', 'regulation', 'decree', 'executive order', 'ministry', 'department', 'commission', 'authority'],
  regulatory: ['court', 'law', 'legal', 'judge', 'ruling', 'licence', 'license', 'ZERA', 'PRAZ', 'ZIMRA', 'SI', 'statutory instrument', 'compliance', 'regulatory', 'competition', 'tribunal', 'prosecution', 'verdict'],
  business: ['SME', 'business', 'company', 'startup', 'enterprise', 'entrepreneur', 'corporate', 'partnership', 'venture', 'trade', 'commerce', 'export', 'import', 'market', 'industry', 'manufacturing', 'retail', 'wholesale', 'supply chain', 'franchise', 'merger', 'acquisition'],
  general: [],
};

export function classifyCategory(title: string, content: string): ContentCategory {
  const text = `${title} ${content}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'general') continue;
    if (keywords.some(k => text.includes(k.toLowerCase()))) return category as ContentCategory;
  }
  return 'general';
}

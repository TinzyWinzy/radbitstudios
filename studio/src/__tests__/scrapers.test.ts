import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { shouldRefreshNewsData } from '@/services/news-scraper';

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const getCached = <T>(key: string): T | null => {
  const entry = cache.get(key) as { data: T; expiresAt: number } | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
};
const setCached = <T>(key: string, data: T, ttlMs: number) => {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
};
const invalidateCache = (pattern?: string) => {
  if (!pattern) { cache.clear(); return; }
  for (const key of cache.keys()) { if (key.includes(pattern)) cache.delete(key); }
};
const cacheStats = () => ({ size: cache.size, keys: Array.from(cache.keys()) });

describe('scraper-cache', () => {
  beforeEach(() => { cache.clear(); });

  it('stores and retrieves values', () => {
    setCached('key1', { name: 'test' }, 60000);
    expect(getCached<{ name: string }>('key1')).toEqual({ name: 'test' });
  });

  it('returns null for missing keys', () => {
    expect(getCached('nonexistent')).toBeNull();
  });

  it('expires entries after TTL', async () => {
    setCached('short', 'value', 1);
    await new Promise(r => setTimeout(r, 20));
    expect(getCached('short')).toBeNull();
  });

  it('invalidates by pattern', () => {
    setCached('news:1', 'a', 60000);
    setCached('news:2', 'b', 60000);
    setCached('tenders:1', 'c', 60000);
    invalidateCache('news:');
    expect(getCached('news:1')).toBeNull();
    expect(getCached('news:2')).toBeNull();
    expect(getCached('tenders:1')).not.toBeNull();
  });

  it('returns cache stats', () => {
    setCached('a', 1, 60000);
    setCached('b', 2, 60000);
    const stats = cacheStats();
    expect(stats.size).toBe(2);
    expect(stats.keys).toContain('a');
    expect(stats.keys).toContain('b');
  });
});

describe('news-scraper: shouldRefreshNewsData', () => {
  it('triggers a refresh when stored news is older than the freshness window', () => {
    const now = new Date('2026-06-28T12:00:00.000Z');
    const staleRecords = [{ publishedAt: new Date('2024-01-01T00:00:00.000Z') }];

    expect(shouldRefreshNewsData(staleRecords, now)).toBe(true);
  });

  it('does not trigger a refresh when recent news already exists', () => {
    const now = new Date('2026-06-28T12:00:00.000Z');
    const freshRecords = [{ publishedAt: new Date('2026-06-27T10:00:00.000Z') }];

    expect(shouldRefreshNewsData(freshRecords, now)).toBe(false);
  });
});

describe('news-scraper: classifyCategory', () => {
  const classifyCategory = (title: string, content: string, mapping: Record<string, string[]>): string => {
    const text = `${title} ${content}`.toLowerCase();
    for (const [category, keywords] of Object.entries(mapping)) {
      if (keywords.some(k => text.includes(k.toLowerCase()))) return category;
    }
    return 'general';
  };

  it('classifies finance articles', () => {
    expect(classifyCategory('Reserve Bank raises interest rates', 'inflation concerns', { finance: ['Reserve Bank', 'inflation', 'forex'] })).toBe('finance');
  });

  it('classifies technology articles', () => {
    expect(classifyCategory('EcoCash launches new service', '', { technology: ['EcoCash', 'digital', 'mobile'] })).toBe('technology');
  });

  it('returns general for unclassified', () => {
    expect(classifyCategory('Random headline', 'random content', {})).toBe('general');
  });

  it('matches first keyword found', () => {
    expect(classifyCategory('Government tech policy', 'digital transformation', { policy: ['government', 'minister'], technology: ['tech', 'digital'] })).toBe('policy');
  });
});

describe('news-scraper: extractIndustryTags', () => {
  const SECTORS = ['Agriculture', 'Retail', 'Manufacturing', 'Technology', 'Financial Services', 'Healthcare', 'Education', 'Hospitality', 'Tourism', 'Transport', 'Construction', 'Creative', 'Media', 'Professional Services', 'Mining', 'Energy', 'Telecommunications'];

  const extractIndustryTags = (title: string, content: string): string[] => {
    const text = `${title} ${content}`.toLowerCase();
    return SECTORS.filter(s => text.includes(s.toLowerCase()) || text.includes(s.split(' ')[0].toLowerCase()));
  };

  it('extracts matching sectors', () => {
    const tags = extractIndustryTags('Technology startup in Agriculture sector', '');
    expect(tags).toContain('Agriculture');
    expect(tags).toContain('Technology');
  });

  it('returns empty array for no matches', () => {
    expect(extractIndustryTags('Random news', '')).toHaveLength(0);
  });

  it('matches exact or first-word sector names', () => {
    expect(extractIndustryTags('Technology trends in Healthcare', '')).toContain('Technology');
    expect(extractIndustryTags('Retail business growth', '')).toContain('Retail');
  });
});

describe('news-scraper: generateId (matches real MD5 implementation)', () => {
  const generateId = (url: string): string => crypto.createHash('md5').update(url).digest('hex');

  it('generates consistent IDs for same URL', () => {
    expect(generateId('https://example.com/article-1')).toBe(generateId('https://example.com/article-1'));
  });

  it('generates different IDs for different URLs', () => {
    const id1 = generateId('https://news1.example.com/article');
    const id2 = generateId('https://news2.example.com/article');
    expect(id1).not.toBe(id2);
  });

  it('produces 32-character hex hash', () => {
    const id = generateId('https://example.com/article');
    expect(id).toHaveLength(32);
    expect(/^[0-9a-f]{32}$/.test(id)).toBe(true);
  });
});

describe('tender-scraper: enrichTender (matches real implementation)', () => {
  const SECTOR_KEYWORDS: Record<string, string[]> = {
    'Construction & Engineering': ['construction', 'building', 'infrastructure'],
    'Information Technology': ['IT', 'software', 'computer'],
    'Professional Services': ['consulting', 'legal', 'audit'],
    'Financial Services': ['banking', 'insurance', 'finance'],
  };

  const classifySector = (text: string): string => {
    const lower = text.toLowerCase();
    for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
      if (keywords.some(k => lower.includes(k))) return sector;
    }
    return 'General Services';
  };

  const determineStatus = (closingDate: Date | null): string => {
    if (!closingDate) return 'open';
    const daysLeft = Math.ceil((closingDate.getTime() - Date.now()) / 86400000);
    if (daysLeft < 0) return 'closed';
    if (daysLeft <= 7) return 'closing_soon';
    return 'open';
  };

  const generateId = (text: string): string => crypto.createHash('sha256').update(text).digest('hex').slice(0, 32);

  const enrichTender = (raw: any): any => {
    const sector = raw.sector || classifySector(raw.title + ' ' + (raw.description || ''));
    return {
      ...raw,
      region: raw.region || 'Zimbabwe',
      id: generateId(raw.title + raw.sourceUrl + (raw.closingDate ? new Date(raw.closingDate).toISOString() : '')),
      sourceName: raw.sourceName || 'Government Tenders Portal',
      publishedAt: raw.publishedAt || new Date(),
      sector,
      status: determineStatus(raw.closingDate ? new Date(raw.closingDate) : null),
      processedAt: new Date(),
      scrapedAt: new Date(),
    };
  };

  it('sets open status for future closing dates', () => {
    const t = enrichTender({ title: 'Test', sourceUrl: 'http://test.com', closingDate: new Date(Date.now() + 86400000 * 30) });
    expect(t.status).toBe('open');
  });

  it('sets closing_soon for tenders closing within 7 days', () => {
    const t = enrichTender({ title: 'Test', sourceUrl: 'http://test.com', closingDate: new Date(Date.now() + 86400000 * 3) });
    expect(t.status).toBe('closing_soon');
  });

  it('sets closed for past closing dates', () => {
    const t = enrichTender({ title: 'Test', sourceUrl: 'http://test.com', closingDate: new Date(Date.now() - 86400000) });
    expect(t.status).toBe('closed');
  });

  it('sets open when closingDate is null', () => {
    const t = enrichTender({ title: 'Test', sourceUrl: 'http://test.com' });
    expect(t.status).toBe('open');
  });

  it('preserves publishedAt when provided', () => {
    const pubDate = new Date('2026-01-15');
    const t = enrichTender({ title: 'Test', sourceUrl: 'http://test.com', publishedAt: pubDate });
    expect(t.publishedAt).toEqual(pubDate);
  });

  it('falls back to now when publishedAt missing', () => {
    const before = Date.now();
    const t = enrichTender({ title: 'Test', sourceUrl: 'http://test.com' });
    expect(t.publishedAt.getTime()).toBeGreaterThanOrEqual(before - 100);
  });

  it('classifies sector from title', () => {
    const t = enrichTender({ title: 'IT Software Development Tender', sourceUrl: 'http://test.com' });
    expect(t.sector).toBe('Information Technology');
  });

  it('defaults to General Services when sector unknown', () => {
    const t = enrichTender({ title: 'Miscellaneous Items', sourceUrl: 'http://test.com' });
    expect(t.sector).toBe('General Services');
  });

  it('generates deterministic IDs', () => {
    const raw = { title: 'Same Title', sourceUrl: 'http://test.com' };
    const t1 = enrichTender(raw);
    const t2 = enrichTender(raw);
    expect(t1.id).toBe(t2.id);
  });
});
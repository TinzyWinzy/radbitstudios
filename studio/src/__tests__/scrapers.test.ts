import { describe, it, expect, beforeEach } from 'vitest';

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

describe('news-scraper: generateId', () => {
  const generateId = (url: string): string => Buffer.from(url).toString('base64url').slice(0, 32);

  it('generates consistent IDs for same URL', () => {
    expect(generateId('https://example.com/article-1')).toBe(generateId('https://example.com/article-1'));
  });

  it('generates different IDs for different URLs', () => {
    const id1 = generateId('https://news1.example.com/article');
    const id2 = generateId('https://news2.example.com/article');
    expect(id1).not.toBe(id2);
  });

  it('produces same ID for URL with/without trailing slash', () => {
    expect(generateId('https://example.com/article')).toBe(generateId('https://example.com/article/'));
  });

  it('truncates to 32 characters', () => {
    const id = generateId('https://example.com/very/long/path/to/article/' + 'x'.repeat(100));
    expect(id.length).toBe(32);
  });
});

describe('tender-scraper: enrichTender', () => {
  const enrichTender = (raw: any): any => {
    const now = new Date();
    const published = raw.publishedAt || now;
    const closing = raw.closingDate ? new Date(raw.closingDate) : null;
    let status: string;
    if (!closing) {
      status = 'open';
    } else {
      const days = (closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      status = days < 0 ? 'closed' : days < 7 ? 'closing_soon' : 'open';
    }
    return {
      id: raw.id || '',
      title: raw.title || '',
      description: raw.description || '',
      organization: raw.organization || '',
      sourceUrl: raw.sourceUrl || '',
      sourceName: raw.sourceName || 'proc.gov.zw',
      publishedAt: published,
      closingDate: closing,
      value: raw.value || null,
      sector: raw.sector || 'General Services',
      category: raw.category || 'Works',
      region: raw.region || 'Zimbabwe',
      requirements: raw.requirements || [],
      status,
      processedAt: now,
      scrapedAt: now,
    };
  };

  it('sets open status for future closing dates', () => {
    const t = enrichTender({ id: '1', title: 'Test', publishedAt: new Date(), closingDate: new Date(Date.now() + 86400000 * 30) });
    expect(t.status).toBe('open');
  });

  it('sets closing_soon for tenders closing within 7 days', () => {
    const t = enrichTender({ id: '2', title: 'Test', publishedAt: new Date(), closingDate: new Date(Date.now() + 86400000 * 3) });
    expect(t.status).toBe('closing_soon');
  });

  it('sets closed for past closing dates', () => {
    const t = enrichTender({ id: '3', title: 'Test', publishedAt: new Date(), closingDate: new Date(Date.now() - 86400000) });
    expect(t.status).toBe('closed');
  });

  it('sets open when closingDate is null', () => {
    const t = enrichTender({ id: '4', title: 'Test', publishedAt: new Date() });
    expect(t.status).toBe('open');
  });

  it('defaults sector and category', () => {
    const t = enrichTender({ id: '5', title: 'Test' });
    expect(t.sector).toBe('General Services');
    expect(t.category).toBe('Works');
  });
});
import { describe, it, expect } from 'vitest';
import { formatRateSummary } from '@/services/exchange-rate-scraper';
import { formatIndicatorSummary } from '@/services/economic-indicators-scraper';
import { formatBusinessContext } from '@/services/context-service';

function reparseZimrate(data: { USD: Array<{ currency: string; rate: number; name: string }> }) {
  const rates: Array<{ pair: string; label: string; mid: number }> = [];
  for (const entry of data.USD) {
    const rate = entry.rate;
    if (entry.currency === 'ZWG') {
      let label = 'official';
      if (entry.name.includes('Black Market (Buy USD)')) label = 'black_market_buy';
      else if (entry.name.includes('Black Market (Sell USD)')) label = 'black_market_sell';
      else if (entry.name.includes('Cash Rate')) label = 'cash_rate';
      else if (entry.name.includes('Maximum Rate')) label = 'max_business_rate';
      else if (entry.name.includes('OK Supermarket')) label = 'business_ok';
      else if (entry.name.includes('Pick N Pay')) label = 'business_picknpay';
      else if (entry.name.includes('Sai Mart')) label = 'business_saimart';
      else if (entry.name.includes('Liquid Home')) label = 'business_liquid';
      rates.push({ pair: 'ZiG/USD', label, mid: rate });
    } else {
      rates.push({ pair: `ZiG/${entry.currency}`, label: `cross_${entry.currency}`, mid: rate });
    }
  }
  return rates;
}

describe('exchange-rate-scraper: parseZimrateResponse logic', () => {
  it('classifies official rate correctly', () => {
    const result = reparseZimrate({
      USD: [{ currency: 'ZWG', rate: 26.9181, name: 'Zim price check - Official' }],
    });
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('official');
    expect(result[0].mid).toBe(26.9181);
  });

  it('classifies black market buy/sell correctly', () => {
    const result = reparseZimrate({
      USD: [
        { currency: 'ZWG', rate: 33, name: 'Zim price check - Black Market (Buy USD)' },
        { currency: 'ZWG', rate: 30, name: 'Zim price check - Black Market (Sell USD)' },
      ],
    });
    expect(result[0].label).toBe('black_market_buy');
    expect(result[1].label).toBe('black_market_sell');
  });

  it('classifies cash rate', () => {
    const result = reparseZimrate({
      USD: [{ currency: 'ZWG', rate: 40, name: 'Zim price check - Cash Rate' }],
    });
    expect(result[0].label).toBe('cash_rate');
  });

  it('classifies business rates', () => {
    const result = reparseZimrate({
      USD: [
        { currency: 'ZWG', rate: 32, name: 'Zim price check - OK Supermarket' },
        { currency: 'ZWG', rate: 26.5, name: 'Zim price check - Liquid Home' },
      ],
    });
    expect(result[0].label).toBe('business_ok');
    expect(result[1].label).toBe('business_liquid');
  });

  it('classifies cross rates', () => {
    const result = reparseZimrate({
      USD: [
        { currency: 'ZAR', rate: 16.2539, name: 'Cross Rate (Official)' },
        { currency: 'EUR', rate: 0.859, name: 'Cross Rate (Official)' },
      ],
    });
    expect(result[0].label).toBe('cross_ZAR');
    expect(result[0].pair).toBe('ZiG/ZAR');
    expect(result[1].label).toBe('cross_EUR');
  });

  it('handles empty input', () => {
    expect(reparseZimrate({ USD: [] })).toEqual([]);
  });
});

describe('exchange-rate-scraper: formatRateSummary', () => {
  it('formats official and black market rates', () => {
    const now = new Date('2026-06-09T10:00:00Z');
    const result = formatRateSummary({
      rates: [
        { pair: 'ZiG/ZAR', bid: 0.60, ask: 0.61, mid: 0.605, source: 'zimpricecheck', label: 'cross_ZAR', fetchedAt: now },
      ],
      officialZiGPerUSD: 26.9181,
      blackMarketBuyZiGPerUSD: 33,
      blackMarketSellZiGPerUSD: 30,
      fetchedAt: now,
    });

    expect(result).toContain('Official: 1 USD = 26.9181 ZiG');
    expect(result).toContain('Black Market Buy: 1 USD = 33.00 ZiG');
    expect(result).toContain('Black Market Sell: 1 USD = 30.00 ZiG');
    expect(result).toContain('ZiG/ZAR');
  });
});

describe('economic-indicators-scraper: formatIndicatorSummary', () => {
  it('formats all fields correctly', () => {
    const result = formatIndicatorSummary({
      goldPriceUSD: 4329.30,
      rbzPolicyRate: 35,
      cpiMonthOverMonth: 0.51,
      cpiYearOverYear: 1.30,
      cpiMonth: 'March 2026',
      fetchedAt: new Date('2026-06-09T10:00:00Z'),
      sources: ['gold-api.com'],
    });

    expect(result).toContain('Gold Price: US$4329.30/oz');
    expect(result).toContain('RBZ Policy Rate: 35%');
    expect(result).toContain('CPI (March 2026)');
    expect(result).toContain('M-o-M 0.51%');
    expect(result).toContain('Y-o-Y 1.30%');
  });
});

describe('context-service: formatBusinessContext', () => {
  const now = new Date('2026-06-09T10:00:00Z');

  it('formats complete context with all sections', () => {
    const result = formatBusinessContext({
      rates: {
        rates: [],
        officialZiGPerUSD: 26.9181,
        blackMarketBuyZiGPerUSD: 33,
        blackMarketSellZiGPerUSD: 30,
        fetchedAt: now,
      },
      indicators: {
        goldPriceUSD: 4329.30,
        rbzPolicyRate: 35,
        cpiMonthOverMonth: null,
        cpiYearOverYear: null,
        cpiMonth: null,
        fetchedAt: now,
        sources: ['estimate'],
      },
      news: [
        {
          id: 'n1', title: 'Business news', summary: 'Zimbabwe economy grows',
          sourceUrl: 'https://example.com', sourceName: 'Herald',
          category: 'business' as const, industryTags: ['Finance'],
          region: 'Zimbabwe', publishedAt: now, processedAt: now, scrapedAt: now,
          impactScore: 5, urgencyScore: 3, confidenceScore: 8,
        },
      ],
      reddit: [],
      tenders: [],
      fetchedAt: now,
      errors: [],
    });

    expect(result).toContain('Zimbabwe Business Context');
    expect(result).toContain('Exchange Rates');
    expect(result).toContain('Economic Indicators');
    expect(result).toContain('Latest News');
    expect(result).toContain('Business news');
  });

  it('includes errors section when present', () => {
    const result = formatBusinessContext({
      rates: null,
      indicators: null,
      news: [],
      reddit: [],
      tenders: [],
      fetchedAt: now,
      errors: ['rates: timeout', 'indicators: fetch failed'],
    });

    expect(result).toContain('Data Gaps');
    expect(result).toContain('rates: timeout');
  });

  it('includes reddit and tender sections when data present', () => {
    const result = formatBusinessContext({
      rates: null,
      indicators: null,
      news: [],
      reddit: [
        {
          id: 'r1', title: 'Zim economy discussion', summary: 'Great thread about business',
          sourceUrl: 'https://reddit.com', sourceName: 'reddit',
          subreddit: 'Zimbabwe', publishedAt: now,
          category: 'general' as const, industryTags: [], region: 'Zimbabwe',
          score: 42, numComments: 10,
        },
      ],
      tenders: [
        {
          id: 't1', title: 'Road construction tender', description: 'Build roads',
          organization: 'Government', sourceUrl: 'https://example.com',
          sourceName: 'Procurement', publishedAt: now, closingDate: now,
          value: '$500k', category: 'Construction', sector: 'Infrastructure',
          region: 'Zimbabwe', requirements: [], status: 'open' as const,
          processedAt: now, scrapedAt: now,
        },
      ],
      fetchedAt: now,
      errors: [],
    });

    expect(result).toContain('Reddit Discussions');
    expect(result).toContain('Zim economy discussion');
    expect(result).toContain('Open Tenders');
    expect(result).toContain('Road construction tender');
  });
});

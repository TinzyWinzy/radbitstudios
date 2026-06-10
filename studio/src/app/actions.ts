'use server';

import type { NewsArticle } from '@/types/news';
import type { Tender } from '@/services/tender-scraper';
import type { ExchangeRateSnapshot } from '@/services/exchange-rate-scraper';
import type { EconomicIndicators } from '@/services/economic-indicators-scraper';

export async function getLatestNewsAction(options: {
  limit?: number;
  category?: NewsArticle['category'];
  industry?: string;
  region?: string;
} = {}): Promise<NewsArticle[]> {
  const { getLatestNews } = await import('@/services/news-scraper');
  const result = await getLatestNews(options);
  // Serialize dates for client consumption
  return JSON.parse(JSON.stringify(result)) as NewsArticle[];
}

export async function getLatestTendersAction(options: {
  limit?: number;
  sector?: string;
  region?: string;
  status?: Tender['status'];
} = {}): Promise<Tender[]> {
  const { getLatestTenders } = await import('@/services/tender-scraper');
  const result = await getLatestTenders(options);
  return JSON.parse(JSON.stringify(result)) as Tender[];
}

export interface MarketSnapshot {
  exchangeRates: ExchangeRateSnapshot;
  economicIndicators: EconomicIndicators;
  fetchedAt: string;
}

export async function getMarketSnapshotAction(): Promise<MarketSnapshot> {
  const [{ getExchangeRates }, { getEconomicIndicators }] = await Promise.all([
    import('@/services/exchange-rate-scraper'),
    import('@/services/economic-indicators-scraper'),
  ]);

  const [exchangeRates, economicIndicators] = await Promise.all([
    getExchangeRates(),
    getEconomicIndicators(),
  ]);

  return JSON.parse(JSON.stringify({
    exchangeRates,
    economicIndicators,
    fetchedAt: new Date().toISOString(),
  })) as MarketSnapshot;
}

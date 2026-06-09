import { getCached, setCached } from '@/lib/scraper-cache';
import { getExchangeRates, formatRateSummary, type ExchangeRateSnapshot } from '@/services/exchange-rate-scraper';
import { getEconomicIndicators, formatIndicatorSummary, type EconomicIndicators } from '@/services/economic-indicators-scraper';
import { getLatestNews } from '@/services/news-scraper';
import { scrapeAllReddit, type RedditNewsItem } from '@/services/reddit-scraper';
import { getLatestTenders } from '@/services/tender-scraper';
import type { NewsArticle } from '@/types/news';
import type { Tender } from '@/services/tender-scraper';

export interface BusinessContext {
  rates: ExchangeRateSnapshot | null;
  indicators: EconomicIndicators | null;
  news: NewsArticle[];
  reddit: RedditNewsItem[];
  tenders: Tender[];
  fetchedAt: Date;
  errors: string[];
}

export async function getBusinessContext(): Promise<BusinessContext> {
  const cacheKey = 'business:context';
  const cached = getCached<BusinessContext>(cacheKey);
  if (cached && Date.now() - cached.fetchedAt.getTime() < 30 * 60 * 1000) {
    return cached;
  }

  const errors: string[] = [];

  const [rates, indicators, news, reddit, tenders] = await Promise.allSettled([
    getExchangeRates(),
    getEconomicIndicators(),
    getLatestNews({ limit: 10 }),
    scrapeAllReddit(),
    getLatestTenders({ limit: 10, status: 'open' }),
  ]);

  if (rates.status === 'rejected') errors.push(`rates: ${rates.reason}`);
  if (indicators.status === 'rejected') errors.push(`indicators: ${indicators.reason}`);
  if (news.status === 'rejected') errors.push(`news: ${news.reason}`);
  if (reddit.status === 'rejected') errors.push(`reddit: ${reddit.reason}`);
  if (tenders.status === 'rejected') errors.push(`tenders: ${tenders.reason}`);

  const context: BusinessContext = {
    rates: rates.status === 'fulfilled' ? rates.value : null,
    indicators: indicators.status === 'fulfilled' ? indicators.value : null,
    news: news.status === 'fulfilled' ? news.value : [],
    reddit: reddit.status === 'fulfilled' ? reddit.value : [],
    tenders: tenders.status === 'fulfilled' ? tenders.value : [],
    fetchedAt: new Date(),
    errors,
  };

  setCached(cacheKey, context, 30 * 60 * 1000);
  return context;
}

export function formatBusinessContext(context: BusinessContext): string {
  const parts: string[] = [];
  const now = context.fetchedAt.toISOString().slice(0, 16);

  parts.push(`[Zimbabwe Business Context — Updated ${now}]`);

  if (context.rates) {
    parts.push('\n--- Exchange Rates ---');
    parts.push(formatRateSummary(context.rates));
  }

  if (context.indicators) {
    parts.push('\n--- Economic Indicators ---');
    parts.push(formatIndicatorSummary(context.indicators));
  }

  if (context.news.length > 0) {
    parts.push('\n--- Latest News ---');
    for (const article of context.news.slice(0, 5)) {
      const date = article.publishedAt?.toISOString?.()?.slice(0, 10) || '';
      parts.push(`- [${article.category}] ${article.title} (${date})`);
      if (article.summary) parts.push(`  ${article.summary.slice(0, 200)}`);
    }
  }

  if (context.reddit.length > 0) {
    parts.push('\n--- Reddit Discussions ---');
    for (const post of context.reddit.slice(0, 5)) {
      const date = post.publishedAt?.toISOString?.()?.slice(0, 10) || '';
      parts.push(`- r/${post.subreddit}: ${post.title} (${date}, +${post.score})`);
      if (post.summary) parts.push(`  ${post.summary.slice(0, 200)}`);
    }
  }

  if (context.tenders.length > 0) {
    parts.push('\n--- Open Tenders ---');
    for (const tender of context.tenders.slice(0, 5)) {
      const deadline = tender.closingDate?.toISOString?.()?.slice(0, 10) || 'No deadline';
      parts.push(`- ${tender.title} — ${tender.organization} (closes: ${deadline})`);
    }
  }

  if (context.errors.length > 0) {
    parts.push('\n--- Data Gaps ---');
    for (const err of context.errors) {
      parts.push(`- ${err}`);
    }
  }

  return parts.join('\n');
}

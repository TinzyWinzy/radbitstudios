import parser from 'rss-parser';
import crypto from 'crypto';
import { getCached, setCached, checkRateLimit } from '@/lib/scraper-cache';
import { upsertNewsBatch, getNews, newsFromDb, logSync } from '@/lib/sqlite';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'data', 'news-scraper.log');
function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(logFile, line);
  } catch {
    // Ignore log write errors
  }
  console.log(message);
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
  category: 'policy' | 'finance' | 'technology' | 'business' | 'regulatory' | 'general';
  industryTags: string[];
  region: string;
  processedAt: Date;
  scrapedAt: Date;
}

interface FeedConfig {
  url: string;
  sourceName: string;
  region: string;
  industryMapping: Record<string, string[]>;
}

const FEEDS: FeedConfig[] = [
  {
    url: 'https://www.herald.co.zw/feed/',
    sourceName: 'The Herald Zimbabwe',
    region: 'Zimbabwe',
    industryMapping: {
      finance: ['Reserve Bank', 'bond', 'inflation', 'rtgs', 'usd', 'forex', 'deposit', 'loan', 'bank', 'zig'],
      technology: ['ICT', 'EcoCash', 'TelOne', 'NetOne', 'data', 'internet', 'digital'],
      policy: ['government', 'minister', 'zimra', 'budget', 'policy', 'parliament'],
      regulatory: ['ZERA', 'PRA', 'competition', 'licensing', 'regulation', 'court', 'licence'],
      business: ['SME', 'business', 'company', 'startup', 'enterprise'],
    },
  },
  {
    url: 'https://www.businessweekly.co.zw/feed/',
    sourceName: 'Business Weekly Zimbabwe',
    region: 'Zimbabwe',
    industryMapping: {
      finance: ['banking', 'fintech', 'insurance', 'invest', 'stock', 'market', 'JSE'],
      business: ['SME', 'startup', 'enterprise', 'company', 'corporate', 'revenue'],
      technology: ['tech', 'digital', 'AI', 'software', 'innovation', 'cyber'],
    },
  },
  {
    url: 'https://www.praz.org.zw/feed/',
    sourceName: 'PRAZ Zimbabwe',
    region: 'Zimbabwe',
    industryMapping: {
      business: ['SME', 'business', 'company', 'enterprise', 'procurement', 'tender', 'bid'],
      policy: ['government', 'public', 'parliament', 'regulation', 'policy'],
      regulatory: ['PRAZ', 'procurement', 'regulation', 'disposal', 'debarment', 'threshold'],
    },
  },
  {
    url: 'https://bulawayo24.com/',
    sourceName: 'Bulawayo24 News',
    region: 'Zimbabwe',
    industryMapping: {
      business: ['SME', 'business', 'company', 'economy', 'enterprise'],
      policy: ['government', 'minister', 'parliament', 'zimbabwe', 'politics'],
      finance: ['bank', 'inflation', 'currency', ' ZiG', 'forex', 'bond', 'RTGS'],
      technology: ['tech', 'digital', 'AI', 'mobile', 'telecom'],
      regulatory: ['court', 'law', 'regulation', 'licence', 'ZERA', 'PRAZ'],
    },
  },
  {
    url: 'https://www.newsday.co.zw/category/4/business',
    sourceName: 'NewsDay Zimbabwe Business',
    region: 'Zimbabwe',
    industryMapping: {
      business: ['SME', 'business', 'company', 'economy', 'enterprise', 'market'],
      finance: ['bank', 'inflation', 'currency', ' ZiG', 'forex', 'investment'],
      technology: ['tech', 'digital', 'startup', 'software'],
      policy: ['government', 'minister', 'budget', 'policy'],
    },
  },
];

const rssParser = new parser({ timeout: 8000 });

const SECTORS = [
  'Agriculture', 'Retail', 'Manufacturing', 'Technology', 'Financial Services',
  'Healthcare', 'Education', 'Hospitality', 'Tourism', 'Transport', 'Construction',
  'Creative', 'Media', 'Professional Services', 'Mining', 'Energy', 'Telecommunications',
];

function classifyCategory(title: string, content: string, mapping: Record<string, string[]>): NewsArticle['category'] {
  const text = `${title} ${content}`.toLowerCase();
  for (const [category, keywords] of Object.entries(mapping)) {
    if (keywords.some(k => text.includes(k.toLowerCase()))) return category as NewsArticle['category'];
  }
  return 'general';
}

function extractIndustryTags(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  return SECTORS.filter(s =>
    text.includes(s.toLowerCase()) ||
    text.includes(s.split(' ')[0].toLowerCase())
  );
}

function generateId(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}

async function scrapeFeed(feed: FeedConfig): Promise<NewsArticle[]> {
  const rateKey = `rss:${feed.sourceName}`;
  const { allowed } = checkRateLimit(rateKey, 'rss');
  if (!allowed) {
    console.warn(`[NewsScraper] Rate limited for ${feed.sourceName}, skipping.`);
    return [];
  }

  try {
    const parsed = await rssParser.parseURL(feed.url);
    const articles: NewsArticle[] = [];

    for (const item of parsed.items.slice(0, 15)) {
      if (!item.link || !item.title) continue;

      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      const ageHours = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
      if (ageHours > 168) continue; // skip articles older than 7 days

      const content = item.contentSnippet || item.content || item.summary || '';
      const category = classifyCategory(item.title, content, feed.industryMapping);
      const industryTags = extractIndustryTags(item.title, content);

      logToFile(`[scrapeFeed] Item: link=${item.link}, title=${item.title?.slice(0, 50)}`);

      articles.push({
        id: generateId(item.link),
        title: item.title,
        summary: content.slice(0, 600),
        sourceUrl: item.link,
        sourceName: feed.sourceName,
        publishedAt: pubDate,
        category,
        industryTags,
        region: feed.region,
        processedAt: new Date(),
        scrapedAt: new Date(),
      });
    }

    return articles;
  } catch (error) {
    console.error(`[NewsScraper] Failed ${feed.sourceName}:`, error);
    return [];
  }
}

export async function scrapeAllFeeds(): Promise<{ scraped: number; errors: number }> {
  const cacheKey = 'news:scrape:last_run';
  const cached = getCached<{ scraped: number; errors: number }>(cacheKey);
  if (cached) return cached;

  const results = { scraped: 0, errors: 0 };
  const allArticles: Array<{
    id: string;
    title: string;
    summary?: string;
    sourceUrl?: string;
    sourceName?: string;
    publishedAt?: Date;
    category?: string;
    industryTags?: string[];
    region?: string;
  }> = [];

  // Scrape in serial to avoid hammering feeds
  for (const feed of FEEDS) {
    const articles = await scrapeFeed(feed);
    if (articles.length === 0) {
      results.errors++;
      continue;
    }

    allArticles.push(...articles.map(a => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      sourceUrl: a.sourceUrl,
      sourceName: a.sourceName,
      publishedAt: a.publishedAt,
      category: a.category,
      industryTags: a.industryTags,
      region: a.region,
    })));
    results.scraped += articles.length;
  }

  if (allArticles.length > 0) {
    logToFile(`Attempting to save ${allArticles.length} articles to SQLite`);
    logToFile(`First article: ${JSON.stringify({ id: allArticles[0].id, title: allArticles[0].title?.slice(0, 50) })}`);
    logToFile(`All IDs: ${allArticles.map(a => a.id).join(', ')}`);
    try {
      upsertNewsBatch(allArticles);
      logToFile(`Saved ${results.scraped} articles to SQLite`);
      logSync('news', results.scraped, 'success');
    } catch (err: any) {
      results.errors = allArticles.length;
      logToFile(`SQLite write error: ${err.message}`);
      logSync('news', 0, 'error', err.message);
    }
  } else {
    logToFile('No articles to save');
  }

  setCached(cacheKey, results, 15 * 60 * 1000);
  return results;
}

export async function getLatestNews(options: {
  limit?: number;
  category?: NewsArticle['category'];
  industry?: string;
  region?: string;
} = {}): Promise<NewsArticle[]> {
  const { limit: n = 50, category, industry, region } = options;

  const cacheKey = `news:list:${category || 'all'}:${industry || 'all'}:${region || 'all'}:${n}`;
  const cached = getCached<NewsArticle[]>(cacheKey);
  if (cached) return cached;

  const records = getNews({
    limit: 200,
    category: category || undefined,
    region,
  });

  let articles: NewsArticle[] = records.map(newsFromDb);

  if (industry) articles = articles.filter(a =>
    a.industryTags.some(t => t.toLowerCase().includes(industry.toLowerCase()))
  );

  const result = articles.slice(0, n);
  setCached(cacheKey, result, 5 * 60 * 1000);
  return result;
}

export async function getNewsForUser(userId: string): Promise<NewsArticle[]> {
  const cacheKey = `news:user:${userId}`;
  const cached = getCached<NewsArticle[]>(cacheKey);
  if (cached) return cached;

  const records = getNews({ limit: 100 });
  const articles = records
    .map(newsFromDb)
    .slice(0, 15);

  setCached(cacheKey, articles, 10 * 60 * 1000);
  return articles;
}
import parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { getCached, setCached, checkRateLimit } from '@/lib/scraper-cache';
import { saveNews, loadNews, safeNewsFromDb, saveLog } from '@/lib/scraper-storage';
import { scoreBatch } from '@/services/scoring/content-scorer';
import { saveScores, loadScores } from '@/services/scoring/scored-items-store';
import { getActiveSources, recordSourceFetch } from '@/services/discovery/source-store';
import fs from 'fs';
import path from 'path';
import type { NewsArticle } from '@/types/news';

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

export type { NewsArticle };

interface FeedConfig {
  url: string;
  sourceName: string;
  region: string;
  industryMapping: Record<string, string[]>;
  type: 'rss' | 'html';
  _id?: string;
}

const FEEDS: FeedConfig[] = [
  {
    url: 'https://www.herald.co.zw/feed/',
    sourceName: 'The Herald Zimbabwe',
    region: 'Zimbabwe',
    type: 'rss',
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
    type: 'rss',
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
    type: 'rss',
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
    type: 'html',
    industryMapping: {
      business: ['SME', 'business', 'company', 'economy', 'enterprise'],
      policy: ['government', 'minister', 'parliament', 'zimbabwe', 'politics'],
      finance: ['bank', 'inflation', 'currency', 'ZiG', 'forex', 'bond', 'RTGS'],
      technology: ['tech', 'digital', 'AI', 'mobile', 'telecom'],
      regulatory: ['court', 'law', 'regulation', 'licence', 'ZERA', 'PRAZ'],
    },
  },
  {
    url: 'https://www.newsday.co.zw/',
    sourceName: 'NewsDay Zimbabwe',
    region: 'Zimbabwe',
    type: 'html',
    industryMapping: {
      business: ['SME', 'business', 'company', 'economy', 'enterprise', 'market'],
      finance: ['bank', 'inflation', 'currency', 'ZiG', 'forex', 'investment'],
      technology: ['tech', 'digital', 'startup', 'software'],
      policy: ['government', 'minister', 'budget', 'policy'],
    },
  },
  {
    url: 'https://www.sundaymail.co.zw/feed/',
    sourceName: 'The Sunday Mail',
    region: 'Zimbabwe',
    type: 'rss',
    industryMapping: {
      finance: ['Reserve Bank', 'bond', 'inflation', 'rtgs', 'usd', 'forex', 'deposit', 'loan', 'bank'],
      technology: ['ICT', 'EcoCash', 'TelOne', 'NetOne', 'data', 'internet', 'digital'],
      policy: ['government', 'minister', 'zimra', 'budget', 'policy', 'parliament'],
      business: ['SME', 'business', 'company', 'startup', 'enterprise'],
    },
  },
  {
    url: 'https://www.chronicle.co.zw/feed/',
    sourceName: 'The Chronicle',
    region: 'Zimbabwe',
    type: 'rss',
    industryMapping: {
      business: ['SME', 'business', 'company', 'economy', 'enterprise'],
      finance: ['bank', 'inflation', 'currency', 'ZiG', 'forex', 'bond'],
      policy: ['government', 'minister', 'parliament', 'policy'],
    },
  },
  {
    url: 'https://www.thestandard.co.zw/feed/',
    sourceName: 'The Standard',
    region: 'Zimbabwe',
    type: 'rss',
    industryMapping: {
      finance: ['bank', 'inflation', 'currency', 'ZiG', 'forex', 'investment'],
      policy: ['government', 'minister', 'parliament', 'policy'],
      business: ['SME', 'business', 'company', 'economy'],
      technology: ['tech', 'digital', 'software'],
    },
  },
];

// ── rss-parser with custom request headers to avoid 403 ────────────────────
const rssParser = new parser({
  timeout: 15000,
  requestOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
  },
});

const SECTORS = [
  'Agriculture', 'Retail', 'Manufacturing', 'Technology', 'Financial Services',
  'Healthcare', 'Education', 'Hospitality', 'Tourism', 'Transport', 'Construction',
  'Creative', 'Media', 'Professional Services', 'Mining', 'Energy', 'Telecommunications',
];

const INDUSTRY_TO_SECTOR: Record<string, string[]> = {
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

// ── RSS scraping ────────────────────────────────────────────────────────────
async function scrapeRssFeed(feed: FeedConfig): Promise<NewsArticle[]> {
  const rateKey = `rss:${feed.sourceName}`;
  const { allowed } = await checkRateLimit(rateKey, 'rss');
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
  } catch (error: any) {
    console.error(`[NewsScraper] RSS failed ${feed.sourceName}:`, error.message?.slice(0, 100) || error);
    return [];
  }
}

// ── HTML scraping (for sites without proper RSS) ──────────────────────────
async function scrapeHtmlFeed(feed: FeedConfig): Promise<NewsArticle[]> {
  const rateKey = `html:${feed.sourceName}`;
  const { allowed } = await checkRateLimit(rateKey, 'rss');
  if (!allowed) {
    console.warn(`[NewsScraper] Rate limited for ${feed.sourceName}, skipping.`);
    return [];
  }

  try {
    const response = await axios.get(feed.url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      maxRedirects: 5,
    });

    const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    const $ = cheerio.load(html);
    const articles: NewsArticle[] = [];
    const seen = new Set<string>();

    // Try multiple common selectors for article links
    const selectors = [
      'article a[href]',
      '.post a[href]',
      '.entry a[href]',
      '.news-item a[href]',
      '.story a[href]',
      'h2 a[href]',
      'h3 a[href]',
      '.headline a[href]',
      '.title a[href]',
      'a[href*="/202"]',
    ];

    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const href = $(el).attr('href') || '';
        const title = $(el).text().trim().replace(/\s+/g, ' ');
        if (!href || !title || title.length < 10 || title.length > 200) return;
        if (seen.has(href)) return;
        seen.add(href);

        const cleanHref = href.startsWith('http') ? href : new URL(href, feed.url).href;
        const category = classifyCategory(title, '', feed.industryMapping);
        const industryTags = extractIndustryTags(title, '');

        articles.push({
          id: generateId(cleanHref),
          title,
          summary: '',
          sourceUrl: cleanHref,
          sourceName: feed.sourceName,
          publishedAt: new Date(),
          category,
          industryTags,
          region: feed.region,
          processedAt: new Date(),
          scrapedAt: new Date(),
        });
      });

      if (articles.length >= 10) break; // enough articles found
    }

    if (articles.length > 0) {
      console.log(`[NewsScraper] HTML scraped ${articles.length} from ${feed.sourceName}`);
    }
    return articles.slice(0, 15);
  } catch (error: any) {
    console.error(`[NewsScraper] HTML failed ${feed.sourceName}:`, error.message?.slice(0, 100) || error);
    return [];
  }
}

async function scrapeFeed(feed: FeedConfig): Promise<NewsArticle[]> {
  if (feed.type === 'html') {
    return scrapeHtmlFeed(feed);
  }
  return scrapeRssFeed(feed);
}

export async function scrapeAllFeeds(): Promise<{ scraped: number; errors: number; articles: any[] }> {
  const rl = await checkRateLimit('newsScrape', 'newsScrape');
  if (!rl.allowed) {
    console.log('[NewsScraper] Rate limited — skipping scrape (4h window)');
    return { scraped: 0, errors: 0, articles: [] };
  }

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

  // Load feeds from Firestore active_sources, fall back to hardcoded
  let feeds = FEEDS;
  try {
    const active = await getActiveSources();
    if (active.length > 0) {
      feeds = active.map(a => ({
        url: a.feedUrl,
        sourceName: a.name,
        region: a.region || 'Zimbabwe',
        industryMapping: a.industryMapping || {},
        type: (a.type as 'rss' | 'html') || 'rss',
        _id: a.id,
      }));
    }
  } catch {
    console.log('[NewsScraper] Could not load active sources from Firestore, using hardcoded feeds');
  }

  // Scrape in serial to avoid hammering feeds
  for (const feed of feeds) {
    const articles = await scrapeFeed(feed);
    if (articles.length === 0) {
      results.errors++;
      if (feed._id) recordSourceFetch(feed._id, false).catch(e => logToFile(`recordSourceFetch failed: ${e}`));
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
    if (feed._id) recordSourceFetch(feed._id, true).catch(e => logToFile(`recordSourceFetch failed: ${e}`));
  }

  if (allArticles.length > 0) {
    logToFile(`Attempting to save ${allArticles.length} articles to database`);
    logToFile(`First article: ${JSON.stringify({ id: allArticles[0].id, title: allArticles[0].title?.slice(0, 50) })}`);
    try {
      await saveNews(allArticles);
      logToFile(`Saved ${results.scraped} articles`);

      // Score newly saved articles (fire-and-forget)
      scoreBatch(allArticles.map(a => ({
        id: a.id,
        title: a.title,
        summary: a.summary || '',
        sourceUrl: a.sourceUrl || '',
        publishedAt: a.publishedAt || new Date(),
        category: a.category,
        type: 'news' as const,
      }))).then(scored => {
        saveScores(scored.map(s => ({
          contentId: s.id,
          contentType: 'news' as const,
          impactScore: s.scores.impactScore,
          urgencyScore: s.scores.urgencyScore,
          confidenceScore: s.scores.confidenceScore,
          reasoning: s.scores.reasoning,
          scoredAt: new Date().toISOString(),
        }))).catch(e => logToFile(`Score save failed: ${e}`));
      }).catch(e => logToFile(`Score generation failed: ${e}`));

      try { await saveLog('news', results.scraped, 'success'); } catch { /* saveLog failed, ignore */ }
    } catch (err: any) {
      results.errors = allArticles.length;
      logToFile(`Write error: ${err.message}`);
      try { await saveLog('news', 0, 'error', err.message); } catch { /* saveLog failed, ignore */ }
    }
  } else {
    logToFile('No articles to save');
  }

  return { ...results, articles: allArticles.slice(0, 20).map(a => ({
    id: a.id,
    title: a.title,
    summary: a.summary,
    sourceUrl: a.sourceUrl,
    sourceName: a.sourceName,
    publishedAt: a.publishedAt,
    category: a.category,
    industryTags: a.industryTags,
    region: a.region,
  })) };
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

  const records = await loadNews({
    limit: 200,
    category: category || undefined,
    region,
  });

  let articles: NewsArticle[] = records.map(safeNewsFromDb);

  // Enrich with scores
  const scores = await loadScores(articles.map(a => a.id));
  for (const a of articles) {
    const s = scores.get(a.id);
    if (s) {
      a.impactScore = s.impactScore;
      a.urgencyScore = s.urgencyScore;
      a.confidenceScore = s.confidenceScore;
    }
  }

  if (industry) {
    const sectorTags = INDUSTRY_TO_SECTOR[industry] || [industry];
    articles = articles.filter(a =>
      a.industryTags.some(t => sectorTags.some(s => s.toLowerCase() === t.toLowerCase()))
    );
  }

  const result = articles.slice(0, n);
  setCached(cacheKey, result, 5 * 60 * 1000);
  return result;
}

export async function getNewsForUser(userId: string): Promise<NewsArticle[]> {
  const cacheKey = `news:user:${userId}`;
  const cached = getCached<NewsArticle[]>(cacheKey);
  if (cached) return cached;

  const records = await loadNews({ limit: 100 });
  const articles = records
    .map(safeNewsFromDb)
    .slice(0, 15);

  const scores = await loadScores(articles.map(a => a.id));
  for (const a of articles) {
    const s = scores.get(a.id);
    if (s) { a.impactScore = s.impactScore; a.urgencyScore = s.urgencyScore; a.confidenceScore = s.confidenceScore; }
  }

  setCached(cacheKey, articles, 10 * 60 * 1000);
  return articles;
}

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
  type: 'rss' | 'html' | 'json';
  _id?: string;
}

// ── Rich source list: Zimbabwe + Africa ────────────────────────────────────

const FEEDS: FeedConfig[] = [
  // ZIMBABWE — Major Newspapers (RSS)
  {
    url: 'https://www.herald.co.zw/feed/',
    sourceName: 'The Herald Zimbabwe',
    region: 'Zimbabwe',
    type: 'rss',
    industryMapping: {
      finance: ['Reserve Bank', 'bond', 'inflation', 'rtgs', 'usd', 'forex', 'deposit', 'loan', 'bank', 'zig', 'ZiG', 'RBZ', 'MPU'],
      technology: ['ICT', 'EcoCash', 'TelOne', 'NetOne', 'data', 'internet', 'digital', 'mobile', 'fintech'],
      policy: ['government', 'minister', 'zimra', 'budget', 'policy', 'parliament', 'cabinet', 'president'],
      regulatory: ['ZERA', 'PRA', 'competition', 'licensing', 'regulation', 'court', 'licence', 'SI ', 'statutory'],
      business: ['SME', 'business', 'company', 'startup', 'enterprise', 'industry', 'trade'],
    },
  },
  {
    url: 'https://www.businessweekly.co.zw/feed/',
    sourceName: 'Business Weekly Zimbabwe',
    region: 'Zimbabwe',
    type: 'rss',
    industryMapping: {
      finance: ['banking', 'fintech', 'insurance', 'invest', 'stock', 'market', 'JSE', 'ZBSE', 'exchange', 'dividend'],
      business: ['SME', 'startup', 'enterprise', 'company', 'corporate', 'revenue', 'profit', 'turnover'],
      technology: ['tech', 'digital', 'AI', 'software', 'innovation', 'cyber', 'blockchain'],
    },
  },
  {
    url: 'https://www.praz.org.zw/feed/',
    sourceName: 'PRAZ Zimbabwe',
    region: 'Zimbabwe',
    type: 'rss',
    industryMapping: {
      business: ['SME', 'business', 'company', 'enterprise', 'procurement', 'tender', 'bid', 'supplier'],
      policy: ['government', 'public', 'parliament', 'regulation', 'policy', 'public finance'],
      regulatory: ['PRAZ', 'procurement', 'regulation', 'disposal', 'debarment', 'threshold', 'PPA'],
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
      finance: ['bank', 'inflation', 'currency', 'ZiG', 'forex', 'bond', 'RBZ'],
      policy: ['government', 'minister', 'parliament', 'policy', 'cabinet'],
    },
  },
  {
    url: 'https://www.thestandard.co.zw/feed/',
    sourceName: 'The Standard',
    region: 'Zimbabwe',
    type: 'rss',
    industryMapping: {
      finance: ['bank', 'inflation', 'currency', 'ZiG', 'forex', 'investment', 'IMF', 'World Bank'],
      policy: ['government', 'minister', 'parliament', 'policy', 'corruption', 'audit'],
      business: ['SME', 'business', 'company', 'economy', 'rights', 'workers'],
      technology: ['tech', 'digital', 'software'],
    },
  },

  // ZIMBABWE — HTML scrapers (sites without proper RSS)
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
    url: 'https://www.zimlive.com/',
    sourceName: 'ZimLive',
    region: 'Zimbabwe',
    type: 'html',
    industryMapping: {
      policy: ['government', 'minister', 'parliament', 'zimbabwe', 'politics', 'election', 'opposition'],
      business: ['SME', 'business', 'company', 'economy'],
      finance: ['bank', 'inflation', 'currency', 'ZiG', 'forex'],
    },
  },
  {
    url: 'https://techzim.co.zw/',
    sourceName: 'TechZim',
    region: 'Zimbabwe',
    type: 'html',
    industryMapping: {
      technology: ['tech', 'ICT', 'internet', 'mobile', 'fintech', 'startup', 'software', 'AI', 'digital', 'Econet', 'NetOne', 'Telecel', 'Cassava', 'EcoCash'],
      finance: ['EcoCash', 'mobile money', 'fintech', 'banking', 'RBZ', 'digital payments'],
      business: ['SME', 'startup', 'entrepreneur', 'business'],
    },
  },
  {
    url: 'https://www.263chat.com/',
    sourceName: '263Chat',
    region: 'Zimbabwe',
    type: 'html',
    industryMapping: {
      business: ['SME', 'business', 'company', 'entrepreneur', 'startup'],
      finance: ['bank', 'inflation', 'currency', 'ZiG', 'forex', 'investment'],
      technology: ['tech', 'digital', 'ICT'],
      policy: ['government', 'minister', 'parliament', 'policy'],
    },
  },

  // SOUTH AFRICA — Business & Finance
  {
    url: 'https://mg.co.za/rss-feeds/',
    sourceName: 'Mail & Guardian',
    region: 'South Africa',
    type: 'rss',
    industryMapping: {
      policy: ['government', 'minister', 'parliament', 'policy', 'anc', 'election', 'corruption'],
      finance: ['bank', 'JSE', 'reserve bank', 'inflation', 'rand', 'investment'],
      business: ['SME', 'business', 'company', 'corporate', 'mining', 'energy'],
      technology: ['tech', 'digital', 'AI', 'software'],
    },
  },
  {
    url: 'https://www.businessday.co.za/feed/',
    sourceName: 'Business Day SA',
    region: 'South Africa',
    type: 'rss',
    industryMapping: {
      finance: ['JSE', 'bank', 'reserve bank', 'inflation', 'rand', 'investment', 'stock', 'market'],
      business: ['SME', 'business', 'company', 'corporate', 'mining', 'retail'],
      policy: ['government', 'minister', 'parliament', 'policy', 'regulation'],
    },
  },
  {
    url: 'https://www.dailymaverick.co.za/rss/',
    sourceName: 'Daily Maverick',
    region: 'South Africa',
    type: 'rss',
    industryMapping: {
      policy: ['government', 'minister', 'parliament', 'policy', 'corruption', 'state capture'],
      finance: ['bank', 'JSE', 'reserve bank', 'inflation', 'rand'],
      business: ['SME', 'business', 'company', 'corporate', 'mining'],
    },
  },
  {
    url: 'https://www.news24.com/page/rss/0,,2-1841,00.xml',
    sourceName: 'News24 Business',
    region: 'South Africa',
    type: 'rss',
    industryMapping: {
      finance: ['JSE', 'bank', 'reserve bank', 'inflation', 'rand', 'investment'],
      business: ['SME', 'business', 'company', 'corporate', 'retail', 'property'],
      technology: ['tech', 'digital', 'AI', 'software', 'telecom'],
    },
  },
  {
    url: 'https://techcrunch.com/category/startups/feed/',
    sourceName: 'TechCrunch Startups',
    region: 'Global',
    type: 'rss',
    industryMapping: {
      technology: ['startup', 'venture', 'funding', 'Series A', 'Series B', 'IPO', 'AI', 'SaaS', 'app', 'platform'],
      business: ['SME', 'entrepreneur', 'founder', 'scaleup'],
      finance: ['funding', 'investment', 'VC', 'venture capital', 'valuation'],
    },
  },

  // EAST AFRICA
  {
    url: 'https://www.theeastafrican.co.ke/rss.xml',
    sourceName: 'The East African',
    region: 'East Africa',
    type: 'rss',
    industryMapping: {
      business: ['SME', 'business', 'company', 'trade', 'EAC', 'export', 'import'],
      finance: ['bank', 'inflation', 'currency', 'forex', 'investment', 'IMF', 'World Bank'],
      policy: ['government', 'minister', 'parliament', 'policy', 'EAC', 'integration'],
      technology: ['tech', 'digital', 'mobile money', 'M-Pesa', 'fintech'],
    },
  },
  {
    url: 'https://nation.africa/kenya/rss.xml',
    sourceName: 'Daily Nation Kenya',
    region: 'Kenya',
    type: 'rss',
    industryMapping: {
      business: ['SME', 'business', 'company', 'trade'],
      finance: ['bank', 'CBK', 'inflation', 'currency', 'forex', 'investment'],
      technology: ['tech', 'digital', 'M-Pesa', 'Safaricom', 'fintech', 'mobile money'],
      policy: ['government', 'minister', 'parliament', 'policy'],
    },
  },

  // WEST AFRICA
  {
    url: 'https://www.premiumtimesng.com/feed',
    sourceName: 'Premium Times Nigeria',
    region: 'Nigeria',
    type: 'rss',
    industryMapping: {
      policy: ['government', 'minister', 'parliament', 'policy', 'election', ' Buhari', 'Tinubu'],
      finance: ['bank', 'CBN', 'inflation', 'naira', 'forex', 'investment', 'oil', 'gas'],
      business: ['SME', 'business', 'company', 'trade', 'agriculture'],
      technology: ['tech', 'digital', 'fintech', 'Flutterwave', 'Paystack', 'startup'],
    },
  },
  {
    url: 'https://techcabal.com/feed/',
    sourceName: 'TechCabal',
    region: 'Africa',
    type: 'rss',
    industryMapping: {
      technology: ['startup', 'fintech', 'tech', 'digital', 'AI', 'SaaS', 'app', 'venture', 'funding'],
      finance: ['funding', 'investment', 'VC', 'venture capital', 'acquisition', 'IPO'],
      business: ['SME', 'entrepreneur', 'founder', 'scaleup', 'business'],
    },
  },

  // PAN-AFRICAN / GLOBAL AFRICA FOCUS
  {
    url: 'https://qz.com/africa/feed',
    sourceName: 'Quartz Africa',
    region: 'Africa',
    type: 'rss',
    industryMapping: {
      business: ['SME', 'business', 'company', 'trade', 'AFCFTA', 'industry'],
      finance: ['bank', 'inflation', 'currency', 'forex', 'investment', 'fintech'],
      technology: ['tech', 'digital', 'AI', 'startup', 'mobile money'],
      policy: ['government', 'minister', 'African Union', 'policy', 'AFCFTA'],
    },
  },
  {
    url: 'https://www.howwemadeitinafrica.com/feed/',
    sourceName: 'How We Made It In Africa',
    region: 'Africa',
    type: 'rss',
    industryMapping: {
      business: ['SME', 'entrepreneur', 'company', 'investment', 'manufacturing', 'agriculture', 'retail'],
      finance: ['investment', 'private equity', 'funding', 'bank'],
      policy: ['government', 'policy', 'AFCFTA', 'trade'],
    },
  },
  {
    url: 'https:// disrupt-africa.com/feed/',
    sourceName: 'Disrupt Africa',
    region: 'Africa',
    type: 'rss',
    industryMapping: {
      technology: ['startup', 'fintech', 'tech', 'digital', 'AI', 'SaaS', 'venture', 'funding'],
      finance: ['funding', 'investment', 'VC', 'venture capital', 'seed', 'Series A'],
      business: ['SME', 'entrepreneur', 'founder', 'scaleup'],
    },
  },
  {
    url: 'https://www.businessinsider.co.za/rss',
    sourceName: 'Business Insider Africa',
    region: 'Africa',
    type: 'rss',
    industryMapping: {
      finance: ['bank', 'JSE', 'investment', 'rand', 'inflation', 'forex'],
      business: ['SME', 'business', 'company', 'retail', 'property'],
      technology: ['tech', 'digital', 'AI', 'fintech', 'startup'],
    },
  },

  // DEVELOPMENT / POLICY
  {
    url: 'https://www.afdb.org/en/news-and-events/rss-feeds/news-rss-feed',
    sourceName: 'African Development Bank',
    region: 'Africa',
    type: 'rss',
    industryMapping: {
      finance: ['AfDB', 'investment', 'loan', 'grant', 'development finance', 'infrastructure'],
      policy: ['government', 'policy', 'African Union', 'development', 'sustainable'],
      business: ['SME', 'business', 'company', 'trade', 'AFCFTA'],
      technology: ['tech', 'digital', 'infrastructure', 'energy', 'power'],
    },
  },
  {
    url: 'https://www.worldbank.org/en/region/afr/rss.xml',
    sourceName: 'World Bank Africa',
    region: 'Africa',
    type: 'rss',
    industryMapping: {
      finance: ['World Bank', 'IMF', 'investment', 'loan', 'grant', 'development'],
      policy: ['government', 'policy', 'development', 'poverty', 'sustainable', 'SDG'],
      business: ['SME', 'business', 'trade', 'AFCFTA'],
    },
  },
  {
    url: 'https://www.imf.org/en/Publications/RSS?lang=eng&series=IMF%20Staff%20Country%20Reports',
    sourceName: 'IMF Africa Reports',
    region: 'Africa',
    type: 'rss',
    industryMapping: {
      finance: ['IMF', 'macroeconomic', 'inflation', 'currency', 'fiscal', 'debt', 'budget'],
      policy: ['government', 'policy', 'reform', 'structural adjustment', ' Article IV'],
    },
  },
];

// ── rss-parser with custom request headers ──────────────────────────────────
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message.slice(0, 100) : String(error);
    console.error(`[NewsScraper] RSS failed ${feed.sourceName}:`, message);
    return [];
  }
}

// ── HTML scraping ──────────────────────────────────────────────────────────
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
      '.latest-news a[href]',
      '.news-list a[href]',
      '.article-title a[href]',
    ];

    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const href = $(el).attr('href') || '';
        const title = $(el).text().trim().replace(/\s+/g, ' ');
        if (!href || !title || title.length < 10 || title.length > 200) return;
        if (seen.has(href)) return;
        seen.add(href);

        try {
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
        } catch {
          // Invalid URL, skip
        }
      });

      if (articles.length >= 10) break;
    }

    if (articles.length > 0) {
      console.log(`[NewsScraper] HTML scraped ${articles.length} from ${feed.sourceName}`);
    }
    return articles.slice(0, 15);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message.slice(0, 100) : String(error);
    console.error(`[NewsScraper] HTML failed ${feed.sourceName}:`, message);
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
        type: ((a as any).type as 'rss' | 'html') || 'rss',
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
      (a.industryTags || []).some(t => sectorTags.some(s => s.toLowerCase() === t.toLowerCase()))
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

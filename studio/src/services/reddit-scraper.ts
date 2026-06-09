import { checkRateLimit } from '@/lib/scraper-cache';
import crypto from 'crypto';

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  url: string;
  subreddit: string;
  score: number;
  numComments: number;
  createdUtc: number;
  permalink: string;
}

export interface RedditNewsItem {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  subreddit: string;
  publishedAt: Date;
  category: 'policy' | 'finance' | 'technology' | 'business' | 'regulatory' | 'general';
  industryTags: string[];
  region: string;
  score: number;
  numComments: number;
}

const SUBREDDITS = [
  { name: 'Zimbabwe', region: 'Zimbabwe' },
  { name: 'zim', region: 'Zimbabwe' },
  { name: 'AfricaBusiness', region: 'Africa' },
  { name: 'SmallBusiness', region: 'Global' },
  { name: 'Entrepreneur', region: 'Global' },
  { name: 'Startups', region: 'Global' },
];

function generateId(title: string): string {
  return crypto.createHash('md5').update(title).digest('hex');
}

function classifySubmission(title: string, selftext: string): RedditNewsItem['category'] {
  const text = `${title} ${selftext}`.toLowerCase();
  if (/\b(reserve bank|inflation|forex|zig|usd|zimra|tax|finance|bank|investment|stock|market|rbz)\b/.test(text)) return 'finance';
  if (/\b(tech|ict|digital|software|startup|ai|fintech|blockchain|mobile|app)\b/.test(text)) return 'technology';
  if (/\b(government|minister|policy|parliament|regulation|law|bill|act|si\b)\b/.test(text)) return 'policy';
  if (/\b(regulatory|compliance|licence|license|praz|zera|competition)\b/.test(text)) return 'regulatory';
  if (/\b(sme|business|small business|entrepreneur|company|enterprise|trade|export|import)\b/.test(text)) return 'business';
  return 'general';
}

function extractIndustryTags(title: string, selftext: string): string[] {
  const text = `${title} ${selftext}`.toLowerCase();
  const sectors = [
    'Agriculture', 'Retail', 'Manufacturing', 'Technology', 'Financial Services',
    'Healthcare', 'Education', 'Hospitality', 'Tourism', 'Transport', 'Construction',
    'Creative', 'Media', 'Professional Services', 'Mining', 'Energy', 'Telecommunications',
  ];
  return sectors.filter(s =>
    text.includes(s.toLowerCase()) || text.includes(s.split(' ')[0].toLowerCase()),
  );
}

export async function scrapeReddit(subreddit: string, region: string): Promise<RedditNewsItem[]> {
  const rateKey = `reddit:${subreddit}`;
  const { allowed } = await checkRateLimit(rateKey, 'api');
  if (!allowed) return [];

  try {
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RadbitSME/1.0)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!res.ok) return [];
    const data = await res.json();

    const items: RedditPost[] = data?.data?.children
      ?.map((c: any) => c?.data)
      ?.filter((d: any) => d && !d.stickied && !d.over_18) || [];

    return items.slice(0, 15).map((post: RedditPost) => {
      const title = post.title || '';
      const selftext = (post.selftext || '').slice(0, 300);
      const summary = selftext || `Discussion on r/${post.subreddit} — ${post.score} points, ${post.numComments} comments`;

      return {
        id: generateId(title + post.url),
        title,
        summary,
        sourceUrl: `https://reddit.com${post.permalink}`,
        sourceName: `r/${post.subreddit}`,
        subreddit: post.subreddit,
        publishedAt: new Date(post.createdUtc * 1000),
        category: classifySubmission(title, selftext),
        industryTags: extractIndustryTags(title, selftext),
        region,
        score: post.score || 0,
        numComments: post.numComments || 0,
      };
    });
  } catch {
    return [];
  }
}

export async function scrapeAllReddit(): Promise<RedditNewsItem[]> {
  const all: RedditNewsItem[] = [];

  const results = await Promise.allSettled(
    SUBREDDITS.map(sr => scrapeReddit(sr.name, sr.region)),
  );

  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value);
  }

  const seen = new Map<string, RedditNewsItem>();
  for (const item of all) {
    const key = item.id;
    if (!seen.has(key) || seen.get(key)!.score < item.score) {
      seen.set(key, item);
    }
  }

  return Array.from(seen.values()).sort((a, b) => b.score - a.score);
}

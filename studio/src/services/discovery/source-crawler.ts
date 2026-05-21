export interface DiscoveredSource {
  id: string;
  url: string;
  name: string;
  feedUrl: string | null;
  region: string;
  description: string;
  relevanceScore: number;
  qualityScore: number;
  updateFrequency: 'daily' | 'weekly' | 'monthly' | 'unknown';
  reasonForSelection: string;
  discoveredAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
}

const SEED_DOMAINS = [
  'herald.co.zw',
  'chronicle.co.zw',
  'newsday.co.zw',
  'bulawayo24.com',
  'techzim.co.zw',
  'finx.co.zw',
  'thezimbabwemail.co.zw',
  'zimeye.net',
  'southerneye.co.zw',
  'dailynews.co.zw',
  'zbcnews.co.zw',
  '263chat.com',
  'businessweekly.co.zw',
  'praz.org.zw',
];

const RSS_PATHS = ['/feed/', '/rss/', '/news.xml', '/feed.xml', '/rss.xml', '/atom.xml', '/news/feed/'];

async function findFeedUrl(domain: string): Promise<string | null> {
  for (const path of RSS_PATHS) {
    try {
      const url = `https://${domain}${path}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const text = await res.text();
        if (text.includes('<rss') || text.includes('<feed') || text.includes('<rdf:RDF')) {
          return url;
        }
      }
    } catch {
      continue;
    }
  }

  try {
    const url = `https://${domain}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const html = await res.text();
      const feedLinks = html.match(/<link[^>]*(?:type\s*=\s*["']application\/(?:rss|atom)\+xml["'])[^>]*href\s*=\s*["']([^"']+)["'][^>]*\/?>/gi);
      if (feedLinks && feedLinks.length > 0) {
        const match = feedLinks[0].match(/href\s*=\s*["']([^"']+)["']/);
        if (match) {
          const feedUrl = match[1].startsWith('http') ? match[1] : `https://${domain}${match[1]}`;
          return feedUrl;
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

export async function crawlForSources(): Promise<DiscoveredSource[]> {
  const discovered: DiscoveredSource[] = [];
  const visited = new Set<string>();

  const toVisit = [...SEED_DOMAINS];

  while (toVisit.length > 0 && visited.size < 30) {
    const domain = toVisit.shift()!;
    if (visited.has(domain)) continue;
    visited.add(domain);

    const feedUrl = await findFeedUrl(domain);

    try {
      const res = await fetch(`https://${domain}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const html = await res.text();

      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descMatch = html.match(/<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*\/?>/i) ||
                        html.match(/<meta[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*\/?>/i);

      discovered.push({
        id: domain.replace(/[^a-zA-Z0-9]/g, '_'),
        url: `https://${domain}`,
        name: titleMatch ? titleMatch[1].split('|')[0].split('-')[0].trim() : domain,
        feedUrl,
        region: 'Zimbabwe',
        description: descMatch ? descMatch[1].slice(0, 300) : '',
        relevanceScore: 50,
        qualityScore: 50,
        updateFrequency: 'unknown',
        reasonForSelection: seedDomains.includes(domain) ? 'Seed domain' : 'Discovered via crawl',
        discoveredAt: new Date().toISOString(),
        status: 'pending',
      });

      const links = [...html.matchAll(/<a[^>]*href\s*=\s*["']https?:\/\/([^"'\s\/]+)["'][^>]*>/gi)];
      for (const link of links) {
        const linkedDomain = link[1].replace('www.', '');
        if (!visited.has(linkedDomain) && !toVisit.includes(linkedDomain) &&
            (linkedDomain.endsWith('.co.zw') || linkedDomain.endsWith('.org.zw') ||
             linkedDomain.endsWith('.ac.zw') || linkedDomain.endsWith('.gov.zw') ||
             linkedDomain.endsWith('.zw'))) {
          toVisit.push(linkedDomain);
        }
      }
    } catch {
      continue;
    }
  }

  return discovered;
}

const seedDomains = SEED_DOMAINS;
export { SEED_DOMAINS };

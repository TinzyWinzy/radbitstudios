import axios from 'axios';
import * as cheerio from 'cheerio';
import { checkRateLimit } from '@/lib/scraper-cache';
import {
  type Tender,
  type TenderSourceConfig,
  enrichTender,
  createLog,
} from './types';

const log = (tag: string, msg: string) => createLog(tag, msg);

function parseHtml(html: string): cheerio.CheerioAPI {
  return cheerio.load(typeof html === 'string' ? html : JSON.stringify(html));
}

function resolveHref(href: string, base: string): string {
  if (!href || href === '#' || href === '/') return '';
  return href.startsWith('http') ? href : `${base}${href}`;
}

async function fetchPage(url: string, timeout = 15000): Promise<string | null> {
  try {
    const r = await axios.get(url, {
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html, application/rss+xml, application/xml, */*',
      },
    });
    return typeof r.data === 'string' ? r.data : JSON.stringify(r.data);
  } catch {
    return null;
  }
}

function scrapeHtmlTable(config: TenderSourceConfig, $: cheerio.CheerioAPI): Tender[] {
  const results: Tender[] = [];
  const seen = new Set<string>();
  const rowSel = config.rowSelector || 'table tbody tr, table tr';
  const hrefBase = config.hrefBase || config.baseUrl;

  $(rowSel).each((_, row) => {
    const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get();
    const link = $(row).find('a[href]').first();
    const linkText = link.text().trim().replace(/\s+/g, ' ');
    const linkHref = link.attr('href') || '';

    if (cells.length < 2 || !linkHref || linkHref === '#' || linkHref === '/') return;

    const title = linkText || cells[0];
    const fullHref = resolveHref(linkHref, hrefBase);
    const key = fullHref.toLowerCase();
    if (seen.has(key) || !title || title.length < 3) return;
    seen.add(key);

    let closingDate: Date | null = null;
    for (const cell of cells) {
      const match = cell.match(/(?:close|deadline|due)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
      if (match) {
        try { closingDate = new Date(match[1]); } catch { /* ignore */ }
        break;
      }
    }

    results.push(enrichTender({
      title: title.slice(0, 200),
      description: cells.join(' | '),
      organization: config.organization,
      sourceUrl: fullHref,
      closingDate,
      value: null,
      sector: config.sector || '',
      category: config.category,
      requirements: config.requirements || [],
      region: config.region || 'Zimbabwe',
      sourceName: config.name,
    }));
  });

  return results;
}

function scrapeHtmlLinks(config: TenderSourceConfig, $: cheerio.CheerioAPI): Tender[] {
  const results: Tender[] = [];
  const seen = new Set<string>();
  const hrefBase = config.hrefBase || config.baseUrl;
  const linkFilter = config.linkFilter || 'a[href]';

  $(linkFilter).each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (!href || !text || text.length < 5 || href === '#') return;

    const fullHref = resolveHref(href, hrefBase);
    const key = fullHref.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    results.push(enrichTender({
      title: text.slice(0, 200),
      description: `${config.displayName}: ${text}`,
      organization: config.organization,
      sourceUrl: fullHref,
      closingDate: null,
      value: null,
      sector: config.sector || '',
      category: config.category,
      requirements: config.requirements || [],
      region: config.region || 'Zimbabwe',
      sourceName: config.name,
    }));
  });

  return results;
}

function scrapeHtmlDivs(config: TenderSourceConfig, $: cheerio.CheerioAPI): Tender[] {
  const results: Tender[] = [];
  const seen = new Set<string>();
  const hrefBase = config.hrefBase || config.baseUrl;

  $('div[id*="tender"], div[class*="tender"], tr[class*="tender"], .notice-item, .tender-row').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (!text || text.length < 20) return;

    const summaryMatch = text.match(/Summary:\s*([^\n]+)/i);
    const countryMatch = text.match(/Country:\s*([^\n]+)/i);
    const deadlineMatch = text.match(/Deadline:\s*([^\n]+)/i);
    const noticeMatch = text.match(/Notice Type:\s*([^\n]+)/i);
    const postingMatch = text.match(/Posting Date:\s*([^\n]+)/i);
    const link = $(el).find('a[href]').first();
    const href = link.attr('href') || '';

    const title = summaryMatch?.[1]?.trim() || link.text().trim() || text.slice(0, 100);
    const key = (href + title.slice(0, 60)).toLowerCase();
    if (seen.has(key) || !title || title.length < 5) return;
    seen.add(key);

    const cleanHref = resolveHref(href, hrefBase);
    let closingDate: Date | null = null;
    if (deadlineMatch) {
      const parsed = new Date(deadlineMatch[1].trim());
      if (!isNaN(parsed.getTime())) closingDate = parsed;
    }

    results.push(enrichTender({
      title: title.slice(0, 200),
      description: text.slice(0, 500),
      organization: countryMatch?.[1]?.trim() || config.organization,
      sourceUrl: cleanHref,
      closingDate,
      value: null,
      sector: config.sector || '',
      category: noticeMatch?.[1]?.trim() || config.category,
      requirements: config.requirements || [],
      region: config.region || 'Zimbabwe',
      sourceName: config.name,
      publishedAt: postingMatch ? new Date(postingMatch[1].trim()) : undefined,
    }));
  });

  return results;
}

function parseRssFeed(config: TenderSourceConfig, xml: string): Tender[] {
  const results: Tender[] = [];
  const seen = new Set<string>();

  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descMatch = itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
    const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const pubDateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);

    let title = titleMatch?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() || '';
    const description = descMatch?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim() || '';
    const link = linkMatch?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() || '';
    const pubDate = pubDateMatch?.[1]?.trim() || '';

    if (!title || title.length < 5) continue;

    title = title.replace(/&#8211;/g, '–').replace(/&#8212;/g, '—').replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/\n/g, ' ');

    const key = (link + title.slice(0, 60)).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    let publishedAt: Date | undefined;
    if (pubDate) {
      try { publishedAt = new Date(pubDate); } catch { /* ignore */ }
    }

    results.push(enrichTender({
      title: title.slice(0, 200),
      description: description.slice(0, 500) || title,
      organization: config.organization,
      sourceUrl: link,
      closingDate: null,
      value: null,
      sector: config.sector || '',
      category: config.category,
      requirements: config.requirements || [],
      region: config.region || 'Zimbabwe',
      sourceName: config.name,
      publishedAt,
    }));
  }

  return results;
}

export async function scrapeSource(config: TenderSourceConfig): Promise<Tender[]> {
  const { allowed } = await checkRateLimit(`tender:${config.name}`, 'tender');
  if (!allowed) return [];

  if (config.strategy === 'custom' && config.customParser) {
    const { customScrapers } = await import('./custom-parsers');
    const parser = customScrapers[config.customParser];
    if (parser) return parser(config);
    console.warn(log(config.name, `Custom parser '${config.customParser}' not found`));
    return [];
  }

  const url = config.strategy === 'rss' ? (config.rssUrl || config.url) : config.url;
  const html = await fetchPage(url, config.timeout);
  if (!html) {
    console.warn(log(config.name, 'Fetch failed'));
    return [];
  }

  let results: Tender[];
  switch (config.strategy) {
    case 'html-table': {
      const $ = parseHtml(html);
      results = scrapeHtmlTable(config, $);
      break;
    }
    case 'html-links': {
      const $ = parseHtml(html);
      results = scrapeHtmlLinks(config, $);
      break;
    }
    case 'html-divs': {
      const $ = parseHtml(html);
      results = scrapeHtmlDivs(config, $);
      break;
    }
    case 'rss': {
      results = parseRssFeed(config, html);
      break;
    }
    default:
      results = [];
  }

  if (results.length > 0) {
    console.log(log(config.name, `Scraped ${results.length} tenders`));
  }
  return results;
}

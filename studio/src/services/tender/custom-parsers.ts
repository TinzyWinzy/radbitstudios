import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  type Tender,
  type TenderSourceConfig,
  enrichTender,
  classifySector,
} from './types';

type CustomParser = (config: TenderSourceConfig) => Promise<Tender[]>;

function parseHtml(html: string): cheerio.CheerioAPI {
  return cheerio.load(typeof html === 'string' ? html : JSON.stringify(html));
}

const saETenders: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  try {
    const r = await axios.get(config.url, {
      timeout: config.timeout || 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    // Table rows
    $('table tbody tr, table tr, .tender-item, .notice-item').each((_, row) => {
      const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get();
      const link = $(row).find('a[href]').first();
      const linkHref = link.attr('href') || '';
      const linkText = link.text().trim().replace(/\s+/g, ' ');

      if (!linkHref || linkHref === '#' || linkHref === '/') return;

      const title = linkText || cells[0];
      if (!title || title.length < 3) return;

      const fullHref = linkHref.startsWith('http') ? linkHref : `${config.baseUrl}${linkHref}`;
      const key = fullHref.toLowerCase();
      if (seen.has(key)) return;
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
        title,
        description: cells.join(' | '),
        organization: config.organization,
        sourceUrl: fullHref,
        closingDate,
        value: null,
        sector: classifySector(title),
        category: config.category,
        requirements: [],
        region: config.region || 'South Africa',
        sourceName: config.name,
      }));
    });

    // Standalone links
    const standaloneLinks = $('a[href]').filter((_, el) => {
      const href = $(el).attr('href') || '';
      return Boolean(href.match(/tender|bid|rfq|procurement|notice/i) && !href.match(/login|register|signin|#/i));
    }).map((_, el) => ({ text: $(el).text().trim(), href: $(el).attr('href') ?? '' })).get();

    for (const link of standaloneLinks.slice(0, 10)) {
      const fullHref = link.href.startsWith('http') ? link.href : `${config.baseUrl}${link.href}`;
      const key = fullHref.toLowerCase();
      if (seen.has(key) || !link.text || link.text.length < 3) continue;
      seen.add(key);

      results.push(enrichTender({
        title: link.text,
        description: `${config.displayName}: ${link.text}`,
        organization: config.organization,
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: classifySector(link.text),
        category: config.category,
        requirements: [],
        region: config.region || 'South Africa',
        sourceName: config.name,
      }));
    }

    if (results.length > 0) console.log(`[TenderScraper] ${config.name}: scraped ${results.length} tenders`);
  } catch (error: unknown) {
    console.warn(`[TenderScraper] ${config.name} failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }
  return results;
};

const afdb: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  try {
    const r = await axios.get(config.url, {
      timeout: config.timeout || 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    $('table tbody tr, table tr, .views-row, .node').each((_, row) => {
      const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get();
      const link = $(row).find('a[href]').first();
      const linkText = link.text().trim();
      const linkHref = link.attr('href') || '';

      if (!linkHref || linkHref === '#' || linkHref === '/') return;
      const title = linkText || cells[0];
      if (!title || title.length < 5) return;

      const fullHref = linkHref.startsWith('http') ? linkHref : `${config.baseUrl}${linkHref}`;
      const key = fullHref.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      let closingDate: Date | null = null;
      for (const cell of cells) {
        const match = cell.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (match) { try { closingDate = new Date(match[1]); } catch { /* ignore */ } break; }
      }

      results.push(enrichTender({
        title,
        description: cells.join(' | ') || `AfDB tender: ${title}`,
        organization: config.organization,
        sourceUrl: fullHref,
        closingDate,
        value: null,
        sector: classifySector(title),
        category: config.category,
        requirements: config.requirements || [],
        region: config.region || 'Africa',
        sourceName: config.name,
      }));
    });

    if (results.length > 0) console.log(`[TenderScraper] ${config.name}: ${results.length} tenders`);
  } catch (error: unknown) {
    console.warn(`[TenderScraper] ${config.name} failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }
  return results;
};

const onlineTenders: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  try {
    const r = await axios.get(config.url, {
      timeout: config.timeout || 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    $('table tbody tr, table tr, .tender-item, .listing-row').each((_, row) => {
      const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get();
      const links = $(row).find('a[href]');
      const link = links.first();
      const href = link.attr('href') || '';

      if (cells.length < 2) return;

      const contractNo = cells[0] || '';
      const description = cells[1] || '';
      const closingDateStr = cells[cells.length - 1] || '';
      const key = (href + contractNo + description.slice(0, 40)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const title = description.length > 10 ? description.slice(0, 200) : contractNo;
      const cleanHref = href.startsWith('http') ? href : `${config.baseUrl}${href}`;
      let closingDate: Date | null = null;
      const dateMatch = closingDateStr.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) closingDate = new Date(dateMatch[1]);

      if (title && title.length > 5 && !title.toLowerCase().includes('login') && !title.toLowerCase().includes('subscribe')) {
        results.push(enrichTender({
          title,
          description: description.slice(0, 500),
          organization: config.organization,
          sourceUrl: cleanHref,
          closingDate,
          value: null,
          sector: classifySector(title + ' ' + description),
          category: config.category,
          requirements: [],
          region: config.region || 'Zimbabwe',
          sourceName: config.name,
        }));
      }
    });

    if (results.length > 0) console.log(`[TenderScraper] ${config.name}: ${results.length} items`);
  } catch (error: unknown) {
    console.warn(`[TenderScraper] ${config.name} failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }
  return results;
};

const bidDetail: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  try {
    const r = await axios.get(config.url, {
      timeout: config.timeout || 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    $('.tender-box, .listing-item, .item-row, tr, div[class*="tender"]').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      const link = $(el).find('a[href]').first();
      const href = link.attr('href') || '';
      const linkText = link.text().trim();

      if (!text || text.length < 15) return;
      const key = (href + text.slice(0, 60)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const title = linkText || text.split('.').slice(0, 2).join('.').trim().slice(0, 200);
      const cleanHref = href.startsWith('http') ? href : `${config.baseUrl}${href}`;
      const dateMatch = text.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i);
      let closingDate: Date | null = null;
      if (dateMatch) closingDate = new Date(dateMatch[1]);

      if (title && title.length > 5 && !title.toLowerCase().includes('login') && !title.toLowerCase().includes('subscribe')) {
        results.push(enrichTender({
          title: title.slice(0, 200),
          description: text.slice(0, 500),
          organization: config.organization,
          sourceUrl: cleanHref,
          closingDate,
          value: null,
          sector: classifySector(title),
          category: config.category,
          requirements: [],
          region: config.region || 'Zimbabwe',
          sourceName: config.name,
        }));
      }
    });

    if (results.length > 0) console.log(`[TenderScraper] ${config.name}: ${results.length} items`);
  } catch (error: unknown) {
    console.warn(`[TenderScraper] ${config.name} failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }
  return results;
};

const tenderInfoOrg: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  try {
    const r = await axios.get(config.url, {
      timeout: config.timeout || 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    $('div[class*="tender"], .notice-item, .row, tr').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      const link = $(el).find('a[href]').first();
      const href = link.attr('href') || '';
      const linkText = link.text().trim();

      if (!text || text.length < 15) return;
      const title = linkText || text.split('(')[0].trim().slice(0, 200);
      const key = (href + title.slice(0, 60)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const cleanHref = href.startsWith('http') ? href : `${config.baseUrl}${href}`;
      const dateMatch = text.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)/i);
      let closingDate: Date | null = null;
      if (dateMatch) closingDate = new Date(dateMatch[1]);

      if (title && title.length > 5) {
        results.push(enrichTender({
          title: title.slice(0, 200),
          description: text.slice(0, 500),
          organization: config.organization,
          sourceUrl: cleanHref,
          closingDate,
          value: null,
          sector: classifySector(title),
          category: config.category,
          requirements: [],
          region: config.region || 'Zimbabwe',
          sourceName: config.name,
        }));
      }
    });

    if (results.length > 0) console.log(`[TenderScraper] ${config.name}: ${results.length} items`);
  } catch (error: unknown) {
    console.warn(`[TenderScraper] ${config.name} failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }
  return results;
};

const tendersZimbabwe: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  try {
    const r = await axios.get(config.url, {
      timeout: config.timeout || 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    $('a[href*="/tender"], a[href*="/rfq"], a[href*="/eoi"], .tender-card, .listing-item, article').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      const href = $(el).attr('href') || '';
      if (!text || text.length < 10) return;
      const fullHref = href.startsWith('http') ? href : `${config.baseUrl}${href}`;
      const key = (fullHref + text.slice(0, 80)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const title = $(el).find('h2, h3, h4, .title, .card-title').first().text().trim() || text.slice(0, 100);
      const orgMatch = text.match(/(?:by|from|organisation|organization)[:\s]+([A-Z][A-Za-z\s&.]+?)(?:\d|closing|deadline|$)/i);
      const dateMatch = text.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i);
      const daysLeftMatch = text.match(/(\d+)\s*days?\s*left/i);

      let closingDate: Date | null = null;
      if (dateMatch) closingDate = new Date(dateMatch[1]);
      else if (daysLeftMatch) closingDate = new Date(Date.now() + parseInt(daysLeftMatch[1]) * 86400000);

      if (title && title.length > 5) {
        results.push(enrichTender({
          title: title.slice(0, 200),
          description: text.slice(0, 500),
          organization: orgMatch ? orgMatch[1].trim() : config.organization,
          sourceUrl: fullHref,
          closingDate,
          value: null,
          sector: classifySector(title),
          category: text.includes('Quotation') ? 'RFQ' : text.includes('EOI') ? 'EOI' : config.category,
          requirements: [],
          region: config.region || 'Zimbabwe',
          sourceName: config.name,
        }));
      }
    });

    if (results.length > 0) console.log(`[TenderScraper] ${config.name}: ${results.length} items`);
  } catch (error: unknown) {
    console.warn(`[TenderScraper] ${config.name} failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }
  return results;
};

const zimra: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  const paths = ['/tenders', '/tenders/category/30-tenders', '/tenders/category/49-rfqs'];

  for (const path of paths) {
    try {
      const r = await axios.get(`${config.baseUrl}${path}`, {
        timeout: config.timeout || 15000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });
      const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

      $('table tbody tr, table tr').each((_, row) => {
        const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get().filter(Boolean);
        const linkEl = $(row).find('a[href]').first();
        const linkText = linkEl.text().trim();
        const linkHref = linkEl.attr('href') || '';

        if (!linkHref || linkHref === '#' || linkHref === '/') return;

        const title = linkText || cells[0];
        if (!title || title.length < 3) return;

        const fullHref = linkHref.startsWith('http') ? linkHref : `${config.baseUrl}${linkHref}`;
        const key = fullHref.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);

        results.push(enrichTender({
          title,
          description: `ZIMRA Procurement: ${cells.join(' - ')}`,
          organization: config.organization,
          sourceUrl: fullHref,
          closingDate: null,
          value: null,
          sector: 'Professional Services',
          category: path.includes('rfq') ? 'RFQ' : config.category,
          requirements: [],
          region: config.region || 'Zimbabwe',
          sourceName: config.name,
        }));
      });
    } catch { /* skip failed page */ }
  }

  if (results.length > 0) console.log(`[TenderScraper] ${config.name}: ${results.length} tender entries`);
  return results;
};

const undp: CustomParser = async (config) => {
  const results: Tender[] = [];
  try {
    const r = await axios.get(config.url, {
      timeout: config.timeout || 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    const categories = $('h3, h4').filter((_, el) => {
      const text = $(el).text().toLowerCase();
      return text.includes('request for') || text.includes('invitation');
    }).map((_, el) => $(el).text().trim()).get();

    const procurementLinks = $('a[href]').filter((_, el) => {
      const href = $(el).attr('href') || '';
      return Boolean(href.match(/rfq|itb|rfp|procurement|tender/i) && !href.match(/login|register/i));
    }).map((_, el) => ({ text: $(el).text().trim(), href: $(el).attr('href') ?? '' })).get();

    for (const cat of categories.slice(0, 5)) {
      results.push(enrichTender({
        title: cat,
        description: `UNDP Zimbabwe procurement category: ${cat}. Categories available: ${categories.join(', ')}`,
        organization: config.organization,
        sourceUrl: config.url,
        closingDate: null,
        value: null,
        sector: config.sector || 'Professional Services',
        category: config.category,
        requirements: config.requirements || [],
        region: config.region || 'Zimbabwe',
        sourceName: config.name,
      }));
    }

    for (const link of procurementLinks.slice(0, 5)) {
      const fullHref = link.href.startsWith('http') ? link.href : `${config.baseUrl}${link.href}`;
      const title = link.text || 'UNDP Procurement Link';
      results.push(enrichTender({
        title,
        description: `UNDP procurement: ${link.text}`,
        organization: config.organization,
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: classifySector(link.text),
        category: config.category,
        requirements: [],
        region: config.region || 'Zimbabwe',
        sourceName: config.name,
      }));
    }

    console.log(`[TenderScraper] ${config.name}: scraped ${results.length} procurement entries`);
  } catch (error: unknown) {
    console.warn(`[TenderScraper] ${config.name} failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }
  return results;
};

const liveTenders: CustomParser = async (config) => {
  const results: Tender[] = [];
  try {
    const response = await axios.get(config.url, {
      timeout: config.timeout || 5000,
      headers: { 'User-Agent': 'RadbitStudios/1.0', 'Accept': 'application/json' },
    });

    const data = response.data as Record<string, unknown>;
    const items: Array<Record<string, unknown>> = Array.isArray(data) ? data as Array<Record<string, unknown>> : (data?.tenders || data?.items || []) as Array<Record<string, unknown>>;

    for (const item of items.slice(0, 30)) {
      const title = (item.title || item.name || item.subject || '') as string;
      const description = (item.description || item.details || item.summary || '') as string;
      if (!title) continue;

      let closingDate: Date | null = null;
      const cd = item.closing_date || item.deadline || item.closingDate;
      if (cd) {
        try { closingDate = new Date(cd as string); } catch { /* ignore */ }
      }

      results.push(enrichTender({
        title,
        description: description || title,
        organization: (item.organization || item.org || item.entity || config.organization) as string,
        sourceUrl: (item.url || item.link || item.sourceUrl || config.url) as string,
        closingDate,
        value: (item.value || item.amount || item.budget || null) as string | null,
        sector: classifySector(title + ' ' + description),
        category: (item.category || item.type || config.category) as string,
        requirements: [],
        region: config.region || 'Zimbabwe',
        sourceName: config.name,
      }));
    }

    console.log(`[TenderScraper] ${config.name}: ${results.length} tenders`);
  } catch (error: unknown) {
    console.warn(`[TenderScraper] ${config.name} failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }
  return results;
};

export const customScrapers: Record<string, CustomParser> = {
  'sa-etenders': saETenders,
  'afdb': afdb,
  'online-tenders': onlineTenders,
  'bid-detail': bidDetail,
  'tender-info-org': tenderInfoOrg,
  'tenders-zimbabwe': tendersZimbabwe,
  'zimra': zimra,
  'undp': undp,
  'live-tenders': liveTenders,
};

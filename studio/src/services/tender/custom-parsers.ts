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

const ZIMRA_KNOWN_TENDERS: Array<{ title: string; sector: string; category: string; closingDate?: string }> = [
  { title: 'Disposal of Goods by Informal Tender Advert GH BAK 01.01.2026', sector: 'General Goods', category: 'Disposal' },
  { title: 'NCB 12/2026: Supply and Delivery of a Brand New Boat', sector: 'Marine', category: 'Tender' },
  { title: 'NCB 21/2026: Procurement of Intelligent Flight Batteries and Battery Stations', sector: 'Aviation', category: 'Tender' },
  { title: 'NCB 08/2026: Provision of Security Services', sector: 'Security Services', category: 'Tender' },
  { title: 'NCB 07/2026: Provision of Servicing of Fire Extinguishers', sector: 'Fire & Safety', category: 'Tender' },
  { title: 'NCB 06/2026: Supply and Delivery of PPE', sector: 'Safety', category: 'Tender' },
  { title: 'NCB 05/2026: ZITF Promotional Materials', sector: 'Marketing', category: 'Tender' },
  { title: 'NCB 04/2026: Designing Construction and Commissioning of ZITF Stand 2026', sector: 'Events', category: 'Tender' },
  { title: 'NCB 48/2025: Supply and Delivery of Heavy Duty and Medium Duty Laser Printers', sector: 'IT Equipment', category: 'Tender' },
  { title: 'FA 06/2025: Supply and Delivery of Computer and Printer Parts Accessories - Re Tender', sector: 'IT Equipment', category: 'Tender' },
  { title: 'NCB 29/2025: Branding and Signage of Vic Falls, Zvishavane and Chiredzi ZIMRA Offices', sector: 'Branding', category: 'Tender' },
  { title: 'NCB 24/2025: Quality Assurance and Change Management Services for SAP Upgrade', sector: 'IT Consulting', category: 'Tender' },
  { title: 'NCB 15/2025: Provision of Insurance Services', sector: 'Insurance', category: 'Tender' },
  { title: 'NCB 26/2025: Supply and Delivery of Promotional Material', sector: 'Marketing', category: 'Tender' },
  { title: 'FA 02/2025: Provision of Motor Vehicle Towing Services', sector: 'Transport', category: 'Tender' },
  { title: 'FA 03/2025: Provision of Motor Vehicle Service and Repairs', sector: 'Automotive', category: 'Tender' },
  { title: 'NCB 22/2025: Provision of Stand Design for Zimbabwe Agricultural Show', sector: 'Events', category: 'Tender' },
];

const zimra: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  const paths = ['/tenders', '/tenders/category/30-tenders', '/tenders/category/49-rfqs'];

  // Try live scrape first
  let liveSuccess = false;
  for (const path of paths) {
    try {
      const r = await axios.get(`${config.baseUrl}${path}`, {
        timeout: config.timeout || 15000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });
      const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

      let rowCount = 0;
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
        rowCount++;

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
      if (rowCount > 0) liveSuccess = true;
    } catch { /* skip failed page */ }
  }

  // Fall back to known data if live scrape yielded nothing
  if (!liveSuccess || results.length < 5) {
    for (const t of ZIMRA_KNOWN_TENDERS) {
      const key = `zimra-fallback-${t.title}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(enrichTender({
        title: t.title,
        description: `ZIMRA Tender: ${t.title}. Tender documents available as PDF download from ZIMRA website.`,
        organization: config.organization,
        sourceUrl: `${config.baseUrl}/tenders`,
        closingDate: t.closingDate ? new Date(t.closingDate) : null,
        value: null,
        sector: t.sector,
        category: t.category,
        requirements: [],
        region: config.region || 'Zimbabwe',
        sourceName: config.name,
      }));
    }
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

const herald: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  try {
    const r = await axios.get(config.url, {
      timeout: config.timeout || 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));

    // Extract article links from the WordPress listing
    const articles = $('article, .post, .entry, .listing-item').map((_, el) => {
      const link = $(el).find('a[href]').first();
      const href = link.attr('href') || '';
      const title = link.text().trim().replace(/\s+/g, ' ') || $(el).find('h2, h3').first().text().trim();
      const excerpt = $(el).find('.excerpt, .entry-summary, p').first().text().trim().replace(/\s+/g, ' ');
      const dateText = $(el).find('.date, .entry-date, .published, time').first().text().trim() || '';
      return { href, title, excerpt, dateText };
    }).get().filter(a => a.href && a.title && a.title.length > 5);
    
    for (const article of articles.slice(0, 25)) {
      const key = article.href.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      // Try to parse closing date from title, excerpt, or published date
      let closingDate: Date | null = null;
      const allText = `${article.title} ${article.excerpt}`;
      
      // Match common date patterns used in Zim tender ads
      const datePatterns = [
        /(?:clos(?:ing|e)|deadline|due date)[:\s]*(\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4})/i,
        /(?:clos(?:ing|e)|deadline|due date)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
        /(\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4})/i,
      ];
      
      for (const pattern of datePatterns) {
        const match = allText.match(pattern);
        if (match) {
          try { closingDate = new Date(match[1]); } catch { /* ignore */ }
          if (closingDate && !isNaN(closingDate.getTime())) break;
        }
      }

      // Extract organization/buyer name
      const orgMatch = allText.match(/(?:invites|issued by|procuring entity|buyer|organization)[:\s]+([A-Z][A-Za-z\s&.]+?)(?:\d|closing|deadline|tender|rfq|eoi|\,|\s{2,}|$)/i);
      
      // Extract tender reference number
      const refMatch = allText.match(/(?:ref(?:erence)?|tender no|contract no)[.:\s]*([A-Z0-9][-A-Z0-9\/\s]+?)(?:\s{2,}|\,|$)/i);
      const description = refMatch ? `Ref: ${refMatch[1].trim()}. ${article.excerpt}` : article.excerpt;

      const fullHref = article.href.startsWith('http') ? article.href : `https://www.heraldonline.co.zw${article.href}`;

      let publishedAt: Date | undefined;
      if (article.dateText) {
        try { publishedAt = new Date(article.dateText); } catch { /* ignore */ }
      }

      results.push(enrichTender({
        title: article.title.slice(0, 200),
        description: description.slice(0, 500),
        organization: orgMatch ? orgMatch[1].trim() : config.organization,
        sourceUrl: fullHref,
        closingDate,
        value: null,
        sector: classifySector(article.title),
        category: config.category,
        requirements: [],
        region: config.region || 'Zimbabwe',
        sourceName: config.name,
        publishedAt,
      }));
    }

    console.log(`[TenderScraper] ${config.name}: ${results.length} tenders`);
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

const botswanaPPADB: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  try {
    const r = await axios.get('https://www.ppadb.co.bw/api/tenders', {
      timeout: config.timeout || 15000,
      headers: { 'User-Agent': 'RadbitStudios/1.0', 'Accept': 'application/json' },
    });
    const data = r.data as Record<string, unknown>;
    const tenders: Array<Record<string, unknown>> = Array.isArray(data)
      ? data
      : ((data?.tenders || data?.data || []) as Array<Record<string, unknown>>);
    for (const item of tenders.slice(0, 30)) {
      const title = (item.title || item.name || item.procurement_reference || '') as string;
      if (!title || title.length < 3) continue;
      const key = title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const closingDate = item.closing_date || item.deadline || item.closingDate || null;
      results.push(enrichTender({
        title,
        description: (item.description || item.details || '') as string || `Botswana PPADB tender: ${title}`,
        organization: (item.organization || item.procuring_entity || config.organization) as string,
        sourceUrl: (item.url || item.link || item.sourceUrl || 'https://www.ppadb.co.bw/tenders') as string,
        closingDate: closingDate ? new Date(closingDate as string) : null,
        value: (item.value || item.estimated_value || null) as string | null,
        sector: classifySector(title),
        category: (item.category || config.category) as string,
        requirements: [],
        region: 'Botswana',
        sourceName: config.name,
      }));
    }
    if (results.length > 0) console.log(`[TenderScraper] PPADB Botswana: ${results.length} tenders`);
  } catch (error: unknown) {
    console.warn(`[TenderScraper] PPADB Botswana failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }
  return results;
};

const zambiaZPPA: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  try {
    const r = await axios.get('https://www.zppa.org.zm/index.php/procurement-notices', {
      timeout: config.timeout || 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    $('table tbody tr, table tr, .notice-item, .views-row').each((_, row) => {
      const cells = $(row).find('td').map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get();
      const link = $(row).find('a[href]').first();
      const href = link.attr('href') || '';
      const linkText = link.text().trim();
      if (!href || href === '#' || href === '/') return;
      const title = linkText || cells[0] || '';
      if (!title || title.length < 5) return;
      const key = (href + title.slice(0, 40)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      const fullHref = href.startsWith('http') ? href : `${config.baseUrl}${href}`;
      let closingDate: Date | null = null;
      for (const c of cells) {
        const m = c.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (m) { try { closingDate = new Date(m[1]); } catch { /* ignore */ } break; }
      }
      results.push(enrichTender({
        title,
        description: cells.join(' | ') || `ZPPA Zambia procurement notice`,
        organization: config.organization,
        sourceUrl: fullHref,
        closingDate,
        value: null,
        sector: classifySector(title),
        category: config.category,
        requirements: [],
        region: 'Zambia',
        sourceName: config.name,
      }));
    });
    if (results.length > 0) console.log(`[TenderScraper] ZPPA Zambia: ${results.length} tenders`);
  } catch (error: unknown) {
    console.warn(`[TenderScraper] ZPPA Zambia failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }
  return results;
};

const mozambiqueCNU: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  try {
    const r = await axios.get('https://www.cnu.gov.mz/avisos-de-concurso', {
      timeout: config.timeout || 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    $('a[href*="concurso"], a[href*="tender"], table tr').each((_, el) => {
      const link = $(el).is('a') ? $(el) : $(el).find('a').first();
      const href = link.attr('href') || '';
      const text = link.text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5) return;
      const key = (href + text.slice(0, 40)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      const fullHref = href.startsWith('http') ? href : `${config.baseUrl}${href}`;
      results.push(enrichTender({
        title: text.slice(0, 200),
        description: `Mozambique CNU procurement notice: ${text}`,
        organization: config.organization,
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: classifySector(text),
        category: config.category,
        requirements: [],
        region: 'Mozambique',
        sourceName: config.name,
      }));
    });
    if (results.length > 0) console.log(`[TenderScraper] CNU Mozambique: ${results.length} notices`);
  } catch (error: unknown) {
    console.warn(`[TenderScraper] CNU Mozambique failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
  }
  return results;
};

const malawiPPDA: CustomParser = async (config) => {
  const results: Tender[] = [];
  const seen = new Set<string>();
  try {
    const r = await axios.get('https://www.ppda.mw/procurement-notices', {
      timeout: config.timeout || 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
    });
    const $ = parseHtml(typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
    $('a[href*="notice"], a[href*="tender"], .views-row a, table tr a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!href || !text || text.length < 5) return;
      const key = (href + text.slice(0, 40)).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      const fullHref = href.startsWith('http') ? href : `${config.baseUrl}${href}`;
      results.push(enrichTender({
        title: text.slice(0, 200),
        description: `Malawi PPDA procurement notice: ${text}`,
        organization: config.organization,
        sourceUrl: fullHref,
        closingDate: null,
        value: null,
        sector: classifySector(text),
        category: config.category,
        requirements: [],
        region: 'Malawi',
        sourceName: config.name,
      }));
    });
    if (results.length > 0) console.log(`[TenderScraper] PPDA Malawi: ${results.length} notices`);
  } catch (error: unknown) {
    console.warn(`[TenderScraper] PPDA Malawi failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 100)}`);
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
  'herald': herald,
  'live-tenders': liveTenders,
  'botswana-ppadb': botswanaPPADB,
  'zambia-zppa': zambiaZPPA,
  'mozambique-cnu': mozambiqueCNU,
  'malawi-ppda': malawiPPDA,
};

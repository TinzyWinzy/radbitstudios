import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function extractPdfText(pdfPath) {
  const { default: pdf } = await import('pdf-parse-debugging-disabled');
  const buffer = readFileSync(pdfPath);
  const data = await pdf(buffer);
  return data.text;
}

function chunkBySections(text, maxWords = 600) {
  const lines = text.split('\n');
  const sections = [];
  let current = { text: [], words: 0, title: '' };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isHeader = /^(CHAPTER\s+\d+|PART\s+\d+|SCHEDULE|\d+\s+[A-Z][A-Z\s]{3,})/.test(trimmed) ||
      /^[A-Z][A-Z\s]{10,}$/.test(trimmed);

    if (isHeader && current.text.length > 0 && current.words > 30) {
      sections.push({
        title: current.title || trimmed.slice(0, 80),
        content: current.text.join('\n'),
      });
      current = { text: [trimmed], words: trimmed.split(/\s+/).length, title: trimmed.slice(0, 80) };
    } else {
      if (!current.title) current.title = trimmed.slice(0, 80);
      current.text.push(trimmed);
      current.words += trimmed.split(/\s+/).length;
    }

    if (current.words >= maxWords) {
      sections.push({
        title: current.title,
        content: current.text.join('\n'),
      });
      current = { text: [], words: 0, title: '' };
    }
  }
  if (current.text.length > 0) {
    sections.push({ title: current.title, content: current.text.join('\n') });
  }
  return sections;
}

async function indexSections(sections, source, category) {
  const { indexDocument } = await import('../src/services/ai/rag.server');
  let indexed = 0;
  for (const section of sections) {
    try {
      const id = await indexDocument(
        `[${source}] ${section.title}`,
        section.content,
        source,
        category,
        'en',
      );
      console.log(`  ✓ [${id}] ${section.title.slice(0, 60)}`);
      indexed++;
    } catch (err) {
      console.error(`  ✗ Failed: ${section.title.slice(0, 60)}: ${err.message}`);
    }
  }
  return indexed;
}

async function indexPdf(pdfPath, source, category, label) {
  console.log(`\nExtracting ${label}...`);
  try {
    const text = await extractPdfText(pdfPath);
    const sections = chunkBySections(text);
    console.log(`  ${sections.length} chunks (${text.length} chars)`);
    console.log(`\nIndexing ${label} into RAG...`);
    const indexed = await indexSections(sections, source, category);
    console.log(`  ${label}: ${indexed} indexed`);
    return indexed;
  } catch (err) {
    console.error(`  ✗ Failed to index ${label}: ${err.message}`);
    return 0;
  }
}

async function main() {
  let total = 0;

  total += await indexPdf(
    resolve(__dirname, '../../Constitution Consolidated (2023).pdf'),
    'Constitution of Zimbabwe (2023)', 'constitution', 'Constitution'
  );

  total += await indexPdf(
    resolve(__dirname, '../../National Development Strategy 2 (NDS2) 2026-2030.pdf'),
    'National Development Strategy 2 (2026-2030)', 'nds2', 'NDS2'
  );

  total += await indexPdf(
    resolve(__dirname, '../../ZiG Transactions FAQs_.pdf'),
    'ZiG Transactions FAQs', 'zig_currency', 'ZiG FAQs'
  );

  total += await indexPdf(
    resolve(__dirname, '../../Fiscal Device Gateway API v7.2 - clients.pdf'),
    'Fiscal Device Gateway API v7.2', 'fiscal_device', 'Fiscal Device API'
  );

  total += await indexPdf(
    resolve(__dirname, '../../Lcensed agents for 2026_.pdf'),
    'Licensed Agents 2026', 'licensed_agents', 'Licensed Agents'
  );

  total += await indexPdf(
    resolve(__dirname, '../../2025-1st-Quarter-Abridged-Sector-Performance-Report-HMed.pdf'),
    '2025 Sector Performance Report', 'sector_performance', 'Sector Performance Report'
  );

  // ZIDA website content (scraped pages)
  const zidaContent = [
    { file: 'zida_invest.txt', source: 'ZIDA Invest Hub', category: 'zida_investment' },
    { file: 'zida_grow.txt', source: 'ZIDA Grow', category: 'zida_investment' },
    { file: 'zida_agriculture.txt', source: 'ZIDA Agriculture Sector', category: 'zida_investment' },
    { file: 'zida_tourism.txt', source: 'ZIDA Tourism Sector', category: 'zida_investment' },
    { file: 'zida_mining.txt', source: 'ZIDA Mining Sector', category: 'zida_investment' },
    { file: 'zida_energy.txt', source: 'ZIDA Energy Sector', category: 'zida_investment' },
    { file: 'zida_doing_business.txt', source: 'ZIDA Doing Business in Zimbabwe', category: 'zida_investment' },
  ];

  for (const zc of zidaContent) {
    const zidaPath = resolve(__dirname, `../database/${zc.file}`);
    try {
      const text = readFileSync(zidaPath, 'utf-8');
      console.log(`\nIndexing ${zc.source}...`);
      const sections = chunkBySections(text);
      const indexed = await indexSections(sections, zc.source, zc.category);
      console.log(`  ${zc.source}: ${indexed} chunks`);
      total += indexed;
    } catch (err) {
      console.error(`  ✗ Skipping ${zc.file}: ${err.message}`);
    }
  }

  // ZIDA Quarterly Report (if placed in project root)
  const zidaReportPath = resolve(__dirname, '../../ZIDA QUARTERLY REPORT Q1 2026.pdf');
  try {
    total += await indexPdf(zidaReportPath, 'ZIDA Quarterly Report Q1 2026', 'zida_investment', 'ZIDA Q1 2026 Report');
  } catch {
    console.log('  (ZIDA Quarterly Report PDF not found — will index when available)');
  }

  console.log(`\nDone. Total indexed: ${total} chunks.`);
}

main().catch(console.error);

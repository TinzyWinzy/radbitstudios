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

async function main() {
  const constitutionPath = resolve(__dirname, '../../Constitution Consolidated (2023).pdf');
  const nds2Path = resolve(__dirname, '../../National Development Strategy 2 (NDS2) 2026-2030.pdf');

  console.log('Extracting Constitution text...');
  const constitutionText = await extractPdfText(constitutionPath);
  const constitutionSections = chunkBySections(constitutionText);
  console.log(`  ${constitutionSections.length} chunks (${constitutionText.length} chars)`);

  console.log('\nExtracting NDS2 text...');
  const nds2Text = await extractPdfText(nds2Path);
  const nds2Sections = chunkBySections(nds2Text);
  console.log(`  ${nds2Sections.length} chunks (${nds2Text.length} chars)`);

  console.log('\nIndexing Constitution into RAG...');
  const constitutionIndexed = await indexSections(constitutionSections, 'Constitution of Zimbabwe (2023)', 'constitution');

  console.log('\nIndexing NDS2 into RAG...');
  const nds2Indexed = await indexSections(nds2Sections, 'National Development Strategy 2 (2026-2030)', 'nds2');

  console.log(`\nDone. Indexed ${constitutionIndexed + nds2Indexed} total chunks.`);
  console.log(`  Constitution: ${constitutionIndexed}`);
  console.log(`  NDS2: ${nds2Indexed}`);
}

main().catch(console.error);

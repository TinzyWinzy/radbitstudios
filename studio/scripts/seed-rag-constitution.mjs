import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONSTITUTION_PATH = resolve(__dirname, '../../Constitution Consolidated (2023).pdf');
const NDS2_PATH = resolve(__dirname, '../../National Development Strategy 2 (NDS2) 2026-2030.pdf');

async function extractTextFromPdf(pdfPath) {
  const { default: pdf } = await import('pdf-parse-debugging-disabled');
  const buffer = readFileSync(pdfPath);
  const data = await pdf(buffer);
  return data.text;
}

function chunkBySections(text, maxWords = 800) {
  const lines = text.split('\n');
  const sections = [];
  let current = [];
  let wordCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    const isSectionHeader = /^CHAPTER\s+\d+|^\d+\s+[A-Z][A-Z\s]+$|^PART\s+\d+|^SCHEDULE/i.test(trimmed);

    if (isSectionHeader && current.length > 0 && wordCount > 50) {
      sections.push(current.join('\n'));
      current = [trimmed];
      wordCount = trimmed.split(/\s+/).length;
    } else {
      current.push(trimmed);
      wordCount += trimmed.split(/\s+/).length;
    }

    if (wordCount >= maxWords && current.length > 0) {
      sections.push(current.join('\n'));
      current = [];
      wordCount = 0;
    }
  }
  if (current.length > 0) sections.push(current.join('\n'));
  return sections;
}

async function main() {
  console.log('Extracting Constitution text...');
  const constitutionText = await extractTextFromPdf(CONSTITUTION_PATH);
  const constitutionSections = chunkBySections(constitutionText);
  console.log(`Constitution: ${constitutionSections.length} sections`);

  console.log('Extracting NDS2 text...');
  const nds2Text = await extractTextFromPdf(NDS2_PATH);
  const nds2Sections = chunkBySections(nds2Text);
  console.log(`NDS2: ${nds2Sections.length} sections`);

  console.log('\nReady to index into RAG. Sections extracted:');
  console.log(`- Constitution: ${constitutionSections.length} chunks (${constitutionText.length} chars)`);
  console.log(`- NDS2: ${nds2Sections.length} chunks (${nds2Text.length} chars)`);
}

main().catch(console.error);

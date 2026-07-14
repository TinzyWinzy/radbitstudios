import { existsSync, readFileSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { RAG_SOURCES } from './rag-sources.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = {
    list: false,
    dryRun: false,
    includeDisabled: false,
    sourceIds: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--list') args.list = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--include-disabled') args.includeDisabled = true;
    else if (arg === '--source') {
      const value = argv[++i];
      if (!value) throw new Error('--source requires an id');
      args.sourceIds.push(value);
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: npm run rag:index -- [options]

Options:
  --list                List registered sources and file status only.
  --dry-run             Extract and chunk sources without writing to the database.
  --source <id>         Index or inspect a single source id. Can be repeated.
  --include-disabled    Include disabled sources.
  --help                Show this help.

Required for live indexing:
  DATABASE_URL
  GOOGLE_GENAI_API_KEY or GEMINI_API_KEY
`);
}

function getSourcePath(source) {
  return resolve(__dirname, source.path);
}

function getCanonicalPath(source) {
  return source.canonicalPath ? resolve(__dirname, source.canonicalPath) : null;
}

function sourceStatus(source) {
  const filePath = getSourcePath(source);
  const exists = existsSync(filePath);
  const size = exists ? statSync(filePath).size : 0;
  const canonicalPath = getCanonicalPath(source);
  const canonicalExists = canonicalPath ? existsSync(canonicalPath) : null;

  return {
    exists,
    size,
    canonicalExists,
    enabled: source.enabled !== false,
  };
}

function selectSources(args) {
  const requested = new Set(args.sourceIds);
  const sources = RAG_SOURCES.filter((source) => {
    if (requested.size > 0 && !requested.has(source.id)) return false;
    if (!args.includeDisabled && source.enabled === false) return false;
    return true;
  });

  if (requested.size > 0) {
    const found = new Set(sources.map((source) => source.id));
    const missing = [...requested].filter((id) => !found.has(id));
    if (missing.length > 0) {
      throw new Error(`Source id not found or disabled: ${missing.join(', ')}`);
    }
  }

  return sources;
}

function listSources(sources) {
  console.log('Zimbabwe knowledge base sources\n');

  for (const source of sources) {
    const status = sourceStatus(source);
    const state = status.enabled ? 'enabled' : 'disabled';
    const fileState = status.exists ? `${status.size} bytes` : 'missing';
    const canonical = status.canonicalExists === null
      ? ''
      : `, canonical ${status.canonicalExists ? 'found' : 'missing'}`;

    console.log(`- ${source.id} [${state}]`);
    console.log(`  ${source.title}`);
    console.log(`  category=${source.category}, trust=${source.trust}, freshness=${source.freshness}`);
    console.log(`  file=${source.path} (${fileState}${canonical})`);
  }
}

async function extractPdfText(pdfPath) {
  const { default: pdf } = await import('pdf-parse-debugging-disabled');
  const buffer = readFileSync(pdfPath);
  const data = await pdf(buffer);
  return data.text;
}

async function readSourceText(source) {
  const filePath = getSourcePath(source);
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${source.path}`);
  }

  if (source.type === 'pdf') {
    return extractPdfText(filePath);
  }

  return readFileSync(filePath, 'utf-8');
}

function chunkBySections(text, maxWords = 600) {
  const lines = text.split('\n');
  const sections = [];
  let current = { text: [], words: 0, title: '' };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isHeader =
      /^(CHAPTER\s+\d+|PART\s+\d+|SCHEDULE|\d+\s+[A-Z][A-Z\s]{3,})/.test(trimmed) ||
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

async function indexSections(sections, source) {
  const { indexDocument } = await import('../src/services/ai/rag.server');
  let indexed = 0;

  for (const section of sections) {
    try {
      const id = await indexDocument(
        `[${source.source}] ${section.title}`,
        section.content,
        source.source,
        source.category,
        source.locale || 'en',
        source.trust || null,
        source.freshness || null,
      );
      console.log(`  OK [${id}] ${section.title.slice(0, 60)}`);
      indexed++;
    } catch (err) {
      console.error(`  FAIL ${section.title.slice(0, 60)}: ${err.message}`);
    }
  }

  return indexed;
}

async function processSource(source, args) {
  console.log(`\nReading ${source.title}...`);

  const text = await readSourceText(source);
  const sections = chunkBySections(text);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  console.log(`  ${sections.length} sections, ${words} words, ${text.length} chars`);
  console.log(`  source=${source.source}`);
  console.log(`  category=${source.category}, trust=${source.trust}, freshness=${source.freshness}`);
  console.log(`  guidance=${source.claimGuidance}`);

  if (args.dryRun) return sections.length;

  console.log(`  Indexing into RAG...`);
  return indexSections(sections, source);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const sources = selectSources(args);

  if (args.list) {
    listSources(sources);
    return;
  }

  if (sources.length === 0) {
    throw new Error('No sources selected.');
  }

  let total = 0;

  for (const source of sources) {
    try {
      total += await processSource(source, args);
    } catch (err) {
      console.error(`  FAIL ${source.id}: ${err.message}`);
    }
  }

  const unit = args.dryRun ? 'sections found' : 'sections indexed';
  console.log(`\nDone. Total ${unit}: ${total}.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});

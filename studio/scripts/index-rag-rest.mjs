import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { RAG_SOURCES } from './rag-sources.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = 'https://ryipqveulgcwgljymlwc.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GEMINI_KEY = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

function parseArgs(argv) {
  const args = { list: false, dryRun: false, includeDisabled: false, sourceIds: [], help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--list') args.list = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--include-disabled') args.includeDisabled = true;
    else if (arg === '--source') args.sourceIds.push(argv[++i]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/index-rag-rest.mjs [options]

Requires env:
  SUPABASE_SERVICE_KEY  (service_role key for Supabase REST API)
  GOOGLE_GENAI_API_KEY or GEMINI_API_KEY

Options:
  --list                List sources only
  --dry-run             Extract & chunk without writing
  --source <id>         Index a single source (repeatable)
  --include-disabled    Index disabled sources too
`);
}

function getSourcePath(source) {
  return resolve(__dirname, source.path);
}

function selectSources(args) {
  const requested = new Set(args.sourceIds);
  return RAG_SOURCES.filter(s => {
    if (requested.size > 0 && !requested.has(s.id)) return false;
    if (!args.includeDisabled && s.enabled === false) return false;
    return true;
  });
}

function listSources(sources) {
  console.log('Zimbabwe knowledge base sources\n');
  for (const s of sources) {
    const p = getSourcePath(s);
    const exists = existsSync(p);
    const state = s.enabled !== false ? 'enabled' : 'disabled';
    console.log(`- ${s.id} [${state}]`);
    console.log(`  ${s.title}`);
    console.log(`  category=${s.category}, trust=${s.trust}, freshness=${s.freshness}`);
    console.log(`  file=${s.path} (${exists ? 'found' : 'missing'})`);
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
  if (!existsSync(filePath)) throw new Error(`File not found: ${source.path}`);
  if (source.type === 'pdf') return extractPdfText(filePath);
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
      sections.push({ title: current.title || trimmed.slice(0, 80), content: current.text.join('\n') });
      current = { text: [trimmed], words: trimmed.split(/\s+/).length, title: trimmed.slice(0, 80) };
    } else {
      if (!current.title) current.title = trimmed.slice(0, 80);
      current.text.push(trimmed);
      current.words += trimmed.split(/\s+/).length;
    }
    if (current.words >= maxWords) {
      sections.push({ title: current.title, content: current.text.join('\n') });
      current = { text: [], words: 0, title: '' };
    }
  }
  if (current.text.length > 0) sections.push({ title: current.title, content: current.text.join('\n') });
  return sections;
}

function chunkEmbeddingInput(text, chunkSize = 512, overlap = 32) {
  const words = text.split(/\s+/);
  const chunks = [];
  const step = chunkSize - overlap;
  for (let i = 0; i < words.length; i += step) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks.length ? chunks : [text];
}

async function generateEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'models/text-embedding-004', content: { parts: [{ text }] } }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.embedding?.values || [];
}

async function restFetch(path, options = {}) {
  const url = `${SUPABASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`REST ${res.status} ${path}: ${err.slice(0, 200)}`);
  }
  return res;
}

function escapeVector(v) {
  return `[${v.join(',')}]`;
}

async function ensureRagColumns() {
  // trust_tier and freshness don't exist remotely yet.
  // Add them via a raw pg connection won't work (IPv6 only).
  // We store them in chunk metadata instead, and use a
  // one-shot SQL migration to add the columns.
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/add_rag_columns`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  if (!res.ok && res.status !== 404) {
    const err = await res.text();
    console.warn(`  [warn] add_rag_columns rpc: ${res.status} ${err.slice(0, 100)}`);
  }
}

async function indexSection(title, content, source, category, locale, trustTier, freshness) {
  const docId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // 1. insert document (skip missing trust_tier/freshness columns)
  const docBody = {
    id: docId,
    title,
    content,
    source,
    category,
    locale: locale || 'en',
    chunk_count: 0,
  };
  await restFetch('/rest/v1/rag_documents', {
    method: 'POST',
    headers: { 'Prefer': 'return=minimal' },
    body: JSON.stringify(docBody),
  });

  // 2. chunk, embed, insert chunks
  const fullText = `${title}\n\n${content}`;
  const chunks = chunkEmbeddingInput(fullText);
  const embeddings = await Promise.allSettled(chunks.map(c => generateEmbedding(c)));

  let storedCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    const emb = embeddings[i];
    if (emb.status !== 'fulfilled' || emb.value.length === 0) continue;
    await restFetch('/rest/v1/rag_chunks', {
      method: 'POST',
      headers: { 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        document_id: docId,
        chunk_index: i,
        content: chunks[i],
        embedding: escapeVector(emb.value),
        metadata: { title, source, category, locale, trustTier, freshness },
      }),
    });
    storedCount++;
  }

  // 3. update chunk_count
  await restFetch(`/rest/v1/rag_documents?id=eq.${docId}`, {
    method: 'PATCH',
    headers: { 'Prefer': 'return=minimal' },
    body: JSON.stringify({ chunk_count: storedCount }),
  });

  // 4. patch trust_tier & freshness on document (silent if column missing)
  if (trustTier || freshness) {
    const patch = {};
    if (trustTier) patch.trust_tier = trustTier;
    if (freshness) patch.freshness = freshness;
    try {
      await restFetch(`/rest/v1/rag_documents?id=eq.${encodeURIComponent(docId)}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify(patch),
      });
    } catch {
      // columns not yet added; skip silently
    }
  }

  return docId;
}

async function processSource(source, args) {
  console.log(`\nReading ${source.title}...`);
  const text = await readSourceText(source);
  const sections = chunkBySections(text);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  console.log(`  ${sections.length} sections, ${words} words, ${text.length} chars`);
  console.log(`  source=${source.source}, trust=${source.trust}, freshness=${source.freshness}`);

  if (args.dryRun) return sections.length;

  let indexed = 0;
  for (const section of sections) {
    try {
      const id = await indexSection(
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); return; }

  if (!SERVICE_KEY) throw new Error('SUPABASE_SERVICE_KEY env var is required');
  if (!GEMINI_KEY) throw new Error('GOOGLE_GENAI_API_KEY or GEMINI_API_KEY env var is required');

  const sources = selectSources(args);
  if (args.list) { listSources(sources); return; }
  if (sources.length === 0) throw new Error('No sources selected.');

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

main().catch(err => { console.error(err.message || err); process.exitCode = 1; });

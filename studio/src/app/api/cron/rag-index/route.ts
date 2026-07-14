import { NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { getPool } from '@/lib/sqlite';
import { indexDocument } from '@/services/ai/rag.server';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { RAG_SOURCES } = await import('../../../../../scripts/rag-sources.mjs');
    const scriptsDir = resolve(process.cwd(), 'scripts');

    // Clear existing RAG data before re-indexing
    const pool = getPool();
    await pool.query('DELETE FROM rag_chunks');
    await pool.query('DELETE FROM rag_documents');

    let indexed = 0;
    const errors: string[] = [];

    for (const source of RAG_SOURCES) {
      if (source.enabled === false) continue;

      const filePath = resolve(scriptsDir, source.path);
      if (!existsSync(filePath)) {
        errors.push(`${source.id}: file not found`);
        continue;
      }

      const text = readFileSync(filePath, 'utf-8');
      const sections = chunkBySections(text);

      for (const section of sections) {
        try {
          await indexDocument(
            `[${source.source}] ${section.title}`,
            section.content,
            source.source,
            source.category,
            source.locale || 'en',
            source.trust || undefined,
            source.freshness || undefined,
          );
          indexed++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`${source.id}/${section.title.slice(0, 40)}: ${msg}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      indexed,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'RAG index failed';
    console.error('[CRON rag-index] Error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function chunkBySections(text: string, maxWords = 600) {
  const lines = text.split('\n');
  const sections: { title: string; content: string }[] = [];
  let current = { text: [] as string[], words: 0, title: '' };

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

  if (current.text.length > 0) {
    sections.push({ title: current.title, content: current.text.join('\n') });
  }

  return sections;
}

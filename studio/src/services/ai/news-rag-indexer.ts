import { indexDocument } from './rag.server';

interface IndexableArticle {
  id?: string;
  title: string;
  summary?: string;
  sourceName?: string;
  publishedAt?: Date | string;
  impactScore?: number;
}

const MAX_NEWS_TO_INDEX = 20;

export async function indexNewsToRag(articles: IndexableArticle[]): Promise<number> {
  const scored = articles
    .filter(a => a.title && (a.summary || a.title))
    .sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0))
    .slice(0, MAX_NEWS_TO_INDEX);

  let indexed = 0;
  for (const article of scored) {
    try {
      const content = article.summary || article.title;
      const raw = article.publishedAt;
      const freshness = raw instanceof Date
        ? raw.toISOString().split('T')[0]
        : typeof raw === 'string'
          ? raw.slice(0, 10)
          : new Date().toISOString().split('T')[0];

      await indexDocument(
        article.title,
        content,
        article.sourceName || 'News',
        'news',
        'en',
        'news',
        freshness,
      );
      indexed++;
    } catch (err) {
      console.error(`[NewsRAG] Failed to index article ${article.id}:`, err);
    }
  }
  return indexed;
}

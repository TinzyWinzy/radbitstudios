export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
  category: 'policy' | 'finance' | 'technology' | 'business' | 'regulatory' | 'general';
  industryTags: string[];
  region: string;
  processedAt: Date;
  scrapedAt: Date;
}

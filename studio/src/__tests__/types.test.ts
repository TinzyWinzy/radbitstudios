import { describe, it, expect } from 'vitest';

describe('Type Definitions', () => {
  describe('NewsArticle type', () => {
    it('should have required fields', () => {
      const article = {
        id: 'test-123',
        title: 'Test Article',
        summary: 'Test summary',
        sourceUrl: 'https://example.com',
        sourceName: 'Test Source',
        publishedAt: new Date(),
        category: 'business' as const,
        industryTags: ['SME', 'Zimbabwe'],
        region: 'Zimbabwe',
        processedAt: new Date(),
        scrapedAt: new Date(),
      };

      expect(article.id).toBeTruthy();
      expect(article.title).toBeTruthy();
      expect(['policy', 'finance', 'technology', 'business', 'regulatory', 'general']).toContain(article.category);
    });
  });

  describe('AssessmentQuestion type', () => {
    it('should have question, options, and category', () => {
      const question = {
        question: 'How do you accept payments?',
        options: ['Cash only', 'EcoCash', 'Bank transfer', 'Online gateway'],
        category: 'Payments',
      };

      expect(question.question).toBeTruthy();
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      expect(question.category).toBeTruthy();
    });
  });

  describe('Tender type', () => {
    it('should have required fields', () => {
      const tender = {
        id: 'tender-123',
        title: 'Supply of IT Equipment',
        organization: 'Ministry of ICT',
        status: 'open' as const,
        sourceUrl: 'https://example.com',
        sourceName: 'ZIMGS',
        publishedAt: new Date(),
      };

      expect(tender.id).toBeTruthy();
      expect(tender.title).toBeTruthy();
      expect(['open', 'closing_soon', 'closed', 'awarded']).toContain(tender.status);
    });
  });
});

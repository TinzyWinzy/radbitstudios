import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MockAIGateway,
  setupMockAIGateway,
  resetMock,
  setMockContent,
  setMockJsonResponse,
  setMockError,
  getGenerateCalls,
  getLastGenerateCall,
} from '@/__tests__/helpers/mock-ai-gateway';

const __aiMockInstance = new MockAIGateway();
vi.mock('@/services/ai/ai-gateway', () => ({
  AIGateway: MockAIGateway,
  aiGateway: __aiMockInstance,
}));

setupMockAIGateway();

beforeEach(() => {
  resetMock();
});

describe('Pattern A — simple text response with error check', () => {
  it('generateSwotAnalysis returns answer from gateway', async () => {
    const { generateSwotAnalysis } = await import('@/ai/flows/generate-swot-analysis');
    setMockContent('SWOT analysis result');

    const result = await generateSwotAnalysis({
      query: 'Analyze my business',
      businessName: 'TestBiz',
      industry: 'Tech',
    });

    expect(result.answer).toBe('SWOT analysis result');
    const call = getLastGenerateCall();
    expect(call?.prompt).toContain('TestBiz');
    expect(call?.difficulty).toBe('complex');
    expect(call?.maxTokens).toBe(1024);
  });

  it('generateSwotAnalysis throws on gateway error', async () => {
    const { generateSwotAnalysis } = await import('@/ai/flows/generate-swot-analysis');
    setMockError('API failed');

    await expect(generateSwotAnalysis({ query: 'test' })).rejects.toThrow('API failed');
  });

  it('generateHrPolicy returns answer from gateway', async () => {
    const { generateHrPolicy } = await import('@/ai/flows/generate-hr-policy');
    setMockContent('HR policy document');

    const result = await generateHrPolicy({ query: 'Draft policy', businessName: 'Biz' });
    expect(result.answer).toBe('HR policy document');
    expect(getLastGenerateCall()?.maxTokens).toBe(2048);
  });

  it('coachExport returns answer from gateway', async () => {
    const { coachExport } = await import('@/ai/flows/generate-export-coach');
    setMockContent('Export advice');

    const result = await coachExport({ query: 'How to export?', industry: 'Agriculture' });
    expect(result.answer).toBe('Export advice');
    expect(getLastGenerateCall()?.systemPrompt).toContain('Sekuru Jabu');
  });

  it('negotiateSupplier returns answer from gateway', async () => {
    const { negotiateSupplier } = await import('@/ai/flows/generate-supplier-negotiator');
    setMockContent('Negotiation script');

    const result = await negotiateSupplier({ query: 'Negotiate price' });
    expect(result.answer).toBe('Negotiation script');
    expect(getLastGenerateCall()?.systemPrompt).toContain('Zimbabwe procurement negotiator');
  });

  it('aiBusinessMentor returns answer from gateway', async () => {
    const { aiBusinessMentor } = await import('@/ai/flows/ai-business-mentor');
    setMockContent('Mentor advice');

    const result = await aiBusinessMentor({ query: 'Help me grow' });
    expect(result.answer).toBe('Mentor advice');
    expect(getLastGenerateCall()?.temperature).toBe(0.8);
  });
});

describe('Pattern B — JSON mode with parse/fallback', () => {
  it('moderateCommunityContent returns isSafe from parsed JSON', async () => {
    const { moderateCommunityContent } = await import('@/ai/flows/moderate-community-content');
    setMockJsonResponse({ isSafe: true });

    const result = await moderateCommunityContent({ text: 'Hello everyone' });
    expect(result.isSafe).toBe(true);
  });

  it('moderateCommunityContent returns unsafe with reason', async () => {
    const { moderateCommunityContent } = await import('@/ai/flows/moderate-community-content');
    setMockJsonResponse({ isSafe: false, reason: 'Hate speech detected' });

    const result = await moderateCommunityContent({ text: 'bad content' });
    expect(result.isSafe).toBe(false);
    expect(result.reason).toBe('Hate speech detected');
  });

  it('moderateCommunityContent defaults unsafe on parse failure', async () => {
    const { moderateCommunityContent } = await import('@/ai/flows/moderate-community-content');
    setMockContent('not valid json');

    const result = await moderateCommunityContent({ text: 'any text' });
    expect(result.isSafe).toBe(false);
    expect(result.reason).toBe('Moderation service returned an invalid response');
  });

  it('generateExportAssessment returns parsed assessment', async () => {
    const { generateExportAssessment } = await import('@/ai/flows/generate-export-assessment');
    setMockJsonResponse({
      readinessScore: 65,
      strengths: ['Good logistics'],
      gaps: ['No export license'],
      recommendedMarkets: ['South Africa'],
      requiredCertifications: ['EUR1'],
      summary: 'Ready for SADC export',
    });

    const result = await generateExportAssessment({
      responses: [{ question: 'Q1', answer: 'Yes', score: 3, category: 'Logistics' }],
    });
    expect(result.readinessScore).toBe(65);
    expect(result.strengths).toContain('Good logistics');
  });

  it('generateExportAssessment returns zeros on parse failure', async () => {
    const { generateExportAssessment } = await import('@/ai/flows/generate-export-assessment');
    setMockContent('bad json');

    const result = await generateExportAssessment({
      responses: [{ question: 'Q1', answer: 'No', score: 1, category: 'Test' }],
    });
    expect(result.readinessScore).toBe(0);
    expect(result.strengths).toEqual([]);
  });

  it('generateTaxAnswer returns parsed tax response', async () => {
    const { generateTaxAnswer } = await import('@/ai/flows/tax-copilot');
    setMockJsonResponse({
      answer: 'VAT is due on the 25th',
      regulations: ['VAT Act Section 15'],
      disclaimers: ['Consult a practitioner'],
    });

    const result = await generateTaxAnswer({
      query: 'VAT deadline?',
    });
    expect(result.answer).toContain('VAT');
    expect(result.regulations).toHaveLength(1);
  });

  it('curateTendersNews returns parsed articles', async () => {
    const { curateTendersNews } = await import('@/ai/flows/curate-tenders-news');
    setMockJsonResponse({
      articles: [
        { title: 'New tender', summary: 'Road construction', source: 'https://example.com/tender', category: 'Tender', isRelevant: true },
      ],
    });

    const result = await curateTendersNews({ content: 'raw text', userQuery: 'construction' });
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].title).toBe('New tender');
  });

  it('curateTendersNews returns empty on validation failure', async () => {
    const { curateTendersNews } = await import('@/ai/flows/curate-tenders-news');
    setMockJsonResponse({ articles: [{ title: 'Missing fields' }] });
    const result = await curateTendersNews({ content: 'raw', userQuery: 'test' });
    expect(result.articles).toEqual([]);
  });

  it('generateTenderProposal returns parsed proposal', async () => {
    const { generateTenderProposal } = await import('@/ai/flows/generate-tender-proposal');
    setMockJsonResponse({
      executiveSummary: 'We can do this',
      technicalApproach: 'Agile',
      teamQualification: 'Experienced',
      financialProposal: '$10,000',
      complianceChecklist: ['Tax clearance'],
      riskMitigation: ['Load-shedding plan'],
    });
    (getLastGenerateCall); // flush call

    const result = await generateTenderProposal({
      tenderTitle: 'Bridge construction',
      tenderDescription: 'Build a bridge',
      organization: 'Govt',
      requirements: ['Insurance'],
      currency: 'USD',
    });
    expect(result.executiveSummary).toBe('We can do this');
    expect(result.riskMitigation).toContain('Load-shedding plan');
  });

  it('generateOnboardingChecklistFlow returns parsed checklist', async () => {
    const { generateOnboardingChecklistFlow } = await import('@/ai/flows/generate-onboarding-checklist');
    setMockJsonResponse({
      persona: 'sme',
      suggestedPackage: 'Business Site — $400',
      items: [
        { id: 'step-1', task: 'Upload logo', description: 'Provide your logo', type: 'upload' },
      ],
    });

    const result = await generateOnboardingChecklistFlow({
      audience: 'my-business',
      need: 'website',
      budget: '500-2000',
      name: 'John',
      company: 'JohnCo',
    });
    expect(result.persona).toBe('sme');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].task).toBe('Upload logo');
  });

  it('generateOnboardingChecklistFlow falls back on error', async () => {
    const { generateOnboardingChecklistFlow } = await import('@/ai/flows/generate-onboarding-checklist');
    setMockError('Gateway error');

    const result = await generateOnboardingChecklistFlow({
      audience: 'myself',
      need: 'not-sure',
      budget: 'not-sure',
      name: 'Jane',
    });
    expect(result.persona).toBe('sme');
    expect(result.items.length).toBeGreaterThan(0);
  });
});

describe('Pattern C — JSON mode with quality control retry', () => {
  it('generateDashboardInsights retries on quality failure', async () => {
    const { generateDashboardInsights } = await import('@/ai/flows/generate-dashboard-insights');
    setMockJsonResponse({
      dailyTips: ['Tip 1', 'Tip 2', 'Tip 3'],
      recommendations: ['Rec 1', 'Rec 2'],
    });

    const result = await generateDashboardInsights({
      userId: 'user-1',
      businessDescription: 'A tech startup',
      industry: 'Technology',
    });

    expect(result.dailyTips).toHaveLength(3);
    expect(result.recommendations).toHaveLength(2);
    const calls = getGenerateCalls();
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[0].jsonMode).toBe(true);
  });

  it('generateAssessmentSummary retries on quality failure', async () => {
    const { generateAssessmentSummary } = await import('@/ai/flows/generate-assessment-summary');
    setMockContent('Great assessment results with strengths and recommendations for your business growth.');

    const result = await generateAssessmentSummary({
      responses: [{ question: 'Q1', answer: 'Good', score: 3, category: 'Finance' }],
      industry: 'Finance',
    });

    expect(result.summary.length).toBeGreaterThan(0);
    const calls = getGenerateCalls();
    expect(calls[0].systemPrompt).toContain('Zimbabwe business assessor');
  });
});

describe('Pattern D — Dynamic system prompts', () => {
  it('generateBusinessInsight selects correct persona', async () => {
    const { generateBusinessInsight } = await import('@/ai/flows/generate-business-insight');
    setMockContent('Generated insight');

    const result = await generateBusinessInsight({
      businessDescription: 'A retail shop',
      insightType: 'profile_generator',
    });

    expect(result.insight).toBe('Generated insight');
    const call = getLastGenerateCall();
    expect(call?.systemPrompt).toContain('Tino');
    expect(call?.difficulty).toBe('complex');
  });

  it('generateBusinessInsight uses different persona per type', async () => {
    const { generateBusinessInsight } = await import('@/ai/flows/generate-business-insight');
    setMockContent('Slogans');

    await generateBusinessInsight({ businessDescription: 'Cafe', insightType: 'slogan_generator' });
    expect(getLastGenerateCall()?.systemPrompt).toContain('Zimbabwe brand strategist');
  });
});

describe('Pattern E — External service integration', () => {
  it('generatePersonalizedBrief falls back to tender listing on parse failure', async () => {
    vi.mock('@/services/news-scraper', () => ({
      getNewsForUser: vi.fn().mockResolvedValue([]),
    }));
    vi.mock('@/services/tender-scraper', () => ({
      getTendersForUser: vi.fn().mockResolvedValue([
        { id: 't1', title: 'Road works', description: 'Build road', organization: 'Govt',
          sourceUrl: 'https://example.com', sourceName: 'Test', publishedAt: new Date(),
          closingDate: new Date(), value: '$10k', category: 'Construction', sector: 'Construction',
          region: 'Zimbabwe', requirements: [], status: 'open', processedAt: new Date(), scrapedAt: new Date() },
      ]),
    }));

    const { generatePersonalizedBrief } = await import('@/ai/flows/generate-personalized-brief');
    setMockContent('not valid json');
    (getLastGenerateCall); // flush

    const result = await generatePersonalizedBrief({
      userId: 'user-1',
      industry: 'Construction',
      focusArea: 'both',
    });
    expect(result.relevantTenders.length).toBeGreaterThan(0);
    expect(result.summary).toBeTruthy();
  });
});

describe('Gateway generates correct parameters for each flow', () => {
  it('swot-analysis uses complex difficulty', async () => {
    const { generateSwotAnalysis } = await import('@/ai/flows/generate-swot-analysis');
    setMockContent('x'); await generateSwotAnalysis({ query: 'test' }).catch(() => {});
    expect(getLastGenerateCall()?.difficulty).toBe('complex');
  });

  it('tax-copilot uses simple difficulty with jsonMode', async () => {
    const { generateTaxAnswer } = await import('@/ai/flows/tax-copilot');
    setMockContent('x'); await generateTaxAnswer({ query: 'test' }).catch(() => {});
    const call = getLastGenerateCall();
    expect(call?.difficulty).toBe('simple');
    expect(call?.jsonMode).toBe(true);
  });

  it('moderate-community uses appropriate tokens', async () => {
    const { moderateCommunityContent } = await import('@/ai/flows/moderate-community-content');
    setMockContent('x'); await moderateCommunityContent({ text: 'test' }).catch(() => {});
    expect(getLastGenerateCall()?.maxTokens).toBe(512);
  });
});

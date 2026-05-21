import { AIGateway } from '@/services/ai/ai-gateway';

const gateway = new AIGateway();

export interface ContentScore {
  impactScore: number;
  urgencyScore: number;
  confidenceScore: number;
  reasoning: string;
}

export async function scoreArticle(
  title: string,
  summary: string,
  sourceUrl: string,
  publishedAt: Date,
  closingDate?: Date | null,
  category?: string,
): Promise<ContentScore> {
  const { getSourceConfidence, scoreUrgency } = await import('./source-credibility');

  const confidenceScore = getSourceConfidence(sourceUrl);
  const urgencyScore = scoreUrgency(publishedAt, closingDate);

  const isTender = !!closingDate;
  const typeLabel = isTender ? 'tender' : 'news article';

  const prompt = `Score this Zimbabwe ${typeLabel} on IMPACT for Zimbabwean SMEs (0-100).

Title: ${title}
${summary ? `Summary: ${summary.slice(0, 500)}` : ''}
Category: ${category || 'general'}
Source: ${sourceUrl}
${closingDate ? `Closing Date: ${closingDate.toISOString()}` : ''}
Published: ${publishedAt.toISOString()}

Rate IMPACT (0-100) based on:
- How many Zimbabwean SMEs does this affect?
- Is it a regulatory/financial change?
- What's the economic scope?
- Is there a financial opportunity or cost?

Return ONLY valid JSON:
{ "impactScore": 0-100, "reasoning": "1 sentence explaining the score" }`;

  try {
    const result = await gateway.generate({
      prompt,
      systemPrompt: 'You are a Zimbabwe business intelligence analyst. Score 0-100. Return ONLY valid JSON.',
      difficulty: 'simple',
      maxTokens: 256,
      temperature: 0.2,
      jsonMode: true,
    });

    const parsed = JSON.parse(result.content);
    const impactScore = Math.max(0, Math.min(100, Math.round(parsed.impactScore || 0)));

    return {
      impactScore,
      urgencyScore,
      confidenceScore,
      reasoning: (parsed.reasoning || '').slice(0, 200),
    };
  } catch {
    return {
      impactScore: 50,
      urgencyScore,
      confidenceScore,
      reasoning: 'Default score (AI parsing failed)',
    };
  }
}

export async function scoreBatch(
  items: Array<{
    id: string;
    title: string;
    summary: string;
    sourceUrl: string;
    publishedAt: Date;
    closingDate?: Date | null;
    category?: string;
    type: 'news' | 'tender';
  }>,
): Promise<Array<{ id: string; scores: ContentScore }>> {
  const { getSourceConfidence, scoreUrgency } = await import('./source-credibility');

  const descriptions = items.map((item, i) => {
    const isTender = item.type === 'tender';
    return `ITEM ${i + 1}:
Title: ${item.title}
${item.summary ? `Summary: ${item.summary.slice(0, 300)}` : ''}
Category: ${item.category || 'general'}
Source: ${item.sourceUrl}
${isTender && item.closingDate ? `Closing: ${item.closingDate.toISOString()}` : ''}
Published: ${item.publishedAt.toISOString()}`;
  }).join('\n\n');

  const prompt = `Score each Zimbabwe item below on IMPACT for Zimbabwean SMEs (0-100).

${descriptions}

For each ITEM, return JSON array:
[
  { "itemIndex": 1, "impactScore": 0-100, "reasoning": "brief reason" },
  { "itemIndex": 2, "impactScore": 0-100, "reasoning": "brief reason" }
]

Rate IMPACT (0-100) on: economic scope, SME relevance, regulatory/financial impact, opportunity/cost.
Return ONLY valid JSON array.`;

  try {
    const result = await gateway.generate({
      prompt,
      systemPrompt: 'You are a Zimbabwe business intelligence analyst. Return ONLY valid JSON array.',
      difficulty: 'simple',
      maxTokens: 1024,
      temperature: 0.2,
      jsonMode: true,
    });

    const parsed = JSON.parse(result.content);
    if (!Array.isArray(parsed)) return fallbackScores(items);

    return items.map((item, i) => {
      const ai = parsed.find((p: any) => p.itemIndex === i + 1);
      const impactScore = ai ? Math.max(0, Math.min(100, Math.round(ai.impactScore || 0))) : 50;
      const reasoning = ai ? (ai.reasoning || '').slice(0, 200) : 'Default';
      const confidenceScore = getSourceConfidence(item.sourceUrl);
      const urgencyScore = scoreUrgency(item.publishedAt, item.closingDate);

      return {
        id: item.id,
        scores: { impactScore, urgencyScore, confidenceScore, reasoning },
      };
    });
  } catch {
    return fallbackScores(items);
  }
}

function fallbackScores(
  items: Array<{ id: string; sourceUrl: string; publishedAt: Date; closingDate?: Date | null }>,
): Array<{ id: string; scores: ContentScore }> {
  const { getSourceConfidence, scoreUrgency } = require('./source-credibility');
  return items.map((item) => ({
    id: item.id,
    scores: {
      impactScore: 50,
      urgencyScore: scoreUrgency(item.publishedAt, item.closingDate),
      confidenceScore: getSourceConfidence(item.sourceUrl),
      reasoning: 'Default (batch scoring failed)',
    },
  }));
}

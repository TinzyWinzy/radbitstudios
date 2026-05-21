import { AIGateway } from '@/services/ai/ai-gateway';
import type { DiscoveredSource } from './source-crawler';

const gateway = new AIGateway();

export interface ClassifiedSource extends DiscoveredSource {
  relevanceScore: number;
  qualityScore: number;
  updateFrequency: 'daily' | 'weekly' | 'monthly' | 'unknown';
  reasonForSelection: string;
}

export async function classifySources(sources: DiscoveredSource[]): Promise<ClassifiedSource[]> {
  if (sources.length === 0) return [];

  const descriptions = sources.map((s, i) =>
    `SOURCE ${i + 1}:
URL: ${s.url}
Name: ${s.name}
Description: ${s.description.slice(0, 200)}
Has RSS Feed: ${s.feedUrl ? 'Yes' : 'No'}`
  ).join('\n\n');

  const prompt = `Evaluate each Zimbabwe-related website below as a business news source for Zimbabwean SMEs.

${descriptions}

For each SOURCE, return a JSON array:
[
  {
    "itemIndex": 1,
    "relevance": 0-100,
    "quality": 0-100,
    "frequency": "daily|weekly|monthly|unknown",
    "reason": "Why this would be valuable for Zim SME news"
  },
  ...
]

Rate RELEVANCE (0-100): How Zimbabwe-business related is this source?
Rate QUALITY (0-100): Professional journalism, regular updates, credible content?
Return ONLY valid JSON array.`;

  try {
    const result = await gateway.generate({
      prompt,
      systemPrompt: 'You are a media analyst evaluating Zimbabwe news sources. Return ONLY valid JSON array.',
      difficulty: 'simple',
      maxTokens: 2048,
      temperature: 0.2,
      jsonMode: true,
    });

    const parsed = JSON.parse(result.content);
    if (!Array.isArray(parsed)) return sources.map(s => ({ ...s, updateFrequency: 'unknown' as const }));

    return sources.map((s, i) => {
      const ai = parsed.find((p: any) => p.itemIndex === i + 1);
      return {
        ...s,
        relevanceScore: ai ? Math.max(0, Math.min(100, Math.round(ai.relevance || 50))) : 50,
        qualityScore: ai ? Math.max(0, Math.min(100, Math.round(ai.quality || 50))) : 50,
        updateFrequency: (ai?.frequency && ['daily', 'weekly', 'monthly'].includes(ai.frequency) ? ai.frequency : 'unknown') as ClassifiedSource['updateFrequency'],
        reasonForSelection: ai?.reason ? String(ai.reason).slice(0, 300) : s.reasonForSelection,
      };
    });
  } catch {
    return sources.map(s => ({ ...s, updateFrequency: 'unknown' as const }));
  }
}

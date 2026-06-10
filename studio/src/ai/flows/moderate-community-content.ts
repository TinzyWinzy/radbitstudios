'use server';

import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';

const ModerateCommunityContentInputSchema = z.object({
  text: z.string().describe('The text content to be moderated.'),
});
export type ModerateCommunityContentInput = z.infer<typeof ModerateCommunityContentInputSchema>;

const ModerateCommunityContentOutputSchema = z.object({
  isSafe: z.boolean(),
  reason: z.string().optional(),
});
export type ModerateCommunityContentOutput = z.infer<typeof ModerateCommunityContentOutputSchema>;

const gateway = aiGateway;

const BLOCKED_KEYWORDS = [
  'kill', 'murder', 'rape', 'slur', 'nigger', 'kike', 'spic',
  'bomb', 'terrorist', 'child porn', 'snuff',
];

function preFilter(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_KEYWORDS.some(k => lower.includes(k));
}

export async function moderateCommunityContent(input: ModerateCommunityContentInput): Promise<ModerateCommunityContentOutput> {
  if (preFilter(input.text)) {
    return { isSafe: false, reason: 'Content contains blocked keywords' };
  }

  const systemPrompt = `Determine if the text is safe for a community of Zimbabwean SME owners. Check: hate speech, harassment, dangerous content, sexually explicit material. Return JSON: {"isSafe": true} or {"isSafe": false, "reason": "..."} Only valid JSON.`;

  const result = await gateway.generate({
    prompt: input.text,
    systemPrompt,
    difficulty: 'complex',
    maxTokens: 512,
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(result.content);
    return {
      isSafe: parsed.isSafe ?? false,
      reason: parsed.reason,
    };
  } catch {
    return { isSafe: false, reason: 'Moderation service returned an invalid response' };
  }
}

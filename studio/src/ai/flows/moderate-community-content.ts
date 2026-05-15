'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const ModerateCommunityContentInputSchema = z.object({
  text: z.string().describe('The text content to be moderated.'),
});
export type ModerateCommunityContentInput = z.infer<typeof ModerateCommunityContentInputSchema>;

const ModerateCommunityContentOutputSchema = z.object({
  isSafe: z.boolean(),
  reason: z.string().optional(),
});
export type ModerateCommunityContentOutput = z.infer<typeof ModerateCommunityContentOutputSchema>;

const gateway = new AIGateway();

export async function moderateCommunityContent(input: ModerateCommunityContentInput): Promise<ModerateCommunityContentOutput> {
  const systemPrompt = `You are an AI content moderator. Determine if the provided text is safe and appropriate for a community of Zimbabwean SME owners.

Categories to check: hate speech, harassment, dangerous content, sexually explicit material.

Return ONLY a JSON object:
- If safe: {"isSafe": true}
- If unsafe: {"isSafe": false, "reason": "Brief explanation of why"}

Return ONLY valid JSON.`;

  const result = await gateway.generate({
    prompt: input.text,
    systemPrompt,
    difficulty: 'simple',
    maxTokens: 256,
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(result.content);
    return {
      isSafe: parsed.isSafe ?? true,
      reason: parsed.reason,
    };
  } catch {
    return { isSafe: true };
  }
}

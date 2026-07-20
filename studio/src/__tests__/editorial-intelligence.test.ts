import { describe, expect, it } from 'vitest';
import { EditorialBriefInputSchema, EditorialBriefOutputSchema, RADBIT_EDITORIAL_SYSTEM_PROMPT } from '@/ai/flows/generate-editorial-brief';

describe('editorial intelligence', () => {
  it('rejects vague topics before calling the model', () => {
    expect(EditorialBriefInputSchema.safeParse({ topic: 'AI' }).success).toBe(false);
  });

  it('keeps publishing and evidence safeguards in the system prompt', () => {
    expect(RADBIT_EDITORIAL_SYSTEM_PROMPT).toContain('not an autonomous publisher');
    expect(RADBIT_EDITORIAL_SYSTEM_PROMPT).toContain('never invent statistics');
    expect(RADBIT_EDITORIAL_SYSTEM_PROMPT).toContain('FIRSTHAND CONTEXT');
  });

  it('requires confidence labels and the complete content graph', () => {
    const result = EditorialBriefOutputSchema.safeParse({ title: 'Incomplete' });
    expect(result.success).toBe(false);
  });
});

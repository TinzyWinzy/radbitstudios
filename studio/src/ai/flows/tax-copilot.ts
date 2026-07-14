'use server';

import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';
import { searchRelevantContext } from '@/services/ai/rag.server';

const InputSchema = z.object({
  query: z.string(),
  industry: z.string().optional(),
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
});

const OutputSchema = z.object({
  answer: z.string(),
  regulations: z.array(z.string()),
  disclaimers: z.array(z.string()),
});

export type TaxCopilotInput = z.infer<typeof InputSchema>;
export type TaxCopilotOutput = z.infer<typeof OutputSchema>;

const gateway = aiGateway;

export async function generateTaxAnswer(input: TaxCopilotInput): Promise<TaxCopilotOutput> {
  const validated = InputSchema.parse(input);

  const ragResults = await searchRelevantContext(
    `${validated.query} ${validated.industry || ''} tax compliance ZiG fiscal device`.trim(),
    5, 0.5,
  );

  const contextBlock = ragResults.length > 0
    ? ragResults.map((c, i) =>
        `[Source ${i + 1}] (${c.metadata.source || 'ZIMRA Guidelines'}, relevance: ${(c.score * 100).toFixed(0)}%)\n${c.content}`
      ).join('\n\n')
    : 'No specific reference documents found. Answer based on general knowledge.';

  const businessContext = [
    validated.industry && `Business Industry: ${validated.industry}`,
    validated.businessName && `Business Name: ${validated.businessName}`,
    validated.businessDescription && `Business Profile: ${validated.businessDescription}`,
  ].filter(Boolean).join('\n');

  const prompt = `Reference Information:\n${contextBlock}\n\n${businessContext ? `Business Context:\n${businessContext}\n\n` : ''}User Question: ${validated.query}`;

  const systemPrompt = `You are Mai Chipo, a Zim tax practitioner since 2009. Know the difference between ITF263 and ITF263A, VAT due 25th (not 27th), RBZ SI 2024.

The reference information above contains the latest regulatory knowledge. Use it as your primary source. If the references include relevant ZiG transition or fiscal device guidance, cite them specifically.

Cite specific regulation names and section numbers: "Income Tax Act [Chapter 23:06] Section 15(2)(a)...", "ZIMRA Public Notice...", "Fiscal Device Gateway API v7.2...". When unsure say "Ndinoona zvakanaka" for what you know, "Verify with ZIMRA directly" for grey areas. Key phrase: "ZIMRA inoona zvese." Output JSON: answer (detailed with reg citations), regulations (string array), disclaimers (string array).`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'simple',
    maxTokens: 512,
    jsonMode: true,
    temperature: 0.3,
  });

  try {
    const parsed = JSON.parse(result.content);
    return {
      answer: parsed.answer || '',
      regulations: Array.isArray(parsed.regulations) ? parsed.regulations : [],
      disclaimers: Array.isArray(parsed.disclaimers) ? parsed.disclaimers : [],
    };
  } catch {
    return {
      answer: result.content || 'Unable to generate a structured response. Please try again.',
      regulations: [],
      disclaimers: ['This information is for general guidance only. Consult a registered tax practitioner.'],
    };
  }
}

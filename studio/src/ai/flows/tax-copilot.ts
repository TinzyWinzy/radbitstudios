'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const InputSchema = z.object({
  query: z.string(),
  context: z.array(z.object({
    content: z.string(),
    source: z.string(),
    score: z.number(),
  })),
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

const gateway = new AIGateway();

export async function generateTaxAnswer(input: TaxCopilotInput): Promise<TaxCopilotOutput> {
  const validated = InputSchema.parse(input);

  const contextBlock = validated.context.length > 0
    ? validated.context.map((c, i) =>
        `[Source ${i + 1}] (${c.source}, relevance: ${(c.score * 100).toFixed(0)}%)\n${c.content}`
      ).join('\n\n')
    : 'No specific reference documents found. Answer based on general knowledge.';

  const businessContext = [
    validated.industry && `Business Industry: ${validated.industry}`,
    validated.businessName && `Business Name: ${validated.businessName}`,
    validated.businessDescription && `Business Profile: ${validated.businessDescription}`,
  ].filter(Boolean).join('\n');

  const prompt = `Reference Information:\n${contextBlock}\n\n${businessContext ? `Business Context:\n${businessContext}\n\n` : ''}User Question: ${validated.query}`;

  const systemPrompt = `You are a Zimbabwean tax compliance assistant specializing in ZIMRA regulations for SMEs.${validated.industry ? ` The user operates in the ${validated.industry} sector.` : ''}${validated.businessName ? ` Their business is ${validated.businessName}.` : ''}

Based on the provided reference information, answer the user's tax question. Follow these rules:
1. Answer clearly and directly, citing specific regulation names where possible.
2. Tailor your response to the user's industry and business context where relevant.
3. If the reference information does not contain enough detail, state that the user should consult a registered tax practitioner or contact ZIMRA directly.
4. List specific regulations or legal instruments that apply to the user's situation.
5. Include appropriate disclaimers about seeking professional advice.

Respond with a JSON object with these exact keys:
{
  "answer": "Your detailed answer here",
  "regulations": ["Regulation 1", "Regulation 2"],
  "disclaimers": ["Disclaimer 1", "Disclaimer 2"]
}

Return ONLY valid JSON.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'simple',
    maxTokens: 1024,
    jsonMode: true,
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

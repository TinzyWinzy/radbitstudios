import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';

// ─── Shared Business Profile Builder ────────────────────────────────────────

export interface BusinessProfileFields {
  businessName?: string;
  industry?: string;
  businessDescription?: string;
  employeeCount?: number;
}

export function buildBusinessProfile(input: BusinessProfileFields, extra?: string[]): string {
  const lines = [
    input.businessName ? `- Business Name: ${input.businessName}` : '',
    input.industry ? `- Industry: ${input.industry}` : '',
    input.businessDescription ? `- Description: ${input.businessDescription}` : '',
    input.employeeCount ? `- Employees: ${input.employeeCount}` : '',
    ...(extra || []),
  ].filter(Boolean);
  return lines.length > 0 ? lines.join('\n') : '(No profile provided)';
}

// ─── Shared Input/Output Schemas ────────────────────────────────────────────

export const PersonaInputSchema = z.object({
  query: z.string(),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessDescription: z.string().optional(),
});
export type PersonaInput = z.infer<typeof PersonaInputSchema>;

export const PersonaOutputSchema = z.object({
  answer: z.string(),
});
export type PersonaOutput = z.infer<typeof PersonaOutputSchema>;

// ─── Persona Chatbot Factory ────────────────────────────────────────────────

export interface PersonaConfig {
  name: string;
  systemPrompt: string;
  profileLabel?: string;
  queryLabel?: string;
  difficulty?: 'simple' | 'complex' | 'creative';
  temperature?: number;
  maxTokens?: number;
  extraFields?: string[];
}

const gateway = aiGateway;

export function createPersonaChatbot(config: PersonaConfig) {
  return async function (input: PersonaInput): Promise<PersonaOutput> {
    const profile = buildBusinessProfile(input, config.extraFields);
    const queryLabel = config.queryLabel || 'User request';
    const profileLabel = config.profileLabel || 'Profile';

    const prompt = `${profileLabel}:\n${profile}\n\n${queryLabel}: ${input.query}`;

    const result = await gateway.generate({
      prompt,
      systemPrompt: config.systemPrompt,
      difficulty: config.difficulty || 'complex',
      temperature: config.temperature ?? 0.5,
      maxTokens: config.maxTokens || 1024,
    });

    if (result.error) throw new Error(result.error);
    return { answer: result.content };
  };
}

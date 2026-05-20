'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const TenderProposalInputSchema = z.object({
  tenderTitle: z.string(),
  tenderDescription: z.string(),
  organization: z.string(),
  closingDate: z.string().optional(),
  requirements: z.array(z.string()),
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
  currency: z.enum(['USD', 'ZiG', 'ZAR']).default('USD'),
});
export type TenderProposalInput = z.infer<typeof TenderProposalInputSchema>;

const TenderProposalOutputSchema = z.object({
  executiveSummary: z.string(),
  technicalApproach: z.string(),
  teamQualification: z.string(),
  financialProposal: z.string(),
  complianceChecklist: z.array(z.string()),
  riskMitigation: z.array(z.string()),
});
export type TenderProposalOutput = z.infer<typeof TenderProposalOutputSchema>;

const gateway = new AIGateway();

export async function generateTenderProposal(input: TenderProposalInput): Promise<TenderProposalOutput> {
  const prompt = `Tender: ${input.tenderTitle}
Description: ${input.tenderDescription}
Organization: ${input.organization}
Closing Date: ${input.closingDate || 'Not specified'}
Requirements: ${input.requirements.join(', ')}
Business: ${input.businessName || 'Our Business'}
Business Profile: ${input.businessDescription || 'SME'}
Currency: ${input.currency}`;

  const systemPrompt = `You are a professional bid writer specializing in SADC public procurement. Generate a compliant, persuasive proposal response.

Output JSON with these fields:
- executiveSummary: 3-4 sentence overview tailored to the tender
- technicalApproach: How we will deliver (2-3 paragraphs)
- teamQualification: Relevant experience and capability statement
- financialProposal: Pricing structure in ${input.currency}. Include unit costs, total, and validity period
- complianceChecklist: Array of key compliance items we meet
- riskMitigation: Array of risks and how we address them

Use formal business English. Be specific, not generic. Keep financial proposal in ${input.currency}.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'complex',
    maxTokens: 2048,
    jsonMode: true,
  });

  const parsed = TenderProposalOutputSchema.parse(JSON.parse(result.content));
  return parsed;
}

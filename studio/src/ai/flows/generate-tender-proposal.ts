'use server';

import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';

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

const gateway = aiGateway;

export async function generateTenderProposal(input: TenderProposalInput): Promise<TenderProposalOutput> {
  const prompt = `Tender: ${input.tenderTitle}
Description: ${input.tenderDescription}
Organization: ${input.organization}
Closing Date: ${input.closingDate || 'Not specified'}
Requirements: ${input.requirements.join(', ')}
Business: ${input.businessName || 'Our Business'}
Business Profile: ${input.businessDescription || 'SME'}
Currency: ${input.currency}`;

  const systemPrompt = `You help draft Zimbabwe tender proposals from user-provided information. Do not claim PRAZ approval, legal compliance, document validity, or a guaranteed award. Flag items the user should check against the original solicitation and current official guidance, including tax-clearance records, VAT treatment, bid bonds, NSSA records, signatures, certificate dates, pricing validity, escalation, force majeure, and currency terms. Label the checklist as preparation support requiring human review. Output JSON with: executiveSummary, technicalApproach, teamQualification, financialProposal in ${input.currency}, complianceChecklist, riskMitigation.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'complex',
    maxTokens: 1536,
    jsonMode: true,
    enableRAG: true,
    ragCategory: 'zimra_tenders',
    enableNews: true,
  });

  const parsed = TenderProposalOutputSchema.parse(JSON.parse(result.content));
  return parsed;
}

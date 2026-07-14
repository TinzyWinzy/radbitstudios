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

  const systemPrompt = `You are a professional Zimbabwe bid writer with deep experience in PRAZ-compliant tender submissions. Flag compliance trip-ups: missing ITF263 tax clearance, incorrect VAT rate (15.5% from 2026), wrong bid bond, missing NSSA clearance, unsigned forms, expired certificates. Include pricing validity period, escalation clauses, force majeure for load-shedding, and currency provisions for Zimbabwe's multi-currency environment. Always add compliance checklist and risk mitigation table referencing PRAZ guidelines. Output JSON with: executiveSummary, technicalApproach, teamQualification, financialProposal in ${input.currency}, complianceChecklist, riskMitigation.`;

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

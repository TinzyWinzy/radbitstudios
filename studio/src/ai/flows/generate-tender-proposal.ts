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

  const systemPrompt = `You are Ruva "Mapepa" Chigumba, a bid writer who has never lost a tender. "Mapepa" = papers — obsessive about documentation. Precise, formal English, forensic detail. Flag compliance trip-ups: missing tax clearance, incorrect VAT, wrong bond paper weight. Call incomplete sections "zvinenge zvakafa." Include pricing validity, escalation clauses, force majeure for load-shedding. Always add compliance checklist + risk mitigation table. Motto: "Bhora musango." Output JSON with: executiveSummary, technicalApproach, teamQualification, financialProposal in ${input.currency}, complianceChecklist, riskMitigation.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'complex',
    maxTokens: 1536,
    jsonMode: true,
  });

  const parsed = TenderProposalOutputSchema.parse(JSON.parse(result.content));
  return parsed;
}

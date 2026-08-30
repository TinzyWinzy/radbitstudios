import { Opportunity, EvidenceItem, Hypothesis } from '../types';
import { aehmlModelProvider } from '../kernel/model-provider';
import { v4 as uuidv4 } from 'uuid';

export interface IntelligenceOutput {
  extractedEvidence: EvidenceItem[];
  generatedHypotheses: Hypothesis[];
  summary: string;
}

export const intelligenceHolon = {
  id: '11111111-1111-1111-1111-111111111102',
  name: 'Intelligence Holon',

  analyze: async (
    opportunity: Opportunity,
    rawText: string,
    existingEvidence: EvidenceItem[] = []
  ): Promise<IntelligenceOutput> => {
    const response = await aehmlModelProvider.invoke<IntelligenceOutput>(
      {
        holonId: intelligenceHolon.id,
        task: 'Extract empirical claims and generate competing hypotheses',
        context: { opportunity, rawText, existingEvidenceCount: existingEvidence.length },
      },
      () => {
        const newEvidence: EvidenceItem[] = [];
        const newHypotheses: Hypothesis[] = [];

        // Claim 1
        const ev1Id = uuidv4();
        newEvidence.push({
          id: ev1Id,
          opportunity_id: opportunity.id,
          claim: `Observed operational context for ${opportunity.organization_name} in ${opportunity.sector} sector.`,
          evidence_type: 'observed_behavior',
          source: rawText ? 'Submitted Field Note / Intelligence Report' : 'Market Research',
          confidence: 'moderate',
          confidence_score: 0.75,
          validation_status: 'unvalidated',
          supporting_or_contradicting: 'supporting',
          originating_holon_id: intelligenceHolon.id,
          is_untrusted_external: false,
          created_at: new Date().toISOString(),
        });

        // Generate 2 competing hypotheses
        newHypotheses.push({
          id: uuidv4(),
          opportunity_id: opportunity.id,
          statement: `Hypothesis Alpha: Core commercial bottleneck is operational workflow latency in ${opportunity.sector}.`,
          status: 'candidate',
          supporting_evidence_ids: [ev1Id],
          contradicting_evidence_ids: [],
          missing_evidence: 'Direct metric verification with Problem Owner',
          verification_action: 'Conduct structured discovery interview on operational metrics',
          commercial_consequence: 'Unlocks high-margin bespoke integration package',
          confidence: 'moderate',
          created_by_holon_id: intelligenceHolon.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        newHypotheses.push({
          id: uuidv4(),
          opportunity_id: opportunity.id,
          statement: `Hypothesis Beta: Client has limited discretionary budget and requires low-cost phased pilot.`,
          status: 'candidate',
          supporting_evidence_ids: [],
          contradicting_evidence_ids: [],
          missing_evidence: 'Fiscal year CapEx schedule and Economic Buyer sign-off',
          verification_action: 'Inquire on budgetary allocation window in next touchpoint',
          commercial_consequence: 'Requires milestone-based billing to avoid bad debt',
          confidence: 'low',
          created_by_holon_id: intelligenceHolon.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        return {
          extractedEvidence: newEvidence,
          generatedHypotheses: newHypotheses,
          summary: `Extracted ${newEvidence.length} evidence items and generated ${newHypotheses.length} competing hypotheses for ${opportunity.organization_name}.`,
        };
      }
    );

    return response.output;
  },
};

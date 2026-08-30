import { Opportunity, EvidenceItem, VincentScoreBreakdown, Decision } from '../types';
import { aehmlScoring } from '../kernel/scoring';
import { aehmlGovernance, ConstitutionalCheckResult } from '../kernel/governance';

export interface VincentEvaluationOutput {
  scoreBreakdown: VincentScoreBreakdown;
  constitutionalCheck: ConstitutionalCheckResult;
  governanceVerdict: 'APPROVED' | 'GATED' | 'KILLED';
  rationale: string;
}

export const vincentH4Holon = {
  id: '11111111-1111-1111-1111-111111111105',
  name: 'Vincent H4 Governance',

  evaluate: async (
    opportunity: Opportunity,
    evidenceList: EvidenceItem[],
    proposedDecision?: Partial<Decision>,
    deliveryFeasible?: boolean,
    deliveryRisk?: number
  ): Promise<VincentEvaluationOutput> => {
    // 1. Calculate 100-point score
    const scoreBreakdown = aehmlScoring.calculateVincentScore(opportunity, evidenceList);

    // 2. Constitutional check
    const constitutionalCheck = aehmlGovernance.validateDecisionAgainstConstitution(
      proposedDecision || { recommended_action: 'RESEARCH', human_approval_required: true },
      opportunity,
      evidenceList,
      deliveryFeasible,
      deliveryRisk
    );

    let governanceVerdict: VincentEvaluationOutput['governanceVerdict'] = 'APPROVED';
    let rationale = `Scored ${scoreBreakdown.totalScore}/100 [Band: ${scoreBreakdown.scoreBand}].`;

    if (!constitutionalCheck.passed) {
      governanceVerdict = 'GATED';
      rationale = `Proposal gated due to constitutional violations: ${constitutionalCheck.violations.join('; ')}`;
    } else if (scoreBreakdown.totalScore < 50 && proposedDecision?.recommended_action === 'PROPOSE') {
      governanceVerdict = 'KILLED';
      rationale = `Kill rule triggered: score ${scoreBreakdown.totalScore} is insufficient for high-cost proposal preparation.`;
    }

    return {
      scoreBreakdown,
      constitutionalCheck,
      governanceVerdict,
      rationale,
    };
  },
};

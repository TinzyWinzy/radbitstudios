import {
  Opportunity,
  EvidenceItem,
  Decision,
  Episode,
} from '../types';
import { SalesDiagnosisOutput } from './sales';
import { DeliveryAssessmentOutput } from './delivery';
import { RedTeamOutput } from './red_team';
import { VincentEvaluationOutput } from './vincent_h4';
import { v4 as uuidv4 } from 'uuid';

export interface DecisionPackage {
  decision: Decision;
  synthesisSummary: string;
  recommendedAction: string;
  confidence: number;
  deliveryFeasible: boolean;
  redTeamChallengesCount: number;
  vincentVerdict: string;
}

export const executiveHolon = {
  id: '11111111-1111-1111-1111-111111111101',
  name: 'Executive Holon',

  synthesize: async (
    opportunity: Opportunity,
    episode: Episode,
    evidenceList: EvidenceItem[],
    salesDiagnosis: SalesDiagnosisOutput,
    deliveryAssessment: DeliveryAssessmentOutput,
    redTeamOutput: RedTeamOutput,
    vincentEvaluation: VincentEvaluationOutput
  ): Promise<DecisionPackage> => {
    const evidenceIds = evidenceList.map((e) => e.id);

    const rationale = [
      `Sales Holon recommends [${salesDiagnosis.recommendedAction}] based on buyer state (${salesDiagnosis.buyerState}).`,
      `Vincent H4 Score: ${vincentEvaluation.scoreBreakdown.totalScore}/100 [Verdict: ${vincentEvaluation.governanceVerdict}].`,
      `Delivery Feasibility: ${deliveryAssessment.delivery_feasible ? 'FEASIBLE' : 'INFEASIBLE'} (Est. Cost: $${deliveryAssessment.estimated_cost}, Risk: ${(deliveryAssessment.delivery_risk * 100).toFixed(0)}%).`,
      `Red Team Stress Test: ${redTeamOutput.fatal_assumptions.length} fatal assumptions flagged. Cheapest disconfirming test: "${redTeamOutput.cheapest_disconfirming_test}".`,
    ].join('\n');

    const decision: Decision = {
      id: uuidv4(),
      episode_id: episode.id,
      opportunity_id: opportunity.id,
      holon_id: executiveHolon.id,
      decision_type: 'commercial_next_action',
      recommended_action: salesDiagnosis.recommendedAction,
      alternatives_considered: salesDiagnosis.alternativesConsidered,
      rationale,
      evidence_ids: evidenceIds,
      confidence: Number(
        (
          (salesDiagnosis.confidence +
            deliveryAssessment.delivery_confidence +
            (1 - deliveryAssessment.delivery_risk)) /
          3
        ).toFixed(2)
      ),
      estimated_value: opportunity.expected_value || opportunity.estimated_contract_value || 0,
      estimated_cost: deliveryAssessment.estimated_cost,
      estimated_risk: deliveryAssessment.delivery_risk,
      authority_required: { role: 'commercial_operator' },
      human_approval_required: true, // Non-negotiable in v0.1
      status: 'proposed',
      created_at: new Date().toISOString(),
    };

    return {
      decision,
      synthesisSummary: `Executive decision package compiled for ${opportunity.organization_name}: Action [${decision.recommended_action}] awaiting human operator authorization.`,
      recommendedAction: decision.recommended_action,
      confidence: decision.confidence,
      deliveryFeasible: deliveryAssessment.delivery_feasible,
      redTeamChallengesCount: redTeamOutput.fatal_assumptions.length,
      vincentVerdict: vincentEvaluation.governanceVerdict,
    };
  },
};

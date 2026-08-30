import { Episode, Decision, Evaluation, FailureCategory, Opportunity } from '../types';
import { aehmlReward } from '../kernel/reward';
import { v4 as uuidv4 } from 'uuid';

export interface EvaluatorOutput {
  evaluation: Evaluation;
  retrospective_summary: string;
}

export const evaluatorHolon = {
  id: '11111111-1111-1111-1111-111111111108',
  name: 'Evaluator Holon',

  evaluateEpisode: async (
    episode: Episode,
    decision: Decision,
    opportunity: Opportunity,
    outcomeValue: number,
    wasHumanOverride: boolean = false
  ): Promise<EvaluatorOutput> => {
    const isSuccess = outcomeValue > 0 || opportunity.stage === 'won';

    // 5-dimensional retrospective scores (0 - 100)
    const decisionQualityScore = isSuccess ? 90 : wasHumanOverride ? 65 : 75;
    const evidenceQualityScore = opportunity.confidence === 'high' ? 88 : opportunity.confidence === 'moderate' ? 70 : 50;
    const processQualityScore = 85;
    const outcomeQualityScore = isSuccess ? 92 : 40;
    const commercialFitnessScore = isSuccess ? 88 : 45;

    // Regret calculation
    const alternativeActionList = (decision.alternatives_considered || []).map((alt) => ({
      action: alt,
      estimatedValue: opportunity.expected_value || 0,
    }));

    const regretResult = aehmlReward.calculateDecisionRegret(
      decision.recommended_action,
      outcomeValue,
      alternativeActionList,
      wasHumanOverride
    );

    let failureCategory: FailureCategory | null = null;
    if (!isSuccess && opportunity.stage === 'lost') {
      if (opportunity.primary_risk?.toLowerCase().includes('authority') || !opportunity.economic_buyer) {
        failureCategory = 'buyer_access';
      } else if (opportunity.primary_risk?.toLowerCase().includes('budget') || opportunity.primary_risk?.toLowerCase().includes('cash')) {
        failureCategory = 'cash';
      } else if (opportunity.primary_risk?.toLowerCase().includes('delivery') || opportunity.primary_risk?.toLowerCase().includes('tech')) {
        failureCategory = 'delivery_credibility';
      } else {
        failureCategory = 'qualification';
      }
    }

    const evaluation: Evaluation = {
      id: uuidv4(),
      episode_id: episode.id,
      decision_id: decision.id,
      evaluator_holon_id: evaluatorHolon.id,
      decision_quality_score: decisionQualityScore,
      evidence_quality_score: evidenceQualityScore,
      process_quality_score: processQualityScore,
      outcome_quality_score: outcomeQualityScore,
      commercial_fitness_score: commercialFitnessScore,
      constraint_compliant: true,
      primary_failure_category: failureCategory,
      secondary_failure_category: failureCategory ? 'timing' : null,
      lesson: regretResult.lessonSummary,
      confidence: 0.85,
      observed_regret: regretResult.regretLabel === 'observed_regret' ? regretResult.regret : null,
      estimated_regret: regretResult.regretLabel === 'estimated_regret' ? regretResult.regret : null,
      regret_label: regretResult.regretLabel,
      human_reviewed: false,
      human_agreement: null,
      created_at: new Date().toISOString(),
    };

    return {
      evaluation,
      retrospective_summary: `Evaluation recorded with ${decisionQualityScore}% decision quality and ${evaluation.regret_label}: $${regretResult.regret.toFixed(0)}.`,
    };
  },
};

import {
  Opportunity,
  Episode,
  ActionSpace,
  Decision,
  DecisionOverride,
} from '../types';
import { aehmlDb } from '../db/client';
import { intelligenceHolon } from '../holons/intelligence';
import { salesHolon } from '../holons/sales';
import { deliveryHolon } from '../holons/delivery';
import { redTeamHolon } from '../holons/red_team';
import { vincentH4Holon } from '../holons/vincent_h4';
import { monitorHolon } from '../holons/monitor';
import { evaluatorHolon } from '../holons/evaluator';
import { executiveHolon } from '../holons/executive';
import { aehmlReward } from './reward';
import { v4 as uuidv4 } from 'uuid';

export interface RunCycleResult {
  episode: Episode;
  decision: Decision;
  vincentScore: number;
  scoreBand: string;
  deliveryFeasible: boolean;
  monitorInterrupt: boolean;
  summary: string;
}

export const aehmlOrchestrator = {
  /**
   * Executes the full standard commercial decision cycle (Section 40 & 68).
   */
  runOpportunityDecisionCycle: async (
    opportunityId: string,
    rawNotes: string = '',
    objective: string = 'Determine optimal lowest-cost next commercial action'
  ): Promise<RunCycleResult> => {
    // 1. Fetch current state
    const opportunity = await aehmlDb.getOpportunityById(opportunityId);
    if (!opportunity) {
      throw new Error(`Opportunity ${opportunityId} not found`);
    }

    const existingEvidence = await aehmlDb.getEvidenceByOpportunity(opportunityId);

    // 2. Create Episode
    const episode: Episode = {
      id: uuidv4(),
      opportunity_id: opportunity.id,
      started_at: new Date().toISOString(),
      starting_stage: opportunity.stage,
      objective,
      structure_version: 'v0.1.0',
      vincent_version: 'v0.1.0',
      status: 'in_progress',
    };
    await aehmlDb.saveEpisode(episode);

    // Record Episode Start Trajectory Event
    await aehmlDb.recordTrajectoryEvent({
      id: uuidv4(),
      episode_id: episode.id,
      opportunity_id: opportunity.id,
      event_type: 'observation',
      timestamp: new Date().toISOString(),
      objective: episode.objective,
      state_before: { stage: opportunity.stage, score: opportunity.opportunity_score },
      model_version: 'gpt-4o-2024-08-06',
      prompt_version: 'v0.1.0',
      policy_version: 'v0.1.0',
      harness_version: 'v0.1.0',
      structure_version: 'v0.1.0',
      vincent_version: 'v0.1.0',
      evaluator_version: 'v0.1.0',
      metadata: { rawNotesLength: rawNotes.length },
    });

    // 3. Step 1: Intelligence Holon
    const intelligenceResult = await intelligenceHolon.analyze(
      opportunity,
      rawNotes,
      existingEvidence
    );
    for (const ev of intelligenceResult.extractedEvidence) {
      await aehmlDb.saveEvidence(ev);
      await aehmlDb.recordTrajectoryEvent({
        id: uuidv4(),
        episode_id: episode.id,
        opportunity_id: opportunity.id,
        event_type: 'evidence_added',
        holon_id: intelligenceHolon.id,
        timestamp: new Date().toISOString(),
        evidence_ids: [ev.id],
        action: 'EXTRACT_EVIDENCE',
        model_version: 'gpt-4o-2024-08-06',
        prompt_version: 'v0.1.0',
        policy_version: 'v0.1.0',
        harness_version: 'v0.1.0',
        structure_version: 'v0.1.0',
        vincent_version: 'v0.1.0',
        evaluator_version: 'v0.1.0',
        metadata: { claim: ev.claim, type: ev.evidence_type },
      });
    }

    for (const hyp of intelligenceResult.generatedHypotheses) {
      await aehmlDb.saveHypothesis(hyp);
      await aehmlDb.recordTrajectoryEvent({
        id: uuidv4(),
        episode_id: episode.id,
        opportunity_id: opportunity.id,
        event_type: 'hypothesis_created',
        holon_id: intelligenceHolon.id,
        timestamp: new Date().toISOString(),
        action: 'GENERATE_HYPOTHESIS',
        model_version: 'gpt-4o-2024-08-06',
        prompt_version: 'v0.1.0',
        policy_version: 'v0.1.0',
        harness_version: 'v0.1.0',
        structure_version: 'v0.1.0',
        vincent_version: 'v0.1.0',
        evaluator_version: 'v0.1.0',
        metadata: { statement: hyp.statement },
      });
    }

    const allEvidence = await aehmlDb.getEvidenceByOpportunity(opportunityId);
    const allHypotheses = await aehmlDb.getHypothesesByOpportunity(opportunityId);

    // 4. Step 2: Sales Holon
    const salesDiagnosis = await salesHolon.diagnose(opportunity, allEvidence);

    // 5. Step 3: Delivery Holon
    const deliveryAssessment = await deliveryHolon.assess(opportunity, allEvidence);

    // 6. Step 4: Red Team Holon
    const redTeamOutput = await redTeamHolon.stressTest(opportunity, allEvidence, allHypotheses);

    // 7. Step 5: Vincent H4 Governance & Scoring
    const vincentEvaluation = await vincentH4Holon.evaluate(
      opportunity,
      allEvidence,
      { recommended_action: salesDiagnosis.recommendedAction, human_approval_required: true },
      deliveryAssessment.delivery_feasible,
      deliveryAssessment.delivery_risk
    );

    // Update opportunity score and expected value
    opportunity.opportunity_score = vincentEvaluation.scoreBreakdown.totalScore;
    opportunity.expected_value = Number(
      ((opportunity.estimated_contract_value || 0) * (opportunity.probability_win || 0.1)).toFixed(2)
    );
    opportunity.buyer_state = salesDiagnosis.buyerState;
    opportunity.next_action = salesDiagnosis.recommendedAction;
    await aehmlDb.saveOpportunity(opportunity);

    // 8. Step 6: Monitor Holon Check
    const monitorResult = await monitorHolon.inspect(opportunity, allEvidence);
    for (const intervention of monitorResult.interventions) {
      await aehmlDb.saveMonitorIntervention(intervention);
      await aehmlDb.recordTrajectoryEvent({
        id: uuidv4(),
        episode_id: episode.id,
        opportunity_id: opportunity.id,
        event_type: intervention.interrupted_execution ? 'monitor_interrupt' : 'monitor_warning',
        holon_id: monitorHolon.id,
        timestamp: new Date().toISOString(),
        monitor_intervention_id: intervention.id,
        action: 'MONITOR_ALERT',
        model_version: 'gpt-4o-2024-08-06',
        prompt_version: 'v0.1.0',
        policy_version: 'v0.1.0',
        harness_version: 'v0.1.0',
        structure_version: 'v0.1.0',
        vincent_version: 'v0.1.0',
        evaluator_version: 'v0.1.0',
        metadata: { risk: intervention.risk_type, severity: intervention.severity },
      });
    }

    // 9. Step 7: Executive Aggregation
    const packageResult = await executiveHolon.synthesize(
      opportunity,
      episode,
      allEvidence,
      salesDiagnosis,
      deliveryAssessment,
      redTeamOutput,
      vincentEvaluation
    );

    await aehmlDb.saveDecision(packageResult.decision);

    // Record Decision Proposed Event
    await aehmlDb.recordTrajectoryEvent({
      id: uuidv4(),
      episode_id: episode.id,
      opportunity_id: opportunity.id,
      event_type: 'decision_proposed',
      holon_id: executiveHolon.id,
      timestamp: new Date().toISOString(),
      decision_id: packageResult.decision.id,
      action: packageResult.decision.recommended_action,
      confidence: packageResult.decision.confidence,
      model_version: 'gpt-4o-2024-08-06',
      prompt_version: 'v0.1.0',
      policy_version: 'v0.1.0',
      harness_version: 'v0.1.0',
      structure_version: 'v0.1.0',
      vincent_version: 'v0.1.0',
      evaluator_version: 'v0.1.0',
      metadata: {
        score: vincentEvaluation.scoreBreakdown.totalScore,
        scoreBand: vincentEvaluation.scoreBreakdown.scoreBand,
        deliveryFeasible: deliveryAssessment.delivery_feasible,
        verdict: vincentEvaluation.governanceVerdict,
      },
    });

    return {
      episode,
      decision: packageResult.decision,
      vincentScore: vincentEvaluation.scoreBreakdown.totalScore,
      scoreBand: vincentEvaluation.scoreBreakdown.scoreBand,
      deliveryFeasible: deliveryAssessment.delivery_feasible,
      monitorInterrupt: monitorResult.hasCriticalInterrupt,
      summary: packageResult.synthesisSummary,
    };
  },

  /**
   * Applies human decision (Approve or Override) and executes real action.
   */
  processHumanDecision: async (
    decisionId: string,
    actionType: 'approve' | 'override',
    operatorId: string,
    overrideAction?: ActionSpace,
    overrideReason?: string
  ): Promise<{ decision: Decision; override?: DecisionOverride }> => {
    const decisions = await aehmlDb.getDecisions();
    const decision = decisions.find((d) => d.id === decisionId);
    if (!decision) throw new Error(`Decision ${decisionId} not found`);

    const episode = decision.episode_id ? await aehmlDb.getEpisodeById(decision.episode_id) : null;

    if (actionType === 'approve') {
      decision.status = 'approved';
      await aehmlDb.saveDecision(decision);

      if (episode) {
        await aehmlDb.recordTrajectoryEvent({
          id: uuidv4(),
          episode_id: episode.id,
          opportunity_id: decision.opportunity_id,
          event_type: 'decision_approved',
          timestamp: new Date().toISOString(),
          decision_id: decision.id,
          action: decision.recommended_action,
          model_version: 'gpt-4o-2024-08-06',
          prompt_version: 'v0.1.0',
          policy_version: 'v0.1.0',
          harness_version: 'v0.1.0',
          structure_version: 'v0.1.0',
          vincent_version: 'v0.1.0',
          evaluator_version: 'v0.1.0',
          metadata: { operatorId },
        });
      }

      return { decision };
    } else {
      if (!overrideAction || !overrideReason) {
        throw new Error('Override action and reason are required for human override.');
      }

      const override: DecisionOverride = {
        id: uuidv4(),
        decision_id: decision.id,
        original_action: decision.recommended_action,
        human_action: overrideAction,
        reason: overrideReason,
        operator_id: operatorId,
        created_at: new Date().toISOString(),
      };
      await aehmlDb.saveOverride(override);

      if (episode) {
        await aehmlDb.recordTrajectoryEvent({
          id: uuidv4(),
          episode_id: episode.id,
          opportunity_id: decision.opportunity_id,
          event_type: 'decision_overridden',
          timestamp: new Date().toISOString(),
          decision_id: decision.id,
          action: overrideAction,
          model_version: 'gpt-4o-2024-08-06',
          prompt_version: 'v0.1.0',
          policy_version: 'v0.1.0',
          harness_version: 'v0.1.0',
          structure_version: 'v0.1.0',
          vincent_version: 'v0.1.0',
          evaluator_version: 'v0.1.0',
          metadata: {
            originalAction: decision.recommended_action,
            humanAction: overrideAction,
            reason: overrideReason,
            operatorId,
          },
        });
      }

      return { decision, override };
    }
  },

  /**
   * Records outcome and triggers retrospective post-mortem via Evaluator Holon.
   */
  recordOutcomeAndEvaluate: async (
    episodeId: string,
    outcomeType: string,
    outcomeValue: number,
    nextStage?: Opportunity['stage']
  ) => {
    const episode = await aehmlDb.getEpisodeById(episodeId);
    if (!episode) throw new Error(`Episode ${episodeId} not found`);

    const opportunity = await aehmlDb.getOpportunityById(episode.opportunity_id);
    if (!opportunity) throw new Error(`Opportunity ${episode.opportunity_id} not found`);

    const decisions = await aehmlDb.getDecisionsByOpportunity(opportunity.id);
    const decision = decisions.find((d) => d.episode_id === episode.id) || decisions[0];

    episode.outcome_type = outcomeType;
    episode.outcome_value = outcomeValue;
    episode.ended_at = new Date().toISOString();
    episode.status = 'completed';

    // Calculate system reward
    const systemReward = aehmlReward.calculateSystemReward({
      collectedGrossProfit: outcomeValue * (opportunity.estimated_gross_margin || 0.65),
      cashRealization: outcomeValue,
      recurringRevenue: outcomeType.includes('won') ? outcomeValue * 0.2 : 0,
      expansionValue: outcomeType.includes('won') ? outcomeValue * 0.3 : 0,
      sellingCost: 450,
      deliveryCost: opportunity.estimated_delivery_cost || 5000,
      deliveryRisk: 0.2,
      paymentRisk: 0.1,
      reputationRisk: 0.05,
      opportunityCost: 200,
    });
    episode.system_reward = systemReward;
    if (nextStage) {
      episode.ending_stage = nextStage;
      opportunity.stage = nextStage;
      await aehmlDb.saveOpportunity(opportunity);
    }
    await aehmlDb.saveEpisode(episode);

    // Record Outcome Trajectory Event
    await aehmlDb.recordTrajectoryEvent({
      id: uuidv4(),
      episode_id: episode.id,
      opportunity_id: opportunity.id,
      event_type: 'outcome_recorded',
      timestamp: new Date().toISOString(),
      action: outcomeType,
      immediate_outcome: outcomeType,
      system_reward: systemReward,
      model_version: 'gpt-4o-2024-08-06',
      prompt_version: 'v0.1.0',
      policy_version: 'v0.1.0',
      harness_version: 'v0.1.0',
      structure_version: 'v0.1.0',
      vincent_version: 'v0.1.0',
      evaluator_version: 'v0.1.0',
      metadata: { outcomeType, outcomeValue, systemReward },
    });

    // Retrospective Post-Mortem by Evaluator Holon
    if (decision) {
      const overrides = await aehmlDb.getOverrides();
      const wasOverridden = overrides.some((o) => o.decision_id === decision.id);
      const evalResult = await evaluatorHolon.evaluateEpisode(
        episode,
        decision,
        opportunity,
        outcomeValue,
        wasOverridden
      );
      await aehmlDb.saveEvaluation(evalResult.evaluation);

      await aehmlDb.recordTrajectoryEvent({
        id: uuidv4(),
        episode_id: episode.id,
        opportunity_id: opportunity.id,
        event_type: 'evaluation_created',
        holon_id: evaluatorHolon.id,
        timestamp: new Date().toISOString(),
        evaluation_id: evalResult.evaluation.id,
        action: 'EVALUATE_EPISODE',
        model_version: 'gpt-4o-2024-08-06',
        prompt_version: 'v0.1.0',
        policy_version: 'v0.1.0',
        harness_version: 'v0.1.0',
        structure_version: 'v0.1.0',
        vincent_version: 'v0.1.0',
        evaluator_version: 'v0.1.0',
        metadata: {
          decisionQuality: evalResult.evaluation.decision_quality_score,
          lesson: evalResult.evaluation.lesson,
          regret: evalResult.evaluation.observed_regret ?? evalResult.evaluation.estimated_regret,
        },
      });
    }

    return { episode, systemReward };
  },
};

import { RegretLabel } from '../types';

export interface CommercialRewardInputs {
  collectedGrossProfit: number;
  cashRealization: number;
  recurringRevenue: number;
  expansionValue: number;
  sellingCost: number;
  deliveryCost: number;
  deliveryRisk: number; // 0 - 1
  paymentRisk: number; // 0 - 1
  reputationRisk: number; // 0 - 1
  opportunityCost: number;
}

export interface DecisionRegretEvaluation {
  bestAvailableAction: string;
  chosenAction: string;
  bestEstimatedValue: number;
  chosenEstimatedValue: number;
  regret: number;
  regretLabel: RegretLabel;
  lessonSummary: string;
}

export const aehmlReward = {
  /**
   * Section 28: Initial Commercial Reward Model
   * System Reward = (collected_gross_profit + cash_realization + recurring_revenue + expansion_value)
   *               - (selling_cost + delivery_cost + delivery_risk_cost + payment_risk_cost + reputation_risk_cost + opportunity_cost)
   */
  calculateSystemReward: (inputs: CommercialRewardInputs): number => {
    const positiveCommercialValue =
      inputs.collectedGrossProfit +
      inputs.cashRealization * 0.5 +
      inputs.recurringRevenue * 1.2 +
      inputs.expansionValue * 0.8;

    const riskPenalty =
      inputs.deliveryCost * inputs.deliveryRisk +
      inputs.collectedGrossProfit * inputs.paymentRisk * 0.5 +
      inputs.sellingCost * inputs.reputationRisk;

    const totalCosts = inputs.sellingCost + inputs.deliveryCost + inputs.opportunityCost + riskPenalty;

    return Number((positiveCommercialValue - totalCosts).toFixed(2));
  },

  /**
   * Section 29: Decision Regret Calculation
   * Regret = V(best estimated available action) - V(chosen action)
   */
  calculateDecisionRegret: (
    chosenAction: string,
    actualOutcomeValue: number,
    alternativeActions: Array<{ action: string; estimatedValue: number }>,
    wasHumanOverride: boolean = false
  ): DecisionRegretEvaluation => {
    let maxAlternativeValue = actualOutcomeValue;
    let bestAction = chosenAction;

    for (const alt of alternativeActions) {
      if (alt.estimatedValue > maxAlternativeValue) {
        maxAlternativeValue = alt.estimatedValue;
        bestAction = alt.action;
      }
    }

    const regret = Math.max(0, maxAlternativeValue - actualOutcomeValue);

    let regretLabel: RegretLabel = 'unknown_regret';
    if (actualOutcomeValue > 0 || regret > 0) {
      regretLabel = wasHumanOverride ? 'observed_regret' : 'estimated_regret';
    }

    let lessonSummary = 'Optimal action was selected relative to available information.';
    if (regret > 0) {
      lessonSummary = `Selecting ${chosenAction} yielded $${actualOutcomeValue.toFixed(0)}, whereas available alternative ${bestAction} was estimated at $${maxAlternativeValue.toFixed(0)} (Regret: $${regret.toFixed(0)}).`;
    }

    return {
      bestAvailableAction: bestAction,
      chosenAction,
      bestEstimatedValue: maxAlternativeValue,
      chosenEstimatedValue: actualOutcomeValue,
      regret: Number(regret.toFixed(2)),
      regretLabel,
      lessonSummary,
    };
  },
};

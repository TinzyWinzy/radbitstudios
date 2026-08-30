import { Opportunity, EvidenceItem, VincentScoreBreakdown } from '../types';

export const aehmlScoring = {
  /**
   * Calculates the Vincent 100-point Opportunity Score based on Section 19 of the specification.
   *
   * Economic Impact       20
   * Problem Severity      15
   * Urgency               15
   * Ability to Pay        10
   * Authority Access      10
   * Champion Strength     10
   * Solution Fit          10
   * Timing                 5
   * Expansion Potential    5
   * Total: 100
   */
  calculateVincentScore: (
    opportunity: Partial<Opportunity>,
    evidenceList: EvidenceItem[] = []
  ): VincentScoreBreakdown => {
    // 1. Economic Impact (0 - 20)
    let economicImpact = 5;
    const value = opportunity.estimated_contract_value || 0;
    if (value >= 50000) economicImpact = 20;
    else if (value >= 25000) economicImpact = 16;
    else if (value >= 10000) economicImpact = 12;
    else if (value > 0) economicImpact = 8;

    // 2. Problem Severity (0 - 15)
    let problemSeverity = 6;
    const verifiedData = evidenceList.filter(
      (e) =>
        e.validation_status === 'verified' &&
        (e.evidence_type === 'verified_operational_data' ||
          e.evidence_type === 'direct_client_statement')
    );
    if (verifiedData.length >= 2) problemSeverity = 15;
    else if (verifiedData.length === 1) problemSeverity = 11;

    // 3. Urgency (0 - 15)
    let urgency = 5;
    const window = (opportunity.decision_window || '').toLowerCase();
    if (window.includes('immediate') || window.includes('30 days') || window.includes('q3')) {
      urgency = 14;
    } else if (window.includes('q4') || window.includes('60 days')) {
      urgency = 10;
    }

    // 4. Ability to Pay (0 - 10)
    let abilityToPay = 5;
    if (opportunity.estimated_contract_value && opportunity.estimated_contract_value > 0) {
      abilityToPay = 8;
    }

    // 5. Authority Access (0 - 10)
    let authorityAccess = 2;
    if (opportunity.economic_buyer && opportunity.economic_buyer !== 'Unknown') {
      authorityAccess = 10;
    } else if (opportunity.technical_buyer || opportunity.problem_owner) {
      authorityAccess = 6;
    }

    // 6. Champion Strength (0 - 10)
    let championStrength = 2;
    if (opportunity.champion && opportunity.champion !== 'None') {
      championStrength = 9;
    }

    // 7. Solution Fit (0 - 10)
    let solutionFit = 6;
    if (opportunity.estimated_gross_margin && opportunity.estimated_gross_margin >= 0.6) {
      solutionFit = 10;
    }

    // 8. Timing (0 - 5)
    let timing = 3;
    if (opportunity.buyer_state === 'solution_aware' || opportunity.buyer_state === 'vendor_comparing') {
      timing = 5;
    } else if (opportunity.buyer_state === 'commercially_ready') {
      timing = 5;
    }

    // 9. Expansion Potential (0 - 5)
    const expansionPotential = 4;

    const totalScore =
      economicImpact +
      problemSeverity +
      urgency +
      abilityToPay +
      authorityAccess +
      championStrength +
      solutionFit +
      timing +
      expansionPotential;

    let scoreBand: VincentScoreBreakdown['scoreBand'] = 'deprioritize';
    if (totalScore >= 80) scoreBand = 'priority_pursuit';
    else if (totalScore >= 65) scoreBand = 'active_development';
    else if (totalScore >= 50) scoreBand = 'investigate_nurture';

    return {
      economicImpact,
      problemSeverity,
      urgency,
      abilityToPay,
      authorityAccess,
      championStrength,
      solutionFit,
      timing,
      expansionPotential,
      totalScore,
      scoreBand,
      version: 'v0.1.0',
    };
  },

  /**
   * Assigns probability calibration bucket (Section 30).
   * '0-10%', '10-20%', ..., '90-100%'
   */
  getCalibrationBucket: (prob: number): string => {
    const clamped = Math.max(0, Math.min(1, prob));
    const lower = Math.floor(clamped * 10) * 10;
    const upper = Math.min(100, lower + 10);
    return `${lower}-${upper}%`;
  },
};

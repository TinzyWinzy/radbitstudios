import { Opportunity, EvidenceItem, Decision } from '../types';

export interface ConstitutionalCheckResult {
  passed: boolean;
  violations: string[];
  warnings: string[];
}

export const aehmlGovernance = {
  /**
   * Sanitizes untrusted external text (web content, emails, attachments)
   * Enforces Section 60 Prompt Injection Boundary.
   */
  sanitizeExternalContent: (rawContent: string): string => {
    if (!rawContent) return '';
    // Strip direct command triggers and wrap in explicit UNTRUSTED EXTERNAL EVIDENCE boundary
    const cleaned = rawContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/system:|\bignore previous instructions\b|\bact as\b/gi, '[FILTERED_INSTRUCTION]');

    return `[UNTRUSTED EXTERNAL EVIDENCE START]\n${cleaned.trim()}\n[UNTRUSTED EXTERNAL EVIDENCE END]`;
  },

  /**
   * Enforces Section 18 Constitutional Rules on outgoing proposals or decisions.
   */
  validateDecisionAgainstConstitution: (
    decision: Partial<Decision>,
    opportunity: Opportunity,
    evidenceList: EvidenceItem[],
    deliveryFeasible?: boolean,
    deliveryRisk?: number
  ): ConstitutionalCheckResult => {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Rule 1: No unauthorized external messages (Human approval required)
    if (decision.human_approval_required === false) {
      violations.push(
        'Constitutional Violation [No Autonomous External Messages]: Human approval cannot be bypassed in v0.1.'
      );
    }

    // Rule 2: No promises beyond delivery capability (Proposal Gate)
    if (decision.recommended_action === 'PROPOSE') {
      if (deliveryFeasible === false) {
        violations.push(
          'Proposal Gate Violation [Delivery Infeasible]: Proposal blocked because Delivery Holon determined solution cannot be reliably delivered.'
        );
      }
      if (deliveryRisk !== undefined && deliveryRisk > 0.85) {
        violations.push(
          `Proposal Gate Violation [Excessive Delivery Risk]: Delivery risk ${(deliveryRisk * 100).toFixed(0)}% exceeds the 85% constitutional ceiling.`
        );
      }

      // Check for verified problem and authority evidence
      const hasVerifiedProblem = evidenceList.some(
        (e) =>
          e.validation_status === 'verified' &&
          (e.evidence_type === 'direct_client_statement' ||
            e.evidence_type === 'verified_operational_data')
      );
      if (!hasVerifiedProblem) {
        warnings.push(
          'Epistemic Warning: Proposal recommended without directly verified client problem evidence.'
        );
      }
    }

    // Rule 3: Deprioritization / Kill check for low score
    if (opportunity.opportunity_score < 50 && decision.recommended_action === 'PROPOSE') {
      warnings.push(
        `Commercial Discipline Warning: Proposing to an opportunity scored at ${opportunity.opportunity_score}/100 (< 50 threshold).`
      );
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
    };
  },
};

import { OpportunityStage, EvidenceItem } from '../types';

export interface StageTransitionCheck {
  allowed: boolean;
  missingRequirements: string[];
}

export const aehmlStateMachine = {
  /**
   * Stage progression sequence
   */
  stageOrder: [
    'target',
    'researched',
    'contacted',
    'engaged',
    'discovery',
    'qualified',
    'solution_validated',
    'commercially_validated',
    'proposal',
    'negotiation',
    'contracting',
    'won',
  ] as OpportunityStage[],

  /**
   * Validates if a stage transition is permissible based on empirical evidence.
   * Enforces Section 7 Opportunity State Machine.
   */
  canTransitionStage: (
    _currentStage: OpportunityStage,
    targetStage: OpportunityStage,
    evidenceList: EvidenceItem[]
  ): StageTransitionCheck => {
    // Immediate terminal movements (lost, nurture) are always permitted with human judgment
    if (targetStage === 'lost' || targetStage === 'nurture') {
      return { allowed: true, missingRequirements: [] };
    }

    const missing: string[] = [];

    // Rule: Engaged -> Discovery requires verified client response
    if (targetStage === 'discovery') {
      const hasResponse = evidenceList.some(
        (e) =>
          e.validation_status === 'verified' &&
          (e.evidence_type === 'direct_client_statement' ||
            e.evidence_type === 'observed_behavior')
      );
      if (!hasResponse) {
        missing.push('Requires verified client communication or observed response (direct_client_statement).');
      }
    }

    // Rule: Discovery -> Qualified requires verified problem owner and economic significance
    if (targetStage === 'qualified') {
      const hasProblemEvidence = evidenceList.some(
        (e) =>
          e.validation_status === 'verified' &&
          (e.evidence_type === 'verified_operational_data' ||
            e.evidence_type === 'direct_client_statement' ||
            e.evidence_type === 'client_document')
      );
      if (!hasProblemEvidence) {
        missing.push('Requires verified operational data or client document demonstrating problem significance.');
      }
    }

    // Rule: Qualified -> Solution Validated requires technical or operational fit evidence
    if (targetStage === 'solution_validated') {
      const hasSolutionEvidence = evidenceList.some(
        (e) =>
          e.validation_status === 'verified' &&
          (e.evidence_type === 'demonstration' ||
            e.evidence_type === 'existing_system' ||
            e.evidence_type === 'verified_operational_data')
      );
      if (!hasSolutionEvidence) {
        missing.push('Requires demonstrated solution capability or existing system benchmark match.');
      }
    }

    // Rule: Solution Validated -> Proposal requires verified authority/economic buyer alignment
    if (targetStage === 'proposal' || targetStage === 'commercially_validated') {
      const hasAuthorityEvidence = evidenceList.some(
        (e) =>
          e.validation_status === 'verified' &&
          e.evidence_type === 'direct_client_statement'
      );
      if (!hasAuthorityEvidence) {
        missing.push('Requires verified statement from economic buyer or champion confirming budget/authority.');
      }
    }

    // Rule: Proposal -> Won requires signed contract or deposit payment proof
    if (targetStage === 'won') {
      const hasContractProof = evidenceList.some(
        (e) =>
          e.validation_status === 'verified' &&
          (e.evidence_type === 'client_document' || e.evidence_type === 'verified_operational_data')
      );
      if (!hasContractProof) {
        missing.push('Requires verified contract document or payment transaction confirmation.');
      }
    }

    return {
      allowed: missing.length === 0,
      missingRequirements: missing,
    };
  },
};

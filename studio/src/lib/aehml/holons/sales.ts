import { Opportunity, EvidenceItem, ActionSpace, BuyerState } from '../types';
import { aehmlModelProvider } from '../kernel/model-provider';

export interface SalesDiagnosisOutput {
  buyerState: BuyerState;
  salesMode: 'research' | 'question' | 'teach' | 'challenge' | 'quantify' | 'demonstrate' | 'reassure' | 'prove' | 'negotiate' | 'escalate' | 'wait' | 'disqualify';
  recommendedAction: ActionSpace;
  alternativesConsidered: ActionSpace[];
  rationale: string;
  confidence: number;
}

export const salesHolon = {
  id: '11111111-1111-1111-1111-111111111103',
  name: 'Sales Holon',

  diagnose: async (
    opportunity: Opportunity,
    evidenceList: EvidenceItem[]
  ): Promise<SalesDiagnosisOutput> => {
    const response = await aehmlModelProvider.invoke<SalesDiagnosisOutput>(
      {
        holonId: salesHolon.id,
        task: 'Diagnose buyer state and determine optimal sales behavior and next action',
        context: { opportunity, evidenceCount: evidenceList.length },
      },
      () => {
        let buyerState: BuyerState = opportunity.buyer_state || 'problem_unaware';
        let salesMode: SalesDiagnosisOutput['salesMode'] = 'research';
        let recommendedAction: ActionSpace = 'RESEARCH';
        const alternatives: ActionSpace[] = [];
        let rationale = '';

        // Deterministic domain reasoning matching Section 20 & 21
        if (opportunity.stage === 'target' || opportunity.stage === 'researched') {
          buyerState = 'problem_unaware';
          salesMode = 'research';
          recommendedAction = 'RESEARCH';
          alternatives.push('CONTACT', 'DISQUALIFY');
          rationale = 'Early stage target requires identifying problem owner and operational bottlenecks before contact.';
        } else if (opportunity.stage === 'contacted' || opportunity.stage === 'engaged') {
          buyerState = 'problem_aware';
          salesMode = 'question';
          recommendedAction = 'QUESTION';
          alternatives.push('CALL', 'WAIT');
          rationale = 'Prospect is engaged; ask diagnostic questions to unearth economic impact.';
        } else if (opportunity.stage === 'discovery') {
          buyerState = 'solution_aware';
          salesMode = 'quantify';
          recommendedAction = 'QUANTIFY';
          alternatives.push('DEMONSTRATE', 'CALL');
          rationale = 'Problem is acknowledged; quantify ROI and impact in dollars/hours to justify procurement.';
        } else if (opportunity.stage === 'qualified') {
          buyerState = 'vendor_comparing';
          salesMode = 'demonstrate';
          recommendedAction = 'DEMONSTRATE';
          alternatives.push('PROPOSE', 'QUESTION');
          rationale = 'Qualified deal with identified budget; demonstrate technical prototype to solidify solution fit.';
        } else if (opportunity.stage === 'solution_validated' || opportunity.stage === 'commercially_validated') {
          buyerState = 'commercially_ready';
          salesMode = 'prove';
          recommendedAction = 'PROPOSE';
          alternatives.push('CALL', 'WAIT');
          rationale = 'Solution and commercial fit validated; prepare structured proposal package.';
        } else if (opportunity.opportunity_score < 50) {
          salesMode = 'disqualify';
          recommendedAction = 'DISQUALIFY';
          alternatives.push('WAIT', 'RESEARCH');
          rationale = 'Opportunity score is below 50; disqualifying to protect selling bandwidth.';
        }

        return {
          buyerState,
          salesMode,
          recommendedAction,
          alternativesConsidered: alternatives,
          rationale,
          confidence: 0.85,
        };
      }
    );

    return response.output;
  },
};

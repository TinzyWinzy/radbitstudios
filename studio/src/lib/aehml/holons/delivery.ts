import { Opportunity, EvidenceItem } from '../types';
import { aehmlModelProvider } from '../kernel/model-provider';

export interface DeliveryAssessmentOutput {
  delivery_feasible: boolean;
  delivery_confidence: number;
  estimated_hours: number;
  estimated_cost: number;
  estimated_support_cost: number;
  delivery_risk: number; // 0.0 - 1.0
  missing_capability: string[];
  partnership_required: boolean;
  recommended_scope_limit: string;
  rationale: string;
}

export const deliveryHolon = {
  id: '11111111-1111-1111-1111-111111111104',
  name: 'Delivery Holon',

  assess: async (
    opportunity: Opportunity,
    evidenceList: EvidenceItem[]
  ): Promise<DeliveryAssessmentOutput> => {
    const response = await aehmlModelProvider.invoke<DeliveryAssessmentOutput>(
      {
        holonId: deliveryHolon.id,
        task: 'Assess technical delivery feasibility, effort, risk, and protect delivery margins',
        context: { opportunity, evidenceList },
      },
      () => {
        const contractVal = opportunity.estimated_contract_value || 20000;
        const isHighRiskSector = opportunity.sector.toLowerCase() === 'mining';

        let estimatedHours = 80;
        let deliveryRisk = 0.25;
        const missingCaps: string[] = [];

        if (contractVal > 30000) {
          estimatedHours = 160;
          deliveryRisk = 0.35;
        }

        if (isHighRiskSector) {
          deliveryRisk += 0.15;
          missingCaps.push('On-site physical telemetry hardware specialist');
        }

        const hourlyRate = 65; // Standard delivery benchmark rate in USD
        const estimatedCost = estimatedHours * hourlyRate;
        const estimatedSupportCost = Number((contractVal * 0.15).toFixed(2));
        const deliveryFeasible = deliveryRisk <= 0.85;

        return {
          delivery_feasible: deliveryFeasible,
          delivery_confidence: 0.88,
          estimated_hours: estimatedHours,
          estimated_cost: estimatedCost,
          estimated_support_cost: estimatedSupportCost,
          delivery_risk: Number(deliveryRisk.toFixed(2)),
          missing_capability: missingCaps,
          partnership_required: missingCaps.length > 0,
          recommended_scope_limit:
            'Limit initial MVP to read-only reporting integration and core automated sync before enabling bidirectional writes.',
          rationale: `Estimated ${estimatedHours}h at $${hourlyRate}/h ($${estimatedCost} base delivery). Gross margin is protected at ${(((contractVal - estimatedCost) / contractVal) * 100).toFixed(0)}%.`,
        };
      }
    );

    return response.output;
  },
};

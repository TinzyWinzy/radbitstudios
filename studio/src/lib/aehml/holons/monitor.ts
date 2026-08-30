import { Opportunity, EvidenceItem, MonitorIntervention, TrajectoryEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface MonitorCheckOutput {
  interventions: MonitorIntervention[];
  hasCriticalInterrupt: boolean;
  summary: string;
}

export const monitorHolon = {
  id: '11111111-1111-1111-1111-111111111107',
  name: 'Monitor Holon',

  inspect: async (
    opportunity: Opportunity,
    evidenceList: EvidenceItem[],
    _recentEvents: TrajectoryEvent[] = []
  ): Promise<MonitorCheckOutput> => {
    const interventions: MonitorIntervention[] = [];
    let hasCriticalInterrupt = false;

    // Check 1: Stage Inflation (Opportunity advanced to proposal/negotiation without verified problem or authority)
    if (opportunity.stage === 'proposal' || opportunity.stage === 'negotiation') {
      const verifiedAuthority = evidenceList.some(
        (e) =>
          e.validation_status === 'verified' &&
          (e.evidence_type === 'direct_client_statement' || e.evidence_type === 'verified_operational_data')
      );

      if (!verifiedAuthority) {
        interventions.push({
          id: uuidv4(),
          opportunity_id: opportunity.id,
          risk_type: 'stage_inflation',
          severity: 'high',
          evidence: { currentStage: opportunity.stage, verifiedEvidenceCount: evidenceList.filter(e => e.validation_status === 'verified').length },
          recommended_action: 'Pause proposal creation until direct client statement confirms authority access.',
          interrupted_execution: true,
          created_at: new Date().toISOString(),
        });
        hasCriticalInterrupt = true;
      }
    }

    // Check 2: Stalled Opportunity (No updates in > 14 days while in active status)
    const daysSinceUpdate = (Date.now() - new Date(opportunity.updated_at).getTime()) / (1000 * 3600 * 24);
    if (daysSinceUpdate > 14 && opportunity.status === 'active') {
      interventions.push({
        id: uuidv4(),
        opportunity_id: opportunity.id,
        risk_type: 'stalled_opportunity',
        severity: 'medium',
        evidence: { daysSinceUpdate: Math.floor(daysSinceUpdate) },
        recommended_action: 'Trigger low-cost QUESTION touchpoint or demote to nurture.',
        interrupted_execution: false,
        created_at: new Date().toISOString(),
      });
    }

    // Check 3: Low-Value Pursuit with High Selling Cost
    if (opportunity.estimated_contract_value < 5000 && (opportunity.stage === 'discovery' || opportunity.stage === 'qualified')) {
      interventions.push({
        id: uuidv4(),
        opportunity_id: opportunity.id,
        risk_type: 'low_value_resource_drain',
        severity: 'low',
        evidence: { contractValue: opportunity.estimated_contract_value },
        recommended_action: 'Apply standardized template pricing to avoid bespoke engineering overhead.',
        interrupted_execution: false,
        created_at: new Date().toISOString(),
      });
    }

    return {
      interventions,
      hasCriticalInterrupt,
      summary: interventions.length > 0
        ? `Monitor generated ${interventions.length} intervention alert(s). Interrupt status: ${hasCriticalInterrupt}`
        : 'All epistemic and operational health checks passed.',
    };
  },
};

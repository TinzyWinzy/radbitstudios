import { NextResponse } from 'next/server';
import { aehmlDb } from '@/lib/aehml/db/client';
import { aehmlEvolution } from '@/lib/aehml/kernel/evolution';
import { withRole } from '@/lib/api-auth';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';

export const GET = withIpRateLimit(
  RateLimits.apiDefault,
  withRole(['admin', 'super_admin'], async () => {
    try {
      const [
        holons,
        opportunities,
        evidence,
        hypotheses,
        decisions,
        overrides,
        events,
        vincentRules,
        interventions,
        evaluations,
        policies,
      ] = await Promise.all([
        aehmlDb.getHolons(),
        aehmlDb.getOpportunities(),
        aehmlDb.getAllEvidence(),
        aehmlDb.getHypothesesByOpportunity('all'),
        aehmlDb.getDecisions(),
        aehmlDb.getOverrides(),
        aehmlDb.getAllTrajectoryEvents(),
        aehmlDb.getVincentRules(),
        aehmlDb.getMonitorInterventions(),
        aehmlDb.getEvaluations(),
        aehmlDb.getPolicies(),
      ]);

      // Generate real-time evolution proposals
      const evolutionProposals = aehmlEvolution.generateEvolutionProposals(events, opportunities);

      // Compute calibration and regret metrics
      let totalRegret = 0;
      for (const ev of evaluations) {
        if (ev.observed_regret) totalRegret += ev.observed_regret;
        else if (ev.estimated_regret) totalRegret += ev.estimated_regret;
      }
      const avgRegret = evaluations.length > 0 ? totalRegret / evaluations.length : 0;

      const pipelineEV = opportunities.reduce((acc, o) => acc + (o.expected_value || 0), 0);
      const totalContractValue = opportunities.reduce((acc, o) => acc + (o.estimated_contract_value || 0), 0);

      const agreementCount = decisions.filter((d) => d.status === 'approved').length;
      const overrideCount = overrides.length;
      const approvalRate = decisions.length > 0 ? (agreementCount / (agreementCount + overrideCount || 1)) * 100 : 100;

      return NextResponse.json({
        success: true,
        data: {
          holons,
          opportunities,
          evidence,
          hypotheses,
          decisions,
          overrides,
          events,
          vincentRules,
          interventions,
          evaluations,
          policies,
          evolutionProposals,
          metrics: {
            pipelineEV,
            totalContractValue,
            avgRegret,
            approvalRate,
            totalDecisions: decisions.length,
            activeOpportunities: opportunities.filter((o) => o.status === 'active').length,
            activeAlerts: interventions.filter((i) => !i.resolved_at).length,
          },
        },
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }),
);
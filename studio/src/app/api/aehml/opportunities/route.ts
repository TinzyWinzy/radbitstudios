import { NextRequest, NextResponse } from 'next/server';
import { aehmlDb } from '@/lib/aehml/db/client';
import { Opportunity } from '@/lib/aehml/types';
import { v4 as uuidv4 } from 'uuid';
import { withRole } from '@/lib/api-auth';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';

export const GET = withIpRateLimit(
  RateLimits.apiDefault,
  withRole(['admin', 'super_admin'], async () => {
    try {
      const opps = await aehmlDb.getOpportunities();
      return NextResponse.json({ success: true, data: opps });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }),
);

export const POST = withIpRateLimit(
  RateLimits.mutation,
  withRole(['admin', 'super_admin'], async (req: NextRequest) => {
    try {
      const body = await req.json();
      const newOpp: Opportunity = {
        id: uuidv4(),
        organization_name: body.organization_name,
        website: body.website || null,
        sector: body.sector || 'General Commercial',
        country: body.country || 'Zimbabwe',
        source: body.source || 'Direct Entry',
        stage: body.stage || 'target',
        status: 'active',
        estimated_contract_value: Number(body.estimated_contract_value || 0),
        estimated_gross_margin: Number(body.estimated_gross_margin || 0.65),
        estimated_delivery_cost: Number(body.estimated_delivery_cost || 0),
        probability_win: Number(body.probability_win || 0.2),
        expected_value: Number((Number(body.estimated_contract_value || 0) * Number(body.probability_win || 0.2)).toFixed(2)),
        opportunity_score: 50,
        confidence: 'moderate',
        economic_buyer: body.economic_buyer || null,
        champion: body.champion || null,
        problem_owner: body.problem_owner || null,
        technical_buyer: body.technical_buyer || null,
        buyer_state: 'problem_unaware',
        decision_window: body.decision_window || '30-60 Days',
        next_action: 'RESEARCH',
        next_action_owner: 'Sales Holon',
        primary_risk: body.primary_risk || 'Unverified problem economic significance',
        loss_condition: body.loss_condition || 'Inactivity or budget freeze',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const saved = await aehmlDb.saveOpportunity(newOpp);
      return NextResponse.json({ success: true, data: saved });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }),
);
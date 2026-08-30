import { NextRequest, NextResponse } from 'next/server';
import { aehmlOrchestrator } from '@/lib/aehml/kernel/orchestrator';
import { withRole } from '@/lib/api-auth';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';

export const POST = withIpRateLimit(
  RateLimits.mutation,
  withRole(['admin', 'super_admin'], async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { opportunityId, rawNotes, objective } = body;

      if (!opportunityId) {
        return NextResponse.json({ success: false, error: 'opportunityId is required' }, { status: 400 });
      }

      const result = await aehmlOrchestrator.runOpportunityDecisionCycle(
        opportunityId,
        rawNotes || '',
        objective || 'Determine optimal lowest-cost next commercial action'
      );

      return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }),
);
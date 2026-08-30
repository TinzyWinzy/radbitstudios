import { NextRequest, NextResponse } from 'next/server';
import { aehmlOrchestrator } from '@/lib/aehml/kernel/orchestrator';
import { withRole } from '@/lib/api-auth';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';

export const POST = withIpRateLimit(
  RateLimits.mutation,
  withRole(['admin', 'super_admin'], async (req: NextRequest, operatorId: string) => {
    try {
      const body = await req.json();
      const { decisionId, actionType, overrideAction, overrideReason } = body;

      if (!decisionId || !actionType) {
        return NextResponse.json({ success: false, error: 'decisionId and actionType are required' }, { status: 400 });
      }

      const result = await aehmlOrchestrator.processHumanDecision(
        decisionId,
        actionType,
        operatorId,
        overrideAction,
        overrideReason
      );

      return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }),
);
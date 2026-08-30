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
      const { episodeId, outcomeType, outcomeValue, nextStage } = body;

      if (!episodeId || !outcomeType) {
        return NextResponse.json({ success: false, error: 'episodeId and outcomeType are required' }, { status: 400 });
      }

      const result = await aehmlOrchestrator.recordOutcomeAndEvaluate(
        episodeId,
        outcomeType,
        Number(outcomeValue || 0),
        nextStage
      );

      return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }),
);
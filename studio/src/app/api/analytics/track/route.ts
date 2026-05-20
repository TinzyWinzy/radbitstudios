import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  // Analytics endpoint — ready to forward to any provider.
  // Currently acknowledges receipt; data rate-limited at the edge.
  return NextResponse.json({ ok: true });
}

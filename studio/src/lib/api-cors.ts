import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'https://radbitstudios.co.zw';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Idempotency-Key',
  'Access-Control-Max-Age': '86400',
};

export function corsResponse(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function handleCors(req: NextRequest): NextResponse | null {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }
  return null;
}

export function withCors(
  handler: (req: NextRequest) => Promise<NextResponse>,
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    const preflight = handleCors(req);
    if (preflight) return preflight;
    return corsResponse(await handler(req));
  };
}

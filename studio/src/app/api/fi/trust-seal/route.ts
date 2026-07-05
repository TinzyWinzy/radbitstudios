import { NextRequest, NextResponse } from 'next/server';
import { validateFiApiKey, generateFiCreditReport } from '@/services/fi-integration';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing x-api-key header. Contact Radbit to get your FI partner API key.' }, { status: 401 });
    }

    const partner = await validateFiApiKey(apiKey);
    if (!partner) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const smeId = request.nextUrl.searchParams.get('smeId');
    if (!smeId) {
      return NextResponse.json({ error: 'Missing smeId query parameter' }, { status: 400 });
    }

    const report = await generateFiCreditReport(smeId);
    if (!report) {
      return NextResponse.json({ error: 'SME not found or no data available' }, { status: 404 });
    }

    report.partnerName = partner.name;

    return NextResponse.json({ report });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

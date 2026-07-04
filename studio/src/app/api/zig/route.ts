import { NextRequest, NextResponse } from 'next/server';
import { getZiGFaq, getLatestZiGRate, convertTaxObligation, getPayeTaxTablesUrl } from '@/services/zig-currency';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (searchParams.has('faq')) {
    return NextResponse.json({ faq: getZiGFaq() });
  }

  if (searchParams.has('paye')) {
    return NextResponse.json({ url: getPayeTaxTablesUrl() });
  }

  const rate = await getLatestZiGRate();

  const amount = searchParams.get('amount');
  const from = searchParams.get('from') as 'ZWL' | 'USD' | 'ZiG' | null;
  const to = searchParams.get('to') as 'ZiG' | 'USD' | null;

  let conversion = null;
  if (amount && from && to && rate) {
    conversion = convertTaxObligation(Number(amount), from, to, rate.rate);
  }

  return NextResponse.json({
    rate,
    conversion,
    payeTaxTablesUrl: getPayeTaxTablesUrl(),
  });
}

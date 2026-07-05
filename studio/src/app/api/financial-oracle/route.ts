import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/api-auth';
import { parseAndStoreStatement, getFinancialHealth, getFinancialSummary } from '@/services/financial-oracle';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const verified = await verifyIdToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const health = await getFinancialHealth(verified.uid);
    const full = await getFinancialSummary(verified.uid);

    if (!health && full.statementCount === 0) {
      return NextResponse.json({ status: 'no_data', message: 'Upload a bank statement to get your Financial Oracle insights' });
    }

    return NextResponse.json({
      status: 'available',
      financialHealth: health,
      summary: full.summary,
      cashFlow: full.cashFlow,
      fxExposure: full.fxExposure,
      statementCount: full.statementCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const verified = await verifyIdToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('statement') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided. Upload a bank statement as "statement".' }, { status: 400 });
    }

    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { statement, financialHealth } = await parseAndStoreStatement(verified.uid, buffer, file.name);

    return NextResponse.json({
      success: true,
      bankName: statement.bankName,
      accountNumber: statement.accountNumber,
      transactionCount: statement.transactions.length,
      period: statement.statementPeriod,
      financialHealth,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { verifySession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

interface CategoryTotal {
  totalScore: number;
  count: number;
}

export async function GET(req: NextRequest) {
  try {
    const user = await verifySession(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snap = await adminDb.collection('assessments').orderBy('createdAt', 'desc').limit(500).get();
    const allResponses: { category: string; score: number }[] = [];

    for (const doc of snap.docs) {
      const data = doc.data();
      const responsesArr = data.responses || [];
      for (const val of responsesArr) {
        const category = val.category || '';
        const score = Number(val.score || 0);
        if (category && score > 0) {
          allResponses.push({ category, score });
        }
      }
    }

    if (allResponses.length === 0) {
      return NextResponse.json({ benchmark: [] });
    }

    const categoryTotals: Record<string, CategoryTotal> = {};
    for (const r of allResponses) {
      if (!categoryTotals[r.category]) {
        categoryTotals[r.category] = { totalScore: 0, count: 0 };
      }
      categoryTotals[r.category].totalScore += r.score;
      categoryTotals[r.category].count += 1;
    }

    const benchmark = Object.entries(categoryTotals).map(([category, data]) => ({
      category,
      benchmarkScore: Number(((data.totalScore / (data.count * 4)) * 100).toFixed(1)),
    }));

    return NextResponse.json({ benchmark });
  } catch (error: unknown) {
    console.error('[Benchmark API] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ benchmark: [] });
  }
}

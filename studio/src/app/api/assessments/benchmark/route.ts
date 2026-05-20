import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

interface CategoryTotal {
  totalScore: number;
  count: number;
}

export async function GET(_req: NextRequest) {
  try {
    const url = `${BASE_URL}/assessments?key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('[Benchmark API] Firestore responded', res.status);
      return NextResponse.json({ benchmark: [] });
    }

    const data = await res.json();
    const documents = data.documents || [];

    const allResponses: { category: string; score: number }[] = [];

    for (const doc of documents) {
      const fields = doc.fields || {};
      const responsesArr = fields.responses?.arrayValue?.values || [];
      for (const val of responsesArr) {
        const map = val.mapValue?.fields || {};
        const category = map.category?.stringValue || '';
        const score = Number(map.score?.integerValue || map.score?.doubleValue || 0);
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
  } catch (error: any) {
    console.error('[Benchmark API] Error:', error?.message);
    return NextResponse.json({ benchmark: [] });
  }
}

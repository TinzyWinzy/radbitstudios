import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';

function revenueLabel(revenue: number | undefined): string {
  if (!revenue || revenue === 0) return 'Pre-revenue';
  if (revenue <= 50000) return '$0–$50K';
  if (revenue <= 200000) return '$50K–$200K';
  if (revenue <= 500000) return '$200K–$500K';
  if (revenue <= 1000000) return '$500K–$1M';
  return '$1M+';
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const sectorFilter = searchParams.get('sector');
    const search = searchParams.get('search')?.toLowerCase();

    const snap = await adminDb
      .collection('users')
      .where('businessName', '>=', '')
      .where('businessName', '<=', '\uf8ff')
      .limit(50)
      .get();

    const smes = snap.docs
      .map(doc => {
        const d = doc.data();
        if (!d.businessName || !d.industry) return null;
        return {
          id: doc.id,
          name: d.businessName,
          sector: d.industry,
          description: d.businessDescription || '',
          revenue: revenueLabel(d.revenue),
          prazStatus: d.prazVerified ? 'Verified' : 'Pending',
          readiness: d.maturityScore || Math.floor(Math.random() * 30) + 50,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    const sectorMap: Record<string, string[]> = {
      agri: ['Agriculture', 'Retail & Wholesale'],
      'real-estate': ['Construction', 'Real Estate'],
      tech: ['Technology'],
      manufacturing: ['Manufacturing'],
      healthcare: ['Healthcare'],
      tourism: ['Hospitality & Tourism', 'Transport & Logistics'],
    };

    let filtered = smes;
    if (sectorFilter && sectorMap[sectorFilter]) {
      filtered = smes.filter(s => sectorMap[sectorFilter].includes(s.sector));
    }
    if (search) {
      filtered = filtered.filter(
        s => s.name.toLowerCase().includes(search) || s.sector.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({ smes: filtered });
  } catch (error: unknown) {
    console.error('[Diaspora SMEs] Error:', error);
    return NextResponse.json({ error: 'Failed to load SMEs' }, { status: 500 });
  }
}

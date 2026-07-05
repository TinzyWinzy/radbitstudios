import { adminDb } from '@/lib/firebase/firebase-admin';

export interface CompetitorProfile {
  name: string;
  tenderCount: number;
  wins: number;
  losses: number;
  winRate: number;
  topCategories: string[];
  averageWinValue: number;
  recentWins: Array<{ title: string; value: number; date: string; category: string }>;
}

export interface MarketGap {
  category: string;
  totalTenders: number;
  uniqueBidders: number;
  competitionLevel: 'low' | 'medium' | 'high';
  averageValue: number;
  recommendation: string;
}

export interface BidRiggingFlag {
  severity: 'low' | 'medium' | 'high';
  pattern: string;
  organizations: string[];
  categories: string[];
  evidence: string;
}

export interface CompetitorIntelligenceReport {
  topCompetitors: CompetitorProfile[];
  marketGaps: MarketGap[];
  bidRiggingFlags: BidRiggingFlag[];
  yourRanking: { rank: number; totalCompetitors: number; percentile: number } | null;
  generatedAt: string;
}

async function loadAllTenderItems(): Promise<any[]> {
  try {
    const snap = await adminDb.collection('scraped_items')
      .orderBy('publishedAt', 'desc')
      .limit(500)
      .get();
    return snap.docs.map(d => d.data());
  } catch {
    return [];
  }
}

function normalizeOrg(name: string): string {
  return name.replace(/\s+/g, ' ').trim().toLowerCase();
}

export async function getCompetitorIntelligence(userId?: string): Promise<CompetitorIntelligenceReport> {
  const items = await loadAllTenderItems();

  const orgWins = new Map<string, { wins: number; losses: number; total: number; categories: Set<string>; values: number[]; recent: any[] }>();
  const categoryBidders = new Map<string, Set<string>>();
  const categoryTenders = new Map<string, { count: number; totalValue: number }>();
  const orgPatterns = new Map<string, { categories: string[]; recentDates: string[] }>();

  for (const item of items) {
    const org = normalizeOrg(item.title?.match(/(?:by|awarded to|supplier|contractor)[:\s]+([A-Z][A-Za-z\s&.]+?)(?:\d|,|\s{2,}|$)/i)?.[1] || item.organization || 'Unknown');
    const category = item.sector || item.category || 'General';
    const status = (item.status || '').toLowerCase();
    const value = parseFloat(item.value) || 0;

    if (!orgWins.has(org)) {
      orgWins.set(org, { wins: 0, losses: 0, total: 0, categories: new Set(), values: [], recent: [] });
    }
    const entry = orgWins.get(org)!;
    entry.total++;
    if (status === 'won' || status === 'awarded') {
      entry.wins++;
      if (value > 0) entry.values.push(value);
      entry.recent.push({ title: item.title || '', value, date: item.publishedAt?.toDate?.()?.toISOString?.() || item.publishedAt || '', category });
      entry.recent.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      entry.recent = entry.recent.slice(0, 10);
    } else {
      entry.losses++;
    }
    entry.categories.add(category);

    if (!categoryBidders.has(category)) categoryBidders.set(category, new Set());
    categoryBidders.get(category)!.add(org);

    if (!categoryTenders.has(category)) categoryTenders.set(category, { count: 0, totalValue: 0 });
    categoryTenders.get(category)!.count++;
    if (value > 0) categoryTenders.get(category)!.totalValue += value;

    if (!orgPatterns.has(org)) orgPatterns.set(org, { categories: [], recentDates: [] });
    const pattern = orgPatterns.get(org)!;
    if (!pattern.categories.includes(category)) pattern.categories.push(category);
    if (item.publishedAt) {
      const dateStr = typeof item.publishedAt === 'string' ? item.publishedAt : item.publishedAt?.toDate?.()?.toISOString?.() || '';
      if (dateStr) pattern.recentDates.push(dateStr);
    }
  }

  // Top competitors
  const competitors: CompetitorProfile[] = Array.from(orgWins.entries())
    .filter(([name]) => name !== 'unknown' && name !== '')
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      tenderCount: data.total,
      wins: data.wins,
      losses: data.losses,
      winRate: data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0,
      topCategories: Array.from(data.categories).slice(0, 5),
      averageWinValue: data.values.length > 0 ? Math.round(data.values.reduce((a, b) => a + b, 0) / data.values.length) : 0,
      recentWins: data.recent,
    }))
    .sort((a, b) => b.tenderCount - a.tenderCount)
    .slice(0, 20);

  // Market gaps
  const marketGaps: MarketGap[] = Array.from(categoryTenders.entries())
    .map(([category, data]) => {
      const bidders = categoryBidders.get(category)?.size || 0;
      const competitionLevel: 'low' | 'medium' | 'high' = bidders <= 3 ? 'low' : bidders <= 8 ? 'medium' : 'high';
      return {
        category,
        totalTenders: data.count,
        uniqueBidders: bidders,
        competitionLevel,
        averageValue: data.count > 0 ? Math.round(data.totalValue / data.count) : 0,
        recommendation: competitionLevel === 'low'
          ? `Low competition in ${category} — good entry opportunity`
          : competitionLevel === 'medium'
            ? `Moderate competition in ${category} — differentiation needed`
            : `High competition in ${category} — specialize to stand out`,
      };
    })
    .sort((a, b) => a.uniqueBidders - b.uniqueBidders)
    .slice(0, 15);

  // Bid rigging flags
  const bidRiggingFlags: BidRiggingFlag[] = [];
  for (const [category, bidders] of categoryBidders.entries()) {
    if (bidders.size <= 2 && categoryTenders.get(category)!.count >= 3) {
      bidRiggingFlags.push({
        severity: 'high',
        pattern: 'Persistent winner — same small pool of bidders across multiple tenders',
        organizations: Array.from(bidders),
        categories: [category],
        evidence: `${categoryTenders.get(category)!.count} tenders in ${category} with only ${bidders.size} unique bidder(s)`,
      });
    }
  }

  const winStreaks = Array.from(orgWins.entries())
    .filter(([_, d]) => {
      const wr = d.total > 0 ? d.wins / d.total : 0;
      return d.wins >= 3 && d.total >= 5 && wr >= 0.7;
    })
    .sort((a, b) => {
      const wrA = a[1].total > 0 ? a[1].wins / a[1].total : 0;
      const wrB = b[1].total > 0 ? b[1].wins / b[1].total : 0;
      return wrB - wrA;
    })
    .slice(0, 5);

  for (const [name, data] of winStreaks) {
    const winRate = data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0;
    bidRiggingFlags.push({
      severity: winRate >= 90 ? 'high' : 'medium',
      pattern: `High win rate (${winRate}%) — may indicate preferential treatment or strong incumbent advantage`,
      organizations: [name],
      categories: Array.from(data.categories).slice(0, 3),
      evidence: `${name} won ${data.wins}/${data.total} tenders (${winRate}%)`,
    });
  }

  // Your ranking
  let yourRanking: { rank: number; totalCompetitors: number; percentile: number } | null = null;
  if (userId) {
    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const businessName = userDoc.data()?.businessName;
      if (businessName) {
        const normName = normalizeOrg(businessName);
        const allOrgs = Array.from(orgWins.entries())
          .filter(([n]) => n !== 'unknown')
          .sort((a, b) => b[1].wins - a[1].wins);
        const idx = allOrgs.findIndex(([n]) => normalizeOrg(n) === normName);
        if (idx >= 0) {
          yourRanking = {
            rank: idx + 1,
            totalCompetitors: allOrgs.length,
            percentile: Math.round(((allOrgs.length - idx) / allOrgs.length) * 100),
          };
        }
      }
    } catch {
      // silently skip
    }
  }

  return {
    topCompetitors: competitors,
    marketGaps,
    bidRiggingFlags,
    yourRanking,
    generatedAt: new Date().toISOString(),
  };
}

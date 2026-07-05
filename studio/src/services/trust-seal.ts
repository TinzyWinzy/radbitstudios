import { getComplianceScorecard } from './compliance-scorecard';
import { getFinancialHealth } from './financial-oracle';

export type TrustSealStatus = 'green' | 'amber' | 'red';

export interface TrustSealDimension {
  score: number;
  weight: number;
  status: TrustSealStatus;
  details: string;
  available: boolean;
}

export interface TrustSeal {
  overallScore: number;
  status: TrustSealStatus;
  lastUpdated: string;
  dimensions: {
    financial_health: TrustSealDimension;
    operational_consistency: TrustSealDimension;
    compliance: TrustSealDimension;
    tender_track_record: TrustSealDimension;
    founder_reputation: TrustSealDimension;
  };
}

const DIMENSIONS = [
  { key: 'financial_health', label: 'Financial Health', weight: 0.30 },
  { key: 'operational_consistency', label: 'Operational Consistency', weight: 0.25 },
  { key: 'compliance', label: 'Compliance Score', weight: 0.20 },
  { key: 'tender_track_record', label: 'Tender Track Record', weight: 0.15 },
  { key: 'founder_reputation', label: 'Founder Reputation', weight: 0.10 },
] as const;

function scoreToStatus(score: number): TrustSealStatus {
  if (score >= 80) return 'green';
  if (score >= 60) return 'amber';
  return 'red';
}

export async function calculateTrustSeal(userId: string): Promise<TrustSeal> {
  const [scorecard, financialHealth] = await Promise.all([
    getComplianceScorecard(userId),
    getFinancialHealth(userId),
  ]);

  const dimensions: TrustSeal['dimensions'] = {} as TrustSeal['dimensions'];
  let totalWeightedScore = 0;
  let activeWeight = 0;

  for (const dim of DIMENSIONS) {
    let score: number;
    let details: string;
    let available: boolean;

    switch (dim.key) {
      case 'financial_health':
        if (financialHealth) {
          score = financialHealth.overallScore;
          details = financialHealth.details;
          available = true;
        } else {
          score = 0;
          details = 'Upload a bank statement to calculate financial health';
          available = false;
        }
        break;

      case 'operational_consistency':
        score = 0;
        details = 'Operational verification not yet available. Connect stock, delivery, and attendance tracking to enable this score.';
        available = false;
        break;

      case 'compliance':
        if (scorecard) {
          score = scorecard.overallScore;
          details = `Compliance score: ${score}/100`;
          available = true;
        } else {
          score = 0;
          details = 'Compliance data not found';
          available = false;
        }
        break;

      case 'tender_track_record':
        if (scorecard) {
          const tender = scorecard.breakdown.tender_track_record;
          score = tender.score;
          details = tender.details;
          available = tender.status !== 'not_tracked';
        } else {
          score = 0;
          details = 'No tender history found';
          available = false;
        }
        break;

      case 'founder_reputation':
        score = 0;
        details = 'Founder reputation scoring not yet available. This will incorporate tender performance, employee retention, and supplier payment history.';
        available = false;
        break;

      default:
        score = 0;
        details = 'Not yet implemented';
        available = false;
    }

    dimensions[dim.key] = {
      score,
      weight: dim.weight,
      status: scoreToStatus(score),
      details,
      available,
    };

    if (available) {
      totalWeightedScore += score * dim.weight;
      activeWeight += dim.weight;
    }
  }

  const overallScore = activeWeight > 0 ? Math.round(totalWeightedScore / activeWeight) : 0;
  const status = scoreToStatus(overallScore);

  return {
    overallScore,
    status,
    lastUpdated: new Date().toISOString(),
    dimensions,
  };
}

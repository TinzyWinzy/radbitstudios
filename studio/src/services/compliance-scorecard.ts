import { adminDb } from '@/lib/firebase/firebase-admin';
import { getPrazProfile } from './praz-compliance';
import type { ComplianceCertificate } from './compliance-tracker';

export type CheckStatus = 'compliant' | 'partial' | 'non_compliant' | 'not_tracked';
export type ScorecardStatus = 'green' | 'amber' | 'red';

export interface ScorecardCheck {
  score: number;
  maxScore: number;
  weight: number;
  status: CheckStatus;
  details: string;
  dataSource: string;
}

export interface ComplianceScorecard {
  userId: string;
  businessName: string;
  overallScore: number;
  status: ScorecardStatus;
  lastUpdated: string;
  breakdown: {
    praz_registration: ScorecardCheck;
    tax_clearance: ScorecardCheck;
    nssa_compliance: ScorecardCheck;
    paye_remittance: ScorecardCheck;
    saz_iso: ScorecardCheck;
    tender_track_record: ScorecardCheck;
    litigation: ScorecardCheck;
    blacklist_status: ScorecardCheck;
    banking_history: ScorecardCheck;
    zimra_fiscal_device: ScorecardCheck;
  };
}

const CHECKS: Array<{ key: keyof ComplianceScorecard['breakdown']; label: string; weight: number }> = [
  { key: 'praz_registration', label: 'PRAZ Registration', weight: 0.15 },
  { key: 'tax_clearance', label: 'Tax Clearance Certificate', weight: 0.15 },
  { key: 'nssa_compliance', label: 'NSSA Compliance', weight: 0.10 },
  { key: 'paye_remittance', label: 'PAYE / AIDS Levy Remittance', weight: 0.10 },
  { key: 'saz_iso', label: 'SAZ / ISO Certification', weight: 0.05 },
  { key: 'tender_track_record', label: 'Tender Win/Loss History', weight: 0.15 },
  { key: 'litigation', label: 'Litigation / Judgments', weight: 0.05 },
  { key: 'blacklist_status', label: 'Blacklist Status', weight: 0.05 },
  { key: 'banking_history', label: 'Banking History (No Bounced Checks)', weight: 0.05 },
  { key: 'zimra_fiscal_device', label: 'ZIMRA Fiscal Device', weight: 0.15 },
];

function makeCheck(
  score: number,
  maxScore: number,
  weight: number,
  status: CheckStatus,
  details: string,
  dataSource: string,
): ScorecardCheck {
  return { score, maxScore, weight, status, details, dataSource };
}

function checkFromCertificate(cert: ComplianceCertificate | null, weight: number): ScorecardCheck {
  if (!cert) {
    return makeCheck(0, 100, weight, 'non_compliant', 'No certificate registered. Upload your certificate to track compliance.', 'Compliance Tracker');
  }
  switch (cert.status) {
    case 'valid': {
      const dateStr = cert.expiryDate instanceof Date ? cert.expiryDate.toLocaleDateString() : new Date(cert.expiryDate as unknown as string).toLocaleDateString();
      return makeCheck(100, 100, weight, 'compliant', `Valid until ${dateStr}`, 'Compliance Tracker');
    }
    case 'expiring': {
      const dateStr = cert.expiryDate instanceof Date ? cert.expiryDate.toLocaleDateString() : new Date(cert.expiryDate as unknown as string).toLocaleDateString();
      return makeCheck(60, 100, weight, 'partial', `Expiring ${dateStr} — renew now`, 'Compliance Tracker');
    }
    case 'expired':
      return makeCheck(0, 100, weight, 'non_compliant', 'Certificate expired — immediate action required', 'Compliance Tracker');
    default:
      return makeCheck(0, 100, weight, 'non_compliant', 'Unknown status', 'Compliance Tracker');
  }
}

async function getCertificate(userId: string, type: ComplianceCertificate['type']): Promise<ComplianceCertificate | null> {
  try {
    const snap = await adminDb
      .collection('compliance_certificates')
      .where('userId', '==', userId)
      .where('type', '==', type)
      .orderBy('expiryDate', 'desc')
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snap.docs[0].data() as ComplianceCertificate;
  } catch {
    return null;
  }
}

export async function calculateComplianceScore(userId: string): Promise<ComplianceScorecard> {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  const userData = userDoc.data();
  const businessName = userData?.businessName || userData?.displayName || 'Business';

  const breakdown = {} as ComplianceScorecard['breakdown'];
  let totalWeightedScore = 0;

  for (const check of CHECKS) {
    let result: ScorecardCheck;

    switch (check.key) {
      case 'praz_registration': {
        try {
          const profile = await getPrazProfile(userId);
          const readinessScore = profile.readinessScore;
          if (readinessScore === 0) {
            result = makeCheck(0, 100, check.weight, 'non_compliant', 'No PRAZ documents uploaded. Certificate of Incorporation, CR14, CR6, and tax clearance are required.', 'PRAZ Document Upload');
          } else {
            const docsUploaded = Object.values(profile.documents).filter(Boolean).length;
            const status: CheckStatus = readinessScore >= 80 ? 'compliant' : readinessScore >= 40 ? 'partial' : 'non_compliant';
            result = makeCheck(readinessScore, 100, check.weight, status, `${docsUploaded}/7 required documents uploaded (${readinessScore}% readiness)`, 'PRAZ Document Upload');
          }
        } catch {
          result = makeCheck(0, 100, check.weight, 'non_compliant', 'Could not retrieve PRAZ profile', 'PRAZ Document Upload');
        }
        break;
      }

      case 'tax_clearance': {
        const cert = await getCertificate(userId, 'zimra_tax_clearance');
        result = checkFromCertificate(cert, check.weight);
        break;
      }

      case 'nssa_compliance': {
        const cert = await getCertificate(userId, 'nssa');
        result = checkFromCertificate(cert, check.weight);
        break;
      }

      case 'paye_remittance':
        result = makeCheck(0, 100, check.weight, 'not_tracked', 'PAYE tracking not yet set up. Connect your payroll to enable this check.', 'Not Available');
        break;

      case 'saz_iso':
        result = makeCheck(0, 100, check.weight, 'not_tracked', 'SAZ/ISO certification tracking not yet available. Upload your certificates to include this check.', 'Not Available');
        break;

      case 'tender_track_record': {
        try {
          const snap = await adminDb.collection('scraped_items')
            .where('userId', '==', userId)
            .limit(50)
            .get();
          if (snap.empty) {
            result = makeCheck(0, 100, check.weight, 'not_tracked', 'No tender history found. Start bidding to build your track record.', 'PRAZ / Tender Scraper');
          } else {
            const tenders = snap.docs.map(d => d.data());
            const won = tenders.filter(t => t.status === 'awarded' || t.status === 'won');
            const winRate = tenders.length > 0 ? (won.length / tenders.length) * 100 : 0;
            const score = Math.round(winRate);
            const status: CheckStatus = score >= 60 ? 'compliant' : score >= 30 ? 'partial' : 'non_compliant';
            result = makeCheck(score, 100, check.weight, status, `${won.length}/${tenders.length} tenders won (${score}% win rate)`, 'PRAZ / Tender Scraper');
          }
        } catch {
          result = makeCheck(0, 100, check.weight, 'not_tracked', 'Could not retrieve tender history', 'PRAZ / Tender Scraper');
        }
        break;
      }

      case 'litigation':
        result = makeCheck(0, 100, check.weight, 'not_tracked', 'Litigation monitoring not yet available. This will check Zimbabwe court records for judgments against your business.', 'Not Available');
        break;

      case 'blacklist_status':
        result = makeCheck(0, 100, check.weight, 'not_tracked', 'Blacklist monitoring not yet available. This will check ZIMRA, PRAZ, and RBZ blacklists.', 'Not Available');
        break;

      case 'banking_history':
        result = makeCheck(0, 100, check.weight, 'not_tracked', 'Banking verification not yet available. Connect your bank account to enable this check.', 'Not Available');
        break;

      case 'zimra_fiscal_device': {
        const cert = await getCertificate(userId, 'zimra_fiscal_device');
        result = checkFromCertificate(cert, check.weight);
        break;
      }

      default:
        result = makeCheck(0, 100, check.weight, 'not_tracked', 'Check not yet implemented', 'Not Available');
    }

    breakdown[check.key] = result;
    totalWeightedScore += result.score * result.weight;
  }

  const overallScore = Math.round(totalWeightedScore);

  let status: ScorecardStatus;
  if (overallScore >= 80) status = 'green';
  else if (overallScore >= 60) status = 'amber';
  else status = 'red';

  const scorecard: ComplianceScorecard = {
    userId,
    businessName,
    overallScore,
    status,
    lastUpdated: new Date().toISOString(),
    breakdown,
  };

  try {
    await adminDb.collection('compliance_scorecards').doc(userId).set({
      ...scorecard,
      updatedAt: new Date(),
    }, { merge: true });
  } catch {
    // cache write failure is non-fatal
  }

  return scorecard;
}

export async function getComplianceScorecard(userId: string, forceRefresh = false): Promise<ComplianceScorecard | null> {
  if (!forceRefresh) {
    try {
      const doc = await adminDb.collection('compliance_scorecards').doc(userId).get();
      if (doc.exists) {
        const data = doc.data() as ComplianceScorecard;
        const age = Date.now() - new Date(data.lastUpdated).getTime();
        if (age < 5 * 60 * 1000) return data;
      }
    } catch {
      // fall through to recalculate
    }
  }

  return calculateComplianceScore(userId);
}

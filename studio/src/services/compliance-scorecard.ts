import { adminDb } from '@/lib/firebase/firebase-admin';
import { getPrazProfile } from './praz-compliance';
import { getFiscalComplianceStatus } from './zimra-fiscal';
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
  };
}

const CHECKS: Array<{ key: keyof ComplianceScorecard['breakdown']; label: string; weight: number }> = [
  { key: 'praz_registration', label: 'PRAZ Registration', weight: 0.15 },
  { key: 'tax_clearance', label: 'Tax Clearance Certificate', weight: 0.15 },
  { key: 'nssa_compliance', label: 'NSSA Compliance', weight: 0.10 },
  { key: 'paye_remittance', label: 'PAYE / AIDS Levy Remittance', weight: 0.10 },
  { key: 'saz_iso', label: 'SAZ / ISO Certification', weight: 0.05 },
  { key: 'tender_track_record', label: 'Tender Win/Loss History', weight: 0.15 },
  { key: 'litigation', label: 'Litigation / Judgments', weight: 0.10 },
  { key: 'blacklist_status', label: 'Blacklist Status', weight: 0.10 },
  { key: 'banking_history', label: 'Banking History (No Bounced Checks)', weight: 0.10 },
];

function scoreForCertificate(cert: ComplianceCertificate | null): { score: number; maxScore: number; status: CheckStatus; details: string } {
  if (!cert) {
    return { score: 0, maxScore: 100, status: 'non_compliant', details: 'No certificate registered. Upload your certificate to track compliance.' };
  }
  switch (cert.status) {
    case 'valid':
      return { score: 100, maxScore: 100, status: 'compliant', details: `Valid until ${cert.expiryDate instanceof Date ? cert.expiryDate.toLocaleDateString() : new Date(cert.expiryDate as unknown as string).toLocaleDateString()}` };
    case 'expiring':
      return { score: 60, maxScore: 100, status: 'partial', details: `Expiring ${cert.expiryDate instanceof Date ? cert.expiryDate.toLocaleDateString() : new Date(cert.expiryDate as unknown as string).toLocaleDateString()} — renew now` };
    case 'expired':
      return { score: 0, maxScore: 100, status: 'non_compliant', details: 'Certificate expired — immediate action required' };
    default:
      return { score: 0, maxScore: 100, status: 'non_compliant', details: 'Unknown status' };
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

  const breakdown: ComplianceScorecard['breakdown'] = {} as ComplianceScorecard['breakdown'];
  let totalWeightedScore = 0;
  let activeWeight = 0;

  for (const check of CHECKS) {
    let result: { score: number; maxScore: number; status: CheckStatus; details: string; dataSource: string };

    switch (check.key) {
      case 'praz_registration': {
        try {
          const profile = await getPrazProfile(userId);
          const readinessScore = profile.readinessScore;
          if (readinessScore === 0) {
            result = { score: 0, maxScore: 100, weight: check.weight, status: 'non_compliant', details: 'No PRAZ documents uploaded. Certificate of Incorporation, CR14, CR6, and tax clearance are required.', dataSource: 'PRAZ Document Upload' };
          } else {
            const docsUploaded = Object.values(profile.documents).filter(Boolean).length;
            const status: CheckStatus = readinessScore >= 80 ? 'compliant' : readinessScore >= 40 ? 'partial' : 'non_compliant';
            result = { score: readinessScore, maxScore: 100, weight: check.weight, status, details: `${docsUploaded}/7 required documents uploaded (${readinessScore}% readiness)`, dataSource: 'PRAZ Document Upload' };
          }
        } catch {
          result = { score: 0, maxScore: 100, weight: check.weight, status: 'non_compliant', details: 'Could not retrieve PRAZ profile', dataSource: 'PRAZ Document Upload' };
        }
        break;
      }

      case 'tax_clearance': {
        const cert = await getCertificate(userId, 'zimra_tax_clearance');
        const base = scoreForCertificate(cert);
        result = { ...base, weight: check.weight, dataSource: 'Compliance Tracker' };
        break;
      }

      case 'nssa_compliance': {
        const cert = await getCertificate(userId, 'nssa');
        const base = scoreForCertificate(cert);
        result = { ...base, weight: check.weight, dataSource: 'Compliance Tracker' };
        break;
      }

      case 'paye_remittance':
        result = { score: 0, maxScore: 100, weight: check.weight, status: 'not_tracked', details: 'PAYE tracking not yet set up. Connect your payroll to enable this check.', dataSource: 'Not Available' };
        break;

      case 'saz_iso':
        result = { score: 0, maxScore: 100, weight: check.weight, status: 'not_tracked', details: 'SAZ/ISO certification tracking not yet available. Upload your certificates to include this check.', dataSource: 'Not Available' };
        break;

      case 'tender_track_record': {
        try {
          const snap = await adminDb.collection('scraped_items')
            .where('userId', '==', userId)
            .limit(50)
            .get();
          if (snap.empty) {
            result = { score: 0, maxScore: 100, weight: check.weight, status: 'not_tracked', details: 'No tender history found. Start bidding to build your track record.', dataSource: 'PRAZ / Tender Scraper' };
          } else {
            const tenders = snap.docs.map(d => d.data());
            const won = tenders.filter(t => t.status === 'awarded' || t.status === 'won');
            const winRate = tenders.length > 0 ? (won.length / tenders.length) * 100 : 0;
            const score = Math.round(winRate);
            const status: CheckStatus = score >= 60 ? 'compliant' : score >= 30 ? 'partial' : 'non_compliant';
            result = { score, maxScore: 100, weight: check.weight, status, details: `${won.length}/${tenders.length} tenders won (${score}% win rate)`, dataSource: 'PRAZ / Tender Scraper' };
          }
        } catch {
          result = { score: 0, maxScore: 100, weight: check.weight, status: 'not_tracked', details: 'Could not retrieve tender history', dataSource: 'PRAZ / Tender Scraper' };
        }
        break;
      }

      case 'litigation':
        result = { score: 0, maxScore: 100, weight: check.weight, status: 'not_tracked', details: 'Litigation monitoring not yet available. This will check Zimbabwe court records for judgments against your business.', dataSource: 'Not Available' };
        break;

      case 'blacklist_status':
        result = { score: 0, maxScore: 100, weight: check.weight, status: 'not_tracked', details: 'Blacklist monitoring not yet available. This will check ZIMRA, PRAZ, and RBZ blacklists.', dataSource: 'Not Available' };
        break;

      case 'banking_history':
        result = { score: 0, maxScore: 100, weight: check.weight, status: 'not_tracked', details: 'Banking verification not yet available. Connect your bank account to enable this check.', dataSource: 'Not Available' };
        break;

      default:
        result = { score: 0, maxScore: 100, weight: check.weight, status: 'not_tracked', details: 'Check not yet implemented', dataSource: 'Not Available' };
    }

    breakdown[check.key] = result;
    totalWeightedScore += result.score * result.weight * (result.maxScore > 0 ? 1 : 0);
    activeWeight += result.weight;
  }

  const overallScore = activeWeight > 0 ? Math.round(totalWeightedScore) : 0;
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

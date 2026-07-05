import { adminDb } from '@/lib/firebase/firebase-admin';
import { calculateTrustSeal } from './trust-seal';
import { getFinancialSummary } from './financial-oracle';
import { getComplianceScorecard } from './compliance-scorecard';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'FIIntegration' });

export interface FiPartner {
  partnerId: string;
  name: string;
  apiKey: string;
  webhookUrl: string | null;
  active: boolean;
}

export interface FiCreditReport {
  partnerName: string;
  reportGeneratedAt: string;
  trustSeal: {
    overallScore: number;
    status: string;
  };
  compliance: {
    overallScore: number;
    prazStatus: string;
    taxCompliant: boolean;
    nssaCompliant: boolean;
  };
  financial: {
    totalRevenue: number | null;
    netProfit: number | null;
    cashFlowWeeksUntilDepletion: number | null;
    financialHealthScore: number | null;
  };
  tenderTrackRecord: {
    score: number;
    details: string;
  };
}

export async function validateFiApiKey(apiKey: string): Promise<FiPartner | null> {
  try {
    const snap = await adminDb.collection('fi_partners')
      .where('apiKey', '==', apiKey)
      .where('active', '==', true)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const data = snap.docs[0].data() as FiPartner;
    return data;
  } catch {
    return null;
  }
}

export async function generateFiCreditReport(smeUserId: string): Promise<FiCreditReport | null> {
  try {
    const [trustSeal, financialSummary, scorecard] = await Promise.all([
      calculateTrustSeal(smeUserId),
      getFinancialSummary(smeUserId),
      getComplianceScorecard(smeUserId),
    ]);

    if (!scorecard) return null;

    return {
      partnerName: 'FI Integration',
      reportGeneratedAt: new Date().toISOString(),
      trustSeal: {
        overallScore: trustSeal.overallScore,
        status: trustSeal.status,
      },
      compliance: {
        overallScore: scorecard.overallScore,
        prazStatus: scorecard.breakdown.praz_registration.status,
        taxCompliant: scorecard.breakdown.tax_clearance.status === 'compliant',
        nssaCompliant: scorecard.breakdown.nssa_compliance.status === 'compliant',
      },
      financial: {
        totalRevenue: financialSummary.summary?.totalRevenue || null,
        netProfit: financialSummary.summary?.netProfit || null,
        cashFlowWeeksUntilDepletion: financialSummary.cashFlow?.weeksUntilDepletion || null,
        financialHealthScore: financialSummary.financialHealth?.overallScore || null,
      },
      tenderTrackRecord: {
        score: scorecard.breakdown.tender_track_record.score,
        details: scorecard.breakdown.tender_track_record.details,
      },
    };
  } catch (err) {
    log.error({ err, smeUserId }, 'Failed to generate FI credit report');
    return null;
  }
}

export async function registerFiWebhook(partnerId: string, webhookUrl: string): Promise<boolean> {
  try {
    await adminDb.collection('fi_partners').doc(partnerId).update({ webhookUrl });
    return true;
  } catch {
    return false;
  }
}

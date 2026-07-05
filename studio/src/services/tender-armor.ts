import { adminDb } from '@/lib/firebase/firebase-admin';
import { getPrazProfile } from './praz-compliance';
import { getFiscalComplianceStatus } from './zimra-fiscal';
import type { ComplianceCertificate } from './compliance-tracker';

export type ArmorStatus = 'green' | 'yellow' | 'red';

export interface ArmorCheck {
  label: string;
  status: 'pass' | 'warn' | 'fail' | 'untracked';
  detail: string;
}

export interface TenderArmorResult {
  overallStatus: ArmorStatus;
  checks: ArmorCheck[];
  passCount: number;
  warnCount: number;
  failCount: number;
  remediationSteps: string[];
  lastUpdated: string;
}

async function getCertificate(userId: string, type: ComplianceCertificate['type']): Promise<ComplianceCertificate | null> {
  try {
    const snap = await adminDb.collection('compliance_certificates')
      .where('userId', '==', userId).where('type', '==', type)
      .orderBy('expiryDate', 'desc').limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0].data() as ComplianceCertificate;
  } catch { return null; }
}

export async function runTenderArmor(userId: string): Promise<TenderArmorResult> {
  const checks: ArmorCheck[] = [];
  const remediationSteps: string[] = [];

  // 1. PRAZ registration
  try {
    const profile = await getPrazProfile(userId);
    const validDocs = Object.values(profile.documents).filter(d => d && d.status === 'valid').length;
    const missingDocs = Object.values(profile.documents).filter(d => !d || d.status === 'missing').length;
    if (validDocs >= 7) {
      checks.push({ label: 'PRAZ Registration', status: 'pass', detail: 'All 7 required documents uploaded' });
    } else if (validDocs >= 4) {
      checks.push({ label: 'PRAZ Registration', status: 'warn', detail: `${validDocs}/7 documents valid — ${missingDocs} missing` });
      remediationSteps.push(`Upload missing PRAZ documents: Certificate of Incorporation, CR14, CR6, ITF263, NSSA, Business License, Proof of Residence`);
    } else {
      checks.push({ label: 'PRAZ Registration', status: 'fail', detail: `${validDocs}/7 documents uploaded — PRAZ compliance insufficient for bidding` });
      remediationSteps.push('Complete PRAZ registration — upload all 7 required documents');
    }
  } catch {
    checks.push({ label: 'PRAZ Registration', status: 'fail', detail: 'PRAZ profile not found — register with PRAZ first' });
    remediationSteps.push('Register with PRAZ (Procurement Regulatory Authority of Zimbabwe) and upload required documents');
  }

  // 2. Tax Clearance
  const taxCert = await getCertificate(userId, 'zimra_tax_clearance');
  if (taxCert?.status === 'valid') {
    checks.push({ label: 'Tax Clearance (ITF263)', status: 'pass', detail: 'Valid tax clearance certificate on file' });
  } else if (taxCert?.status === 'expiring') {
    checks.push({ label: 'Tax Clearance (ITF263)', status: 'warn', detail: 'Tax clearance expiring soon — renew immediately' });
    remediationSteps.push('Renew your ZIMRA Tax Clearance Certificate (ITF263) before bidding');
  } else {
    checks.push({ label: 'Tax Clearance (ITF263)', status: 'fail', detail: taxCert ? 'Tax clearance expired' : 'Tax clearance not found' });
    remediationSteps.push('Obtain a valid ZIMRA Tax Clearance Certificate (ITF263)');
  }

  // 3. NSSA Compliance
  const nssaCert = await getCertificate(userId, 'nssa');
  if (nssaCert?.status === 'valid') {
    checks.push({ label: 'NSSA Compliance', status: 'pass', detail: 'NSSA contributions up to date' });
  } else if (nssaCert?.status === 'expiring') {
    checks.push({ label: 'NSSA Compliance', status: 'warn', detail: 'NSSA compliance expiring soon' });
    remediationSteps.push('Renew NSSA compliance certificate');
  } else {
    checks.push({ label: 'NSSA Compliance', status: 'fail', detail: nssaCert ? 'NSSA expired' : 'NSSA not registered' });
    remediationSteps.push('Register with NSSA and obtain compliance certificate');
  }

  // 4. Fiscal Device
  try {
    const fiscal = await getFiscalComplianceStatus(userId);
    if (fiscal.status === 'registered' || fiscal.status === 'pending') {
      checks.push({ label: 'ZIMRA Fiscal Device', status: 'pass', detail: `Fiscal device ${fiscal.status}` });
    } else {
      checks.push({ label: 'ZIMRA Fiscal Device', status: 'warn', detail: 'Fiscal device not registered — may be required for VAT-registered businesses' });
    }
  } catch {
    checks.push({ label: 'ZIMRA Fiscal Device', status: 'untracked', detail: 'Fiscal device status unavailable' });
  }

  // 5. Bid Bond / Bank Guarantee
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const hasBond = userDoc.data()?.bidBondAvailable === true;
    if (hasBond) {
      checks.push({ label: 'Bid Bond / Bank Guarantee', status: 'pass', detail: 'Bid bond available' });
    } else {
      checks.push({ label: 'Bid Bond / Bank Guarantee', status: 'warn', detail: 'No bid bond on file — may be required for high-value tenders' });
      remediationSteps.push('Arrange a bid bond or bank guarantee from your bank for tender submissions');
    }
  } catch {
    checks.push({ label: 'Bid Bond / Bank Guarantee', status: 'untracked', detail: 'Bid bond status unavailable' });
  }

  // 6. Past Performance
  try {
    const tenderSnap = await adminDb.collection('scraped_items').where('userId', '==', userId).limit(30).get();
    if (!tenderSnap.empty) {
      const tenders = tenderSnap.docs.map(d => d.data());
      const won = tenders.filter(t => t.status === 'won' || t.status === 'awarded').length;
      const rate = Math.round((won / tenders.length) * 100);
      if (rate >= 50) {
        checks.push({ label: 'Past Performance', status: 'pass', detail: `${won}/${tenders.length} tenders won (${rate}% win rate)` });
      } else if (rate >= 20) {
        checks.push({ label: 'Past Performance', status: 'warn', detail: `${won}/${tenders.length} tenders won (${rate}% win rate)` });
      } else {
        checks.push({ label: 'Past Performance', status: 'warn', detail: `${won}/${tenders.length} won — consider smaller tenders to build track record` });
        remediationSteps.push('Start with smaller, lower-competition tenders to build your win history');
      }
    } else {
      checks.push({ label: 'Past Performance', status: 'warn', detail: 'No tender history — new bidders may face higher scrutiny' });
    }
  } catch {
    checks.push({ label: 'Past Performance', status: 'untracked', detail: 'Tender history unavailable' });
  }

  // 7. Capacity Check
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const data = userDoc.data();
    const staffCount = data?.employeeCount || 0;
    const hasEquipment = data?.hasEquipment === true;
    const equipmentOk = hasEquipment || staffCount >= 3;
    if (staffCount >= 5 && equipmentOk) {
      checks.push({ label: 'Capacity (Staff & Equipment)', status: 'pass', detail: `${staffCount} employees, adequate equipment` });
    } else if (staffCount >= 2) {
      checks.push({ label: 'Capacity (Staff & Equipment)', status: 'warn', detail: `${staffCount} employees — may need to demonstrate capacity for large contracts` });
      remediationSteps.push('Document your staff count, equipment, and subcontractor network for capacity demonstration');
    } else {
      checks.push({ label: 'Capacity (Staff & Equipment)', status: 'warn', detail: `${staffCount} employees on record — consider partnerships for larger tenders` });
    }
  } catch {
    checks.push({ label: 'Capacity (Staff & Equipment)', status: 'untracked', detail: 'Capacity data unavailable — update your business profile' });
  }

  // Determine overall status
  const passCount = checks.filter(c => c.status === 'pass').length;
  const warnCount = checks.filter(c => c.status === 'warn').length;
  const failCount = checks.filter(c => c.status === 'fail').length;

  let overallStatus: ArmorStatus;
  if (failCount > 0) {
    overallStatus = 'red';
  } else if (warnCount >= 3) {
    overallStatus = 'yellow';
  } else {
    overallStatus = 'green';
  }

  if (overallStatus === 'red' && remediationSteps.length === 0) {
    remediationSteps.push('Resolve all failed compliance checks before submitting any tender bid');
  }

  return { overallStatus, checks, passCount, warnCount, failCount, remediationSteps, lastUpdated: new Date().toISOString() };
}

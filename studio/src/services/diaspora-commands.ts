import { adminDb } from '@/lib/firebase/firebase-admin';
import { calculateTrustSeal } from './trust-seal';
import { getFinancialSummary } from './financial-oracle';
import { enqueueOutboundMessage } from './whatsapp/outbound-queue';

export interface DiasporaAlert {
  id: string;
  investorUserId: string;
  smeUserId: string;
  smeName: string;
  alertType: 'trust_seal_drop' | 'capital_call' | 'milestone_complete';
  threshold?: number;
  active: boolean;
  createdAt: string;
}

export async function handleShowSme(_investorUserId: string, smeName: string): Promise<string> {
  const snap = await adminDb.collection('users')
    .where('businessName', '==', smeName).limit(1).get();
  if (snap.empty) return `SME "${smeName}" not found. Check the name and try again.`;

  const sme = snap.docs[0];
  const smeId = sme.id;
  const data = sme.data();

  const [trustSeal, financialSummary] = await Promise.all([
    calculateTrustSeal(smeId).catch(() => null),
    getFinancialSummary(smeId).catch(() => null),
  ]);

  const lines = [
    `*${data.businessName || smeName}*`,
    `Sector: ${data.industry || 'N/A'}`,
    `Location: ${data.location || 'Zimbabwe'}`,
    '',
  ];

  if (trustSeal) {
    const emoji = trustSeal.status === 'green' ? '🟢' : trustSeal.status === 'amber' ? '🟡' : '🔴';
    lines.push(`${emoji} *Trust Seal: ${trustSeal.overallScore}/100* (${trustSeal.status.toUpperCase()})`);
  }

  if (financialSummary?.financialHealth) {
    lines.push(`Financial Health: ${financialSummary.financialHealth.overallScore}/100`);
  }

  if (financialSummary?.summary) {
    const rev = financialSummary.summary.totalRevenue;
    lines.push(`Revenue: $${rev.toLocaleString()}`);
    lines.push(`Net: $${financialSummary.summary.netProfit.toLocaleString()}`);
  }

  lines.push('', 'Reply *details* for full report or *alert* to get notified of changes.');

  return lines.join('\n');
}

export async function handleDepositEscrow(investorUserId: string, smeName: string, amountUsd: number): Promise<string> {
  const snap = await adminDb.collection('users')
    .where('businessName', '==', smeName).limit(1).get();
  if (snap.empty) return `SME "${smeName}" not found.`;

  const sme = snap.docs[0];
  const smeId = sme.id;

  const escrowRef = await adminDb.collection('escrow_requests').add({
    investorUserId,
    smeUserId: smeId,
    smeName,
    amountUsd,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  const investorDoc = await adminDb.collection('diaspora_investors').doc(investorUserId).get();
  const investorName = investorDoc.data()?.countryOfResidence || 'Diaspora investor';

  await enqueueOutboundMessage(smeId, '', 'assessment_results_ready', {
    message: `New escrow deposit: ${investorName} proposes $${amountUsd.toLocaleString()} deposit to ${smeName}. Reply CONFIRM or DECLINE.`,
  }, 0);

  return `Escrow request #${escrowRef.id} created for $${amountUsd.toLocaleString()} to ${smeName}. The SME will be notified to confirm.`;
}

export async function handleCreateAlert(investorUserId: string, smeName: string, threshold?: number): Promise<string> {
  const snap = await adminDb.collection('users')
    .where('businessName', '==', smeName).limit(1).get();
  if (snap.empty) return `SME "${smeName}" not found.`;

  const sme = snap.docs[0];
  const smeId = sme.id;

  await adminDb.collection('diaspora_alerts').add({
    investorUserId,
    smeUserId: smeId,
    smeName,
    alertType: 'trust_seal_drop',
    threshold: threshold || 60,
    active: true,
    createdAt: new Date().toISOString(),
  });

  return `Alert created for ${smeName}. You'll be notified if their Trust Seal drops below ${threshold || 60}.`;
}

export async function handleVerifyDeliveries(_investorUserId: string, smeName: string): Promise<string> {
  const snap = await adminDb.collection('users')
    .where('businessName', '==', smeName).limit(1).get();
  if (snap.empty) return `SME "${smeName}" not found.`;

  const sme = snap.docs[0];
  const smeId = sme.id;

  const deliverySnap = await adminDb.collection('operational_mirror').doc(smeId)
    .collection('deliveries').orderBy('confirmedAt', 'desc').limit(5).get();

  if (deliverySnap.empty) {
    return `No delivery records found for ${smeName}. Delivery tracking not yet active.`;
  }

  const lines = [`*Recent Deliveries — ${smeName}*`, ''];
  for (const d of deliverySnap.docs) {
    const data = d.data();
    lines.push(`📍 ${data.destination || 'Unknown'} — ${data.status}`);
    if (data.confirmedAt) lines.push(`   Confirmed: ${new Date(data.confirmedAt).toLocaleDateString()}`);
    lines.push('');
  }

  return lines.join('\n');
}

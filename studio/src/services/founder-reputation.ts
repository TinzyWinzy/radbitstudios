import { adminDb } from '@/lib/firebase/firebase-admin';

export interface FounderReputationScore {
  overallScore: number;
  status: 'strong' | 'moderate' | 'weak' | 'unrated';
  components: {
    tenderPerformance: { score: number; detail: string };
    employeeRetention: { score: number; detail: string };
    supplierPayment: { score: number; detail: string };
    networkQuality: { score: number; detail: string };
  };
}

export async function calculateFounderReputation(userId: string): Promise<FounderReputationScore> {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  const userData = userDoc.data() || {};

  // Tender performance
  let tenderScore = 0;
  let tenderDetail = 'No tender history available';
  try {
    const snap = await adminDb.collection('scraped_items')
      .where('userId', '==', userId).limit(50).get();
    if (!snap.empty) {
      const items = snap.docs.map(d => d.data());
      const won = items.filter(i => i.status === 'won' || i.status === 'awarded').length;
      const completed = items.filter(i => i.status === 'completed' || i.status === 'closed').length;
      const onTime = items.filter(i => i.completed === true).length;
      const winRate = items.length > 0 ? Math.round((won / items.length) * 100) : 0;
      const reliabilityRate = completed > 0 ? Math.round((onTime / completed) * 100) : 0;
      tenderScore = Math.round((winRate * 0.6 + reliabilityRate * 0.4));
      tenderDetail = `${won}/${items.length} won (${winRate}% win rate) — ${reliabilityRate}% on-time delivery`;
    }
  } catch {
    tenderScore = 0;
    tenderDetail = 'Could not load tender history';
  }

  // Employee retention
  let retentionScore = 0;
  let retentionDetail = 'No attendance data available';
  try {
    const attendanceSnap = await adminDb.collection('operational_mirror').doc(userId)
      .collection('attendance').limit(100).get();
    if (!attendanceSnap.empty) {
      const records = attendanceSnap.docs.map(d => d.data());
      const employeeNames = new Set(records.map(r => r.employeeName));
      const totalEmployees = employeeNames.size;
      const longTerm = records.filter(r => {
        const clockIn = new Date(r.clockIn).getTime();
        return records.some(other => other.employeeName === r.employeeName && other.clockOut && new Date(other.clockOut).getTime() - clockIn > 90 * 24 * 60 * 60 * 1000);
      });
      const longTermCount = new Set(longTerm.map(r => r.employeeName)).size;
      const retentionRate = totalEmployees > 0 ? Math.round((longTermCount / totalEmployees) * 100) : 0;
      retentionScore = Math.min(100, retentionRate * 1.2);
      retentionDetail = `${longTermCount}/${totalEmployees} employees retained > 90 days (${retentionRate}%)`;
    } else {
      const staffCount = userData?.employeeCount || 0;
      if (staffCount > 0) {
        retentionScore = 50;
        retentionDetail = `${staffCount} employees on record — tracking retention requires attendance data`;
      } else {
        retentionDetail = 'No employee data — update your business profile';
      }
    }
  } catch {
    retentionScore = 0;
  }

  // Supplier payment history
  let paymentScore = 0;
  let paymentDetail = 'No supplier payment data available';
  try {
    const financialSnap = await adminDb.collection('financial_oracle').doc(userId)
      .collection('transactions').limit(100).get();
    if (!financialSnap.empty) {
      const transactions = financialSnap.docs.map(d => d.data());
      const supplierPayments = transactions.filter(t => t.category === 'cost_of_goods' || t.category === 'professional_fees' || t.category === 'other_expense');
      const totalPaid = supplierPayments.reduce((s, t) => s + t.amount, 0);
      const onTimeEstimate = supplierPayments.filter(t => t.amount > 0).length;
      if (onTimeEstimate > 0) {
        paymentScore = 70;
        paymentDetail = `${supplierPayments.length} supplier payments tracked ($${Math.round(totalPaid).toLocaleString()} total)`;
      }
    } else {
      paymentDetail = 'Connect your bank account to track supplier payment history';
    }
  } catch {
    paymentScore = 0;
  }

  // Network quality (social graph)
  let networkScore = 0;
  let networkDetail = 'Network analysis requires more data';
  try {
    const partnersSnap = await adminDb.collection('partner_attributions')
      .where('attributedBy', '==', userId).limit(20).get();
    const referrals = partnersSnap.size;
    const tenderNetwork = await adminDb.collection('scraped_items')
      .where('userId', '==', userId).limit(20).get();
    const hasTenderHistory = !tenderNetwork.empty;

    if (referrals > 0) {
      networkScore = Math.min(100, referrals * 20);
      networkDetail = `${referrals} referral(s) — indicates trusted network`;
    } else if (hasTenderHistory) {
      networkScore = 40;
      networkDetail = 'Active in tender ecosystem — expanding network';
    } else {
      networkDetail = 'No referral or tender network data yet';
    }
  } catch {
    networkScore = 0;
  }

  const tenderPerformance = { score: tenderScore, detail: tenderDetail };
  const employeeRetention = { score: retentionScore, detail: retentionDetail };
  const supplierPayment = { score: paymentScore, detail: paymentDetail };
  const networkQuality = { score: networkScore, detail: networkDetail };

  const overallScore = Math.round((
    tenderPerformance.score * 0.35 +
    employeeRetention.score * 0.25 +
    supplierPayment.score * 0.25 +
    networkQuality.score * 0.15
  ));

  const status: FounderReputationScore['status'] = overallScore >= 70 ? 'strong' : overallScore >= 40 ? 'moderate' : overallScore > 0 ? 'weak' : 'unrated';

  return { overallScore, status, components: { tenderPerformance, employeeRetention, supplierPayment, networkQuality } };
}

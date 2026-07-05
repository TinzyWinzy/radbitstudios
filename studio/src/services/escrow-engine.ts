import { adminDb } from '@/lib/firebase/firebase-admin';
import { createHash } from 'crypto';
import { enqueueOutboundMessage } from './whatsapp/outbound-queue';

export type EscrowStatus = 'pending' | 'funded' | 'partial' | 'completed' | 'disputed' | 'returned';
export type MilestoneStatus = 'pending' | 'verified' | 'failed' | 'released';

export interface Milestone {
  id: string;
  description: string;
  amountUsd: number;
  dueDate: string;
  status: MilestoneStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  evidenceUrl?: string;
}

export interface EscrowAgreement {
  id: string;
  investorUserId: string;
  investorName: string;
  smeUserId: string;
  smeName: string;
  totalAmountUsd: number;
  releasedAmountUsd: number;
  remainingAmountUsd: number;
  status: EscrowStatus;
  milestones: Milestone[];
  trustSealThreshold: number;
  chainHash: string;
  previousHash: string;
  createdAt: string;
  updatedAt: string;
}

function hashBlock(data: string, previousHash: string): string {
  return createHash('sha256').update(data + previousHash).digest('hex');
}

export async function createEscrow(
  investorUserId: string,
  investorName: string,
  smeUserId: string,
  smeName: string,
  totalAmountUsd: number,
  milestones: Omit<Milestone, 'id' | 'status'>[],
): Promise<EscrowAgreement> {
  const id = `esc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const genesisHash = hashBlock(`escrow:${id}:created`, 'GENESIS');

  const milestoneRecords: Milestone[] = milestones.map((m, i) => ({
    ...m,
    id: `ms-${id}-${i}`,
    status: 'pending',
  }));

  const escrow: EscrowAgreement = {
    id,
    investorUserId,
    investorName,
    smeUserId,
    smeName,
    totalAmountUsd,
    releasedAmountUsd: 0,
    remainingAmountUsd: totalAmountUsd,
    status: 'pending',
    milestones: milestoneRecords,
    trustSealThreshold: 60,
    chainHash: genesisHash,
    previousHash: 'GENESIS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await adminDb.collection('escrow_agreements').doc(id).set(escrow);

  const smePhone = await getUserPhone(smeUserId);
  const investorPhone = await getUserPhone(investorUserId);

  if (smePhone) {
    await enqueueOutboundMessage(smeUserId, smePhone, 'assessment_results_ready', {
      message: `New escrow agreement from ${investorName}: $${totalAmountUsd.toLocaleString()} for ${smeName}. ${milestones.length} milestone(s). Reply ACCEPT or DECLINE.`,
    }, 0);
  }

  if (investorPhone) {
    await enqueueOutboundMessage(investorUserId, investorPhone, 'assessment_results_ready', {
      message: `Escrow #${id} created for $${totalAmountUsd.toLocaleString()} → ${smeName}. Waiting for SME confirmation.`,
    }, 0);
  }

  return escrow;
}

export async function confirmEscrow(escrowId: string, userId: string): Promise<EscrowAgreement | null> {
  const doc = await adminDb.collection('escrow_agreements').doc(escrowId).get();
  if (!doc.exists) return null;
  const escrow = doc.data() as EscrowAgreement;

  if (escrow.smeUserId !== userId) return null;
  if (escrow.status !== 'pending') return null;

  const newHash = hashBlock(`escrow:${escrowId}:confirmed:${Date.now()}`, escrow.chainHash);

  const updated: Partial<EscrowAgreement> = {
    status: 'funded',
    chainHash: newHash,
    updatedAt: new Date().toISOString(),
  };

  await doc.ref.update(updated);
  return { ...escrow, ...updated };
}

export async function verifyMilestone(
  escrowId: string,
  milestoneId: string,
  verifierUserId: string,
  status: MilestoneStatus,
  evidenceUrl?: string,
): Promise<EscrowAgreement | null> {
  const doc = await adminDb.collection('escrow_agreements').doc(escrowId).get();
  if (!doc.exists) return null;
  const escrow = doc.data() as EscrowAgreement;

  if (escrow.investorUserId !== verifierUserId && escrow.smeUserId !== verifierUserId) return null;

  const milestone = escrow.milestones.find(m => m.id === milestoneId);
  if (!milestone || milestone.status !== 'pending') return null;

  milestone.status = status;
  milestone.verifiedAt = new Date().toISOString();
  milestone.verifiedBy = verifierUserId;
  if (evidenceUrl) milestone.evidenceUrl = evidenceUrl;

  let releasedAmountUsd = escrow.releasedAmountUsd;
  if (status === 'verified') {
    releasedAmountUsd += milestone.amountUsd;
  }

  const allComplete = escrow.milestones.every(m => m.status === 'verified' || m.status === 'failed');
  const newStatus: EscrowStatus = allComplete && releasedAmountUsd >= escrow.totalAmountUsd ? 'completed' : status === 'failed' ? 'disputed' : 'partial';

  const blockData = `escrow:${escrowId}:milestone:${milestoneId}:${status}:${Date.now()}`;
  const newHash = hashBlock(blockData, escrow.chainHash);

  const updated: Partial<EscrowAgreement> = {
    milestones: escrow.milestones,
    releasedAmountUsd,
    remainingAmountUsd: escrow.totalAmountUsd - releasedAmountUsd,
    status: newStatus,
    chainHash: newHash,
    updatedAt: new Date().toISOString(),
  };

  await doc.ref.update(updated);

  const smePhone = await getUserPhone(escrow.smeUserId);
  const investorPhone = await getUserPhone(escrow.investorUserId);

  const msg = `Milestone "${milestone.description}" for ${escrow.smeName}: ${status.toUpperCase()}. $${milestone.amountUsd.toLocaleString()} ${status === 'verified' ? 'released' : 'held'}.`;

  if (smePhone) {
    await enqueueOutboundMessage(escrow.smeUserId, smePhone, 'assessment_results_ready', { message: msg }, 0);
  }
  if (investorPhone) {
    await enqueueOutboundMessage(escrow.investorUserId, investorPhone, 'assessment_results_ready', { message: msg }, 0);
  }

  return { ...escrow, ...updated };
}

export async function getEscrowStatus(escrowId: string): Promise<EscrowAgreement | null> {
  const doc = await adminDb.collection('escrow_agreements').doc(escrowId).get();
  if (!doc.exists) return null;
  return doc.data() as EscrowAgreement;
}

export async function listEscrowsForUser(userId: string): Promise<EscrowAgreement[]> {
  const [asInvestor, asSme] = await Promise.all([
    adminDb.collection('escrow_agreements').where('investorUserId', '==', userId).orderBy('createdAt', 'desc').limit(20).get(),
    adminDb.collection('escrow_agreements').where('smeUserId', '==', userId).orderBy('createdAt', 'desc').limit(20).get(),
  ]);

  const seen = new Set<string>();
  const all: EscrowAgreement[] = [];

  for (const doc of [...asInvestor.docs, ...asSme.docs]) {
    if (!seen.has(doc.id)) {
      seen.add(doc.id);
      all.push(doc.data() as EscrowAgreement);
    }
  }

  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return all;
}

async function getUserPhone(userId: string): Promise<string | null> {
  try {
    const doc = await adminDb.collection('users').doc(userId).get();
    return doc.data()?.phoneNumber || doc.data()?.whatsappNumber || null;
  } catch {
    return null;
  }
}

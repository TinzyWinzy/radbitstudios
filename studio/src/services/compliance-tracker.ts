import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { enqueueOutboundMessage } from '@/services/whatsapp/outbound-queue';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'ComplianceTracker' });

export interface ComplianceCertificate {
  userId: string;
  type: 'praz' | 'zimra_tax_clearance' | 'nssa' | 'zimra_fiscal_device';
  label: string;
  expiryDate: Date;
  renewedAt: Date | null;
  status: 'valid' | 'expiring' | 'expired';
  notifiedAt: {
    thirtyDays?: Date;
    fourteenDays?: Date;
    sevenDays?: Date;
    expired?: Date;
  };
}

const CERTIFICATES_COLLECTION = 'compliance_certificates';

export async function registerCertificate(
  userId: string,
  type: ComplianceCertificate['type'],
  label: string,
  expiryDate: string,
): Promise<boolean> {
  const existing = await adminDb
    .collection(CERTIFICATES_COLLECTION)
    .where('userId', '==', userId)
    .where('type', '==', type)
    .where('status', '==', 'valid')
    .limit(1)
    .get();

  if (!existing.empty) {
    return false;
  }

  const expiry = new Date(expiryDate);
  await adminDb.collection(CERTIFICATES_COLLECTION).add({
    userId,
    type,
    label,
    expiryDate: expiry,
    renewedAt: null,
    status: expiry > new Date() ? 'valid' : 'expired',
    notifiedAt: {},
    createdAt: FieldValue.serverTimestamp(),
  });

  log.info(`Certificate registered: ${type} for ${userId}, expires ${expiryDate}`);
  return true;
}

export async function checkExpiringCertificates(): Promise<{
  alerts: Array<{ userId: string; phoneNumber: string; type: string; label: string; daysLeft: number }>;
}> {
  const now = Date.now();
  const thirtyDays = new Date(now + 30 * 24 * 60 * 60 * 1000);

  const snap = await adminDb
    .collection(CERTIFICATES_COLLECTION)
    .where('status', '==', 'valid')
    .where('expiryDate', '<=', thirtyDays)
    .get();

  const alerts: Array<{ userId: string; phoneNumber: string; type: string; label: string; daysLeft: number }> = [];

  for (const doc of snap.docs) {
    const cert = doc.data() as ComplianceCertificate;
    const expiryTime = cert.expiryDate instanceof Date ? cert.expiryDate.getTime() : new Date(cert.expiryDate as unknown as string).getTime();
    const daysLeft = Math.ceil((expiryTime - now) / (24 * 60 * 60 * 1000));

    if (daysLeft <= 0) {
      if (!cert.notifiedAt.expired) {
        await doc.ref.update({
          status: 'expired',
          'notifiedAt.expired': new Date(),
        });
        const phone = await getUserPhone(cert.userId);
        if (phone) {
          alerts.push({ userId: cert.userId, phoneNumber: phone, type: cert.type, label: cert.label, daysLeft: 0 });
        }
      }
      continue;
    }

    let shouldNotify = false;

    if (daysLeft <= 7 && !cert.notifiedAt.sevenDays) {
      shouldNotify = true;
      await doc.ref.update({ 'notifiedAt.sevenDays': new Date() });
    } else if (daysLeft <= 14 && !cert.notifiedAt.fourteenDays) {
      shouldNotify = true;
      await doc.ref.update({ 'notifiedAt.fourteenDays': new Date() });
    } else if (daysLeft <= 30 && !cert.notifiedAt.thirtyDays) {
      shouldNotify = true;
      await doc.ref.update({ 'notifiedAt.thirtyDays': new Date() });
    }

    if (shouldNotify) {
      const phone = await getUserPhone(cert.userId);
      if (phone) {
        alerts.push({ userId: cert.userId, phoneNumber: phone, type: cert.type, label: cert.label, daysLeft });
      }
    }
  }

  return { alerts };
}

export async function sendComplianceAlerts(): Promise<{ sent: number }> {
  const { alerts } = await checkExpiringCertificates();
  let sent = 0;

  for (const alert of alerts) {
    const title = alert.daysLeft <= 0
      ? `*EXPIRED:* ${alert.label}`
      : `*Expiring in ${alert.daysLeft} day${alert.daysLeft === 1 ? '' : 's'}*`;

    const message = [
      `*Compliance Alert — Radbit*`,
      '',
      `${title}`,
      `Type: ${alert.type.replace(/_/g, ' ').toUpperCase()}`,
      '',
      alert.daysLeft <= 0
        ? `Your ${alert.label} has expired. Renew immediately to avoid penalties.`
        : `Your ${alert.label} expires in ${alert.daysLeft} days. Renew now to stay compliant.`,
      '',
      `_Reply RENEW to get renewal assistance_`,
      `_Radbit Compliance Tracker_`,
    ].join('\n');

    try {
      await enqueueOutboundMessage(
        alert.userId,
        alert.phoneNumber,
        'assessment_results_ready',
        { message },
        0,
      );
      sent++;
    } catch (err) {
      console.error(`[ComplianceAlert] Failed for ${alert.userId}:`, err);
    }
  }

  return { sent };
}

async function getUserPhone(userId: string): Promise<string | null> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const data = userDoc.data();
    const phone = data?.phoneNumber || data?.whatsappNumber || null;
    return phone ? String(phone) : null;
  } catch {
    return null;
  }
}

import { adminDb } from '@/lib/firebase/firebase-admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'ZIMRAFiscal' });

const FDG_BASE_URL = process.env.ZIMRA_FDG_API_URL || 'https://fdg.zimra.co.zw/api/v1';

interface FiscalDeviceRegistration {
  taxpayerId: string;
  deviceId: string;
  deviceType: 'software' | 'hardware' | 'virtual';
  status: 'registered' | 'pending' | 'suspended' | 'revoked';
  registeredAt: string;
  certificateExpiry: string;
  lastFiscalDay: string | null;
}

interface FiscalDayReceipt {
  receiptId: string;
  deviceId: string;
  receiptNumber: string;
  receiptDate: string;
  totalAmount: number;
  currency: 'USD' | 'ZiG';
  vatAmount: number;
  status: 'submitted' | 'pending' | 'failed';
}

const FISCAL_COMPLIANCE_COLLECTION = 'fiscal_compliance';

const FISCAL_THRESHOLDS = {
  vatRegistrationTurnoverUsd: 40000,
  fiscalDeviceMandatoryTurnoverUsd: 40000,
  quarterlyFilingTurnoverUsd: 200000,
  penaltyLateSubmissionUsd: 200,
  penaltyNonComplianceUsd: 500,
};

export function getFiscalThresholds() {
  return FISCAL_THRESHOLDS;
}

export function isFiscalDeviceRequired(annualRevenueUsd: number): boolean {
  return annualRevenueUsd >= FISCAL_THRESHOLDS.fiscalDeviceMandatoryTurnoverUsd;
}

export function isVatRegistered(annualRevenueUsd: number): boolean {
  return annualRevenueUsd >= FISCAL_THRESHOLDS.vatRegistrationTurnoverUsd;
}

export async function registerFiscalDevice(
  userId: string,
  deviceType: FiscalDeviceRegistration['deviceType'],
): Promise<{ success: boolean; deviceId?: string; error?: string }> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const taxpayerId = userDoc.data()?.zimraTaxpayerId;
    if (!taxpayerId) {
      return { success: false, error: 'ZIMRA taxpayer ID not found. Complete tax registration first.' };
    }

    const existing = await adminDb.collection(FISCAL_COMPLIANCE_COLLECTION)
      .where('taxpayerId', '==', taxpayerId)
      .where('status', 'in', ['registered', 'pending'])
      .limit(1)
      .get();

    if (!existing.empty) {
      return { success: false, error: 'A fiscal device is already registered for this taxpayer.' };
    }

    const deviceId = `FD-${taxpayerId}-${Date.now().toString(36).toUpperCase()}`;

    await adminDb.collection(FISCAL_COMPLIANCE_COLLECTION).doc(deviceId).set({
      userId,
      taxpayerId,
      deviceId,
      deviceType,
      status: 'pending',
      registeredAt: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    log.info({ userId, deviceId, deviceType }, 'Fiscal device registration initiated');
    return { success: true, deviceId };
  } catch (err) {
    log.error({ err, userId }, 'Fiscal device registration failed');
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

export async function getFiscalComplianceStatus(userId: string) {
  try {
    const snap = await adminDb.collection(FISCAL_COMPLIANCE_COLLECTION)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (snap.empty) {
      return { status: 'not_registered', requirements: FISCAL_THRESHOLDS };
    }

    const data = snap.docs[0].data() as FiscalDeviceRegistration;
    return {
      status: data.status,
      deviceId: data.deviceId,
      deviceType: data.deviceType,
      registeredAt: data.registeredAt,
      certificateExpiry: data.certificateExpiry,
      lastFiscalDay: data.lastFiscalDay,
      requirements: FISCAL_THRESHOLDS,
    };
  } catch {
    return { status: 'error', requirements: FISCAL_THRESHOLDS };
  }
}

export async function submitFiscalReceipt(
  userId: string,
  receipt: Omit<FiscalDayReceipt, 'receiptId' | 'status'>,
): Promise<{ success: boolean; receiptId?: string; error?: string }> {
  try {
    const compliance = await getFiscalComplianceStatus(userId);
    if (compliance.status !== 'registered' && compliance.status !== 'pending') {
      return { success: false, error: 'No active fiscal device registered. Register first.' };
    }

    const receiptId = `RCP-${Date.now().toString(36).toUpperCase()}`;

    await adminDb.collection(`${FISCAL_COMPLIANCE_COLLECTION}/${compliance.deviceId}/receipts`).doc(receiptId).set({
      ...receipt,
      receiptId,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    });

    log.info({ userId, receiptId, amount: receipt.totalAmount }, 'Fiscal receipt submitted');
    return { success: true, receiptId };
  } catch (err) {
    log.error({ err, userId }, 'Fiscal receipt submission failed');
    return { success: false, error: 'Failed to submit receipt.' };
  }
}

export function getFiscalComplianceGuide(): string[] {
  return [
    'VAT-registered businesses (turnover > US$40,000) must use a ZIMRA-approved fiscal device or fiscalised software.',
    'All receipts and invoices must be submitted to ZIMRA through the Fiscal Device Gateway (FDG) in real-time.',
    'Fiscal days must be opened at the start of trading and closed at the end — all receipts are batched within a fiscal day.',
    'Offline mode is supported: receipts are queued locally and synced when the fiscal device reconnects to the FDG.',
    'Failure to fiscalise receipts carries penalties of up to US$500 per violation plus back-tax assessment.',
    'Software-based fiscal solutions are permitted — Radbit can integrate with the FDG API for automated receipt submission.',
    'Receipt data must include: taxpayer ID, device ID, receipt number, date/time, line items, VAT amount, total, and a digital signature.',
    'Fiscal device certificates must be renewed annually through the ZIMRA online portal.',
    'The FDG API supports: verifyTaxpayerInformation, registerDevice, issueCertificate, submitReceipt, openDay, closeDay, and submitFile (bulk).',
    'Non-VAT-registered businesses below the threshold should voluntarily register if they supply to VAT-registered customers who need compliant invoices.',
  ];
}

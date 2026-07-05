import { adminDb } from '@/lib/firebase/firebase-admin';
import { logger } from '@/lib/logger';
import { registerCertificate } from './compliance-tracker';
import crypto from 'crypto';

const log = logger.child({ module: 'ZIMRAFiscal' });

const FISCAL_COMPLIANCE_COLLECTION = 'fiscal_compliance';
const RECEIPT_TYPES = ['FISCALINVOICE', 'CREDITNOTE', 'DEBITNOTE'] as const;
const FISCAL_COUNTER_TYPES = ['SaleByTax', 'SaleTaxByTax', 'CreditNoteByTax', 'DebitNoteByTax', 'BalanceByMoneyType', 'SaleByCounterType', 'ReceiptQuantityByReceiptType', 'ReceiptQuantityCancelledByReceiptType'] as const;
type ReceiptType = typeof RECEIPT_TYPES[number];
type FiscalCounterType = typeof FISCAL_COUNTER_TYPES[number];
type DeviceOperatingMode = 'online' | 'offline';
type FiscalDayStatus = 'Open' | 'Closed';
type ReconciliationMode = 'AUTO' | 'MANUAL';

interface TaxLine {
  taxID: number;
  taxCode?: string;
  taxPercent?: number;
  taxAmountCents: number;
  salesAmountWithTaxCents: number;
}

interface FiscalDayCounter {
  counterType: FiscalCounterType;
  currency: string;
  taxPercentOrMoneyType?: string;
  valueCents: number;
}

interface FiscalDeviceRegistration {
  userId: string;
  taxpayerId: string;
  deviceId: string;
  deviceType: 'software' | 'hardware' | 'virtual';
  status: 'registered' | 'pending' | 'suspended' | 'revoked';
  registeredAt: string;
  certificateExpiry: string | null;
  lastFiscalDay: string | null;
  receiptGlobalNo: number;
  fiscalDayNo: number;
  fiscalDayOpen: boolean;
  fiscalDayOpenAt: string | null;
  operatingMode: DeviceOperatingMode;
  privateKeyEncrypted?: string;
  certificatePem?: string;
  csrPem?: string;
}

interface FiscalDayRecord {
  deviceId: string;
  fiscalDayNo: number;
  status: FiscalDayStatus;
  openedAt: string;
  closedAt: string | null;
  reconciliationMode: ReconciliationMode | null;
  fiscalDayDeviceSignature: string | null;
  fiscalDayServerSignature: string | null;
  counters: FiscalDayCounter[];
}

interface SubmittedReceipt {
  receiptId: string;
  deviceId: string;
  receiptType: ReceiptType;
  receiptCurrency: string;
  receiptGlobalNo: number;
  receiptDate: string;
  serverDate: string | null;
  receiptTotalCents: number;
  taxLines: TaxLine[];
  receiptDeviceSignature: string;
  receiptServerSignature: string | null;
  receiptHash: string;
  previousReceiptHash: string | null;
  receiptQrCode: string | null;
  submissionMode: DeviceOperatingMode;
  status: 'submitted' | 'pending' | 'failed';
  fiscalDayNo: number;
}

const FISCAL_THRESHOLDS = {
  vatRegistrationTurnoverUsd: 40000,
  fiscalDeviceMandatoryTurnoverUsd: 40000,
  quarterlyFilingTurnoverUsd: 200000,
  penaltyLateSubmissionUsd: 200,
  penaltyNonComplianceUsd: 500,
};

const FDMS_BASE_URL = 'https://invoice.zimra.co.zw';
const DEVICE_SERIAL_PREFIX = 'ZIMRA-SN0001';

/* ============================================================
   PUBLIC HELPERS
   ============================================================ */

export function getFiscalThresholds() {
  return FISCAL_THRESHOLDS;
}

export function isFiscalDeviceRequired(annualRevenueUsd: number): boolean {
  return annualRevenueUsd >= FISCAL_THRESHOLDS.fiscalDeviceMandatoryTurnoverUsd;
}

export function isVatRegistered(annualRevenueUsd: number): boolean {
  return annualRevenueUsd >= FISCAL_THRESHOLDS.vatRegistrationTurnoverUsd;
}

export function getFiscalComplianceGuide(): string[] {
  return [
    'VAT-registered businesses (turnover > US$40,000) must use a ZIMRA-approved fiscal device or fiscalised software.',
    'All receipts and invoices must be submitted to ZIMRA through the Fiscal Device Gateway (FDG) in real-time.',
    'Fiscal days must be opened at the start of trading and closed at the end — all receipts are batched within a fiscal day.',
    'Offline mode is supported: receipts are queued locally and synced when the fiscal device reconnects to the FDG.',
    'Failure to fiscalise receipts carries penalties of up to US$500 per violation plus back-tax assessment.',
    'Software-based fiscal solutions are permitted — Radbit can integrate with the FDG API for automated receipt submission.',
    'Fiscal device certificates must be renewed annually through the ZIMRA online portal.',
    'The FDG API supports: verifyTaxpayerInformation, registerDevice, issueCertificate, submitReceipt, openDay, closeDay, and submitFile (bulk).',
    'Non-VAT-registered businesses below the threshold should voluntarily register if they supply to VAT-registered customers who need compliant invoices.',
  ];
}

/* ============================================================
   KEY MANAGEMENT (ECC P-256)
   ============================================================ */

function generateKeyPair(): { publicKeyPem: string; privateKeyPem: string } {
  const kp = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256', publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
  return { publicKeyPem: kp.publicKey as unknown as string, privateKeyPem: kp.privateKey as unknown as string };
}

function generateCsrPlaceholder(deviceId: string): string {
  const cn = `${DEVICE_SERIAL_PREFIX}-${String(deviceId).padStart(10, '0')}`;
  return `-----BEGIN CERTIFICATE REQUEST-----\nMIHVMH4CAQAwHjEcMBoGA1UEAwwT${Buffer.from(cn).toString('base64')}\n-----END CERTIFICATE REQUEST-----\n`;
}

/* ============================================================
   RECEIPT HASH & SIGNATURE (FDG v7.2 §13.2.1)
   ============================================================ */

function cents(value: number): number {
  return Math.round(value * 100);
}

function receiptTaxesString(taxLines: TaxLine[]): string {
  const sorted = [...taxLines].sort((a, b) => {
    if ((a.taxID || 0) !== (b.taxID || 0)) return (a.taxID || 0) - (b.taxID || 0);
    return (a.taxCode || '').localeCompare(b.taxCode || '');
  });
  return sorted.map(t => {
    const code = t.taxCode || '';
    const pct = t.taxPercent !== undefined ? `${t.taxPercent % 1 === 0 ? t.taxPercent.toFixed(2) : t.taxPercent.toFixed(2)}` : '';
    return `${code}${pct}${t.taxAmountCents}${t.salesAmountWithTaxCents}`;
  }).join('');
}

function buildReceiptHashInput(
  deviceID: number,
  receiptType: ReceiptType,
  receiptCurrency: string,
  receiptGlobalNo: number,
  receiptDate: string,
  receiptTotalCents: number,
  taxLines: TaxLine[],
  previousReceiptHash: string | null,
): string {
  let input = `${deviceID}${receiptType}${receiptCurrency.toUpperCase()}${receiptGlobalNo}${receiptDate}${receiptTotalCents}${receiptTaxesString(taxLines)}`;
  if (previousReceiptHash) input += previousReceiptHash;
  return input;
}

function computeReceiptHash(deviceID: number, receiptType: ReceiptType, receiptCurrency: string, receiptGlobalNo: number, receiptDate: string, receiptTotalCents: number, taxLines: TaxLine[], previousReceiptHash: string | null): string {
  const input = buildReceiptHashInput(deviceID, receiptType, receiptCurrency, receiptGlobalNo, receiptDate, receiptTotalCents, taxLines, previousReceiptHash);
  return crypto.createHash('sha256').update(input, 'utf-8').digest('base64');
}

function signReceipt(privateKeyPem: string, deviceID: number, receiptType: ReceiptType, receiptCurrency: string, receiptGlobalNo: number, receiptDate: string, receiptTotalCents: number, taxLines: TaxLine[], previousReceiptHash: string | null): string {
  const input = buildReceiptHashInput(deviceID, receiptType, receiptCurrency, receiptGlobalNo, receiptDate, receiptTotalCents, taxLines, previousReceiptHash);
  const sign = crypto.createSign('sha256');
  sign.update(input, 'utf-8');
  return sign.sign(crypto.createPrivateKey(privateKeyPem), 'base64');
}

/* ============================================================
   FISCAL DAY HASH & SIGNATURE (FDG v7.2 §13.3.1)
   ============================================================ */

function fiscalDayCountersString(counters: FiscalDayCounter[]): string {
  const sorted = [...counters].sort((a, b) => {
    if (a.counterType !== b.counterType) return a.counterType.localeCompare(b.counterType);
    if (a.currency !== b.currency) return a.currency.localeCompare(b.currency);
    return (a.taxPercentOrMoneyType || '').localeCompare(b.taxPercentOrMoneyType || '');
  });
  return sorted.map(c => `${c.counterType.toUpperCase()}${c.currency.toUpperCase()}${c.taxPercentOrMoneyType || ''}${c.valueCents}`).join('');
}

function signFiscalDay(privateKeyPem: string, deviceID: number, fiscalDayNo: number, fiscalDayDate: string, counters: FiscalDayCounter[]): string {
  const input = `${deviceID}${fiscalDayNo}${fiscalDayDate}${fiscalDayCountersString(counters)}`;
  const sign = crypto.createSign('sha256');
  sign.update(input, 'utf-8');
  return sign.sign(crypto.createPrivateKey(privateKeyPem), 'base64');
}

/* ============================================================
   QR CODE (FDG v7.2 §11)
   ============================================================ */

function generateQrCode(deviceID: number, receiptDate: string, receiptGlobalNo: number, receiptDeviceSignature: string): string {
  const deviceIdPadded = String(deviceID).padStart(10, '0');
  const d = new Date(receiptDate);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const datePadded = `${dd}${mm}${yyyy}`;
  const globalNoPadded = String(receiptGlobalNo).padStart(10, '0');
  const md5Hash = crypto.createHash('md5').update(receiptDeviceSignature, 'utf-8').digest('hex').toUpperCase();
  const qrData = md5Hash.slice(0, 16);
  return `${FDMS_BASE_URL}/${deviceIdPadded}${datePadded}${globalNoPadded}${qrData}`;
}

/* ============================================================
   FDMS MOCK — simulates ZIMRA FDG API responses
   ============================================================ */

async function fdmsMock(method: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  switch (method) {
    case 'verifyTaxpayerInformation': {
      return { valid: true, taxpayerName: 'Registered Business', tin: payload.tin || '', vatNumber: payload.vatNumber || '' };
    }
    case 'registerDevice': {
      return { deviceID: payload.deviceID || Math.floor(Math.random() * 9000) + 1000, status: 'Active' };
    }
    case 'issueCertificate': {
      return { certificate: `-----BEGIN CERTIFICATE-----\nMIIB9TCCAV2gAwIBAgIU...\n-----END CERTIFICATE-----`, validFrom: new Date().toISOString(), validTo: new Date(Date.now() + 365 * 86400000).toISOString() };
    }
    case 'openDay': {
      return { fiscalDayNo: payload.fiscalDayNo, status: 'Open' };
    }
    case 'submitReceipt': {
      const receiptID = Math.floor(Math.random() * 100000);
      const serverSignature = crypto.createHash('sha256').update(`${payload.receiptDeviceSignature}${receiptID}${new Date().toISOString()}`, 'utf-8').digest('base64');
      return { receiptID, serverDate: new Date().toISOString(), receiptServerSignature: serverSignature, status: 'Accepted' };
    }
    case 'submitFile': {
      return { fileID: `F-${Date.now().toString(36).toUpperCase()}`, status: 'Processing' };
    }
    case 'getFileStatus': {
      return { status: 'Processed', acceptedCount: payload.acceptedCount || 0, rejectedCount: 0 };
    }
    case 'closeDay': {
      return { status: 'Closed', reconciliationMode: 'AUTO', fiscalDayServerSignature: crypto.randomBytes(32).toString('base64') };
    }
    case 'getStatus': {
      return { status: 'Active', fiscalDayStatus: payload.fiscalDayStatus || 'Closed' };
    }
    case 'ping': {
      return { status: 'OK', serverTime: new Date().toISOString() };
    }
    default:
      return { error: 'Unknown method' };
  }
}

/* ============================================================
   DEVICE REGISTRATION
   ============================================================ */

export async function registerFiscalDevice(
  userId: string,
  deviceType: FiscalDeviceRegistration['deviceType'],
  operatingMode: DeviceOperatingMode = 'online',
): Promise<{ success: boolean; deviceId?: string; privateKey?: string; certificate?: string; error?: string }> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const taxpayerId = userDoc.data()?.zimraTaxpayerId;
    if (!taxpayerId) {
      return { success: false, error: 'ZIMRA taxpayer ID not found. Complete tax registration first.' };
    }

    const existing = await adminDb.collection(FISCAL_COMPLIANCE_COLLECTION)
      .where('userId', '==', userId)
      .where('status', 'in', ['registered', 'pending'])
      .limit(1).get();
    if (!existing.empty) {
      return { success: false, error: 'A fiscal device is already registered for this taxpayer.' };
    }

    const { privateKeyPem } = generateKeyPair();

    const deviceIdNumeric = Math.floor(Math.random() * 9000) + 1000;
    const deviceId = `FDG-${deviceIdNumeric}`;

    const csrPem = generateCsrPlaceholder(String(deviceIdNumeric));

    await fdmsMock('registerDevice', { deviceID: deviceIdNumeric, taxpayerId, deviceType });
    const certResult = await fdmsMock('issueCertificate', { csr: csrPem, deviceID: deviceIdNumeric });

    const certificatePem = certResult.certificate as string;
    const expiryDate = certResult.validTo as string || new Date(Date.now() + 365 * 86400000).toISOString();

    await adminDb.collection(FISCAL_COMPLIANCE_COLLECTION).doc(deviceId).set({
      userId,
      taxpayerId,
      deviceId,
      deviceType,
      status: 'registered',
      registeredAt: new Date().toISOString(),
      certificateExpiry: expiryDate,
      lastFiscalDay: null,
      receiptGlobalNo: 0,
      fiscalDayNo: 0,
      fiscalDayOpen: false,
      fiscalDayOpenAt: null,
      operatingMode,
      privateKeyEncrypted: privateKeyPem,
      certificatePem,
      csrPem,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await registerCertificate(userId, 'zimra_fiscal_device', 'ZIMRA Fiscal Device', expiryDate).catch(() => {});
    await adminDb.collection('users').doc(userId).update({ fiscalDeviceRegistered: true, updatedAt: new Date() }).catch(() => {});

    log.info({ userId, deviceId, deviceType }, 'Fiscal device registered with keypair');
    return { success: true, deviceId, privateKey: privateKeyPem, certificate: certificatePem };
  } catch (err) {
    log.error({ err, userId }, 'Fiscal device registration failed');
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

/* ============================================================
   COMPLIANCE STATUS
   ============================================================ */

export async function getFiscalComplianceStatus(userId: string) {
  try {
    const snap = await adminDb.collection(FISCAL_COMPLIANCE_COLLECTION)
      .where('userId', '==', userId).limit(1).get();
    if (snap.empty) return { status: 'not_registered', requirements: FISCAL_THRESHOLDS };
    const data = snap.docs[0].data() as FiscalDeviceRegistration;
    return {
      status: data.status,
      deviceId: data.deviceId,
      deviceType: data.deviceType,
      registeredAt: data.registeredAt,
      certificateExpiry: data.certificateExpiry,
      lastFiscalDay: data.lastFiscalDay,
      fiscalDayOpen: data.fiscalDayOpen,
      operatingMode: data.operatingMode,
      receiptGlobalNo: data.receiptGlobalNo,
      fiscalDayNo: data.fiscalDayNo,
      requirements: FISCAL_THRESHOLDS,
    };
  } catch {
    return { status: 'error', requirements: FISCAL_THRESHOLDS };
  }
}

/* ============================================================
   FISCAL DAY OPERATIONS
   ============================================================ */

export async function openFiscalDay(userId: string): Promise<{ success: boolean; fiscalDayNo?: number; error?: string }> {
  try {
    const snap = await adminDb.collection(FISCAL_COMPLIANCE_COLLECTION)
      .where('userId', '==', userId).limit(1).get();
    if (snap.empty) return { success: false, error: 'No fiscal device registered.' };
    const deviceRef = snap.docs[0].ref;
    const data = snap.docs[0].data() as FiscalDeviceRegistration;
    if (data.fiscalDayOpen) return { success: false, error: 'Fiscal day already open.' };

    const fiscalDayNo = (data.fiscalDayNo || 0) + 1;
    const openedAt = new Date().toISOString();

    await fdmsMock('openDay', { fiscalDayNo, deviceID: data.deviceId });

    await deviceRef.update({ fiscalDayOpen: true, fiscalDayOpenAt: openedAt, fiscalDayNo, receiptGlobalNo: data.receiptGlobalNo || 0, updatedAt: new Date() });

    await adminDb.collection(`${FISCAL_COMPLIANCE_COLLECTION}/${data.deviceId}/fiscal_days`).doc(String(fiscalDayNo)).set({
      deviceId: data.deviceId,
      fiscalDayNo,
      status: 'Open',
      openedAt,
      closedAt: null,
      reconciliationMode: null,
      fiscalDayDeviceSignature: null,
      fiscalDayServerSignature: null,
      counters: [],
    });

    log.info({ userId, deviceId: data.deviceId, fiscalDayNo }, 'Fiscal day opened');
    return { success: true, fiscalDayNo };
  } catch (err) {
    log.error({ err, userId }, 'openFiscalDay failed');
    return { success: false, error: 'Failed to open fiscal day.' };
  }
}

export async function closeFiscalDay(userId: string): Promise<{ success: boolean; zReport?: Record<string, unknown>; error?: string }> {
  try {
    const snap = await adminDb.collection(FISCAL_COMPLIANCE_COLLECTION)
      .where('userId', '==', userId).limit(1).get();
    if (snap.empty) return { success: false, error: 'No fiscal device registered.' };
    const deviceRef = snap.docs[0].ref;
    const data = snap.docs[0].data() as FiscalDeviceRegistration;
    if (!data.fiscalDayOpen) return { success: false, error: 'No fiscal day open.' };
    if (!data.privateKeyEncrypted) return { success: false, error: 'Device private key not available.' };

    const fiscalDayDoc = await adminDb.collection(`${FISCAL_COMPLIANCE_COLLECTION}/${data.deviceId}/fiscal_days`).doc(String(data.fiscalDayNo)).get();
    if (!fiscalDayDoc.exists) return { success: false, error: 'Fiscal day record not found.' };

    const dayData = fiscalDayDoc.data() as FiscalDayRecord;
    const closedAt = new Date().toISOString();
    const fiscalDayDate = data.fiscalDayOpenAt?.slice(0, 10) || new Date().toISOString().slice(0, 10);
    const deviceIDNum = parseInt(data.deviceId.replace('FDG-', '')) || 0;

    const deviceSignature = signFiscalDay(data.privateKeyEncrypted, deviceIDNum, data.fiscalDayNo, fiscalDayDate, dayData.counters || []);

    const closeResult = await fdmsMock('closeDay', { deviceID: deviceIDNum, fiscalDayNo: data.fiscalDayNo, fiscalDayDeviceSignature: deviceSignature });

    const serverSignature = closeResult.fiscalDayServerSignature as string || null;

    await deviceRef.update({
      fiscalDayOpen: false,
      lastFiscalDay: closedAt,
      updatedAt: new Date(),
    });

    await fiscalDayDoc.ref.update({
      status: 'Closed',
      closedAt,
      reconciliationMode: 'AUTO',
      fiscalDayDeviceSignature: deviceSignature,
      fiscalDayServerSignature: serverSignature,
    });

    const zReport = {
      deviceId: data.deviceId,
      fiscalDayNo: data.fiscalDayNo,
      fiscalDayDate,
      openedAt: data.fiscalDayOpenAt,
      closedAt,
      deviceSignature,
      serverSignature,
      counters: dayData.counters,
      deviceSerialNo: `${DEVICE_SERIAL_PREFIX}-${String(deviceIDNum).padStart(10, '0')}`,
    };

    log.info({ userId, deviceId: data.deviceId, fiscalDayNo: data.fiscalDayNo }, 'Fiscal day closed');
    return { success: true, zReport };
  } catch (err) {
    log.error({ err, userId }, 'closeFiscalDay failed');
    return { success: false, error: 'Failed to close fiscal day.' };
  }
}

/* ============================================================
   RECEIPT SUBMISSION
   ============================================================ */

export async function submitFiscalReceipt(
  userId: string,
  params: {
    receiptType?: ReceiptType;
    currency?: string;
    totalAmount: number;
    vatAmount?: number;
    description?: string;
    taxLines?: TaxLine[];
    submissionMode?: DeviceOperatingMode;
  },
): Promise<{
  success: boolean; receiptId?: string; receiptNumber?: string; receiptQrCode?: string;
  receiptHash?: string; receiptDeviceSignature?: string; receiptServerSignature?: string;
  error?: string;
}> {
  try {
    const snap = await adminDb.collection(FISCAL_COMPLIANCE_COLLECTION)
      .where('userId', '==', userId).limit(1).get();
    if (snap.empty) return { success: false, error: 'No active fiscal device registered.' };
    const deviceRef = snap.docs[0].ref;
    const data = snap.docs[0].data() as FiscalDeviceRegistration;
    if (!data.fiscalDayOpen) return { success: false, error: 'Fiscal day not open. Use openFiscalDay first.' };
    if (!data.privateKeyEncrypted) return { success: false, error: 'Device private key not available.' };

    const receiptType = params.receiptType || 'FISCALINVOICE';
    const currency = (params.currency || 'USD').toUpperCase();
    const submissionMode = params.submissionMode || data.operatingMode || 'online';

    const totalCents = cents(params.totalAmount);
    const vatCents = params.vatAmount !== undefined ? cents(params.vatAmount) : cents(params.totalAmount * 0.15);

    const taxLines: TaxLine[] = params.taxLines || [
      { taxID: 1, taxCode: 'VAT', taxPercent: 15, taxAmountCents: vatCents, salesAmountWithTaxCents: totalCents },
    ];

    const nextGlobalNo = (data.receiptGlobalNo || 0) + 1;
    const receiptDate = new Date().toISOString().slice(0, 19);
    const deviceIDNum = parseInt(data.deviceId.replace('FDG-', '')) || 0;

    const fiscalDayDoc = await adminDb.collection(`${FISCAL_COMPLIANCE_COLLECTION}/${data.deviceId}/fiscal_days`).doc(String(data.fiscalDayNo)).get();
    const dayData = fiscalDayDoc.data() as FiscalDayRecord | undefined;

    const receiptsCol = adminDb.collection(`${FISCAL_COMPLIANCE_COLLECTION}/${data.deviceId}/receipts`);
    const lastReceiptSnap = await receiptsCol.orderBy('receiptGlobalNo', 'desc').limit(1).get();
    const lastReceiptHash = lastReceiptSnap.empty ? null : (lastReceiptSnap.docs[0].data() as SubmittedReceipt).receiptHash;

    const receiptHash = computeReceiptHash(deviceIDNum, receiptType, currency, nextGlobalNo, receiptDate, totalCents, taxLines, lastReceiptHash);
    const deviceSignature = signReceipt(data.privateKeyEncrypted, deviceIDNum, receiptType, currency, nextGlobalNo, receiptDate, totalCents, taxLines, lastReceiptHash);

    let serverSignature: string | null = null;
    let serverDate: string | null = null;

    if (submissionMode === 'online') {
      const submitResult = await fdmsMock('submitReceipt', {
        receiptDeviceSignature: deviceSignature, receiptHash, deviceID: deviceIDNum,
        receiptGlobalNo: nextGlobalNo, receiptDate, receiptTotalCents: totalCents, receiptType, currency,
      });
      serverSignature = (submitResult.receiptServerSignature as string) || null;
      serverDate = (submitResult.serverDate as string) || null;
    }

    const receiptQrCode = generateQrCode(deviceIDNum, receiptDate, nextGlobalNo, deviceSignature);
    const receiptId = `RCP-${Date.now().toString(36).toUpperCase()}`;
    const receiptNumber = `FDG-${data.deviceId}-${String(nextGlobalNo).padStart(8, '0')}`;

    await receiptsCol.doc(receiptId).set({
      receiptId, deviceId: data.deviceId, receiptType, receiptCurrency: currency,
      receiptGlobalNo: nextGlobalNo, receiptDate, serverDate, receiptTotalCents: totalCents,
      taxLines, receiptDeviceSignature: deviceSignature, receiptServerSignature: serverSignature,
      receiptHash, previousReceiptHash: lastReceiptHash, receiptQrCode,
      submissionMode, status: submissionMode === 'online' ? 'submitted' : 'pending',
      fiscalDayNo: data.fiscalDayNo, createdAt: new Date(),
    });

    await deviceRef.update({ receiptGlobalNo: nextGlobalNo, updatedAt: new Date() });

    const counters = dayData?.counters || [];
    updateCounters(counters, receiptType, currency, totalCents, vatCents);
    await adminDb.collection(`${FISCAL_COMPLIANCE_COLLECTION}/${data.deviceId}/fiscal_days`).doc(String(data.fiscalDayNo)).update({ counters });

    log.info({ userId, receiptId, receiptNumber, amount: params.totalAmount, mode: submissionMode }, 'Fiscal receipt submitted');
    return { success: true, receiptId, receiptNumber, receiptQrCode, receiptHash, receiptDeviceSignature: deviceSignature, receiptServerSignature: serverSignature || undefined };
  } catch (err) {
    log.error({ err, userId }, 'Fiscal receipt submission failed');
    return { success: false, error: 'Failed to submit receipt.' };
  }
}

function updateCounters(counters: FiscalDayCounter[], receiptType: ReceiptType, currency: string, totalCents: number, vatCents: number): void {
  const upsert = (ct: FiscalCounterType, curr: string, tp: string | undefined, val: number) => {
    const existing = counters.find(c => c.counterType === ct && c.currency === curr && c.taxPercentOrMoneyType === tp);
    if (existing) { existing.valueCents += val; } else { counters.push({ counterType: ct, currency: curr, taxPercentOrMoneyType: tp, valueCents: val }); }
  };
  upsert('SaleByTax', currency, '15.00', totalCents);
  upsert('SaleTaxByTax', currency, '15.00', vatCents);
  if (receiptType === 'CREDITNOTE') {
    upsert('CreditNoteByTax', currency, '15.00', -totalCents);
  } else if (receiptType === 'DEBITNOTE') {
    upsert('DebitNoteByTax', currency, '15.00', totalCents);
  }
  upsert('ReceiptQuantityByReceiptType', currency, receiptType, 1);
}

/* ============================================================
   BATCH SUBMISSION (Offline mode — §4.8)
   ============================================================ */

export async function submitOfflineFile(userId: string): Promise<{ success: boolean; fileID?: string; acceptedCount?: number; error?: string }> {
  try {
    const snap = await adminDb.collection(FISCAL_COMPLIANCE_COLLECTION)
      .where('userId', '==', userId).limit(1).get();
    if (snap.empty) return { success: false, error: 'No fiscal device registered.' };
    const data = snap.docs[0].data() as FiscalDeviceRegistration;

    const pendingSnap = await adminDb.collection(`${FISCAL_COMPLIANCE_COLLECTION}/${data.deviceId}/receipts`)
      .where('status', '==', 'pending').get();
    if (pendingSnap.empty) return { success: false, error: 'No pending receipts to submit.' };

    const pendingReceipts = pendingSnap.docs.map(d => d.data() as SubmittedReceipt);
    const batchPayload = pendingReceipts.map(r => ({
      deviceID: parseInt(data.deviceId.replace('FDG-', '')),
      receiptType: r.receiptType,
      currency: r.receiptCurrency,
      receiptGlobalNo: r.receiptGlobalNo,
      receiptDate: r.receiptDate,
      receiptTotalCents: r.receiptTotalCents,
      taxLines: r.taxLines,
      receiptDeviceSignature: r.receiptDeviceSignature,
      receiptHash: r.receiptHash,
      previousReceiptHash: r.previousReceiptHash,
    }));

    const fileResult = await fdmsMock('submitFile', { receipts: batchPayload });
    const fileID = fileResult.fileID as string;
    const acceptedCount = pendingReceipts.length;

    const batch = adminDb.batch();
    for (const doc of pendingSnap.docs) {
      batch.update(doc.ref, { status: 'submitted' });
    }
    await batch.commit();

    const fileStatusResult = await fdmsMock('getFileStatus', { fileID, acceptedCount });
    log.info({ userId, deviceId: data.deviceId, fileID, acceptedCount }, 'Offline receipts submitted');
    return { success: true, fileID, acceptedCount: fileStatusResult.acceptedCount as number || acceptedCount };
  } catch (err) {
    log.error({ err, userId }, 'submitOfflineFile failed');
    return { success: false, error: 'Failed to submit offline file.' };
  }
}

/* ============================================================
   RECEIPT LISTING
   ============================================================ */

export async function listFiscalReceipts(userId: string, limitCount = 20): Promise<SubmittedReceipt[]> {
  try {
    const snap = await adminDb.collection(FISCAL_COMPLIANCE_COLLECTION)
      .where('userId', '==', userId).limit(1).get();
    if (snap.empty) return [];
    const data = snap.docs[0].data() as FiscalDeviceRegistration;
    const receiptsSnap = await adminDb.collection(`${FISCAL_COMPLIANCE_COLLECTION}/${data.deviceId}/receipts`)
      .orderBy('createdAt', 'desc').limit(limitCount).get();
    return receiptsSnap.docs.map(d => d.data() as SubmittedReceipt);
  } catch {
    return [];
  }
}

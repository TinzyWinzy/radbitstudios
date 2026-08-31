type DeviceType = 'software' | 'hardware' | 'virtual';
type DeviceOperatingMode = 'online' | 'offline';
type ReceiptType = 'FISCALINVOICE' | 'CREDITNOTE' | 'DEBITNOTE';

interface TaxLine {
  taxID: number;
  taxCode?: string;
  taxPercent?: number;
  taxAmountCents: number;
  salesAmountWithTaxCents: number;
}

interface SubmittedReceipt {
  receiptId: string;
  receiptType: ReceiptType;
  receiptCurrency: string;
  receiptTotalCents: number;
  status: 'submitted' | 'pending' | 'failed';
}

const FISCAL_THRESHOLDS = {
  vatRegistrationTurnoverUsd: 25000,
  fiscalDeviceMandatoryTurnoverUsd: 25000,
  quarterlyFilingTurnoverUsd: 200000,
  penaltyLateSubmissionUsd: 200,
  penaltyNonComplianceUsd: 500,
};

const UNAVAILABLE = 'Radbit does not register fiscal devices, submit fiscal data, or issue official fiscal receipts.';

/** Reference values only. Users must verify current requirements directly with ZIMRA. */
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
    'Radbit provides general record-keeping information only and does not determine tax or fiscalisation status.',
    'Confirm current registration, fiscalisation, filing, device, and receipt requirements directly with ZIMRA or a qualified tax professional.',
    'Do not treat a Radbit record, checklist, or status label as a ZIMRA certificate, approval, registration, filing, or receipt.',
  ];
}

export async function registerFiscalDevice(
  _userId: string,
  _deviceType: DeviceType,
  _operatingMode: DeviceOperatingMode = 'online',
): Promise<{ success: boolean; deviceId?: string; privateKey?: string; certificate?: string; error?: string }> {
  return { success: false, error: UNAVAILABLE };
}

export async function getFiscalComplianceStatus(_userId: string) {
  return { status: 'unavailable', requirements: FISCAL_THRESHOLDS, notice: UNAVAILABLE };
}

export async function openFiscalDay(
  _userId: string,
): Promise<{ success: boolean; fiscalDayNo?: number; error?: string }> {
  return { success: false, error: UNAVAILABLE };
}

export async function closeFiscalDay(
  _userId: string,
): Promise<{ success: boolean; zReport?: Record<string, unknown>; error?: string }> {
  return { success: false, error: UNAVAILABLE };
}

export async function submitFiscalReceipt(
  _userId: string,
  _params: {
    receiptType?: ReceiptType;
    currency?: string;
    totalAmount: number;
    vatAmount?: number;
    description?: string;
    taxLines?: TaxLine[];
    submissionMode?: DeviceOperatingMode;
  },
): Promise<{
  success: boolean;
  receiptId?: string;
  receiptNumber?: string;
  receiptQrCode?: string;
  receiptHash?: string;
  receiptDeviceSignature?: string;
  receiptServerSignature?: string;
  error?: string;
}> {
  return { success: false, error: UNAVAILABLE };
}

export async function submitOfflineFile(
  _userId: string,
): Promise<{ success: boolean; fileID?: string; acceptedCount?: number; error?: string }> {
  return { success: false, error: UNAVAILABLE };
}

export async function listFiscalReceipts(
  _userId: string,
  _limitCount = 20,
): Promise<SubmittedReceipt[]> {
  return [];
}

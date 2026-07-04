import { adminDb } from '@/lib/firebase/firebase-admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'ZiGCurrency' });

const ZIG_COLLECTION = 'zig_rates';

interface ZiGRateInfo {
  rate: number;
  source: string;
  effectiveDate: string;
  publishedAt: string;
}

interface ZiGTaxObligation {
  originalCurrency: 'ZWL' | 'ZiG' | 'USD';
  originalAmount: number;
  convertedAmount: number;
  conversionRate: number;
  convertedCurrency: 'ZiG' | 'USD';
  notes: string;
}

const PAYE_TAX_TABLES_URL = 'https://www.zimra.co.zw/domestic-taxes/tax-tables?download=3877:zig-tax-tables-5-april-to-31-december-2024';

const ZIG_FAQ: { question: string; answer: string }[] = [
  {
    question: 'Can I pay tax obligations in ZiG?',
    answer: 'Yes. ZIMRA has transitioned from ZWL to ZiG. All ZWL tax obligations and liabilities have been converted to ZiG at the prevailing rate. Payments for these obligations must be made in ZiG. You can transact on all ZIMRA online platforms using ZiG.',
  },
  {
    question: 'How does the currency change affect my tax refunds and credits?',
    answer: 'Tax refunds and credits owed to taxpayers who previously paid taxes in ZWL will be recalculated and paid back in ZiG using the conversion rate issued by the Reserve Bank of Zimbabwe.',
  },
  {
    question: 'Can businesses use USD alongside ZiG for tax transactions?',
    answer: 'Yes. Taxes are to be paid in the currency of the transaction. If your transaction was in USD, pay tax in USD. If in ZiG, pay tax in ZiG. ZIMRA accepts both currencies.',
  },
  {
    question: 'What ZiG PAYE tax tables are available?',
    answer: `ZiG PAYE tax tables have been published by ZIMRA. Access them at: ${PAYE_TAX_TABLES_URL}`,
  },
  {
    question: 'How do I report ZiG balances in my tax filings (ITF12C)?',
    answer: 'ZIMRA has published guidelines for reporting ZiG balances and their conversion in tax filings. All returns for current and prior tax periods must be submitted in ZiG and USD. All tax liabilities and refunds on returns received prior to 5 April 2024 have been converted to ZiG.',
  },
  {
    question: 'How will customs duties be affected by ZiG?',
    answer: 'Customs procedures remain unchanged. Rates of duty remain the same — only the currency has been converted to ZiG using the RBZ conversion rate.',
  },
  {
    question: 'Where can I get the current ZiG exchange rate for tax purposes?',
    answer: 'The Reserve Bank of Zimbabwe publishes the official ZiG exchange rate. ZIMRA uses this rate for all tax conversions. Check the RBZ website or your bank for the current rate. ZIMRA also publishes Public Notices 28, 29, 31, and 35 with rate guidance.',
  },
];

export function getZiGFaq() {
  return ZIG_FAQ;
}

export function getPayeTaxTablesUrl() {
  return PAYE_TAX_TABLES_URL;
}

export async function getLatestZiGRate(): Promise<ZiGRateInfo | null> {
  try {
    const snap = await adminDb.collection(ZIG_COLLECTION)
      .orderBy('publishedAt', 'desc')
      .limit(1)
      .get();

    if (snap.empty) return null;
    return snap.docs[0].data() as ZiGRateInfo;
  } catch {
    return null;
  }
}

export async function updateZiGRate(rate: number, source: string): Promise<void> {
  try {
    await adminDb.collection(ZIG_COLLECTION).add({
      rate,
      source,
      effectiveDate: new Date().toISOString().split('T')[0],
      publishedAt: new Date().toISOString(),
    });
    log.info({ rate, source }, 'ZiG rate updated');
  } catch (err) {
    log.error({ err, rate }, 'Failed to update ZiG rate');
  }
}

export function convertTaxObligation(
  amount: number,
  fromCurrency: 'ZWL' | 'ZiG' | 'USD',
  toCurrency: 'ZiG' | 'USD',
  rate: number,
): ZiGTaxObligation {
  if (fromCurrency === toCurrency) {
    return {
      originalCurrency: fromCurrency,
      originalAmount: amount,
      convertedAmount: amount,
      conversionRate: 1,
      convertedCurrency: toCurrency,
      notes: 'No conversion needed — same currency.',
    };
  }

  const convertedAmount = fromCurrency === 'USD'
    ? amount * rate
    : amount / rate;

  return {
    originalCurrency: fromCurrency,
    originalAmount: amount,
    convertedAmount: Math.round(convertedAmount * 100) / 100,
    conversionRate: rate,
    convertedCurrency: toCurrency,
    notes: fromCurrency === 'ZWL'
      ? 'ZWL obligations were converted to ZiG at the official RBZ rate. ZIMRA handles this automatically.'
      : fromCurrency === 'USD'
        ? 'USD amounts converted to ZiG using the prevailing RBZ rate. Verify with ZIMRA Public Notices 28-35.'
        : 'Conversion applied at official rate.',
  };
}

export function getZiGTransactionGuidance(): string {
  return [
    'ZIMRA transitioned all ZWL tax obligations to ZiG effective 5 April 2024.',
    'Tax can be paid in the currency of the underlying transaction (USD or ZiG).',
    'All ZIMRA online platforms accept ZiG payments for tax obligations.',
    'ZiG PAYE tax tables are published and accessible on the ZIMRA website.',
    'Tax refunds from ZWL payments are recalculated and repaid in ZiG.',
    'Customs duty rates remain unchanged; only the currency denomination changed to ZiG.',
    'Businesses should maintain accurate records of transactions in both currencies.',
    'Public Notices 28, 29, 31, and 35 contain detailed ZiG transition guidance from ZIMRA.',
    'Independent oversight may verify the accuracy of ZWL-to-ZiG conversions for transparency.',
    'For disputes on conversion amounts, contact ZIMRA through their official support channels.',
  ].join('\n');
}

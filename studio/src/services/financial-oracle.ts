import { adminDb } from '@/lib/firebase/firebase-admin';
import { getExchangeRates } from './exchange-rate-scraper';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'FinancialOracle' });

export type Currency = 'USD' | 'ZiG' | 'ZAR' | 'BWP' | 'ZMW';
export type TransactionType = 'credit' | 'debit' | 'transfer' | 'fee' | 'interest';
export type TransactionCategory =
  | 'revenue' | 'cost_of_goods' | 'salary' | 'rent' | 'utilities'
  | 'transport' | 'marketing' | 'professional_fees' | 'tax' | 'loan_repayment'
  | 'interest_income' | 'other_income' | 'other_expense' | 'fee';

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  category: TransactionCategory;
  balanceAfter?: number;
  metadata?: Record<string, string>;
}

export interface BankStatement {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  currency: Currency;
  statementPeriod: { from: string; to: string };
  transactions: ParsedTransaction[];
  openingBalance: number;
  closingBalance: number;
  uploadedAt: string;
  rawText: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  averageMonthlyRevenue: number;
  averageMonthlyExpenses: number;
  revenueTrend: 'rising' | 'stable' | 'declining';
  expenseTrend: 'rising' | 'stable' | 'declining';
}

export interface CashFlowForecast {
  currentBalance: number;
  projectedInflow: number;
  projectedOutflow: number;
  netProjected: number;
  weeksUntilDepletion: number | null;
  lowPointDate: string | null;
  lowPointAmount: number | null;
  confidence: 'high' | 'medium' | 'low';
}

export interface FxExposure {
  currency: Currency;
  balance: number;
  usdEquivalent: number;
  shareOfTotal: number;
}

export interface FinancialHealthScore {
  overallScore: number;
  profitabilityScore: number;
  liquidityScore: number;
  stabilityScore: number;
  growthScore: number;
  details: string;
}

const BANK_FORMATS: Record<string, { patterns: RegExp[]; currency: Currency }> = {
  cabs: {
    patterns: [
      /CABS/i, /Central African Building Society/i,
    ],
    currency: 'USD',
  },
  stanbic: {
    patterns: [/Stanbic/i],
    currency: 'USD',
  },
  cbz: {
    patterns: [/CBZ/i, /Commercial Bank of Zimbabwe/i],
    currency: 'USD',
  },
  fbc: {
    patterns: [/FBC/i, /FBC Bank/i],
    currency: 'USD',
  },
  nmb: {
    patterns: [/NMB/i, /NMB Bank/i],
    currency: 'USD',
  },
  fcb: {
    patterns: [/FCB/i, /First Capital Bank/i],
    currency: 'USD',
  },
};

function detectBank(text: string): { bankName: string; currency: Currency } | null {
  for (const [name, config] of Object.entries(BANK_FORMATS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(text)) {
        return { bankName: name, currency: config.currency };
      }
    }
  }
  return null;
}

function extractAccountInfo(text: string): { accountNumber: string; accountHolder: string } {
  const numberMatch = text.match(/account\s*(?:no|number|#|nr)[.:]?\s*([\d\s-]{5,20})/i);
  const holderMatch = text.match(/(?:account\s*holder|name|prepared\s*for)[.:]?\s*(.+)/i);
  return {
    accountNumber: numberMatch ? numberMatch[1].trim() : 'Unknown',
    accountHolder: holderMatch ? holderMatch[1].trim() : 'Unknown',
  };
}

function extractStatementPeriod(text: string): { from: string; to: string } {
  const periodMatch = text.match(/(?:period|statement\s*(?:period|date)|from)[.:]?\s*(.+?)(?:to|\-|–)(.+)/i);
  if (periodMatch) {
    return {
      from: periodMatch[1].trim(),
      to: periodMatch[2].trim(),
    };
  }
  return { from: 'Unknown', to: 'Unknown' };
}

function parseBalanceLine(text: string): number | null {
  const match = text.match(/(?:opening|closing)\s*balance[.:]?\s*([\d,]+\.?\d*)/i);
  if (match) return parseFloat(match[1].replace(/,/g, ''));
  return null;
}

const DATE_PATTERNS = [
  /\b(\d{2}\s+[A-Za-z]{3}\s+\d{4})\b/g,
  /\b(\d{2}\/\d{2}\/\d{4})\b/g,
  /\b(\d{2}-\d{2}-\d{4})\b/g,
  /\b(\d{4}-\d{2}-\d{2})\b/g,
];

const TRANSACTION_LINE_PATTERNS = [
  /(\d{2}\s+[A-Za-z]{3}\s+\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s*([\d,]+\.\d{2})?/,
  /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s*([\d,]+\.\d{2})?/,
  /(\d{2}-\d{2}-\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s*([\d,]+\.\d{2})?/,
];

const CATEGORY_KEYWORDS: Array<{ pattern: RegExp; category: TransactionCategory; type: TransactionType }> = [
  { pattern: /sale|invoice|payment received|deposit|customer|revenue/i, category: 'revenue', type: 'credit' },
  { pattern: /salary|wage|payroll|staff/i, category: 'salary', type: 'debit' },
  { pattern: /rent|lease/i, category: 'rent', type: 'debit' },
  { pattern: /electricity|water|rates|utility/i, category: 'utilities', type: 'debit' },
  { pattern: /fuel|transport|delivery/i, category: 'transport', type: 'debit' },
  { pattern: /advert|marketing|promotion/i, category: 'marketing', type: 'debit' },
  { pattern: /legal|audit|consultant|professional/i, category: 'professional_fees', type: 'debit' },
  { pattern: /tax|zimra|vat/i, category: 'tax', type: 'debit' },
  { pattern: /loan|repayment|finance/i, category: 'loan_repayment', type: 'debit' },
  { pattern: /interest/i, category: 'interest_income', type: 'credit' },
  { pattern: /fee|charge|commission/i, category: 'fee', type: 'debit' },
  { pattern: /stock|inventory|purchase|supplier/i, category: 'cost_of_goods', type: 'debit' },
  { pattern: /transfer/i, category: 'other_income', type: 'transfer' },
];

function classifyTransaction(description: string): { category: TransactionCategory; type: TransactionType } {
  for (const rule of CATEGORY_KEYWORDS) {
    if (rule.pattern.test(description)) {
      return { category: rule.category, type: rule.type };
    }
  }
  return { category: 'other_expense', type: 'debit' };
}

function parseDate(dateStr: string): string {
  for (const pattern of DATE_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(dateStr)) return dateStr;
  }
  return dateStr;
}

function parseTransactions(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    for (const txPattern of TRANSACTION_LINE_PATTERNS) {
      const match = trimmed.match(txPattern);
      if (match) {
        const date = parseDate(match[1]);
        const description = match[2].trim();
        const val1 = parseFloat(match[3].replace(/,/g, ''));
        const val2 = parseFloat(match[4].replace(/,/g, ''));
        const val3 = match[5] ? parseFloat(match[5].replace(/,/g, '')) : null;

        let debit = 0;
        let credit = 0;
        let balanceAfter: number | undefined;

        if (val3 !== null && val3 > 0) {
          balanceAfter = val3;
          if (val1 > 0 && val2 > 0) {
            credit = val1;
            debit = val2;
          } else if (val1 > 0) {
            debit = val1;
            credit = val2 > 0 ? val2 : 0;
          }
        } else {
          if (val1 > 0 && val2 > 0) {
            credit = Math.min(val1, val2);
            debit = Math.max(val1, val2);
          } else if (val1 > 0) {
            credit = val1;
          }
        }

        const amount = credit > 0 ? credit : debit;
        const type: TransactionType = credit > 0 && debit === 0 ? 'credit' : debit > 0 && credit === 0 ? 'debit' : 'transfer';

        const { category } = classifyTransaction(description);

        transactions.push({
          date,
          description,
          amount,
          currency: 'USD',
          type,
          category,
          balanceAfter,
        });
        break;
      }
    }
  }

  return transactions;
}

function calculateFinancialSummary(transactions: ParsedTransaction[]): FinancialSummary {
  const revenueByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};
  let totalRevenue = 0;
  let totalExpenses = 0;

  for (const tx of transactions) {
    if (tx.type === 'credit' || (tx.type === 'transfer' && tx.category === 'other_income')) {
      totalRevenue += tx.amount;
      revenueByCategory[tx.category] = (revenueByCategory[tx.category] || 0) + tx.amount;
    } else if (tx.type === 'debit') {
      totalExpenses += tx.amount;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    }
  }

  const months = Math.max(1, Math.ceil(transactions.length / 30));

  const firstHalf = transactions.slice(0, Math.ceil(transactions.length / 2));
  const secondHalf = transactions.slice(Math.ceil(transactions.length / 2));
  const firstRevenue = firstHalf.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const secondRevenue = secondHalf.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const firstExpense = firstHalf.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const secondExpense = secondHalf.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  const revenueTrend: 'rising' | 'stable' | 'declining' = secondRevenue > firstRevenue * 1.1 ? 'rising' : secondRevenue < firstRevenue * 0.9 ? 'declining' : 'stable';
  const expenseTrend: 'rising' | 'stable' | 'declining' = secondExpense > firstExpense * 1.1 ? 'rising' : secondExpense < firstExpense * 0.9 ? 'declining' : 'stable';

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netProfit: Math.round((totalRevenue - totalExpenses) * 100) / 100,
    revenueByCategory,
    expenseByCategory,
    averageMonthlyRevenue: Math.round((totalRevenue / months) * 100) / 100,
    averageMonthlyExpenses: Math.round((totalExpenses / months) * 100) / 100,
    revenueTrend,
    expenseTrend,
  };
}

function calculateCashFlowForecast(transactions: ParsedTransaction[], currentBalance: number): CashFlowForecast {
  const recentDebits = transactions.filter(t => t.type === 'debit').slice(-30);
  const recentCredits = transactions.filter(t => t.type === 'credit').slice(-30);

  const avgDailyOutflow = recentDebits.length > 0
    ? recentDebits.reduce((s, t) => s + t.amount, 0) / Math.max(1, recentDebits.length)
    : 0;
  const avgDailyInflow = recentCredits.length > 0
    ? recentCredits.reduce((s, t) => s + t.amount, 0) / Math.max(1, recentCredits.length)
    : 0;

  const projectedInflow = Math.round(avgDailyInflow * 30 * 100) / 100;
  const projectedOutflow = Math.round(avgDailyOutflow * 30 * 100) / 100;
  const netProjected = Math.round((projectedInflow - projectedOutflow) * 100) / 100;

  let weeksUntilDepletion: number | null = null;
  let lowPointDate: string | null = null;
  let lowPointAmount: number | null = null;

  if (avgDailyOutflow > avgDailyInflow && currentBalance > 0) {
    const netDailyBurn = avgDailyOutflow - avgDailyInflow;
    const daysUntilDepletion = currentBalance / netDailyBurn;
    weeksUntilDepletion = Math.round(daysUntilDepletion / 7 * 10) / 10;
    lowPointDate = new Date(Date.now() + daysUntilDepletion * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    lowPointAmount = 0;
  } else if (currentBalance <= 0) {
    lowPointAmount = currentBalance;
    lowPointDate = new Date().toISOString().split('T')[0];
    weeksUntilDepletion = 0;
  }

  const confidence: 'high' | 'medium' | 'low' = transactions.length >= 60 ? 'high' : transactions.length >= 20 ? 'medium' : 'low';

  return {
    currentBalance: Math.round(currentBalance * 100) / 100,
    projectedInflow,
    projectedOutflow,
    netProjected,
    weeksUntilDepletion,
    lowPointDate,
    lowPointAmount,
    confidence,
  };
}

function calculateFxExposure(
  balances: { currency: Currency; balance: number }[],
  rates: { officialZiGPerUSD: number },
): FxExposure[] {
  const totalUsd = balances.reduce((sum, b) => {
    let usdValue = b.balance;
    if (b.currency === 'ZiG') usdValue = b.balance / rates.officialZiGPerUSD;
    if (b.currency === 'ZAR') usdValue = b.balance * 0.055;
    if (b.currency === 'BWP') usdValue = b.balance * 0.075;
    if (b.currency === 'ZMW') usdValue = b.balance * 0.038;
    return sum + usdValue;
  }, 0);

  return balances.map(b => {
    let usdEquivalent = b.balance;
    if (b.currency === 'ZiG') usdEquivalent = Math.round((b.balance / rates.officialZiGPerUSD) * 100) / 100;
    if (b.currency === 'ZAR') usdEquivalent = Math.round(b.balance * 0.055 * 100) / 100;
    if (b.currency === 'BWP') usdEquivalent = Math.round(b.balance * 0.075 * 100) / 100;
    if (b.currency === 'ZMW') usdEquivalent = Math.round(b.balance * 0.038 * 100) / 100;

    return {
      currency: b.currency,
      balance: b.balance,
      usdEquivalent,
      shareOfTotal: totalUsd > 0 ? Math.round((usdEquivalent / totalUsd) * 10000) / 100 : 0,
    };
  });
}

function calculateFinancialHealth(summary: FinancialSummary, cashFlow: CashFlowForecast): FinancialHealthScore {
  const profitabilityScore = summary.totalRevenue > 0
    ? Math.min(100, Math.round((summary.netProfit / summary.totalRevenue) * 100 * 2 + 50))
    : 0;

  const liquidityScore = cashFlow.weeksUntilDepletion === null ? 100 :
    cashFlow.weeksUntilDepletion > 12 ? 90 :
    cashFlow.weeksUntilDepletion > 8 ? 75 :
    cashFlow.weeksUntilDepletion > 4 ? 50 :
    cashFlow.weeksUntilDepletion > 2 ? 25 : 10;

  const revenueGrowth = summary.revenueTrend === 'rising' ? 90 : summary.revenueTrend === 'stable' ? 60 : 30;
  const expenseControl = summary.expenseTrend === 'declining' ? 90 : summary.expenseTrend === 'stable' ? 60 : 30;

  const avgMonthly = summary.averageMonthlyRevenue;
  const scaleScore = avgMonthly > 50000 ? 100 : avgMonthly > 20000 ? 80 : avgMonthly > 10000 ? 60 : avgMonthly > 5000 ? 40 : 20;

  const growthScore = Math.round((revenueGrowth + expenseControl + scaleScore) / 3);
  const stabilityScore = Math.round((liquidityScore + (summary.revenueTrend === 'stable' ? 80 : 50)) / 2);

  const details = [
    `Profit margin: ${summary.totalRevenue > 0 ? Math.round(summary.netProfit / summary.totalRevenue * 100) : 0}%`,
    `Revenue trend: ${summary.revenueTrend}`,
    `Liquidity: ${cashFlow.weeksUntilDepletion !== null ? `${cashFlow.weeksUntilDepletion} weeks until depletion` : 'Positive cash flow'}`,
  ].join(' | ');

  const overallScore = Math.round((
    profitabilityScore * 0.30 +
    liquidityScore * 0.25 +
    stabilityScore * 0.25 +
    growthScore * 0.20
  ));

  return {
    overallScore,
    profitabilityScore,
    liquidityScore,
    stabilityScore,
    growthScore,
    details,
  };
}

export async function parseAndStoreStatement(
  userId: string,
  pdfBuffer: Buffer,
  _fileName: string,
): Promise<{ statement: BankStatement; financialHealth: FinancialHealthScore }> {
  const { PDFParse } = await import('pdf-parse');
  const pdf = new PDFParse({ data: pdfBuffer });
  const result = await pdf.getText();
  const text = result.text;

  const bankInfo = detectBank(text);
  const accountInfo = extractAccountInfo(text);
  const period = extractStatementPeriod(text);
  const openingBalance = parseBalanceLine(text);
  const closingBalance = parseBalanceLine(text);

  const transactions = parseTransactions(text);

  const statementId = `stmt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const statement: BankStatement = {
    id: statementId,
    userId,
    bankName: bankInfo?.bankName || 'Unknown',
    accountNumber: accountInfo.accountNumber,
    accountHolder: accountInfo.accountHolder,
    currency: bankInfo?.currency || 'USD',
    statementPeriod: period,
    transactions,
    openingBalance: openingBalance || 0,
    closingBalance: closingBalance || 0,
    uploadedAt: new Date().toISOString(),
    rawText: text,
  };

  const lastBalance = transactions.length > 0 && transactions[transactions.length - 1].balanceAfter
    ? transactions[transactions.length - 1].balanceAfter!
    : closingBalance || 0;

  const summary = calculateFinancialSummary(transactions);
  const cashFlow = calculateCashFlowForecast(transactions, lastBalance);
  const financialHealth = calculateFinancialHealth(summary, cashFlow);

  try {
    await adminDb.collection('financial_oracle').doc(userId).collection('statements').doc(statementId).set({
      ...statement,
      rawText: text.slice(0, 50000),
      uploadedAt: new Date(),
    });

    if (transactions.length > 0) {
      const batch = adminDb.batch();
      const txCollection = adminDb.collection('financial_oracle').doc(userId).collection('transactions');
      for (const tx of transactions.slice(0, 500)) {
        const txRef = txCollection.doc();
        batch.set(txRef, { ...tx, statementId, uploadedAt: new Date() });
      }
      await batch.commit();
    }

    await adminDb.collection('financial_oracle').doc(userId).collection('summary').doc('latest').set({
      summary,
      cashFlow,
      financialHealth,
      statementCount: 1,
      lastUpdated: new Date().toISOString(),
      updatedAt: new Date(),
    }, { merge: true });
  } catch (err) {
    log.error({ err, userId }, 'Failed to persist financial oracle data');
  }

  return { statement, financialHealth };
}

export async function getFinancialHealth(userId: string): Promise<FinancialHealthScore | null> {
  try {
    const doc = await adminDb.collection('financial_oracle').doc(userId).collection('summary').doc('latest').get();
    if (!doc.exists) return null;
    const data = doc.data();
    return data?.financialHealth || null;
  } catch {
    return null;
  }
}

export async function getFinancialSummary(userId: string): Promise<{
  summary: FinancialSummary | null;
  cashFlow: CashFlowForecast | null;
  fxExposure: FxExposure[] | null;
  financialHealth: FinancialHealthScore | null;
  statementCount: number;
}> {
  try {
    const doc = await adminDb.collection('financial_oracle').doc(userId).collection('summary').doc('latest').get();
    if (!doc.exists) {
      return { summary: null, cashFlow: null, fxExposure: null, financialHealth: null, statementCount: 0 };
    }
    const data = doc.data()!;

    const rates = await getExchangeRates();
    const fxExposure = calculateFxExposure([
      { currency: 'USD', balance: data.cashFlow?.currentBalance || 0 },
    ], rates);

    return {
      summary: data.summary || null,
      cashFlow: data.cashFlow || null,
      fxExposure,
      financialHealth: data.financialHealth || null,
      statementCount: data.statementCount || 0,
    };
  } catch {
    return { summary: null, cashFlow: null, fxExposure: null, financialHealth: null, statementCount: 0 };
  }
}

export { calculateFinancialSummary, calculateCashFlowForecast, calculateFxExposure, calculateFinancialHealth, detectBank, parseTransactions };

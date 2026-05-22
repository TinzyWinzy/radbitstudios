export const PRAZ_FEES = {
  micro: { usd: 50, zig: 1304, label: 'Micro Enterprise (ME)' },
  sme: { usd: 60, zig: 1564.80, label: 'Small / Medium Enterprise (SME)' },
  other: { usd: 75, zig: 1956, label: 'NMSME (Other Entity)' },
} as const;

export type PrazTier = keyof typeof PRAZ_FEES;

export const CONSULTANT_COST_USD = 145;
export const CONSULTANT_COST_RANGE = '$140 – $150';

export function classifyPrazTier(
  annualRevenueUsd: number,
  staffCount: number,
  totalAssetsUsd: number,
): PrazTier {
  if (annualRevenueUsd <= 50000 && staffCount <= 5 && totalAssetsUsd <= 10000) {
    return 'micro';
  }
  if (annualRevenueUsd <= 500000 && staffCount <= 50 && totalAssetsUsd <= 100000) {
    return 'sme';
  }
  return 'other';
}

export function getPrazFee(tier: PrazTier) {
  return PRAZ_FEES[tier];
}

export function formatPrazSavings(tier: PrazTier): { savedUsd: number; message: string } {
  const fee = PRAZ_FEES[tier];
  const savedUsd = CONSULTANT_COST_USD - fee.usd;
  return {
    savedUsd,
    message: `Save up to $${savedUsd} by bypassing manual consultants (typically $${CONSULTANT_COST_USD})`,
  };
}

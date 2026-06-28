import type { PartnerTier } from '@/types/partner';

export interface TierConfig {
  tier: PartnerTier;
  label: string;
  minClients: number;
  maxClients: number;
  rate: number;
  color: string;
  perks: string[];
}

export const TIERS: TierConfig[] = [
  {
    tier: 'scout',
    label: 'Scout',
    minClients: 0,
    maxClients: 5,
    rate: 0.10,
    color: 'slate',
    perks: [
      '10% commission on all referrals',
      'Referral link & dashboard',
      'Monthly payouts',
      'Email support',
    ],
  },
  {
    tier: 'builder',
    label: 'Builder',
    minClients: 6,
    maxClients: 20,
    rate: 0.15,
    color: 'amber',
    perks: [
      '15% commission on all referrals',
      'Everything in Scout',
      'Priority email support',
      'Quarterly performance review',
    ],
  },
  {
    tier: 'alliance',
    label: 'Alliance',
    minClients: 21,
    maxClients: Infinity,
    rate: 0.20,
    color: 'purple',
    perks: [
      '20% commission on all referrals',
      'Everything in Builder',
      'Dedicated account manager',
      'Early access to new features',
      'Co-branded marketing materials',
    ],
  },
];

export function computeTier(clientCount: number): { tier: PartnerTier; config: TierConfig } {
  for (const t of TIERS) {
    if (clientCount >= t.minClients && clientCount <= t.maxClients) {
      return { tier: t.tier, config: t };
    }
  }
  return { tier: 'scout', config: TIERS[0] };
}

export function getNextTier(currentTier: PartnerTier): TierConfig | null {
  const idx = TIERS.findIndex(t => t.tier === currentTier);
  if (idx < 0 || idx >= TIERS.length - 1) return null;
  return TIERS[idx + 1];
}

export function getTierByClientCount(clientCount: number): TierConfig {
  return computeTier(clientCount).config;
}

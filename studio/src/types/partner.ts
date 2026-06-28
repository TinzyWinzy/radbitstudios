export type PartnerTier = 'scout' | 'builder' | 'alliance';
export type PartnerStatus = 'active' | 'suspended';

export interface Partner {
  id?: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  partnerType?: string;
  bio?: string;
  referralCode: string;
  tier: PartnerTier;
  commissionRate: number;
  totalEarned: number;
  totalPaid: number;
  clientCount: number;
  status: PartnerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ReferralStatus = 'clicked' | 'signed' | 'trial' | 'paid' | 'expired';

export interface Referral {
  id?: string;
  partnerId: string;
  refCode: string;
  clientId?: string;
  landingPage: string;
  device?: string;
  clickedAt: Date;
  attributedAt?: Date;
  status: ReferralStatus;
  expiresAt: Date;
}

export type CommissionStatus = 'pending' | 'approved' | 'paid';

export interface Commission {
  id?: string;
  partnerId: string;
  clientId: string;
  subscriptionId?: string;
  amount: number;
  rate: number;
  planName: string;
  billingPeriod: string;
  status: CommissionStatus;
  createdAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
}

export type PayoutStatus = 'pending' | 'processing' | 'sent' | 'failed';

export interface Payout {
  id?: string;
  partnerId: string;
  amount: number;
  commissionIds: string[];
  method: 'ecocash' | 'bank' | 'crypto';
  recipient?: string;
  currency?: string;
  reference?: string;
  providerRef?: string;
  status: PayoutStatus;
  requestedAt: Date;
  processedAt?: Date;
  notes?: string;
}

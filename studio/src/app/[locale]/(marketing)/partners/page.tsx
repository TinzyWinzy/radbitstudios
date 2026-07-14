import { Metadata } from 'next';
import PartnerSignupPage from './page-client';

export const metadata: Metadata = {
  title: 'Partner Programme — Radbit',
  description: 'Earn commission by referring SMEs to Radbit. Join Zimbabwe\'s digital business referral network.',
  alternates: { canonical: '/partners' },
};

export default function Page() {
  return <PartnerSignupPage />;
}

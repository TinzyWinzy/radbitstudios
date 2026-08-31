import { createHmac, timingSafeEqual } from 'crypto';

function getSecret(): string | null {
  return process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || null;
}

export function createNewsletterUnsubscribeToken(email: string): string | null {
  const secret = getSecret();
  if (!secret) return null;
  return createHmac('sha256', secret).update(email.trim().toLowerCase()).digest('hex');
}

export function verifyNewsletterUnsubscribeToken(email: string, token: string): boolean {
  const expected = createNewsletterUnsubscribeToken(email);
  if (!expected || !/^[a-f0-9]{64}$/i.test(token)) return false;
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(token, 'hex'));
}

export function newsletterUnsubscribeUrl(email: string): string | null {
  const token = createNewsletterUnsubscribeToken(email);
  if (!token) return null;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://radbitstudios.co.zw';
  return `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

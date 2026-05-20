type ConsentPreferences = import('@/hooks/use-consent').ConsentPreferences;

const CONSENT_COOKIE = 'cookie_consent';

function getConsent(): ConsentPreferences | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=([^;]*)`));
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    return parsed.necessary ? parsed : null;
  } catch {
    return null;
  }
}

export function trackPageView(path: string): void {
  const consent = getConsent();
  if (!consent?.analytics) return;
  navigator.sendBeacon('/api/analytics/track', JSON.stringify({
    event: 'page_view',
    path,
    timestamp: new Date().toISOString(),
    referrer: document.referrer || null,
  }));
}

export function trackEvent(name: string, data?: Record<string, unknown>): void {
  const consent = getConsent();
  if (!consent?.analytics) return;
  navigator.sendBeacon('/api/analytics/track', JSON.stringify({
    event: name,
    ...data,
    timestamp: new Date().toISOString(),
  }));
}

'use client';

import { useState, useEffect, useCallback } from 'react';

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing';

export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

const CONSENT_COOKIE = 'cookie_consent';
const CONSENT_EXPIRY_DAYS = 365;
const CONSENT_VERSION = '2026-08-30';
const CONSENT_CHANGED_EVENT = 'radbit:consent-changed';
export const CONSENT_REVIEW_EVENT = 'radbit:consent-review';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function storeConsent(preferences: ConsentPreferences): void {
  setCookie(
    CONSENT_COOKIE,
    JSON.stringify({
      ...preferences,
      version: CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
    }),
    CONSENT_EXPIRY_DAYS,
  );
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: preferences }));
}

export function requestConsentReview(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CONSENT_REVIEW_EVENT));
}

function parseConsent(raw: string | null): ConsentPreferences | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.necessary === true) {
      return parsed as ConsentPreferences;
    }
    return null;
  } catch {
    return null;
  }
}

const DEFAULT_CONSENT: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function useConsent() {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = parseConsent(getCookie(CONSENT_COOKIE));
    setPreferences(stored);
    setIsLoaded(true);

    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent<ConsentPreferences>;
      setPreferences(customEvent.detail || parseConsent(getCookie(CONSENT_COOKIE)));
    };
    window.addEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
  }, []);

  const acceptAll = useCallback(() => {
    const all: ConsentPreferences = { necessary: true, analytics: true, marketing: true };
    storeConsent(all);
    setPreferences(all);
  }, []);

  const acceptNecessary = useCallback(() => {
    storeConsent(DEFAULT_CONSENT);
    setPreferences(DEFAULT_CONSENT);
  }, []);

  const updatePreferences = useCallback((prefs: Partial<ConsentPreferences>) => {
    const current = preferences || DEFAULT_CONSENT;
    const updated: ConsentPreferences = { ...current, ...prefs, necessary: true };
    storeConsent(updated);
    setPreferences(updated);
  }, [preferences]);

  const showBanner = isLoaded && !preferences;

  return {
    preferences: preferences || DEFAULT_CONSENT,
    isLoaded,
    showBanner,
    acceptAll,
    acceptNecessary,
    updatePreferences,
  };
}

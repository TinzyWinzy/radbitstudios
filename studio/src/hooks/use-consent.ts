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
    setPreferences(stored || DEFAULT_CONSENT);
    setIsLoaded(true);
  }, []);

  const acceptAll = useCallback(() => {
    const all: ConsentPreferences = { necessary: true, analytics: true, marketing: true };
    setCookie(CONSENT_COOKIE, JSON.stringify(all), CONSENT_EXPIRY_DAYS);
    setPreferences(all);
  }, []);

  const acceptNecessary = useCallback(() => {
    setCookie(CONSENT_COOKIE, JSON.stringify(DEFAULT_CONSENT), CONSENT_EXPIRY_DAYS);
    setPreferences(DEFAULT_CONSENT);
  }, []);

  const updatePreferences = useCallback((prefs: Partial<ConsentPreferences>) => {
    const current = preferences || DEFAULT_CONSENT;
    const updated: ConsentPreferences = { ...current, ...prefs, necessary: true };
    setCookie(CONSENT_COOKIE, JSON.stringify(updated), CONSENT_EXPIRY_DAYS);
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

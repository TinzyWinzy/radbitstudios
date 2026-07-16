'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useConsent } from '@/hooks/use-consent';
import { onCLS, onLCP, onINP, onFCP, onTTFB } from 'web-vitals';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function GA4Script() {
  const { preferences, isLoaded } = useConsent();

  if (!GA_ID || !isLoaded || !preferences.analytics) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
            });
          `,
        }}
      />
    </>
  );
}

export function GA4PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== 'function') return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('config', GA_ID, { page_path: url });
  }, [pathname, searchParams]);

  return null;
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

function reportWebVitalsToGA4() {
  if (!GA_ID || typeof window.gtag !== 'function') return;

  const send = (name: string, value: number) => {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: name,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      non_interaction: true,
    });
  };

  onCLS(({ value }) => send('CLS', value));
  onLCP(({ value }) => send('LCP', value));
  onINP(({ value }) => send('INP', value));
  onFCP(({ value }) => send('FCP', value));
  onTTFB(({ value }) => send('TTFB', value));
}

let vitalsInitialized = false;

export function useWebVitals() {
  const { preferences, isLoaded } = useConsent();

  useEffect(() => {
    if (isLoaded && preferences.analytics && !vitalsInitialized) {
      vitalsInitialized = true;
      reportWebVitalsToGA4();
    }
  }, [isLoaded, preferences.analytics]);
}

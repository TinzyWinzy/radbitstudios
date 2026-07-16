'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/services/analytics';
import { GA4PageView, useWebVitals } from '@/components/analytics/ga4';

export function AnalyticsTracker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useWebVitals();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return (
    <>
      <GA4PageView />
      {children}
    </>
  );
}

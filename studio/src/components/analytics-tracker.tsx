'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/services/analytics';
import { GA4PageView } from '@/components/analytics/ga4';

export function AnalyticsTracker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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

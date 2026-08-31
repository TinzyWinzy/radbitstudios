'use client';
import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { useConsent } from '@/hooks/use-consent';

export function AdSenseScript() {
  const { preferences, isLoaded } = useConsent();
  if (!isLoaded || !preferences.marketing) return null;

  return (
    <Script
      id="radbit-adsense"
      async
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8600120936743760"
      crossOrigin="anonymous"
    />
  );
}

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical';
  className?: string;
}

export function AdUnit({ slot, format = 'auto', className }: AdUnitProps) {
  const { preferences, isLoaded } = useConsent();
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loaded.current) {
            loaded.current = true;
            try {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            } catch { console.debug('[AdUnit] adsbygoogle push failed'); }
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!isLoaded || !preferences.marketing) return null;

  return (
    <div ref={containerRef} className={`ad-container ${className || ''}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8600120936743760"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

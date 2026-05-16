"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot?: string;
  className?: string;
}

export function AdBanner({ slot = "blog-banner", className = "" }: AdBannerProps) {
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <div className={`my-8 flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8600120936743760"
        data-ad-slot={slot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
}

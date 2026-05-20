"use client";

import { useEffect, useRef } from "react";

interface InArticleAdProps {
  slot?: string;
}

export function InArticleAd({ slot = "blog-in-article" }: InArticleAdProps) {
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
            } catch {}
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="my-8 flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-client="ca-pub-8600120936743760"
        data-ad-slot={slot}
        data-ad-format="fluid"
      />
    </div>
  );
}

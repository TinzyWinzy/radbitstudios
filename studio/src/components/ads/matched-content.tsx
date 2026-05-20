"use client";

import { useEffect, useRef } from "react";

interface MatchedContentProps {
  slot?: string;
}

export function MatchedContent({ slot = "blog-matched" }: MatchedContentProps) {
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
    <div ref={containerRef} className="my-8">
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: "250px" }}
        data-ad-client="ca-pub-8600120936743760"
        data-ad-slot={slot}
        data-ad-format="autorelaxed"
      />
    </div>
  );
}

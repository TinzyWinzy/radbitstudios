"use client";

import { useEffect, useRef } from "react";

interface MatchedContentProps {
  slot?: string;
}

export function MatchedContent({ slot = "blog-matched" }: MatchedContentProps) {
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <div className="my-8">
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

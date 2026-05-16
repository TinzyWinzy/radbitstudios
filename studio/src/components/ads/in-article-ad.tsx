"use client";

import { useEffect, useRef } from "react";

interface InArticleAdProps {
  slot?: string;
}

export function InArticleAd({ slot = "blog-in-article" }: InArticleAdProps) {
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <div className="my-8 flex justify-center">
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

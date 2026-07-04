"use client";

import { usePathname } from "next/navigation";

const SITE_URL = (process.env.NEXT_PUBLIC_FRONTEND_URL || "https://radbitstudios.co.zw").replace(/\/$/, "");

export function SEOLinks() {
  const pathname = usePathname();
  const canonical = `${SITE_URL}${pathname}`;

  return (
    <link rel="canonical" href={canonical} />
  );
}

"use client";

import { usePathname } from "next/navigation";

const SITE_URL = (process.env.NEXT_PUBLIC_FRONTEND_URL || "https://radbitstudios.co.zw").replace(/\/$/, "");
const LOCALES = ["en", "sn", "nd", "pt"];

export function SEOLinks() {
  const pathname = usePathname();
  const canonical = `${SITE_URL}${pathname}`;

  return (
    <>
      <link rel="canonical" href={canonical} />
      <link rel="alternate" href={canonical} hrefLang="x-default" />
      {LOCALES.map((locale) => (
        <link key={locale} rel="alternate" href={canonical} hrefLang={locale} />
      ))}
    </>
  );
}

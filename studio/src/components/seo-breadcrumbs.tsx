"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const SITE_URL = (process.env.NEXT_PUBLIC_FRONTEND_URL || "https://radbitstudios.co.zw").replace(/\/$/, "");

const LABEL_OVERRIDES: Record<string, string> = {
  "solutions": "Solutions",
  "use-cases": "Use Cases",
  "resources": "Resources",
  "diaspora-matchmaking": "Diaspora Matchmaking",
  "start-business": "Start a Business",
  "tools": "Tools",
  "vat-calculator": "VAT Calculator",
  "currency-exchange": "Currency Exchange",
  "business-name-generator": "Business Name Generator",
  "guides": "Guides",
  "faq": "FAQ",
  "intelligence": "Intelligence",
  "threats": "Threat Assessments",
  "partners": "Partners",
  "events": "Events",
  "zimbabwe-business-expo-2026": "Zimbabwe Business Expo 2026",
  "techhub-harare": "TechHub Harare",
  "moto-republik": "Moto Republik",
  "impact-hub": "Impact Hub",
  "privacy": "Privacy Policy",
  "terms": "Terms of Service",
  "founders": "Founders",
  "vat-threshold-alerts": "VAT Threshold Alerts",
  "compliant-receipts": "Compliant Receipts",
  "offline-mode": "Offline Mode",
  "penalty-protection": "Penalty Protection",
  "tender-compliance-bridge": "Tender Compliance Bridge",
  "bid-writer": "AI Bid Writer",
  "tax-copilot": "Tax Co-Pilot",
  "praz-compliance": "PRAZ Compliance",
  "escrow": "Escrow Protection",
};

function labelFor(segment: string): string {
  return LABEL_OVERRIDES[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length < 2) return null;

  const items = segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    return { name: labelFor(segment), url: href };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.name,
        item: `${SITE_URL}${item.url}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="container pt-4">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          </li>
          {items.map((item, i) => (
            <li key={item.url} className="flex items-center gap-1.5">
              <ChevronRight className="size-3" />
              {i === items.length - 1 ? (
                <span className="text-foreground/80 font-medium" aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.url} className="hover:text-foreground transition-colors">{item.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

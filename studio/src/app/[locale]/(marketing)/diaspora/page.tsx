import type { Metadata } from "next";
import dynamic from "next/dynamic";

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/\/$/, '');

export const metadata: Metadata = {
  title: "Diaspora Hub — Run Your Zimbabwe Business from Anywhere | Radbit",
  description:
    "Zimbabwean diaspora entrepreneurs: invest in verified SMEs, manage your business remotely, and access AI tools, tender alerts, and local market intelligence — from anywhere in the world.",
  alternates: { canonical: "/diaspora" },
  openGraph: {
    title: "Diaspora Hub — Run Your Zimbabwe Business from Anywhere",
    description:
      "Invest in verified SMEs, manage remotely, and get tender alerts. Built for Zimbabwean diaspora entrepreneurs.",
    type: "website",
    url: `${SITE_URL}/diaspora`,
  },
};

const DiasporaClient = dynamic(
  () => import("./page-client").then((m) => ({ default: m.DiasporaLanding })),
  { ssr: true }
);

export default function DiasporaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Diaspora Hub — Radbit SME Hub",
            description:
              "AI-powered platform for Zimbabwean diaspora entrepreneurs to invest in SMEs, manage businesses remotely, and access tender alerts.",
            url: `${SITE_URL}/diaspora`,
            isPartOf: {
              "@type": "WebSite",
              name: "Radbit SME Hub",
              url: SITE_URL,
            },
          }),
        }}
      />
      <DiasporaClient />
    </>
  );
}

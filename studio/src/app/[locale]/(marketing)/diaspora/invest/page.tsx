import type { Metadata } from "next";
import dynamic from "next/dynamic";

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/\/$/, '');

export const metadata: Metadata = {
  title: "Invest in Zimbabwe from the Diaspora — Verified SMEs | Radbit",
  description:
    "Browse PRAZ-verified Zimbabwean SMEs seeking investment. Filter by sector, readiness score, and revenue. Express interest and get matched — from anywhere in the world.",
  alternates: { canonical: "/diaspora/invest" },
  openGraph: {
    title: "Invest in Zimbabwe from the Diaspora",
    description:
      "Browse verified Zimbabwean SMEs seeking investment. Filter by sector, readiness, and revenue. Built for diaspora investors.",
    type: "website",
    url: `${SITE_URL}/diaspora/invest`,
  },
};

const InvestClient = dynamic(
  () => import("./page-client").then((m) => ({ default: m.InvestPage })),
  { ssr: true }
);

export default function InvestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Invest in Zimbabwe from the Diaspora — Radbit",
            description:
              "Browse PRAZ-verified Zimbabwean SMEs seeking investment. Filter by sector, readiness score, and revenue.",
            url: `${SITE_URL}/diaspora/invest`,
          }),
        }}
      />
      <InvestClient />
    </>
  );
}

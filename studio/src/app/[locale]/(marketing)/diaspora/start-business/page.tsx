import type { Metadata } from "next";
import dynamic from "next/dynamic";

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/\/$/, '');

export const metadata: Metadata = {
  title: "Start a Business in Zimbabwe from the Diaspora | Radbit",
  description:
    "How to start and run a business in Zimbabwe from the UK, South Africa, USA, or Australia. Remote registration, compliance, and AI-powered management tools for diaspora entrepreneurs.",
  alternates: { canonical: "/diaspora/start-business" },
  openGraph: {
    title: "Start a Business in Zimbabwe from the Diaspora",
    description:
      "Remote business registration, compliance, and management tools for Zimbabwean diaspora entrepreneurs.",
    type: "website",
    url: `${SITE_URL}/diaspora/start-business`,
  },
};

const StartBusinessClient = dynamic(
  () => import("./page-client").then((m) => ({ default: m.StartBusinessPage })),
  { ssr: true }
);

export default function StartBusinessPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "How to Start a Business in Zimbabwe from the Diaspora",
            description:
              "A practical guide for Zimbabwean diaspora entrepreneurs: remote registration, compliance, tax, and AI-powered management tools.",
            url: `${SITE_URL}/diaspora/start-business`,
            author: { "@type": "Organization", name: "Radbit" },
          }),
        }}
      />
      <StartBusinessClient />
    </>
  );
}

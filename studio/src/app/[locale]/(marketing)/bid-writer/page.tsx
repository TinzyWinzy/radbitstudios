import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "AI Bid Writer for Zimbabwe Tenders — Radbit",
  description: "Write winning tender bids faster with Radbit's AI Bid Writer. Smart templates, PRAZ auto-compliance, pricing engine, and deadline tracking for Zimbabwean SMEs.",
  alternates: { canonical: "/bid-writer" },
  openGraph: {
    title: "AI Bid Writer for Zimbabwe Tenders — Radbit",
    description: "Write winning tender bids faster with AI. Smart templates, PRAZ compliance, pricing engine for Zimbabwean SMEs.",
    url: `${baseUrl}/bid-writer`,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Bid Writer for Zimbabwe Tenders — Radbit",
    description: "Write winning tender bids faster with AI. Smart templates, PRAZ compliance, pricing engine for Zimbabwean SMEs.",
  },
};

export default function Page() {
  return <PageClient />;
}

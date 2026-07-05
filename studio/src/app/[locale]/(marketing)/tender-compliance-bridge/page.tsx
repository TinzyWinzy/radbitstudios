import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Tender Compliance Bridge — Radbit",
  description: "Bridge compliance with tender readiness. Radbit unifies PRAZ, ZIMRA, NSSA and Tax Clearance certificates into a single compliance dashboard for tender bids.",
  alternates: { canonical: "/tender-compliance-bridge" },
  openGraph: {
    title: "Tender Compliance Bridge — Radbit",
    description: "Bridge compliance with tender readiness. Radbit unifies PRAZ, ZIMRA, NSSA and Tax Clearance certificates into a single compliance dashboard for tender bids.",
    url: `${baseUrl}/tender-compliance-bridge`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tender Compliance Bridge — Radbit",
    description: "Bridge compliance with tender readiness. Radbit unifies PRAZ, ZIMRA, NSSA and Tax Clearance certificates into a single compliance dashboard for tender bids.",
  },
};

export default function Page() {
  return <PageClient />;
}

import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "ZIMRA Penalty Protection — Radbit",
  description: "Avoid ZIMRA fines of up to US$5,000 for fiscal device non-compliance. Radbit automates compliance checks, certificate renewals, and receipt management.",
  alternates: { canonical: "/penalty-protection" },
  openGraph: {
    title: "ZIMRA Penalty Protection — Radbit",
    description: "Avoid ZIMRA fines of up to US$5,000 for fiscal device non-compliance. Radbit automates compliance checks, certificate renewals, and receipt management.",
    url: `${baseUrl}/penalty-protection`,
  },
  twitter: {
    card: "summary_large_image",
    title: "ZIMRA Penalty Protection — Radbit",
    description: "Avoid ZIMRA fines of up to US$5,000 for fiscal device non-compliance. Radbit automates compliance checks, certificate renewals, and receipt management.",
  },
};

export default function Page() {
  return <PageClient />;
}

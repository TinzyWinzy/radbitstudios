import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "PRAZ Compliance for Zimbabwe Tenders — Radbit",
  description: "Stay compliant with PRAZ (Procurement Regulatory Authority of Zimbabwe). Track documents, get readiness scores, expiry alerts, and match with tenders you're qualified to win.",
  alternates: { canonical: "/praz-compliance" },
  openGraph: {
    title: "PRAZ Compliance for Zimbabwe Tenders — Radbit",
    description: "Stay compliant with PRAZ. Track documents, get readiness scores, expiry alerts, and match with qualified tenders.",
    url: `${baseUrl}/praz-compliance`,
  },
  twitter: {
    card: "summary_large_image",
    title: "PRAZ Compliance for Zimbabwe Tenders — Radbit",
    description: "Stay compliant with PRAZ. Track documents, get readiness scores, expiry alerts, and match with qualified tenders.",
  },
};

export default function Page() {
  return <PageClient />;
}

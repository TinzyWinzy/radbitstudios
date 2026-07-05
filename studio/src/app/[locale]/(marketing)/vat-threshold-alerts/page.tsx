import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "ZIMRA VAT Threshold Alerts — Radbit",
  description: "Get real-time alerts when your SME approaches ZIMRA's VAT registration threshold (US$60,000). Avoid penalties — Radbit monitors your turnover and notifies you before it's too late.",
  alternates: { canonical: "/vat-threshold-alerts" },
  openGraph: {
    title: "ZIMRA VAT Threshold Alerts — Radbit",
    description: "Get real-time alerts when your SME approaches ZIMRA's VAT registration threshold. Avoid penalties with Radbit's automated monitoring.",
    url: `${baseUrl}/vat-threshold-alerts`,
  },
  twitter: {
    card: "summary_large_image",
    title: "ZIMRA VAT Threshold Alerts — Radbit",
    description: "Get real-time alerts when your SME approaches ZIMRA's VAT registration threshold. Avoid penalties with Radbit's automated monitoring.",
  },
};

export default function Page() {
  return <PageClient />;
}

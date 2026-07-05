import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "ZIMRA-Compliant Digital Receipts — Radbit",
  description: "Issue legally compliant digital receipts with Radbit's software fiscal device. No hardware needed — works on WhatsApp, web and offline. ZIMRA FDG approved.",
  alternates: { canonical: "/compliant-receipts" },
  openGraph: {
    title: "ZIMRA-Compliant Digital Receipts — Radbit",
    description: "Issue legally compliant digital receipts with Radbit's software fiscal device. No hardware needed — ZIMRA FDG approved.",
    url: `${baseUrl}/compliant-receipts`,
  },
  twitter: {
    card: "summary_large_image",
    title: "ZIMRA-Compliant Digital Receipts — Radbit",
    description: "Issue legally compliant digital receipts with Radbit's software fiscal device. No hardware needed — ZIMRA FDG approved.",
  },
};

export default function Page() {
  return <PageClient />;
}

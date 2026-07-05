import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Offline Fiscal Device Mode — Radbit",
  description: "Radbit's ZIMRA fiscal device works without internet. Issue receipts offline, auto-sync when connected. Perfect for Zimbabwean SMEs with unreliable connectivity.",
  alternates: { canonical: "/offline-mode" },
  openGraph: {
    title: "Offline Fiscal Device Mode — Radbit",
    description: "Radbit's ZIMRA fiscal device works without internet. Issue receipts offline, auto-sync when connected. Perfect for Zimbabwean SMEs.",
    url: `${baseUrl}/offline-mode`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Offline Fiscal Device Mode — Radbit",
    description: "Radbit's ZIMRA fiscal device works without internet. Issue receipts offline, auto-sync when connected. Perfect for Zimbabwean SMEs.",
  },
};

export default function Page() {
  return <PageClient />;
}

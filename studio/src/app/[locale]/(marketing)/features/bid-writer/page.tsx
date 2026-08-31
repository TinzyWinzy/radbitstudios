import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "AI Bid Writer for Zimbabwe Tenders — Radbit",
  description: "Prepare tender drafts with structured templates, document prompts and deadline tracking. Review every submission before use.",
  alternates: { canonical: "/features/bid-writer" },
  openGraph: {
    title: "AI Bid Writer for Zimbabwe Tenders — Radbit",
    description: "Prepare tender drafts with AI-assisted templates and document prompts for Zimbabwean SMEs.",
    url: `${baseUrl}/features/bid-writer`,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Bid Writer for Zimbabwe Tenders — Radbit",
    description: "Prepare tender drafts with AI-assisted templates and document prompts for Zimbabwean SMEs.",
  },
};

export default function Page() {
  return <PageClient />;
}

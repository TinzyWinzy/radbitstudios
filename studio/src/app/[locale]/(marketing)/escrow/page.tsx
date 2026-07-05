import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Escrow Protection for Diaspora Investments — Radbit",
  description: "Safe, transparent escrow for diaspora investors investing in Zimbabwean SMEs. Milestone-based fund releases, multi-currency support, and trust seal verification.",
  alternates: { canonical: "/escrow" },
  openGraph: {
    title: "Escrow Protection for Diaspora Investments — Radbit",
    description: "Safe escrow for diaspora investments in Zimbabwean SMEs. Milestone-based releases, multi-currency, trust seal verified.",
    url: `${baseUrl}/escrow`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Escrow Protection for Diaspora Investments — Radbit",
    description: "Safe escrow for diaspora investments in Zimbabwean SMEs. Milestone-based releases, multi-currency, trust seal verified.",
  },
};

export default function Page() {
  return <PageClient />;
}

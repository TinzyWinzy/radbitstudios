import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Contact — Radbit",
  description: "Reach the Radbit team. Enterprise digital infrastructure, AI agents, tender intelligence, and regulatory compliance for Zimbabwean organisations.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Radbit",
    description: "Reach the Radbit team. Enterprise digital infrastructure, AI agents, tender intelligence, and regulatory compliance for Zimbabwean organisations.",
    url: `${baseUrl}/contact`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Radbit",
    description: "Reach the Radbit team. Enterprise digital infrastructure, AI agents, tender intelligence, and regulatory compliance for Zimbabwean organisations.",
  },
};

export default function Page() {
  return <PageClient />;
}

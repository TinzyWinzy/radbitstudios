import type { Metadata } from "next";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Radbit — Digital Sovereignty for Zimbabwean Enterprises",
  description: "AI-driven tools for Zimbabwean entrepreneurs. Digital readiness assessment, tender intelligence, PRAZ compliance, AI agent workforce — built for local resilience.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Radbit — Digital Sovereignty for Zimbabwean Enterprises",
    description: "AI-driven tools for Zimbabwean entrepreneurs. Digital readiness assessment, tender intelligence, PRAZ compliance, AI agent workforce — built for local resilience.",
    url: `${baseUrl}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Radbit — Digital Sovereignty for Zimbabwean Enterprises",
    description: "AI-driven tools for Zimbabwean entrepreneurs. Digital readiness assessment, tender intelligence, PRAZ compliance, AI agent workforce — built for local resilience.",
  },
};

export default function Page() {
  return <PageClient />;
}

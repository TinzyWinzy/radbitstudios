import type { Metadata } from "next";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Radbit — Sovereign Digital Infrastructure for African Enterprises",
  description: "Integrated intelligence, automation, and compliance infrastructure for Zimbabwean enterprises. Digital readiness assessment, tender intelligence, PRAZ compliance, AI agents — purpose-built for local realities.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Radbit — Sovereign Digital Infrastructure for African Enterprises",
    description: "Integrated intelligence, automation, and compliance infrastructure for Zimbabwean enterprises. Digital readiness assessment, tender intelligence, PRAZ compliance, AI agents — purpose-built for local realities.",
    url: `${baseUrl}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Radbit — Sovereign Digital Infrastructure for African Enterprises",
    description: "Integrated intelligence, automation, and compliance infrastructure for Zimbabwean enterprises. Digital readiness assessment, tender intelligence, PRAZ compliance, AI agents — purpose-built for local realities.",
  },
};

export default function Page() {
  return <PageClient />;
}

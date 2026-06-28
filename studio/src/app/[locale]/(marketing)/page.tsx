import type { Metadata } from "next";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Radbit — SME Software & AI Platform for Zimbabwean Businesses",
  description: "Zimbabwe's sovereign AI platform for SMEs. Tender intelligence, PRAZ compliance automation, AI business tools, and digital readiness assessment — purpose-built for African enterprises. No monthly fees.",
  openGraph: {
    title: "Radbit — SME Software & AI Platform for Zimbabwean Businesses",
    description: "Zimbabwe's sovereign AI platform for SMEs. Tender intelligence, PRAZ compliance automation, AI business tools, and digital readiness assessment — purpose-built for African enterprises.",
    url: `${baseUrl}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Radbit — SME Software & AI Platform for Zimbabwean Businesses",
    description: "Zimbabwe's sovereign AI platform for SMEs. Tender intelligence, PRAZ compliance automation, AI business tools, and digital readiness assessment — purpose-built for African enterprises.",
  },
};

export default function Page() {
  return <PageClient />;
}

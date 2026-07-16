import type { Metadata } from "next";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Radbit Studios | Systems & AI for African Business",
  description: "Cloud infrastructure, AI-assisted workflows, and compliance systems for African businesses and their international partners.",
  openGraph: {
    title: "Radbit Studios | Systems & AI for African Business",
    description: "Cloud infrastructure, AI-assisted workflows, and compliance systems for African businesses and their international partners.",
    url: `${baseUrl}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Radbit Studios | Systems & AI for African Business",
    description: "Cloud infrastructure, AI-assisted workflows, and compliance systems for African businesses and their international partners.",
  },
};

export default function Page() {
  return <PageClient />;
}

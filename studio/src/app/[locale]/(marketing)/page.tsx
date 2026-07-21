import type { Metadata } from "next";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Radbit Studios Zimbabwe | Software & AI Systems for Business",
  description: "Zimbabwean software development and AI systems company. Custom business software, compliance automation, tender intelligence and AI workflow tools for Zimbabwean SMEs and enterprises.",
  openGraph: {
    title: "Radbit Studios Zimbabwe | Software & AI Systems for Business",
    description: "Zimbabwean software development and AI systems company. Custom business software, compliance automation, tender intelligence and AI workflow tools for Zimbabwean SMEs and enterprises.",
    url: `${baseUrl}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Radbit Studios Zimbabwe | Software & AI Systems for Business",
    description: "Zimbabwean software development and AI systems company. Custom business software, compliance automation, tender intelligence and AI workflow tools for Zimbabwean SMEs and enterprises.",
  },
};

export default function Page() {
  return <PageClient />;
}

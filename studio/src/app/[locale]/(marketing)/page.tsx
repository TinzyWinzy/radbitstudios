import type { Metadata } from "next";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Radbit | Business Software for Zimbabwean SMEs",
  description: "Tender tracking, compliance records, tax reminders, and practical AI tools for Zimbabwean businesses.",
  openGraph: {
    title: "Radbit | Business Software for Zimbabwean SMEs",
    description: "Tender tracking, compliance records, tax reminders, and practical AI tools for Zimbabwean businesses.",
    url: `${baseUrl}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Radbit | Business Software for Zimbabwean SMEs",
    description: "Tender tracking, compliance records, tax reminders, and practical AI tools for Zimbabwean businesses.",
  },
};

export default function Page() {
  return <PageClient />;
}

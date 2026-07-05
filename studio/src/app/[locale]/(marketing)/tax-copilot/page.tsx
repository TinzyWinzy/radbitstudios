import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Tax Co-Pilot — AI Tax Assistant for Zimbabwe — Radbit",
  description: "Your AI tax assistant for ZIMRA compliance. Get VAT answers, tax deadline reminders, fiscal device integration, and expert guidance for Zimbabwean SMEs.",
  alternates: { canonical: "/tax-copilot" },
  openGraph: {
    title: "Tax Co-Pilot — AI Tax Assistant for Zimbabwe — Radbit",
    description: "Your AI tax assistant for ZIMRA compliance. VAT answers, tax deadlines, fiscal device integration for Zimbabwean SMEs.",
    url: `${baseUrl}/tax-copilot`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tax Co-Pilot — AI Tax Assistant for Zimbabwe — Radbit",
    description: "Your AI tax assistant for ZIMRA compliance. VAT answers, tax deadlines, fiscal device integration for Zimbabwean SMEs.",
  },
};

export default function Page() {
  return <PageClient />;
}

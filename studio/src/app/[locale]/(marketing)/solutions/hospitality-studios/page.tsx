import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Hospitality & Studios — Direct Booking AI Agents | Radbit",
  description: "Cut OTA commissions with AI-powered direct booking agents, automated marketing, and cybersecurity compliance for Zimbabwean hospitality.",
  openGraph: {
    title: "Hospitality & Studios — Direct Booking AI Agents | Radbit",
    description: "Cut OTA commissions with AI-powered direct booking agents, automated marketing, and cybersecurity compliance for Zimbabwean hospitality.",
    url: `${baseUrl}/solutions/hospitality-studios`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Hospitality & Studios — Direct Booking AI Agents | Radbit",
    description: "Cut OTA commissions with AI-powered direct booking agents, automated marketing, and cybersecurity compliance for Zimbabwean hospitality.",
  },
};

export default function Page() {
  return <PageClient />;
}

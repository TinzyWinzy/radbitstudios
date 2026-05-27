import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { serviceSchema } from "@/lib/seo";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Hospitality & Studios — Direct Booking AI Agents | Radbit",
  description: "Cut OTA commissions with AI-powered direct booking agents, automated marketing, and cybersecurity compliance for Zimbabwean hospitality.",
  alternates: { canonical: "/solutions/hospitality-studios" },
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
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema({
            name: "Hospitality & Studios — Direct Booking AI Agents",
            description: "Cut OTA commissions with AI-powered direct booking agents, automated marketing, and cybersecurity compliance for Zimbabwean hospitality.",
            url: `${baseUrl}/solutions/hospitality-studios`,
            serviceOutput: "Automated direct bookings, reduced OTA fees, cybersecurity compliance",
          })),
        }}
      />
      <PageClient />
    </>
  );
}

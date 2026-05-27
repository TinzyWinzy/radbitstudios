import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { serviceSchema } from "@/lib/seo";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Logistics & Pharmacy Automation — AI Agent Workforce | Radbit",
  description: "Deploy AI agents to automate EDI transactions, fleet dispatch, inventory management, and load-shedding resilience for logistics and pharmacy.",
  alternates: { canonical: "/solutions/logistics-pharmacies" },
  openGraph: {
    title: "Logistics & Pharmacy Automation — AI Agent Workforce | Radbit",
    description: "Deploy AI agents to automate EDI transactions, fleet dispatch, inventory management, and load-shedding resilience for logistics and pharmacy.",
    url: `${baseUrl}/solutions/logistics-pharmacies`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Logistics & Pharmacy Automation — AI Agent Workforce | Radbit",
    description: "Deploy AI agents to automate EDI transactions, fleet dispatch, inventory management, and load-shedding resilience for logistics and pharmacy.",
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
            name: "Logistics & Pharmacy Automation — AI Agent Workforce",
            description: "Deploy AI agents to automate EDI transactions, fleet dispatch, inventory management, and load-shedding resilience.",
            url: `${baseUrl}/solutions/logistics-pharmacies`,
            serviceOutput: "Automated EDI, fleet dispatch, inventory management, load-shedding resilience",
          })),
        }}
      />
      <PageClient />
    </>
  );
}

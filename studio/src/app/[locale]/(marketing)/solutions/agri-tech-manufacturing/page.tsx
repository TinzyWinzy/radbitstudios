import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { serviceSchema } from "@/lib/seo";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Agri-Tech & Manufacturing — Tender Intelligence | Radbit",
  description: "Win national contracts with AI-curated procurement alerts, PRAZ compliance, and supply chain intelligence for Zimbabwean agri-tech and manufacturing.",
  alternates: { canonical: "/solutions/agri-tech-manufacturing" },
  openGraph: {
    title: "Agri-Tech & Manufacturing — Tender Intelligence | Radbit",
    description: "Win national contracts with AI-curated procurement alerts, PRAZ compliance, and supply chain intelligence for Zimbabwean agri-tech and manufacturing.",
    url: `${baseUrl}/solutions/agri-tech-manufacturing`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Agri-Tech & Manufacturing — Tender Intelligence | Radbit",
    description: "Win national contracts with AI-curated procurement alerts, PRAZ compliance, and supply chain intelligence for Zimbabwean agri-tech and manufacturing.",
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
            name: "Agri-Tech & Manufacturing — Tender Intelligence",
            description: "Win national contracts with AI-curated procurement alerts, PRAZ compliance, and supply chain intelligence.",
            url: `${baseUrl}/solutions/agri-tech-manufacturing`,
            serviceOutput: "AI-curated tenders, PRAZ compliance, supply chain intelligence",
          })),
        }}
      />
      <PageClient />
    </>
  );
}

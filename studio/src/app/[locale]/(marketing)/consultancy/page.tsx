import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { serviceSchema } from "@/lib/seo";

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/\/$/, '');

export const metadata: Metadata = {
  title: "Consultancy Services — Radbit Inc | Technology & Business Solutions for African SMEs",
  description:
    "Radbit Inc offers end-to-end technology consultancy: software development, cybersecurity, business strategy, brand management, ERP systems, and AI/ML solutions. Starting from $100 USD.",
  alternates: { canonical: "/consultancy" },
  openGraph: {
    title: "Consultancy Services — Radbit Inc",
    description:
      "End-to-end technology consultancy for African SMEs. Software, cybersecurity, ERP, AI/ML, and brand management.",
    type: "website",
    url: `${SITE_URL}/consultancy`,
  },
};

const ConsultancyClient = dynamic(
  () => import("./page-client").then((m) => m.ConsultancyClient),
  { ssr: false }
);

export default function ConsultancyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema({
            name: "Technology & Business Consultancy for African SMEs",
            description: "End-to-end technology consultancy: software development, cybersecurity, business strategy, brand management, ERP systems, and AI/ML solutions. Starting from $100 USD.",
            url: `${SITE_URL}/consultancy`,
            serviceOutput: "Custom software, cybersecurity audits, business strategy, ERP implementation, AI/ML solutions",
          })),
        }}
      />
      <ConsultancyClient />
    </>
  );
}

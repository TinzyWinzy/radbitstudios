import type { Metadata } from "next";
import dynamic from "next/dynamic";

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
  return <ConsultancyClient />;
}

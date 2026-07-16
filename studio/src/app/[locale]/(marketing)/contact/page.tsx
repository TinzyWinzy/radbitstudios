import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Contact — Radbit Studios | Systems & AI for African Business",
  description: "Hire Radbit Studios for systems architecture, AI integration, and SaaS development. Or apply to pilot Radbit Ops for your Zim SME.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Radbit Studios",
    description: "Hire Radbit Studios for systems architecture, AI integration, and SaaS development. Or apply to pilot Radbit Ops.",
    url: `${baseUrl}/contact`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Radbit Studios",
    description: "Hire Radbit Studios for systems architecture, AI integration, and SaaS development.",
  },
};

export default function Page() {
  return <PageClient />;
}

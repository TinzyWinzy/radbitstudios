import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Tech Hub Harare × Radbit — AI Tools for Zimbabwe's Founders",
  description: "AI agent workforce, cloud credits, tender intelligence and PRAZ compliance for Tech Hub Harare members.",
  alternates: { canonical: '/partners/techhub-harare' },
  openGraph: {
    title: "Tech Hub Harare × Radbit — AI Tools for Zimbabwe's Founders",
    description: "AI agent workforce, cloud credits, tender intelligence and PRAZ compliance for Tech Hub Harare members.",
    url: `${baseUrl}/partners/techhub-harare`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Hub Harare × Radbit — AI Tools for Zimbabwe's Founders",
    description: "AI agent workforce, cloud credits, tender intelligence and PRAZ compliance for Tech Hub Harare members.",
  },
};

export default function Page() {
  return <PageClient />;
}

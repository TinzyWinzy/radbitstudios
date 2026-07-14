import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Impact Hub Harare × Radbit — Sustainable Innovation Powered by AI",
  description: "Track green energy tenders, access sustainability grants, and scale your climate action impact with AI.",
  alternates: { canonical: '/partners/impact-hub' },
  openGraph: {
    title: "Impact Hub Harare × Radbit — Sustainable Innovation Powered by AI",
    description: "Track green energy tenders, access sustainability grants, and scale your climate action impact with AI.",
    url: `${baseUrl}/partners/impact-hub`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Impact Hub Harare × Radbit — Sustainable Innovation Powered by AI",
    description: "Track green energy tenders, access sustainability grants, and scale your climate action impact with AI.",
  },
};

export default function Page() {
  return <PageClient />;
}

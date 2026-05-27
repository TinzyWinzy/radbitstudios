import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Contact Us — Radbit",
  description: "Get in touch with the Radbit team. Email hello@radbitstudios.co.zw or use the contact form.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us — Radbit",
    description: "Get in touch with the Radbit team. Email hello@radbitstudios.co.zw or use the contact form.",
    url: `${baseUrl}/contact`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — Radbit",
    description: "Get in touch with the Radbit team. Email hello@radbitstudios.co.zw or use the contact form.",
  },
};

export default function Page() {
  return <PageClient />;
}

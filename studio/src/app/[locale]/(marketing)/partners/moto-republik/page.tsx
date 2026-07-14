import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Moto Republik × Radbit — Creative Entrepreneurship Meets AI",
  description: "Generate logos, write copy, automate marketing with AI agents. Built for the Moto Republik creative community.",
  alternates: { canonical: '/partners/moto-republik' },
  openGraph: {
    title: "Moto Republik × Radbit — Creative Entrepreneurship Meets AI",
    description: "Generate logos, write copy, automate marketing with AI agents. Built for the Moto Republik creative community.",
    url: `${baseUrl}/partners/moto-republik`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Moto Republik × Radbit — Creative Entrepreneurship Meets AI",
    description: "Generate logos, write copy, automate marketing with AI agents. Built for the Moto Republik creative community.",
  },
};

export default function Page() {
  return <PageClient />;
}

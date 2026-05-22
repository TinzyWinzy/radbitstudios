import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Zimbabwe Business Expo 2026 — Radbit",
  description: "Zimbabwe's premier B2B expo. December 18, 2026 at Golden Conifer Conference Centre, Harare. Register now.",
  openGraph: {
    title: "Zimbabwe Business Expo 2026 — Radbit",
    description: "Zimbabwe's premier B2B expo. December 18, 2026 at Golden Conifer Conference Centre, Harare. Register now.",
    url: `${baseUrl}/events/zimbabwe-business-expo-2026`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Zimbabwe Business Expo 2026 — Radbit",
    description: "Zimbabwe's premier B2B expo. December 18, 2026 at Golden Conifer Conference Centre, Harare. Register now.",
  },
};

export default function Page() {
  return <PageClient />;
}

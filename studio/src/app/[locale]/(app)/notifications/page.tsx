import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

export const metadata: Metadata = {
  title: "Notifications — Radbit",
  description: "View your full notification history. Assessment results, tender alerts, news updates, and system notifications.",
  openGraph: {
    title: "Notifications — Radbit",
    description: "View your full notification history.",
    url: `${baseUrl}/notifications`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Notifications — Radbit",
    description: "View your full notification history.",
  },
};

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export default function NotificationsPage() {
  return <PageClient />;
}

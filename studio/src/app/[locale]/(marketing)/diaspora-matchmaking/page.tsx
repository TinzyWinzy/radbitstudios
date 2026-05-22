import type { Metadata } from "next";
import dynamic from "next/dynamic";

const baseUrl = process.env.FRONTEND_URL || "https://radbitstudios.co.zw";

const PageClient = dynamic(() => import("./page-client"), { ssr: true });

export const metadata: Metadata = {
  title: "Diaspora Matchmaking — Radbit",
  description: "Bridge diaspora capital with verified Zimbabwean SMEs. Invest in PRAZ-compliant businesses with transparent metrics.",
  openGraph: {
    title: "Diaspora Matchmaking — Radbit",
    description: "Bridge diaspora capital with verified Zimbabwean SMEs. Invest in PRAZ-compliant businesses with transparent metrics.",
    url: `${baseUrl}/diaspora-matchmaking`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Diaspora Matchmaking — Radbit",
    description: "Bridge diaspora capital with verified Zimbabwean SMEs. Invest in PRAZ-compliant businesses with transparent metrics.",
  },
};

export default function Page() {
  return <PageClient />;
}

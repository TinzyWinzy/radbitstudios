import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solutions — Radbit",
  description:
    "Websites, AI platform, ERP systems, and professional services for Zimbabwean SMEs. Tender intelligence, PRAZ compliance, business software — no monthly fees.",
  openGraph: {
    title: "Solutions — Radbit",
    description:
      "Websites, AI platform, ERP systems, and professional services for Zimbabwean SMEs. Tender intelligence, PRAZ compliance, business software — no monthly fees.",
  },
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

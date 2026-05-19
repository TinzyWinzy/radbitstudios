import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VAT Calculator Zimbabwe — 15% VAT",
  description:
    "Free Zimbabwe VAT calculator. Calculate VAT-inclusive and VAT-exclusive prices at the 15% ZIMRA rate. Updated for 2026.",
  alternates: { canonical: "/resources/tools/vat-calculator" },
};

export default function VatCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

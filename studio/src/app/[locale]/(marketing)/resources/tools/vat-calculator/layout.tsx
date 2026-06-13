import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VAT Calculator Zimbabwe — Free ZIMRA 15% VAT Tool",
  description: "Calculate VAT-inclusive and VAT-exclusive prices at the ZIMRA 15% rate. Free online VAT calculator for Zimbabwean businesses.",
  alternates: { canonical: "/resources/tools/vat-calculator" },
};

export default function VatCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}

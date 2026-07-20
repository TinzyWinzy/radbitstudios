import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommercialPage } from "@/components/commercial-page";
import { getIndustry, INDUSTRY_PAGES } from "@/data/commercial-content";

export function generateStaticParams() { return INDUSTRY_PAGES.map(page => ({ industry: page.slug })); }

export function generateMetadata({ params }: { params: { industry: string } }): Metadata {
  const page = getIndustry(params.industry); if (!page) return { title: "Industry not found" };
  return { title: `${page.title} | Radbit Studios`, description: page.metaDescription, alternates: { canonical: `/solutions/${page.slug}` }, openGraph: { title: page.title, description: page.metaDescription, url: `/solutions/${page.slug}`, type: "website" } };
}

export default function IndustryPage({ params }: { params: { industry: string } }) {
  const page = getIndustry(params.industry); if (!page) notFound();
  return <CommercialPage page={page} kind="industry" />;
}

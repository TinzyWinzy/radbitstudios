import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommercialPage } from "@/components/commercial-page";
import { getService, SERVICE_PAGES } from "@/data/commercial-content";

export function generateStaticParams() { return SERVICE_PAGES.map(page => ({ service: page.slug })); }
export function generateMetadata({ params }: { params: { service: string } }): Metadata {
  const page = getService(params.service); if (!page) return { title: "Service not found" };
  return { title: `${page.title} | Radbit Studios`, description: page.metaDescription, alternates: { canonical: `/services/${page.slug}` }, openGraph: { title: page.title, description: page.metaDescription, url: `/services/${page.slug}`, type: "website" } };
}
export default function ServicePage({ params }: { params: { service: string } }) { const page = getService(params.service); if (!page) notFound(); return <CommercialPage page={page} kind="service" />; }

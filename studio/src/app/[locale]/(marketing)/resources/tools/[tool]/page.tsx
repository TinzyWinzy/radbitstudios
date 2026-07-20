import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiagnosticToolEngine } from "@/components/diagnostic-tool";
import { DIAGNOSTIC_TOOLS, getDiagnosticTool } from "@/data/diagnostic-tools";
import { breadcrumbSchema } from "@/lib/seo";

export function generateStaticParams() { return DIAGNOSTIC_TOOLS.map(tool => ({ tool: tool.slug })); }
export function generateMetadata({ params }: { params: { tool: string } }): Metadata { const tool = getDiagnosticTool(params.tool); if (!tool) return { title: "Tool not found" }; return { title: `${tool.title} | Radbit Studios`, description: tool.metaDescription, alternates: { canonical: `/resources/tools/${tool.slug}` } }; }
export default function ToolPage({ params }: { params: { tool: string } }) { const tool = getDiagnosticTool(params.tool); if (!tool) notFound(); const url = `/resources/tools/${tool.slug}`; return <main className="container py-12 md:py-20"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Resources", url: "/resources" }, { name: tool.title, url }])) }} /><nav className="text-sm text-muted-foreground" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden> / </span><Link href="/resources">Resources</Link><span aria-hidden> / </span><span>{tool.title}</span></nav><header className="my-10 max-w-4xl border-b border-border pb-10"><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">{tool.eyebrow}</p><h1 className="mt-5 font-headline text-4xl font-semibold tracking-tight sm:text-5xl">{tool.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{tool.intro}</p></header><DiagnosticToolEngine tool={tool} /></main>; }

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICE_PAGES } from "@/data/commercial-content";

export const metadata: Metadata = { title: "Software, AI and Business Systems Services | Radbit Studios", description: "Custom software, web applications, AI automation, PWAs, process automation, local visibility and SEO services for African businesses.", alternates: { canonical: "/services" } };

export default function ServicesPage() { return <main>
  <header className="container py-14 md:py-24"><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">Commercial systems practice</p><h1 className="mt-5 max-w-4xl font-headline text-5xl font-semibold tracking-tight md:text-6xl">Technology is the execution layer. The operating outcome comes first.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Radbit diagnoses the workflow, defines the smallest responsible intervention, and builds systems whose limitations remain explicit.</p></header>
  <section className="border-y border-border/60"><div className="container divide-y divide-border">{SERVICE_PAGES.map((service, index) => <Link key={service.slug} href={`/services/${service.slug}`} className="group grid gap-4 py-7 md:grid-cols-[4rem_1.1fr_1.6fr_auto] md:items-center"><span className="text-sm tabular-nums text-muted-foreground">0{index + 1}</span><h2 className="font-headline text-xl font-semibold">{service.name}</h2><p className="text-sm leading-6 text-muted-foreground">{service.intro}</p><ArrowRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:text-primary" /></Link>)}</div></section>
  <section className="container py-14 md:py-20"><div className="max-w-3xl border-l-2 border-primary pl-7"><h2 className="font-headline text-3xl font-semibold">Unsure which service fits?</h2><p className="mt-3 text-muted-foreground">Describe the delay, error or visibility gap. The diagnosis should determine the service—not the other way around.</p><Link href="/contact" className="mt-5 inline-flex items-center gap-2 font-medium text-primary">Discuss your current workflow <ArrowRight className="size-4" /></Link></div></section>
</main>; }

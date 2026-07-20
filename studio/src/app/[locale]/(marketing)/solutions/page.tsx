import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { INDUSTRY_PAGES } from "@/data/commercial-content";

export const metadata: Metadata = { title: "Industry Business Systems | Radbit Studios", description: "Operational software patterns for hospitality, staffing, agriculture, solar, construction, mining, education and Zimbabwean SMEs.", alternates: { canonical: "/solutions" } };

export default function SolutionsPage() { return <main>
  <header className="border-b border-border/60"><div className="container py-14 md:py-24"><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">Industry systems</p><h1 className="mt-5 max-w-4xl font-headline text-5xl font-semibold tracking-tight md:text-6xl">Software must understand the operation it enters.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">These are diagnostic starting points, not claims that every business in an industry works the same way.</p></div></header>
  <section className="container py-12 md:py-20"><div className="divide-y divide-border border-y border-border">{INDUSTRY_PAGES.map((item, index) => <Link key={item.slug} href={`/solutions/${item.slug}`} className="group grid gap-4 py-7 md:grid-cols-[4rem_1.1fr_1.6fr_auto] md:items-center"><span className="text-sm tabular-nums text-muted-foreground">0{index + 1}</span><h2 className="font-headline text-xl font-semibold">{item.name}</h2><p className="text-sm leading-6 text-muted-foreground">{item.problem}</p><ArrowRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:text-primary" /></Link>)}</div></section>
</main>; }

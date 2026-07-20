import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import type { CommercialPage as CommercialPageData } from "@/data/commercial-content";
import { breadcrumbSchema, faqPageSchema, serviceSchema } from "@/lib/seo";

const SITE_URL = (process.env.FRONTEND_URL || "https://radbitstudios.co.zw").replace(/\/$/, "");

export function CommercialPage({ page, kind }: { page: CommercialPageData; kind: "service" | "industry" }) {
  const base = kind === "service" ? "services" : "solutions";
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema({ name: page.name, description: page.metaDescription, url: `/${base}/${page.slug}` })) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(page.faq)) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", url: SITE_URL }, { name: kind === "service" ? "Services" : "Solutions", url: `${SITE_URL}/${base}` }, { name: page.name, url: `${SITE_URL}/${base}/${page.slug}` }])) }} />

    <section className="border-b border-border/60"><div className="container py-14 md:py-24">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link href="/">Home</Link><span aria-hidden> / </span><Link href={`/${base}`}>{kind === "service" ? "Services" : "Solutions"}</Link><span aria-hidden> / </span><span>{page.name}</span></nav>
      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,.6fr)] lg:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">{kind === "service" ? "Radbit service" : "Industry system"}</p><h1 className="mt-5 max-w-4xl font-headline text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">{page.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{page.intro}</p></div>
        <aside className="border-l border-border pl-6"><p className="text-xs uppercase tracking-wider text-muted-foreground">Search intent</p><p className="mt-2 font-medium">{page.searchIntent}</p><p className="mt-6 text-xs uppercase tracking-wider text-muted-foreground">First step</p><Link href={`/contact?interest=${page.slug}`} className="mt-2 inline-flex items-center gap-2 font-medium text-primary">Request a workflow assessment <ArrowRight className="size-4" /></Link></aside>
      </div>
    </div></section>

    <section className="container grid gap-10 py-12 md:grid-cols-[.75fr_1.5fr] md:py-20"><div><p className="text-sm text-muted-foreground">The operating problem</p><h2 className="mt-2 font-headline text-2xl font-semibold">Why the current workflow breaks</h2></div><p className="max-w-3xl text-xl leading-9 text-foreground/80">{page.problem}</p></section>

    <section className="border-y border-border/60 bg-muted/20"><div className="container grid gap-12 py-12 lg:grid-cols-2 lg:py-20">
      <div><p className="text-sm text-muted-foreground">Target outcomes</p><h2 className="mt-2 font-headline text-3xl font-semibold">What should improve</h2><ul className="mt-7 divide-y divide-border border-y border-border">{page.outcomes.map(item => <li key={item} className="flex gap-3 py-4"><Check className="mt-1 size-4 shrink-0 text-primary" /><span>{item}</span></li>)}</ul></div>
      <div><p className="text-sm text-muted-foreground">Possible system scope</p><h2 className="mt-2 font-headline text-3xl font-semibold">What Radbit can design</h2><ol className="mt-7 divide-y divide-border border-y border-border">{page.capabilities.map((item, index) => <li key={item} className="grid grid-cols-[2.5rem_1fr] py-4"><span className="text-sm tabular-nums text-muted-foreground">0{index + 1}</span><span>{item}</span></li>)}</ol></div>
    </div></section>

    <section className="container py-12 md:py-20"><div className="grid gap-10 lg:grid-cols-[.75fr_1.5fr]"><div><p className="text-sm text-muted-foreground">Proof boundary</p><h2 className="mt-2 font-headline text-2xl font-semibold">What this page does not claim</h2></div><ul className="space-y-4">{page.exclusions.map(item => <li key={item} className="flex gap-3 border-b border-border pb-4 text-muted-foreground"><Minus className="mt-1 size-4 shrink-0" />{item}</li>)}</ul></div></section>

    <section className="border-y border-border/60"><div className="container py-12 md:py-20"><p className="text-sm text-muted-foreground">Engagement sequence</p><h2 className="mt-2 font-headline text-3xl font-semibold">From diagnosis to a validated release</h2><div className="mt-9 grid gap-0 md:grid-cols-3">{page.process.map((item, index) => <div key={item.title} className="border-t border-border py-6 md:border-l md:border-t-0 md:px-7 md:first:border-l-0 md:first:pl-0"><span className="text-xs text-primary">0{index + 1}</span><h3 className="mt-3 font-headline text-xl font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p></div>)}</div></div></section>

    {page.tool && <section className="container py-10"><div className="flex flex-col justify-between gap-5 border-l-2 border-primary bg-muted/20 p-7 sm:flex-row sm:items-center"><div><p className="font-headline text-xl font-semibold">Get a useful first diagnosis</p><p className="mt-1 text-sm text-muted-foreground">See your result immediately. Contact details are optional.</p></div><Link href={page.tool.href} className="inline-flex items-center gap-2 font-medium text-primary">{page.tool.label} <ArrowRight className="size-4" /></Link></div></section>}

    <section className="container grid gap-10 py-12 md:grid-cols-[.75fr_1.5fr] md:py-20"><div><p className="text-sm text-muted-foreground">Decision support</p><h2 className="mt-2 font-headline text-3xl font-semibold">Frequently asked questions</h2></div><div className="divide-y divide-border border-y border-border">{page.faq.map(item => <details key={item.question} className="group py-5"><summary className="cursor-pointer list-none pr-8 font-medium">{item.question}</summary><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{item.answer}</p></details>)}</div></section>

    <section className="border-t border-border bg-muted/20"><div className="container grid gap-8 py-12 md:grid-cols-2 md:items-end md:py-16"><div><p className="text-sm text-primary">A contextual next step</p><h2 className="mt-2 font-headline text-3xl font-semibold">Discuss the workflow before commissioning the system.</h2><p className="mt-4 max-w-xl text-muted-foreground">Bring the current process, its bottleneck and the people who use it. Radbit will help define whether software is justified.</p></div><div className="md:text-right"><Link href={`/contact?interest=${page.slug}`} className="inline-flex items-center gap-2 bg-primary px-5 py-3 font-medium text-primary-foreground">Request a systems assessment <ArrowRight className="size-4" /></Link><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 md:justify-end">{page.related.map(item => <Link key={item.href} className="text-sm text-muted-foreground hover:text-primary" href={item.href}>{item.label}</Link>)}</div></div></div></section>
  </main>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Cloud, Brain, Code, Shield, Clock, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Services — Radbit Studios | Systems & AI for African Business",
  description: "Systems architecture, AI integration, SaaS development, and security audits for African businesses and their international partners.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services — Radbit Studios",
    description: "Systems architecture, AI integration, SaaS development, and security audits for African businesses.",
    type: "website",
    url: "/services",
  },
};

const services = [
  {
    icon: Cloud,
    title: "Systems Architecture",
    what: "Design cloud infrastructure, database schemas, API layers, and security models for businesses that need reliable technical foundations.",
    whatNot: "This is not a marketing website package. We design systems that handle data, auth, payments, and scale.",
    length: "2-8 weeks per engagement",
    price: "$2,500 - $15,000",
    slug: "systems-architecture",
  },
  {
    icon: Brain,
    title: "AI Integration",
    what: "RAG systems, LLM workflows, document parsing, and automated classification. Built on your data, not generic prompts.",
    whatNot: "This is not a chatbot plugin. We build pipelines that process your documents, classify your data, and return results you can use.",
    length: "2-6 weeks per integration",
    price: "$1,500 - $10,000",
    slug: "ai-integration",
  },
  {
    icon: Code,
    title: "SaaS Development",
    what: "End-to-end product build: frontend, backend, auth, payments, deployment. You own the code and the IP.",
    whatNot: "This is not a no-code prototype. We build production systems with real databases, real auth, and real testing.",
    length: "4-16 weeks per product",
    price: "$5,000 - $50,000",
    slug: "saas-development",
  },
  {
    icon: Shield,
    title: "Security & Compliance Audits",
    what: "Review authentication, data handling, and regulatory alignment. Deliverable: a written report with ranked fixes.",
    whatNot: "This is not a penetration test from a template. We audit against your actual threat model and compliance requirements.",
    length: "1-3 weeks per audit",
    price: "$1,000 - $5,000",
    slug: "security-audits",
  },
];

export default function ServicesPage() {
  return (
    <div className="container py-12 md:py-24 space-y-20 max-w-5xl">
      <div className="space-y-4">
        <h1 className="font-headline text-fluid-4xl font-bold tracking-tighter">
          Services
        </h1>
        <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed">
          Radbit Studios builds cloud infrastructure, AI-assisted workflows, and compliance systems. Every engagement starts with a diagnostic, requires a deposit, and includes a written scope of work.
        </p>
      </div>

      <div className="space-y-12">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <section key={service.title} className="grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12 pb-12 border-b border-border/50 last:border-0">
              <div>
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-headline text-2xl font-bold tracking-tight mb-2">{service.title}</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary/60" />
                    <span>{service.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-primary/60" />
                    <span>{service.price}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-foreground/80 leading-relaxed">{service.what}</p>
                <p className="text-sm text-muted-foreground/60 italic leading-relaxed">{service.whatNot}</p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                >
                  Request a Diagnostic <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>
          );
        })}
      </div>

      <section className="rounded-xl border border-border bg-card/50 p-6 md:p-8">
        <h2 className="font-headline text-xl font-bold tracking-tight mb-3">How engagements work</h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          {[
            { step: "01", title: "Diagnostic", body: "We map your current systems, pain points, and requirements. Delivered as a written scope of work with fixed pricing." },
            { step: "02", title: "Build", body: "We build in weekly sprints with visible deliverables. You review, test, and approve each stage before we move to the next." },
            { step: "03", title: "Handover", body: "You own the code, the documentation, and the deployment credentials. We provide a close-out report and a support window." },
          ].map((item) => (
            <div key={item.step} className="space-y-2">
              <span className="text-xs font-headline tracking-wider text-primary/60">{item.step}</span>
              <h3 className="font-headline font-bold text-foreground">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

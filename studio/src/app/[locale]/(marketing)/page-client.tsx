"use client";

import { useRef } from "react";
import { ChevronRight, BarChart, Shield, Zap, Globe, Server, Database, BadgeCheck, ExternalLink, Brain, ArrowRight, Cloud, Code } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticButton } from "@/components/magnetic-button";
import { GyeNyame } from "@/components/adinkra-symbols";
import { NewsletterSignup } from "@/components/newsletter-signup";
import dynamic from "next/dynamic";

const HeroBackground = dynamic(() => import("@/components/hero-background").then(m => m.HeroBackground), { ssr: false });
const WaveField = dynamic(() => import("@/components/wave-field").then(m => m.WaveField), { ssr: false });

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -40]);

  return (
    <section ref={sectionRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <motion.div style={{ opacity, y }} className="relative z-10 text-center sm:px-4 max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <GyeNyame className="mx-auto h-10 w-10 text-primary/30" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-headline text-fluid-5xl font-bold tracking-tighter leading-[0.9] text-foreground"
        >
          <span className="text-gradient">Systems That Run</span>
          <br />
          <span>Without You.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-8 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        >
          Radbit Studios builds cloud infrastructure, AI-assisted workflows, and compliance systems for African businesses and their international partners. We also design the internal tools your team actually uses.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <MagneticButton asChild size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 font-headline text-sm tracking-wider px-8">
            <Link href="/work">
              See What We Build
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
          </MagneticButton>
          <MagneticButton asChild size="default" variant="outline" className="border-foreground/20 text-foreground/70 hover:bg-card hover:text-foreground font-headline text-sm tracking-wider px-8">
            <Link href="/pilot">Join the SME Pilot</Link>
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground/50"
        >
          <span className="flex items-center gap-1.5"><Cloud className="h-3 w-3 text-primary/60" /> Cloud infrastructure</span>
          <span className="flex items-center gap-1.5"><Brain className="h-3 w-3 text-primary/60" /> AI integration</span>
          <span className="flex items-center gap-1.5"><Code className="h-3 w-3 text-primary/60" /> Web & mobile</span>
        </motion.div>

      </motion.div>

      <motion.div
        style={{ opacity: useTransform(scrollYProgress, [0, 0.3], [0, 1]) }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  );
}

const capabilities = [
  {
    icon: Cloud,
    title: "Cloud & Infrastructure",
    body: "Firebase, Supabase, PostgreSQL, Vercel, Google Cloud. Built to scale.",
    stacks: ["Firebase", "Supabase", "PostgreSQL", "Vercel", "GCP"],
  },
  {
    icon: Brain,
    title: "AI & Automation",
    body: "RAG pipelines, LLM integration, workflow automation. Intelligence that executes.",
    stacks: ["RAG", "LLM", "Genkit", "Gemini", "Python"],
  },
  {
    icon: Code,
    title: "Web & Mobile",
    body: "Next.js, TypeScript, PWAs, smart contracts. Interfaces that perform.",
    stacks: ["Next.js", "TypeScript", "Tailwind", "React Native", "Solidity"],
  },
];

function CapabilityStrip() {
  return (
    <section className="relative py-20 md:py-24 border-y border-border bg-muted/30">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative p-6 rounded-xl border border-border bg-card"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-headline text-lg font-bold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{cap.body}</p>
                <div className="flex flex-wrap gap-2">
                  {cap.stacks.map((s) => (
                    <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/60 bg-muted/40 text-muted-foreground/70">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

const projects = [
  {
    name: "City View Guest House",
    url: "https://cityviewguesthouse.co.zw",
    outcome: "Public-facing hospitality site with booking enquiry flow and mobile-first layout.",
    stacks: ["Next.js", "Tailwind", "Vercel"],
    status: "Paid",
  },
  {
    name: "Wobic",
    url: "https://wobic.co.zw",
    outcome: "Clean web presence for a Zimbabwean business with responsive design and SEO foundations.",
    stacks: ["Next.js", "Tailwind", "Vercel"],
    status: "Paid",
  },
  {
    name: "Nexus Agronomics",
    url: "https://nexusagronomics.co.zw",
    outcome: "Sector-focused agronomy website with service structure and credibility content.",
    stacks: ["Next.js", "Tailwind", "Firebase"],
    status: "Built + Deployed",
  },
  {
    name: "Radbit Ops",
    url: "/pilot",
    outcome: "Compliance and tender-readiness tool for Zimbabwean SMEs. Currently in pilot.",
    stacks: ["Next.js", "Firebase", "Genkit", "Supabase"],
    status: "Built + Deployed (Pilot)",
  },
];

function ProofSection() {
  return (
    <section className="relative py-20 md:py-24 content-visibility-auto">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center space-y-3 mb-14"
        >
          <h2 className="font-headline text-fluid-4xl font-bold tracking-tighter text-foreground">
            <span className="text-gradient">Demonstrated</span> Work
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Projects we have built, deployed, demonstrated, or been paid for.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {projects.map((p, i) => (
            <motion.a
              key={p.name}
              href={p.url}
              target={p.url.startsWith("http") ? "_blank" : undefined}
              rel={p.url.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group block p-6 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-headline font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border border-primary/20 text-primary/60">
                  {p.status}
                </span>
                <span className="h-px flex-1 bg-foreground/10" />
              </div>
              <h3 className="font-headline font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
                {p.name}
                <ArrowRight className="inline-block ml-1.5 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{p.outcome}</p>
              <div className="flex flex-wrap gap-2">
                {p.stacks.map((s) => (
                  <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/50 bg-muted/30 text-muted-foreground/60">
                    {s}
                  </span>
                ))}
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <MagneticButton asChild variant="outline" className="font-headline text-xs tracking-wider border border-primary/20 text-primary/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40">
            <Link href="/work">
              View Full Portfolio <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}

function FounderSection() {
  return (
    <section className="relative py-16 md:py-20 border-t border-border bg-muted/20">
      <div className="container relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-col sm:flex-row gap-6 items-start p-6 md:p-8 rounded-xl border border-border bg-card"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 text-2xl font-bold text-white">
            TD
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="font-headline font-bold text-foreground text-lg">Tinotenda Brandon Duma</h3>
              <p className="text-sm text-muted-foreground">Engineer and systems architect</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Full-stack engineer and AI-augmented systems architect. Operating from Zimbabwe, building for local and international markets. SAQA-evaluated. IITPSA member.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Radbit Studios exists at the intersection of technical capability and local business infrastructure. Every system we build is designed to work in the environments our clients actually operate in.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PlatformScopeSection() {
  return (
    <section className="relative py-16 md:py-20 content-visibility-auto">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-0 bg-card border border-border rounded-xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border"
        >
          {[
            { value: "12+", label: "Government Data Sources", sub: "Tender intelligence across PRAZ, ministries, and state enterprises", icon: <Zap className="h-4 w-4 text-secondary" /> },
            { value: "4", label: "Regulatory Workflows", sub: "ZIMRA, PRAZ, NSSA, and RBZ records kept easier to track", icon: <Shield className="h-4 w-4 text-primary" /> },
            { value: "3", label: "Platform Layers", sub: "Assessment, AI tools, and compliance records working together", icon: <BarChart className="h-4 w-4 text-accent" /> },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-8 md:p-10 text-center group hover:bg-muted transition-colors duration-300"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                {metric.icon}
                <span className="font-headline text-xs tracking-[0.2em] text-muted-foreground uppercase">Scope</span>
              </div>
              <div className="text-foreground">
                <span className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                  {metric.value}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium mt-2">{metric.label}</p>
              <p className="text-xs text-foreground/40 mt-1 max-w-[180px] sm:max-w-[200px] mx-auto leading-relaxed">{metric.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TrustSection() {
  const trustItems = [
    {
      icon: <Shield className="h-4 w-4" />,
      title: "Secured with Modern Controls",
      body: "We use Firebase, TLS 1.3, and modern web security controls to protect account and business data in transit and at rest.",
    },
    {
      icon: <Server className="h-4 w-4" />,
      title: "Data Treated Carefully",
      body: "We collect the information needed to run the product and keep sensitive business records behind authenticated access.",
    },
    {
      icon: <Database className="h-4 w-4" />,
      title: "Never Shared or Sold",
      body: "We do not sell your business data. Product access is designed around accounts, roles, and permissions.",
    },
    {
      icon: <BadgeCheck className="h-4 w-4" />,
      title: "Regulatory Alignment",
      body: "Built to help you organize the documents and reminders commonly needed for ZIMRA, PRAZ, NSSA, and other local workflows.",
    },
  ];

  return (
    <section className="relative py-16 md:py-20 content-visibility-auto border-t border-border/50">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center space-y-3 mb-12"
        >
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">
            Built for <span className="text-gradient">Trust</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Business records are sensitive. We keep the language plain and the controls practical.
          </p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {trustItems.map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="text-center space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                {item.icon}
              </div>
              <h3 className="font-headline text-sm font-bold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const caseStudies = [
  {
    company: "Cultural Coder",
    url: "https://culturalcoder.co.zw",
    tagline: "Zimbabwean software studio building for local needs",
    result: "A Zimbabwean software studio with a practical focus on local business systems.",
    industry: "Technology",
    established: "2020",
    badge: "Portfolio",
  },
  {
    company: "Unikvilla",
    url: "https://unikvilla.co.zw",
    tagline: "Boutique lodging and accommodation in Zimbabwe",
    result: "A hospitality business where clear booking records and guest communication matter every day.",
    industry: "Hospitality & Tourism",
    established: "2019",
    badge: "Client",
  },
  {
    company: "Nexus Agronomics",
    url: "https://nexusagronomics.co.zw",
    tagline: "Data-driven farming solutions for smallholder cooperatives",
    result: "An agri-tech business working with data, growers, and operational records.",
    industry: "Agri-tech",
    established: "2022",
    badge: "Parent Company",
  },
];

function CaseStudiesSection() {
  return (
    <section className="relative py-20 md:py-28 content-visibility-auto">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center space-y-3 mb-14"
        >
          <h2 className="font-headline text-fluid-4xl font-bold tracking-tighter max-w-3xl mx-auto">
            Zimbabwean Businesses We <span className="text-gradient">Understand</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {caseStudies.map((cs, i) => (
            <motion.a
              key={cs.company}
              href={cs.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group block p-6 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-headline font-semibold tracking-wider uppercase text-muted-foreground/40">
                  {cs.industry}
                </span>
                <span className="mx-1.5 text-[10px] text-muted-foreground/30">&middot;</span>
                <span className="text-[10px] font-headline tracking-wider uppercase text-muted-foreground/30">
                  Est. {cs.established}
                </span>
                <span className="text-[9px] font-headline tracking-wider uppercase px-1.5 py-0.5 rounded-full border border-primary/20 text-primary/60">
                  {cs.badge}
                </span>
                <span className="h-px flex-1 bg-foreground/10" />
              </div>
              <h3 className="font-headline font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
                {cs.company}
                <ArrowRight className="inline-block ml-1.5 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{cs.tagline}</p>
              <p className="text-sm text-primary/90 font-medium leading-relaxed mb-3">&ldquo;{cs.result}&rdquo;</p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                <Globe className="h-3 w-3" />
                <span className="font-headline tracking-wider uppercase">View Website</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section className="container py-16 relative z-10">
      <div className="text-center mb-10">
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Services &amp; Pilot Pricing
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Engagement-based services for systems work. Pilot pricing for Radbit Ops.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          {
            title: "Systems Architecture",
            price: "$2,500 - $15,000",
            desc: "Cloud infrastructure design, database schemas, API layers, and security models. Scoped engagements.",
            href: "/services",
          },
          {
            title: "AI Integration",
            price: "$1,500 - $10,000",
            desc: "RAG systems, LLM workflows, document parsing, automated classification. Built on your data.",
            href: "/services",
          },
          {
            title: "Radbit Ops Pilot",
            price: "$49/mo",
            desc: "Tender alerts, compliance deadlines, document storage, ZIMRA workflow reminders. Early access.",
            href: "/pilot",
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group rounded-xl border border-border/50 bg-card/30 p-6 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
          >
            <h3 className="font-headline font-bold mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
            <p className="text-2xl font-bold font-headline text-primary mb-2">{item.price}</p>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
            <span className="inline-flex items-center gap-1 text-sm text-primary mt-3 font-medium">
              Learn more <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PilotTeaserSection() {
  return (
    <section className="relative py-16 md:py-20 border-t border-border bg-muted/20">
      <div className="container relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-5"
        >
          <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">
            Pilot: <span className="text-gradient">Radbit Ops</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
            We are piloting Radbit Ops — a compliance and tender-readiness tool for Zimbabwean SMEs. If you run a business in Zim and want cleaner records, apply for early access.
          </p>
          <MagneticButton asChild size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 font-headline text-sm tracking-wider px-8">
            <Link href="/pilot">
              Apply for Early Access
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden border-t border-border content-visibility-auto">
      <WaveField
        className="absolute inset-0 z-0 opacity-10"
        waveCount={1}
        speed={0.1}
        amplitude={15}
        mouseReactivity={0.1}
      />
      <div className="container relative z-10 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <h2 className="font-headline text-fluid-5xl font-bold tracking-tighter text-foreground">
            Diagnose. Build.
            <br />
            <span className="text-gradient">Delegate.</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto">
            Run a quick diagnostic, fix the messiest workflow first, and build from there. No bloated dashboard your team will ignore.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <MagneticButton asChild size="lg" className="font-headline text-sm tracking-wider border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 hover:border-primary/60 px-8">
            <Link href="/contact">
              Start a Conversation
              <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </MagneticButton>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xs text-foreground/30"
        >
          Radbit Ops is in pilot. Apply to participate.
        </motion.p>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full min-h-full bg-background overflow-x-hidden">
      <HeroBackground />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/30 via-background/60 to-background pointer-events-none" />

      <div className="relative z-10">
        <HeroSection />
        <CapabilityStrip />
        <ProofSection />
        <FounderSection />
        <PlatformScopeSection />
        <CaseStudiesSection />
        <TrustSection />
        <PricingTeaser />
        <PilotTeaserSection />
        <section className="container max-w-4xl py-12 relative z-10">
          <NewsletterSignup
            variant="banner"
            title="Stay ahead of ZIMRA deadlines, tender opportunities, and market shifts"
            description="Weekly notes on systems, compliance, and building in Zimbabwe."
            buttonText="Subscribe Free"
            leadMagnet="ZIMRA Tax Deadline Calendar for 2026"
          />
        </section>
        <CTASection />
      </div>
    </div>
  );
}

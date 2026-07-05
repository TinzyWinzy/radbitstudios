"use client";
/* eslint-disable react/no-unescaped-entities */

import { useRef } from "react";
import { ChevronRight, BarChart, TrendingUp, Briefcase, ArrowRight, Shield, Zap, Globe, Target, Lock, Server, Database, BadgeCheck, ExternalLink, Brain } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticButton } from "@/components/magnetic-button";
import { TiltCard } from "@/components/tilt-card";
import { GyeNyame, Sankofa, Dwennimmen } from "@/components/adinkra-symbols";
import { AdUnit } from "@/components/adsense";
import { HeroBackground } from "@/components/hero-background";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { OperationalStressTester } from "@/components/operational-stress-tester";
import dynamic from "next/dynamic";

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
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.98]);

  return (
    <section ref={sectionRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <motion.div style={{ opacity, y, scale }} className="relative z-10 text-center sm:px-4 max-w-5xl mx-auto">

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
          <span className="text-gradient">Digital Leverage</span>
          <br />
          <span>For Zimbabwean SMEs.</span>
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
          className="mt-8 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          You can't grow if you can't let go. Every tender, every compliance check, every cross-border deal runs through you right now. Radbit automates the parts that eat your time — so you can step back without worrying everything falls apart.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4 text-sm text-muted-foreground/60 max-w-xl mx-auto italic"
        >
          Radbit is Zimbabwe's sovereign AI platform — purpose-built for African SMEs. No monthly subscriptions. No data leaving the continent.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <MagneticButton asChild size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 font-headline text-sm tracking-wider px-8">
            <Link href="/assessment">
              Diagnose Your Operations
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
          </MagneticButton>
          <MagneticButton asChild size="default" variant="outline" className="border-foreground/20 text-foreground/70 hover:bg-card hover:text-foreground font-headline text-sm tracking-wider px-8">
            <Link href="/solutions#diagnostic">Run the Stress-Tester</Link>
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground/50"
        >
          <span className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-primary/60" /> Tender Armor</span>
          <span className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary/60" /> Operational Certainty</span>
          <span className="flex items-center gap-1.5"><Globe className="h-3 w-3 text-primary/60" /> Market Protection</span>
          <span className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-primary/60" /> Verified by Radbit</span>
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

function ProblemSolutionSection() {
  const problems = [
    {
      icon: <TrendingUp className="h-4 w-4" />,
      title: "The Founder Bottleneck",
      body: "You cannot scale because you cannot safely delegate. Every decision, every approval, every compliance check runs through you. One absence — and the operation stalls or leaks.",
    },
    {
      icon: <Shield className="h-4 w-4" />,
      title: "The Procurement Trap",
      body: "Your enterprise has the capability to win government and state contracts. But microscopic compliance errors, missing PRAZ filings, or blind spots in award histories get you cut before evaluation.",
    },
    {
      icon: <Globe className="h-4 w-4" />,
      title: "The Trust Deficit",
      body: "Cross-border buyers, diaspora investors, and AfCFTA partners require auditable, bank-grade operational histories. Fragmented paper records make you invisible to the capital pipeline.",
    },
  ];

  const solutions = [
    {
      icon: <Shield className="h-4 w-4" />,
      title: "Tender Intelligence & Compliance Shield",
      body: "An automated pre-flight abort engine that simulates the procurement officer's disqualification process, flags structural gaps, and seals your bid. You arrive at evaluation bulletproof.",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: "The Executive Multiplier",
      body: "Autonomous digital shadows that enforce your exact business rules across inventory, invoices, and logistics. Real-time alerts the instant an operational anomaly occurs — not after losses compound.",
    },
    {
      icon: <Database className="h-4 w-4" />,
      title: "The Global Partner Passport",
      body: "Transform fragmented records into an immutable, verifiable track record on blockchain. The institutional credibility required to satisfy international suppliers, diaspora investors, and AfCFTA compliance.",
    },
  ];

  return (
    <section className="relative py-20 md:py-28 border-y border-border bg-muted content-visibility-auto">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center space-y-3 mb-16"
        >
          <h2 className="font-headline text-fluid-4xl font-bold tracking-tighter text-foreground">
            You Don&apos;t Have a <span className="text-gradient">Tool Problem</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            You have a trust, compliance, and delegation problem. Off-the-shelf software was built for stable markets. Radbit was built for the SADC reality.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-16">
          {problems.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative p-6 rounded-xl border border-red-900/50 bg-red-950/30"
            >
              <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400 mb-4">
                {item.icon}
              </div>
              <h3 className="font-headline text-base font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3 mb-12"
          >
            <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">Radbit Delivers</span>
            <h2 className="font-headline text-fluid-4xl font-bold tracking-tighter text-foreground">
              Three Pillars of <span className="text-gradient">Operational Leverage</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {solutions.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative p-6 rounded-xl border border-border bg-card"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary mb-4">
                  {item.icon}
                </div>
                <h3 className="font-headline text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const steps = [
    {
      icon: <Shield className="h-4 w-4" />,
      title: "Stress-Test",
      body: "A 3-minute check-up that shows you where your business is leaking — compliance gaps you didn't spot, tasks you shouldn't be doing yourself, opportunities you're missing because your records aren't credible.",
      symbol: <Sankofa className="h-8 w-8 text-primary/20" />,
    },
    {
      icon: <Target className="h-4 w-4" />,
      title: "Armor",
      body: "We build the exact system your operation needs — tender tracking that catches every compliance requirement, automations that enforce your business rules, or verified records that open cross-border deals. Each piece plugs into the next.",
      symbol: <GyeNyame className="h-8 w-8 text-primary/20" />,
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: "Delegate with Certainty",
      body: "Your automated system runs the daily work exactly how you'd do it. You only hear from us when something doesn't match the rules you set. You focus on growing the business. We handle the rest.",
      symbol: <Dwennimmen className="h-8 w-8 text-primary/20" />,
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-20 md:py-28 content-visibility-auto">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center space-y-3 mb-12"
        >
          <h2 className="font-headline text-fluid-4xl font-bold tracking-tighter text-foreground">
            Stress-Test. Armor. <span className="text-gradient">Delegate.</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-0 bg-card border border-border rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="relative group p-8 md:p-10 hover:bg-muted transition-colors duration-300"
            >
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity duration-300">
                {step.symbol}
              </div>
              <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                    {step.icon}
                  </div>
                  <span className="font-headline text-xs tracking-[0.2em] text-primary/70">0{i + 1}</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <MagneticButton asChild variant="outline" className="font-headline text-xs tracking-wider border border-primary/20 text-primary/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40">
            <Link href="/sign-up">
              Start Your Journey <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}

function DiagnosticSection() {
  return (
    <section className="relative py-20 md:py-28 border-y border-border bg-muted/30 content-visibility-auto">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center space-y-3 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-2">
            <Zap className="h-3 w-3" />
            Interactive Diagnostic
          </div>
          <h2 className="font-headline text-fluid-4xl font-bold tracking-tighter text-foreground">
            Three Minutes to Know Your <span className="text-gradient">Exact Exposure</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base">
            Tell us your industry and where it hurts — compliance, leaks, employee errors, or cross-border friction. We'll show you exactly what needs fixing.
          </p>
        </motion.div>
        <OperationalStressTester />
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Shield className="h-4 w-4" />,
      title: "Custom Enterprise Architectures",
      body: "No generic templates. No bloated software built for someone else's market. Your system does exactly what your business needs — and nothing you don't.",
      href: "/solutions",
    },
    {
      icon: <Lock className="h-4 w-4" />,
      title: "Asset & Margin Protection",
      body: "We watch the margins, compliance deadlines, and operational risks you don't have time to track. You get alerted the moment something shifts — before it costs you money.",
      href: "/solutions",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: "Operational Multipliers",
      body: "Your business rules run automatically — inventory, invoices, logistics. You step in only when something unusual happens. Everything else runs on its own, exactly how you'd do it.",
      href: "/solutions",
    },
    {
      icon: <Brain className="h-4 w-4" />,
      title: "Agentic System Automation",
      body: "Your system drafts tenders, runs compliance checks, reconciles accounts, and produces the institutional paperwork banks and partners demand — all without you at the keyboard.",
      href: "/solutions",
    },
  ];

  return (
    <section className="relative py-20 md:py-28 content-visibility-auto">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center space-y-3 mb-12"
        >
          <h2 className="font-headline text-fluid-4xl font-bold tracking-tighter text-foreground">
            Four Ways We <span className="text-gradient">Protect Your Business</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base">
            Each piece of the system works on its own and plugs into everything else. No bloat. No unused features. Just what moves your business forward.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <TiltCard>
                <Link href={feature.href}>
                  <div className="group relative rounded-xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:bg-card h-full">
                    <div className="relative z-10 space-y-5">
                      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                        {feature.icon}
                      </div>
                      <h3 className="font-headline text-xl font-bold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.body}</p>
                    </div>
                    <div className="absolute bottom-4 right-4 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 md:translate-x-2 md:group-hover:translate-x-0">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
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
            { value: "4", label: "Regulatory Frameworks", sub: "ZIMRA, PRAZ, NSSA, RBZ — unified in one command centre", icon: <Shield className="h-4 w-4 text-primary" /> },
            { value: "3", label: "Platform Layers", sub: "Assessment, AI agents, and compliance — end-to-end sovereign infrastructure", icon: <BarChart className="h-4 w-4 text-accent" /> },
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
      icon: <Lock className="h-4 w-4" />,
      title: "End-to-End Encrypted",
      body: "All data encrypted at rest and in transit using AES-256 and TLS 1.3. Your operational data is yours alone.",
    },
    {
      icon: <Server className="h-4 w-4" />,
      title: "Stored in Southern Africa",
      body: "Data centres in Johannesburg and Harare. Zero data leaves the region. Compliant with Zimbabwe Cyber and Data Protection Act.",
    },
    {
      icon: <Database className="h-4 w-4" />,
      title: "Never Shared or Sold",
      body: "We do not share, license, or sell your business data. Period. Privacy is our core architecture, not a checkbox.",
    },
    {
      icon: <BadgeCheck className="h-4 w-4" />,
      title: "Regulatory Compliance",
      body: "Designed to meet ZIMRA, PRAZ, NSSA, and RBZ requirements. Your compliance data is audit-ready at all times.",
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
            Built for <span className="text-gradient">Trust &amp; Sovereignty</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Every layer of Radbit is designed to protect your business data and respect Zimbabwean law.
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
    result: "Scaled from solo founder to 8-person team, reduced compliance overhead by 40% using Radbit's regulatory command centre.",
    industry: "Technology",
    established: "2020",
    badge: "Portfolio",
  },
  {
    company: "Unikvilla",
    url: "https://unikvilla.co.zw",
    tagline: "Boutique lodging and accommodation in Zimbabwe",
    result: "Doubled direct bookings and automated 90% of guest communications through Radbit's AI agent infrastructure.",
    industry: "Hospitality & Tourism",
    established: "2019",
    badge: "Client",
  },
  {
    company: "Nexus Agronomics",
    url: "https://nexusagronomics.co.zw",
    tagline: "Data-driven farming solutions for smallholder cooperatives",
    result: "Secured $50K in matched grant funding and won three government supply contracts via Radbit's tender intelligence.",
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
            Enterprises Already <span className="text-gradient">Winning with Radbit</span>
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

function CuratedBriefsSection() {
  const briefs = [
    {
      title: "Zimbabwe Budget 2026 Analysis",
      summary: "Key takeaways for enterprises: tax relief on digital equipment, expanded MSME lending facilities, and new export incentives for agro-processors.",
      category: "Policy",
      action: "Review how the new digital equipment tax relief applies to your business.",
    },
    {
      title: "Tender Alert: Govt. IT Infrastructure",
      summary: "POTRAZ is accepting proposals for rural connectivity infrastructure. Bids close 15 June. Estimated contract value: $2.5M.",
      category: "Tender",
      action: "Check if your business meets the procurement thresholds.",
    },
    {
      title: "Sector Insight: Agri-Tech Growth",
      summary: "Zimbabwean agri-tech startups raised $4.2M in Q1 2026, up 40% YoY. Mobile-based supply chain solutions lead adoption.",
      category: "Market Intelligence",
      action: "Explore how digital tools can optimize your supply chain.",
    },
  ];

  const categoryIcons: Record<string, React.ReactNode> = {
    Policy: <Shield className="h-3 w-3" />,
    Tender: <Briefcase className="h-3 w-3" />,
    "Market Intelligence": <TrendingUp className="h-3 w-3" />,
  };

  return (
    <section className="relative py-20 md:py-28 content-visibility-auto">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center space-y-3 mb-10"
        >
          <h2 className="font-headline text-fluid-4xl font-bold tracking-tighter text-foreground">
            Intelligence That <span className="text-gradient">Moves Your Business</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base">
            AI-curated news, tenders, and market insights tailored to your industry.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto"
        >
          {briefs.map((brief) => (
            <motion.div
              key={brief.title}
              variants={itemVariants}
              className="group relative"
            >
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-b from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
              <div className="relative rounded-xl border border-border bg-card p-6 h-full flex flex-col group-hover:bg-card transition-colors duration-300">
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground/40 font-headline tracking-wider uppercase">
                  {categoryIcons[brief.category]}
                  <span>{brief.category}</span>
                </div>
                <h3 className="font-headline text-sm font-bold text-foreground/90 mb-2 leading-snug">
                  {brief.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {brief.summary}
                </p>
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-primary flex items-center gap-1.5">
                    <Zap className="h-3 w-3 shrink-0" />
                    {brief.action}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-muted-foreground mb-4">Personalized briefs generated daily from live data sources.</p>
          <MagneticButton asChild size="default" className="font-headline text-sm tracking-wider border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60">
            <Link href="/sign-up">
              Get Your First Brief <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}

function EssentialSection() {
  const essentials = [
    {
      icon: Shield,
      title: "Fiscal Device Compliance",
      desc: "ZIMRA mandates fiscal devices for all VAT-registered businesses (turnover > US$40,000). Radbit's FDG API integration keeps you compliant without hardware costs.",
      badge: "LEGAL MANDATE",
      href: "/api/fiscal",
    },
    {
      icon: TrendingUp,
      title: "ZiG Currency Intelligence",
      desc: "Navigate Zimbabwe's dual-currency economy with real-time ZiG rates, PAYE tax tables, and automatic tax obligation conversion between USD and ZiG.",
      badge: "DAILY TOOL",
      href: "/api/zig",
    },
    {
      icon: Target,
      title: "NDS2 & Constitutional Alignment",
      desc: "Align your strategy with Zimbabwe's National Development Strategy and Constitutional provisions — essential for government tenders and regulatory compliance.",
      badge: "TENDER READY",
      href: "/about",
    },
  ];

  return (
    <section className="container py-16 relative z-10">
      <div className="text-center mb-10">
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Why Radbit is Essential
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Not just helpful — required. Zimbabwean law and regulation make these tools indispensable for your business.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {essentials.map((item) => (
          <div
            key={item.title}
            className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                {item.badge}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-headline text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section className="container py-16 relative z-10">
      <div className="text-center mb-10">
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Solutions for Every Budget
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          From a free AI platform to full enterprise systems — find the right fit for your business.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          {
            title: "Web Packages",
            price: "From $150",
            desc: "Professional websites built for the African market.",
            href: "/pricing#web",
          },
          {
            title: "AI Platform",
            price: "Free — $15/mo",
            desc: "AI tools, tender intelligence, and compliance — start free.",
            href: "/pricing#saas",
          },
          {
            title: "ERP Systems",
            price: "From $49/mo",
            desc: "Integrated accounting, inventory, HR, and CRM. ZIMRA compliant.",
            href: "/pricing#erp",
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
              View plans <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link href="/pricing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
          See all pricing <ArrowRight className="h-4 w-4" />
        </Link>
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
            Step Back Without
            <br />
            <span className="text-gradient">Losing Command.</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto">
            Three minutes to your first stress-test. One deployment to bulletproof your operations. No generic dashboards. No rented developer hours.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <MagneticButton asChild size="lg" className="font-headline text-sm tracking-wider border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 hover:border-primary/60 animate-glow-pulse px-8">
            <Link href="/assessment">
              Deploy Your Armor
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
          Enterprises in manufacturing, financial services, agri-tech, and professional services already use Radbit.
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
        <ProblemSolutionSection />
        <HowItWorksSection />
        <DiagnosticSection />
        <FeaturesSection />
        <PlatformScopeSection />
        <CaseStudiesSection />
        <CuratedBriefsSection />
        <TrustSection />
        <section className="container mx-auto py-8 max-w-4xl relative z-10">
          <AdUnit slot="landing-content" format="rectangle" className="min-h-[90px]" />
        </section>
        <EssentialSection />
        <PricingTeaser />
        <section className="container max-w-4xl py-12 relative z-10">
          <NewsletterSignup
            variant="banner"
            title="Stay ahead of ZIMRA deadlines, tender opportunities, and market shifts"
            description="Join 500+ Zimbabwean entrepreneurs who read our weekly newsletter."
            buttonText="Subscribe Free"
            leadMagnet="ZIMRA Tax Deadline Calendar for 2026"
          />
        </section>
        <CTASection />
      </div>
    </div>
  );
}

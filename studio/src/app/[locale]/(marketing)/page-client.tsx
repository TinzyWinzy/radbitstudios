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
          <span className="text-gradient">Practical Systems</span>
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
          You can't grow if every tender, compliance check, invoice, and follow-up still runs through you. Radbit helps you turn that daily admin into a system your team can actually use.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4 text-sm text-muted-foreground/60 max-w-xl mx-auto italic"
        >
          Built in Zimbabwe for local workflows: tenders, compliance records, tax deadlines, payments, and the paperwork buyers ask for.
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
          <span className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-primary/60" /> Tender checks</span>
          <span className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary/60" /> Deadline reminders</span>
          <span className="flex items-center gap-1.5"><Globe className="h-3 w-3 text-primary/60" /> Export records</span>
          <span className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-primary/60" /> Document vault</span>
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
      body: "The business works because you remember everything. That is useful early on, but it breaks when tenders, staff, suppliers, and tax dates all need attention at once.",
    },
    {
      icon: <Shield className="h-4 w-4" />,
      title: "The Procurement Trap",
      body: "A capable company can still lose before evaluation because one certificate expired, one form is missing, or the tender pack was assembled in a rush.",
    },
    {
      icon: <Globe className="h-4 w-4" />,
      title: "The Trust Deficit",
      body: "Buyers, banks, and diaspora partners ask for proof. Scattered receipts, old spreadsheets, and WhatsApp threads make that proof hard to provide.",
    },
  ];

  const solutions = [
    {
      icon: <Shield className="h-4 w-4" />,
      title: "Tender and Compliance Checks",
      body: "Radbit helps you match tenders to your profile, check the required documents, and spot gaps before submission day.",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: "Daily Operating System",
      body: "Put invoices, stock, tasks, approvals, and reminders in one place so work moves without everything living in the founder's head.",
    },
    {
      icon: <Database className="h-4 w-4" />,
      title: "Cleaner Business Records",
      body: "Keep the records partners ask for: certificates, invoices, delivery notes, tax documents, project history, and supporting files.",
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
            You have a records, compliance, and delegation problem. Radbit focuses on the paperwork and workflows Zimbabwean operators deal with every week.
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
            Three Ways Radbit <span className="text-gradient">Helps</span>
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
      body: "A short check-up that shows where your records, deadlines, handovers, and tender readiness need work.",
      symbol: <Sankofa className="h-8 w-8 text-primary/20" />,
    },
    {
      icon: <Target className="h-4 w-4" />,
      title: "Set Up",
      body: "Start with the system your operation needs most: tender tracking, a compliance file, invoice workflows, reminders, or a cleaner document trail.",
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
            Tell us your industry and where the admin hurts: compliance, tender documents, stock, staff handovers, or cross-border paperwork. We'll show you what to fix first.
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
      title: "Systems That Fit the Work",
      body: "Start with the workflow you actually have: tenders, invoices, stock, documents, approvals, or customer follow-up.",
      href: "/solutions",
    },
    {
      icon: <Lock className="h-4 w-4" />,
      title: "Deadlines and Risk Flags",
      body: "Keep tax dates, registration renewals, open invoices, and missing documents visible before they become urgent.",
      href: "/solutions",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: "Team Handover",
      body: "Give staff a clear process to follow so routine work does not depend on one person's memory.",
      href: "/solutions",
    },
    {
      icon: <Brain className="h-4 w-4" />,
      title: "Useful AI Where It Helps",
      body: "Use AI to draft, summarize, compare, and check documents while you keep final judgment and approvals in human hands.",
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
      icon: <Lock className="h-4 w-4" />,
      title: "End-to-End Encrypted",
      body: "We use Firebase and modern web security controls to protect account and business data in transit and at rest.",
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
      title: "Regulatory Compliance",
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
            Business records are sensitive. Radbit keeps the language plain and the controls practical.
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

function CuratedBriefsSection() {
  const briefs = [
    {
      title: "Zimbabwe Budget 2026 Analysis",
      summary: "Policy and tax updates can change quickly. Radbit helps teams keep notes, dates, and source documents in one place before decisions are made.",
      category: "Policy",
      action: "Save the source notice and assign someone to review the impact.",
    },
    {
      title: "Tender Alert: Govt. IT Infrastructure",
      summary: "Tender opportunities often move across portals, newspapers, and private procurement pages. Missing the document pack is usually the real loss.",
      category: "Tender",
      action: "Check eligibility, required certificates, and closing dates before drafting.",
    },
    {
      title: "Sector Insight: Agri-Tech Growth",
      summary: "Agriculture teams need reliable records: field activity, inputs, buyers, delivery notes, and compliance documents.",
      category: "Market Intelligence",
      action: "Start by cleaning the records buyers and funders already ask for.",
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
            Briefs, reminders, and records your team can act on without hunting through chats.
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
          <p className="text-sm text-muted-foreground mb-4">Useful notes are only useful when the source and next step are clear.</p>
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
      desc: "ZIMRA's Fiscal Device Gateway rules require fiscal days, receipt sequencing, QR data, and submission flows for fiscal devices. Radbit is built around that workflow.",
      badge: "ZIMRA WORKFLOW",
      href: "/api/fiscal",
    },
    {
      icon: TrendingUp,
      title: "ZiG Currency Intelligence",
      desc: "Keep ZiG and USD amounts clear in your records, and track the tax tables and notices your accountant needs to review.",
      badge: "DAILY TOOL",
      href: "/api/zig",
    },
    {
      icon: Target,
      title: "NDS2 & Constitutional Alignment",
      desc: "Store the policy, sector, and compliance references your tender team uses when a bid asks for local context.",
      badge: "BID SUPPORT",
      href: "/about",
    },
  ];

  return (
    <section className="container py-16 relative z-10">
      <div className="text-center mb-10">
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Where Radbit Helps
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          The goal is simple: fewer missed dates, cleaner records, and less last-minute document chasing.
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
          Start small, then add the workflows your team actually uses.
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
            desc: "AI tools, tender tracking, and compliance records. Start free.",
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
            Run a quick check, fix the messiest workflow first, and build from there. No bloated dashboard your team will ignore.
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
              Start the Check
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

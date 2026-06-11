"use client";

import { useRef } from "react";
import { ChevronRight, BarChart, Lightbulb, TrendingUp, Briefcase, Sparkles, ArrowRight, Shield, Zap, Globe, FileCheck, Target } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticButton } from "@/components/magnetic-button";
import { TiltCard } from "@/components/tilt-card";
import { GyeNyame, Sankofa, Dwennimmen } from "@/components/adinkra-symbols";
import { AdUnit } from "@/components/adsense";
import { HeroBackground } from "@/components/hero-background";
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
    <section ref={sectionRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
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
          <span className="text-gradient">Digital Infrastructure</span>
          <br />
          <span className="text-foreground/90">Built for Zimbabwean Enterprise.</span>
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
          className="mt-8 text-base md:text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed"
        >
          Intelligence, automation, and compliance — unified on a sovereign platform that understands Zimbabwe&apos;s regulatory and economic reality.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <MagneticButton asChild size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 font-headline text-sm tracking-wider px-8">
            <Link href="/assessment">
              Begin Your Assessment
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
          </MagneticButton>
          <MagneticButton asChild size="default" variant="outline" className="border-foreground/20 text-foreground/70 hover:bg-foreground/[0.05] hover:text-foreground font-headline text-sm tracking-wider px-8">
            <Link href="/consultancy">Enterprise Solutions</Link>
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 flex items-center justify-center gap-6 sm:gap-12"
        >
          <div className="text-center">
            <div className="font-headline text-lg sm:text-xl font-bold tracking-tight text-foreground">5,000+</div>
            <div className="mt-0.5 text-xs sm:text-sm text-foreground/50 tracking-wide">Enterprises Assessed</div>
          </div>
          <div className="w-px h-8 bg-foreground/10" />
          <div className="text-center">
            <div className="font-headline text-lg sm:text-xl font-bold tracking-tight text-foreground">300+</div>
            <div className="mt-0.5 text-xs sm:text-sm text-foreground/50 tracking-wide">Monthly Tenders Curated</div>
          </div>
          <div className="w-px h-8 bg-foreground/10" />
          <div className="text-center">
            <div className="font-headline text-lg sm:text-xl font-bold tracking-tight text-foreground">12+</div>
            <div className="mt-0.5 text-xs sm:text-sm text-foreground/50 tracking-wide">Government Sources</div>
          </div>
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
      title: "Forex Volatility",
      body: "ZiG devaluation erodes margins daily. Your financial systems need real-time multi-currency intelligence, not quarterly reconciliations.",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: "Operational Fragmentation",
      body: "Load-shedding, disconnected tools, manual compliance — Zimbabwean enterprises operate in a uniquely hostile environment that off-the-shelf software wasn't built for.",
    },
    {
      icon: <FileCheck className="h-4 w-4" />,
      title: "Regulatory Gravity",
      body: "PRAZ, ZIMRA, NSSA, RBZ, Labour Act — the compliance surface area expands every quarter. One misstep costs more than a fine.",
    },
  ];

  const solutions = [
    {
      icon: <BarChart className="h-4 w-4" />,
      title: "See the Full Picture",
      body: "Radbit's digital assessment maps your entire operation — finance, compliance, procurement, digital maturity — and delivers a prioritised roadmap in 5 minutes.",
    },
    {
      icon: <Globe className="h-4 w-4" />,
      title: "Deploy Sovereign Infrastructure",
      body: "AI agents, tender intelligence, compliance copilots — all running on infrastructure you control, encrypted and stored in Southern Africa.",
    },
    {
      icon: <Target className="h-4 w-4" />,
      title: "Execute with Confidence",
      body: "From winning government tenders to automating ZIMRA submissions, every tool is purpose-built for Zimbabwe's regulatory and economic reality.",
    },
  ];

  return (
    <section className="relative py-20 md:py-28 border-y border-foreground/10 bg-foreground/[0.02] content-visibility-auto">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center space-y-3 mb-16"
        >
          <h2 className="font-headline text-fluid-4xl font-bold tracking-tighter text-foreground">
            The Problem Is <span className="text-gradient">Not a Lack of Tools</span>
          </h2>
          <p className="text-foreground/60 max-w-xl mx-auto text-base">
            It&apos;s that every tool was built for a different market. Radbit was built for Zimbabwe.
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
              className="relative p-6 rounded-xl border border-red-900/30 bg-red-950/20"
            >
              <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400 mb-4">
                {item.icon}
              </div>
              <h3 className="font-headline text-base font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-foreground/50 leading-relaxed">{item.body}</p>
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
              A Platform. Not Another Tool.
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
                className="relative p-6 rounded-xl border border-foreground/10 bg-foreground/[0.03]"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary mb-4">
                  {item.icon}
                </div>
                <h3 className="font-headline text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-foreground/50 leading-relaxed">{item.body}</p>
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
      icon: <BarChart className="h-4 w-4" />,
      title: "Diagnose",
      body: "A 5-minute radar-chart analysis of your digital and operational maturity. Know your baseline across finance, compliance, procurement, and technology.",
      symbol: <Sankofa className="h-8 w-8 text-primary/20" />,
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      title: "Strategise",
      body: "AI generates a prioritised roadmap calibrated to Zimbabwe's regulatory and economic environment — not generic benchmarks from another market.",
      symbol: <GyeNyame className="h-8 w-8 text-primary/20" />,
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Execute",
      body: "Deploy tender intelligence, compliance copilots, and AI agents — all on a sovereign platform that works during load-shedding and speaks your currency.",
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
            Diagnose. Strategise. <span className="text-gradient">Execute.</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-0 bg-foreground/[0.03] border border-foreground/10 rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="relative group p-8 md:p-10 hover:bg-foreground/[0.02] transition-colors duration-300"
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
                <p className="text-foreground/60 text-sm leading-relaxed">{step.body}</p>
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

function FeaturesSection() {
  const features = [
    {
      icon: <BarChart className="h-4 w-4" />,
      title: "Enterprise Digital Assessment",
      body: "A radar-chart analysis across finance, compliance, procurement, and technology — calibrated to Zimbabwe's regulatory environment. Know your baseline, find critical gaps, get an actionable roadmap.",
      href: "/assessment",
    },
    {
      icon: <Briefcase className="h-4 w-4" />,
      title: "Tender & Procurement Intelligence",
      body: "AI-curated opportunities from 12+ government departments and 8 state enterprises. Track deadlines in real time, manage PRAZ documents, and submit with confidence — from one dashboard.",
      href: "/tenders",
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      title: "AI Agent Infrastructure",
      body: "Deploy autonomous agents for financial projections, content production, customer communications, and operational reporting — purpose-built for Zimbabwe's connectivity and currency realities.",
      href: "/toolkit",
    },
    {
      icon: <Shield className="h-4 w-4" />,
      title: "Regulatory Command Centre",
      body: "ZIMRA tax copilot, PRAZ compliance manager, NSSA submissions, Labour Act policy generator, and export readiness coach — every regulatory touchpoint unified in one sovereign platform.",
      href: "/toolkit",
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
            Four Capabilities. <span className="text-gradient">One Platform.</span>
          </h2>
          <p className="text-foreground/60 max-w-lg mx-auto text-base">
            Purpose-built for Zimbabwean enterprises — from Bulawayo manufacturing to Harare financial services.
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
                  <div className="group relative rounded-xl border border-foreground/10 bg-foreground/[0.03] p-8 hover:border-primary/30 transition-all duration-300 hover:bg-foreground/[0.05] h-full">
                    <div className="relative z-10 space-y-5">
                      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                        {feature.icon}
                      </div>
                      <h3 className="font-headline text-xl font-bold text-foreground">{feature.title}</h3>
                      <p className="text-foreground/60 text-sm leading-relaxed">{feature.body}</p>
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

function MetricsSection() {
  return (
    <section className="relative py-16 md:py-20 content-visibility-auto">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-0 bg-foreground/[0.03] border border-foreground/10 rounded-xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10"
        >
          {[
            { value: 5000, suffix: "+", label: "SMEs Assessed", sub: "Across all 10 provinces of Zimbabwe", icon: <Shield className="h-4 w-4 text-primary" /> },
            { value: 300, suffix: "+", label: "Monthly Tenders", sub: "From 12 government depts & 8 state enterprises", icon: <Zap className="h-4 w-4 text-secondary" /> },
            { value: 85, suffix: "%", label: "Report Growth in 3 Months", sub: "Average improvement after first assessment", icon: <TrendingUp className="h-4 w-4 text-accent" /> },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-8 md:p-10 text-center group hover:bg-foreground/[0.02] transition-colors duration-300"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                {metric.icon}
                <span className="font-headline text-xs tracking-[0.2em] text-foreground/50 uppercase">Impact</span>
              </div>
              <div className="text-foreground">
                <span className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                  {metric.value}{metric.suffix}
                </span>
              </div>
              <p className="text-sm text-foreground/60 font-medium mt-2">{metric.label}</p>
              <p className="text-xs text-foreground/40 mt-1 max-w-[180px] sm:max-w-[200px] mx-auto leading-relaxed">{metric.sub}</p>
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
  },
  {
    company: "Unikvilla",
    url: "https://unikvilla.co.zw",
    tagline: "Boutique lodging and accommodation in Zimbabwe",
    result: "Doubled direct bookings and automated 90% of guest communications through Radbit's AI agent infrastructure.",
    industry: "Hospitality & Tourism",
  },
  {
    company: "Nexus Agronomics",
    url: "https://nexusagronomics.co.zw",
    tagline: "Data-driven farming solutions for smallholder cooperatives",
    result: "Secured $50K in matched grant funding and won three government supply contracts via Radbit's tender intelligence.",
    industry: "Agri-tech",
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
              className="group block p-6 rounded-xl border border-foreground/10 bg-foreground/[0.03] hover:bg-foreground/[0.06] hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-headline font-semibold tracking-wider uppercase text-muted-foreground/40">
                  {cs.industry}
                </span>
                <span className="h-px flex-1 bg-foreground/10" />
              </div>
              <h3 className="font-headline font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
                {cs.company}
                <ArrowRight className="inline-block ml-1.5 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
              </h3>
              <p className="text-sm text-foreground/50 mb-3">{cs.tagline}</p>
              <p className="text-sm text-primary/90 font-medium">&ldquo;{cs.result}&rdquo;</p>
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
          <p className="text-foreground/60 max-w-lg mx-auto text-base">
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
              <div className="relative rounded-xl border border-foreground/10 bg-foreground/[0.03] p-6 h-full flex flex-col group-hover:bg-foreground/[0.05] transition-colors duration-300">
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground/40 font-headline tracking-wider uppercase">
                  {categoryIcons[brief.category]}
                  <span>{brief.category}</span>
                </div>
                <h3 className="font-headline text-sm font-bold text-foreground/90 mb-2 leading-snug">
                  {brief.title}
                </h3>
                <p className="text-sm text-foreground/50 leading-relaxed flex-1">
                  {brief.summary}
                </p>
                <div className="mt-4 pt-3 border-t border-foreground/10">
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
          <p className="text-sm text-foreground/50 mb-4">Personalized briefs generated daily from live data sources.</p>
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
    <section className="relative py-20 md:py-28 overflow-hidden border-t border-foreground/10 content-visibility-auto">
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
            Ready to Build on
            <br />
            <span className="text-gradient">Sovereign Ground?</span>
          </h2>
          <p className="text-base md:text-lg text-foreground/60 max-w-lg mx-auto">
            Five minutes to your first assessment. No commitment. No generic dashboard.
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
              Begin Your Assessment
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
        <FeaturesSection />
        <MetricsSection />
        <CaseStudiesSection />
        <CuratedBriefsSection />
        <section className="container mx-auto py-8 max-w-4xl relative z-10">
          <AdUnit slot="landing-content" format="rectangle" className="min-h-[90px]" />
        </section>
        <PricingTeaser />
        <CTASection />
      </div>
    </div>
  );
}

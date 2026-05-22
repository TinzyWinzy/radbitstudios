"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Sprout, Factory, FileSearch, Shield, BarChart,
  Bell, ChevronRight, CheckCircle2, Globe,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


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

const problems = [
  {
    icon: <FileSearch className="h-5 w-5" />,
    title: "Missed Procurement Thresholds",
    body: "Ministry of Agriculture tenders published with tight deadlines. Without daily scanning, you miss the submission window by days.",
  },
  {
    icon: <Factory className="h-5 w-5" />,
    title: "Opaque Supply Chains",
    body: "No visibility into upstream inputs or downstream demand. Price fluctuations and supply shocks hit without warning.",
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: "NGO Grants Going Unnoticed",
    body: "Millions in development funding for agri-tech and manufacturing projects go unawarded because SMEs don't know they exist.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "PRAZ Compliance Burden",
    body: "Procurement Regulatory Authority of Zimbabwe filings are complex. One missed form can disqualify you from bidding.",
  },
];

const solutions = [
  {
    icon: <BarChart className="h-5 w-5" />,
    title: "Daily Personalized Briefs",
    body: "AI-curated procurement alerts from 12+ government departments, tailored to your NAICS codes and business size.",
    tags: ["Daily", "Personalized", "Procurement"],
  },
  {
    icon: <Bell className="h-5 w-5" />,
    title: "Automated Tender Matching",
    body: "Machine learning matches your capabilities to live tenders. Get notified only when you're a genuine contender.",
    tags: ["AI Matching", "Tenders", "Alerts"],
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "PRAZ Compliance Manager",
    body: "Step-by-step guidance through every PRAZ filing. Auto-filled forms, deadline tracking, and audit-ready documentation.",
    tags: ["PRAZ", "Compliance", "Audit"],
  },
  {
    icon: <Sprout className="h-5 w-5" />,
    title: "Grant Intelligence Engine",
    body: "Track NGO, development bank, and multilateral funding opportunities. Get match scores and proposal templates.",
    tags: ["Grants", "NGO", "Funding"],
  },
];

const features = [
  {
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: "Procurement Calendar",
    body: "See every upcoming tender deadline in one view. Sync to your calendar with one click.",
  },
  {
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: "Competitor Intelligence",
    body: "See who won past contracts, at what price, and identify your competitive position.",
  },
  {
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: "Supply Chain Radar",
    body: "AI monitors commodity prices, weather patterns, and logistics routes that affect your input costs.",
  },
  {
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: "Bid Readiness Score",
    body: "Know exactly where your bid is weak before you submit. Improve your win rate with data-driven insights.",
  },
];

export default function AgriTechManufacturingPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -40]);

  return (
    <div className="flex flex-col w-full min-h-full bg-background overflow-x-hidden">
      <section ref={sectionRef} className="relative min-h-[75vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-green-500/5 via-background to-background" />
        <motion.div style={{ opacity, y }} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/[0.07] text-sm font-medium text-primary/80 mb-8"
          >
            <Sprout className="h-3.5 w-3.5" />
            Agri-Tech & Manufacturing Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-white"
          >
            Win National Contracts
            <br />
            <span className="text-gradient">Supply Chain Intelligence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Stop missing Ministry of Agriculture procurement windows. Get daily personalized briefs, automated tender matching, and PRAZ compliance — all in one platform built for Zimbabwean agri-tech and manufacturing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="font-headline text-sm tracking-wider">
              <Link href="/tenders">
                Explore Tender Intelligence
                <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-headline text-sm tracking-wider border border-white/20 text-white/60 hover:bg-white/5 hover:text-white">
              <Link href="/assessment">Start Free Assessment</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative py-20 md:py-28">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center space-y-3 mb-12"
          >
            <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">The Problem</span>
            <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-white">
              Opportunities Are <span className="text-gradient">Passing You By</span>
            </h2>
            <p className="text-white/60 max-w-lg mx-auto text-base">
              Government contracts, NGO grants, and supply chain advantages are out there. The question is whether you see them in time.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto"
          >
            {problems.map((problem) => (
              <motion.div key={problem.title} variants={itemVariants}>
                <Card className="border border-white/10 bg-white/[0.03] h-full">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400 mb-2">
                      {problem.icon}
                    </div>
                    <CardTitle className="font-headline text-lg text-white">{problem.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/60 text-sm leading-relaxed">{problem.body}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 border-t border-white/10">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center space-y-3 mb-12"
          >
            <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">The Solution</span>
            <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-white">
              Tender Intelligence for <span className="text-gradient">Agri-Tech & Manufacturing</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto"
          >
            {solutions.map((solution) => (
              <motion.div key={solution.title} variants={itemVariants}>
                <Card className="border border-white/10 bg-white/[0.03] h-full group hover:border-primary/30 transition-all duration-300">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary mb-2">
                      {solution.icon}
                    </div>
                    <CardTitle className="font-headline text-lg text-white">{solution.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-white/60 text-sm leading-relaxed">{solution.body}</CardDescription>
                    <div className="flex flex-wrap gap-2">
                      {solution.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs border-white/10 text-white/50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center space-y-3 mb-12"
          >
            <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">Key Features</span>
            <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-white">
              Win More Bids with <span className="text-gradient">Data-Driven Intelligence</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 h-full hover:bg-white/[0.06] transition-colors duration-300">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-headline text-sm font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-xs leading-relaxed">{feature.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-green-500/10 via-transparent to-primary/10" />
        <div className="container relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-white">
              Ready to Win?
              <br />
              <span className="text-gradient">Start Your Tender Intelligence.</span>
            </h2>
            <p className="text-base md:text-lg text-white/60 max-w-lg mx-auto">
              Get your first personalized procurement brief today. No credit card required.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Button asChild size="lg" className="font-headline text-sm tracking-wider px-8">
              <Link href="/tenders">
                Explore Tender Intelligence
                <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

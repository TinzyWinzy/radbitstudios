"use client";

import { motion } from "framer-motion";
import { FileCheck, Briefcase, Shield, Share2, ScrollText, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const requiredDocs = [
  { name: "PRAZ Registration Certificate", source: "Procurement Regulatory Authority of Zimbabwe" },
  { name: "ZIMRA Tax Clearance Certificate", source: "Valid/Expired check" },
  { name: "NSSA Compliance Certificate", source: "National Social Security Authority" },
  { name: "ZIMRA Fiscal Device Certificate", source: "Fiscal Device Gateway" },
  { name: "Company Registration (CR14/CR5)", source: "Registrar of Companies" },
  { name: "Professional Licenses", source: "Industry-specific" },
];

const benefits = [
  {
    icon: Briefcase,
    title: "Tender-Ready Compliance",
    description: "Radbit unifies all compliance certificates into a single dashboard. Download a tender-specific compliance pack in one click.",
  },
  {
    icon: Shield,
    title: "PRAZ + ZIMRA + NSSA",
    description: "Three critical compliance checks for Zimbabwean tenders. Radbit tracks all of them and alerts you before any expire.",
  },
  {
    icon: Share2,
    title: "Share with Bidding Teams",
    description: "Generate a shareable compliance report that you can attach to tender bids. Shows active certificates and expiry dates.",
  },
  {
    icon: ScrollText,
    title: "Tender Matching",
    description: "Radbit cross-references your compliance status with available tenders. Only see bids you're qualified to win.",
  },
];

export default function TenderComplianceBridgePageClient() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.06),transparent_60%)]" />

      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="container">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <FileCheck className="size-4" />
              Tender Compliance
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              Bridge Your Compliance with{" "}
              <span className="text-gradient">Tender Readiness</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground">
              Every Zimbabwean tender requires compliance certificates. Radbit tracks your PRAZ, ZIMRA, NSSA and fiscal device status so you never miss a bid opportunity.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/sign-up" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40">
                  Start Your Compliance Check
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Link href="/tenders" className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-8 text-sm font-medium transition-colors hover:bg-accent">
                Browse Tenders
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container">
          <motion.div
            className="mx-auto mb-12 max-w-2xl text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
              Documents You Need for{" "}
              <span className="text-gradient">Zimbabwe Tenders</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-muted-foreground">
              These compliance documents are required for most public and private tenders in Zimbabwe. Radbit tracks them all.
            </motion.p>
          </motion.div>
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {requiredDocs.map((doc, i) => (
              <motion.div
                key={doc.name}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-5"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <FileCheck className="size-4" />
                </div>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.source}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container">
          <motion.div
            className="mx-auto mb-12 max-w-2xl text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
              How the Bridge{" "}
              <span className="text-gradient">Works</span>
            </motion.h2>
          </motion.div>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {benefits.map((b) => (
              <motion.div
                key={b.title}
                className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <b.icon className="size-5" />
                </div>
                <h3 className="font-headline text-lg font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container">
          <motion.div
            className="mx-auto max-w-3xl"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <Users className="size-6 text-primary" />
                <h3 className="font-headline text-xl font-semibold">Tender Armor: Pre-Flight Check</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Before you bid, run a Tender Armor check. Radbit scans your compliance posture against the tender's requirements and identifies gaps before you submit. Pass/fail/warn status for each compliance category.
              </p>
              <Button asChild className="mt-6">
                <Link href="/tenders" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25">
                  Try Tender Armor
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.p variants={itemVariants} className="text-sm text-muted-foreground mb-4">Related Features</motion.p>
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3">
              <Link href="/compliant-receipts" className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Compliant Receipts</Link>
              <Link href="/vat-threshold-alerts" className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">VAT Threshold Alerts</Link>
              <Link href="/offline-mode" className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Offline Mode</Link>
              <Link href="/penalty-protection" className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Penalty Protection</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container">
          <motion.div
            className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="text-center">
              <Briefcase className="mx-auto mb-4 size-12 text-primary" />
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to Win<span className="text-gradient"> More Tenders?</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start tracking your compliance and discover tenders you're qualified to win — all in one place.
              </p>
              <Button asChild className="mt-8">
                <Link href="/sign-up" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40">
                  Get Started Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

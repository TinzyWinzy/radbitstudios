"use client";

import { motion } from "framer-motion";
import { Bell, TrendingUp, Shield, Zap, Smartphone, RefreshCw, ArrowRight, CheckCircle } from "lucide-react";
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

const features = [
  {
    icon: TrendingUp,
    title: "Real-Time Turnover Tracking",
    description: "Radbit automatically tracks your sales across all channels and calculates your rolling 12-month turnover against the ZIMRA VAT threshold.",
  },
  {
    icon: Bell,
    title: "Multi-Channel Alerts",
    description: "Get notified via WhatsApp, email, and in-app before you cross the US$60,000 VAT registration threshold. Choose your lead time (30, 60, or 90 days).",
  },
  {
    icon: Shield,
    title: "Penalty Avoidance",
    description: "Late VAT registration carries penalties of up to 100% of tax due. Radbit's alerts ensure you register on time, every time.",
  },
  {
    icon: Smartphone,
    title: "WhatsApp Integration",
    description: "Check your threshold status anytime by sending 'VAT threshold' on WhatsApp. Receive automatic alerts without logging in.",
  },
  {
    icon: RefreshCw,
    title: "Automatic Recalculation",
    description: "Every receipt you issue through Radbit updates your running total. No manual spreadsheets or guesswork.",
  },
  {
    icon: Zap,
    title: "Instant Registration",
    description: "When you hit your alert threshold, Radbit guides you through ZIMRA VAT registration step by step with pre-filled forms.",
  },
];

const thresholds = [
  { label: "VAT Registration Threshold", value: "US$60,000", detail: "Annual turnover" },
  { label: "Fiscal Device Mandate", value: "US$10,000", detail: "Annual turnover" },
  { label: "Penalty for Non-Compliance", value: "Up to US$5,000", detail: "Per ZIMRA regulation" },
  { label: "Alert Lead Time", value: "30 / 60 / 90 days", detail: "Configurable" },
];

export default function VatThresholdAlertsPageClient() {
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
              <Bell className="size-4" />
              ZIMRA Compliance Tool
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              Never Miss the{" "}
              <span className="text-gradient">VAT Threshold</span> Again
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground">
              Radbit monitors your turnover in real-time and alerts you before your SME crosses ZIMRA's US$60,000 VAT registration threshold. Avoid penalties, stay compliant.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/zimra-fiscal-device-registration" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40">
                  Register Your Fiscal Device
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Link href="/resources/tools/vat-calculator" className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-8 text-sm font-medium transition-colors hover:bg-accent">
                Try VAT Calculator
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
              Know Your <span className="text-gradient">Thresholds</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-muted-foreground">
              ZIMRA's fiscal regulations are clear. Radbit makes sure you never cross them unknowingly.
            </motion.p>
          </motion.div>
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {thresholds.map((t, i) => (
              <motion.div
                key={t.label}
                className="rounded-xl border border-border/50 bg-card p-6"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-sm text-muted-foreground">{t.label}</p>
                <p className="mt-1 font-headline text-2xl font-bold">{t.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.detail}</p>
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
              How It <span className="text-gradient">Works</span>
            </motion.h2>
          </motion.div>
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <motion.div
                key={f.title}
                className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-headline text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
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
              <Link href="/offline-mode" className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Offline Mode</Link>
              <Link href="/penalty-protection" className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Penalty Protection</Link>
              <Link href="/tender-compliance-bridge" className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Tender Compliance Bridge</Link>
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
              <Bell className="mx-auto mb-4 size-12 text-primary" />
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Set Up Your First Alert in <span className="text-gradient">60 Seconds</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Link your SME account, set your threshold preference, and Radbit handles the rest. You'll never worry about VAT registration deadlines again.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="size-4 text-green-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="size-4 text-green-500" />
                  Free tier available
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="size-4 text-green-500" />
                  Cancel anytime
                </div>
              </div>
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

"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle, FileText, RefreshCw, CheckCircle, Clock, ArrowRight, DollarSign } from "lucide-react";
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

const penalties = [
  { label: "No Fiscal Device", amount: "US$5,000", detail: "Per ZIMRA regulation Section 46" },
  { label: "Late VAT Registration", amount: "100% of tax due", detail: "Plus interest at prevailing rate" },
  { label: "Non-Compliant Receipts", amount: "US$3,000", detail: "Per offence" },
  { label: "Failure to Issue Receipt", amount: "US$1,000", detail: "Per transaction" },
];

const protections = [
  {
    icon: Shield,
    title: "Automated Compliance Checks",
    description: "Radbit runs 10 compliance checks continuously, including fiscal device status, tax clearance, and certificate validity.",
  },
  {
    icon: RefreshCw,
    title: "Certificate Renewal Alerts",
    description: "Get notified 60, 30, and 7 days before your fiscal device certificate expires. Renew in one click.",
  },
  {
    icon: FileText,
    title: "Audit-Ready Records",
    description: "Every receipt is signed, timestamped, and stored. ZIMRA audits are stress-free with full transaction history at your fingertips.",
  },
  {
    icon: Clock,
    title: "Proactive Monitoring",
    description: "Radbit monitors regulatory changes and updates your compliance posture automatically. You're always ahead of new requirements.",
  },
];

export default function PenaltyProtectionPageClient() {
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
              <Shield className="size-4" />
              Penalty Protection
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              Protect Your Business from{" "}
              <span className="text-gradient">ZIMRA Penalties</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground">
              Fines of up to US$5,000 for fiscal device non-compliance. Radbit keeps you compliant automatically so you never pay a penalty.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/zimra-fiscal-device-registration" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40">
                  Protect Your Business
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Link href="/resources/tools/fiscal-compliance" className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-8 text-sm font-medium transition-colors hover:bg-accent">
                Check Your Risk
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
              What You Could{" "}
              <span className="text-gradient">Pay Without Compliance</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-muted-foreground">
              ZIMRA penalties add up fast. Here's what's at stake for non-compliant businesses.
            </motion.p>
          </motion.div>
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {penalties.map((p, i) => (
              <motion.div
                key={p.label}
                className="flex items-start gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-6"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <AlertTriangle className="mt-1 size-5 shrink-0 text-red-500" />
                <div>
                  <p className="font-medium">{p.label}</p>
                  <p className="font-headline text-2xl font-bold text-red-500">{p.amount}</p>
                  <p className="text-xs text-muted-foreground">{p.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="mx-auto mt-8 max-w-2xl rounded-xl border border-border/50 bg-card p-6 text-center"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <DollarSign className="mx-auto mb-2 size-8 text-primary" />
            <p className="text-lg font-medium">Total potential exposure: <span className="text-gradient font-bold">US$14,000+</span></p>
            <p className="mt-1 text-sm text-muted-foreground">Radbit's compliance automation costs less than a single penalty.</p>
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
              How Radbit{" "}
              <span className="text-gradient">Protects You</span>
            </motion.h2>
          </motion.div>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {protections.map((p) => (
              <motion.div
                key={p.title}
                className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <p.icon className="size-5" />
                </div>
                <h3 className="font-headline text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
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
              <Link href="/vat-threshold-alerts" className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">VAT Threshold Alerts</Link>
              <Link href="/offline-mode" className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Offline Mode</Link>
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
              <Shield className="mx-auto mb-4 size-12 text-primary" />
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Pay for Compliance,{" "}
                <span className="text-gradient">Not Penalties</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Radbit's free tier includes basic compliance monitoring. Upgrade for full penalty protection with automated certificate renewal and audit-ready records.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="size-4 text-green-500" />
                  Free tier available
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="size-4 text-green-500" />
                  No hardware needed
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="size-4 text-green-500" />
                  Cancel anytime
                </div>
              </div>
              <Button asChild className="mt-8">
                <Link href="/zimra-fiscal-device-registration" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40">
                  Start Protecting Your Business
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

"use client";

import { motion } from "framer-motion";
import { Receipt, Shield, Smartphone, Globe, FileSignature, CheckCircle, ArrowRight, Printer } from "lucide-react";
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
    icon: Receipt,
    title: "ZIMRA-Compliant Receipts",
    description: "Every receipt includes mandatory fields: sequential number, date, VAT breakdown, and digital signature — meeting ZIMRA FDG requirements.",
  },
  {
    icon: FileSignature,
    title: "Digital Signature",
    description: "Each receipt is cryptographically signed with SHA-256, creating an immutable audit trail that ZIMRA can verify.",
  },
  {
    icon: Smartphone,
    title: "Issue via WhatsApp",
    description: 'Send "Issue receipt $50 for consultation fees" on WhatsApp. Radbit instantly generates and sends a compliant receipt.',
  },
  {
    icon: Globe,
    title: "Web Dashboard",
    description: "Issue, search, and export receipts from your Radbit dashboard. Download PDF copies for your records or customers.",
  },
  {
    icon: Shield,
    title: "Automatic Compliance",
    description: "Receipt numbering follows FDG sequential format. VAT is calculated automatically at 15%. No manual errors.",
  },
  {
    icon: Printer,
    title: "Printable Format",
    description: "Generate printer-friendly receipts for customers who need paper copies. Same legal compliance, any format.",
  },
];

export default function CompliantReceiptsPageClient() {
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
              <Receipt className="size-4" />
              ZIMRA FDG Compliant
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              Issue ZIMRA-Compliant Receipts Without{" "}
              <span className="text-gradient">Expensive Hardware</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground">
              Radbit&apos;s software fiscal device generates legally compliant digital receipts. No hardware needed — issue from WhatsApp, web, or our API.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/zimra-fiscal-device-registration" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40">
                  Register Your Fiscal Device
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Link href="/resources/tools/fiscal-compliance" className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-8 text-sm font-medium transition-colors hover:bg-accent">
                Check Compliance
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
              What Makes a Receipt{" "}
              <span className="text-gradient">Compliant?</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-muted-foreground">
              ZIMRA&apos;s Fiscal Device Gateway requires specific fields on every receipt. Radbit handles them all automatically.
            </motion.p>
          </motion.div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-border/50 bg-card">
            <div className="border-b border-border/50 bg-muted/50 px-6 py-3">
              <p className="text-sm font-medium text-muted-foreground">Sample Receipt</p>
            </div>
            <div className="space-y-3 p-6 font-mono text-sm">
              <p className="text-primary">FDG-DVC001-0042</p>
              <p>Date: 2026-07-06 14:30:22</p>
              <p>--------------------------------</p>
              <p>Item: Consultation Services</p>
              <p>Total: USD $57.50</p>
              <p>VAT (15%): USD $7.50</p>
              <p>--------------------------------</p>
              <p className="text-xs text-muted-foreground">Signature: a1b2c3d4e5f6...</p>
              <p className="text-xs text-muted-foreground">Powered by Radbit — ZIMRA compliant</p>
            </div>
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
              Issue Receipts{" "}
              <span className="text-gradient">Any Way You Want</span>
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
              <Link href="/vat-threshold-alerts" className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">VAT Threshold Alerts</Link>
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
              <Receipt className="mx-auto mb-4 size-12 text-primary" />
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Start Issuing Compliant Receipts{" "}
                <span className="text-gradient">Today</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Register your software fiscal device in minutes. No hardware, no installation, no upfront costs.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="size-4 text-green-500" />
                  No hardware needed
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="size-4 text-green-500" />
                  Works on WhatsApp
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="size-4 text-green-500" />
                  Free tier available
                </div>
              </div>
              <Button asChild className="mt-8">
                <Link href="/zimra-fiscal-device-registration" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40">
                  Register Now
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

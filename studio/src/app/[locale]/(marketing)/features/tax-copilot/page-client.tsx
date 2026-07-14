"use client";

import { motion } from "framer-motion";
import { Calculator, Calendar, MessageSquare, Receipt, Shield, ArrowRight, CheckCircle, Landmark } from "lucide-react";
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
    icon: MessageSquare,
    title: "Ask Any Tax Question",
    description: "What's my VAT liability? How do I file quarterly returns? Ask in plain English and get instant, accurate answers based on ZIMRA regulations.",
  },
  {
    icon: Calculator,
    title: "VAT & Tax Calculator",
    description: "Calculate VAT at 15%, PAYE, corporate tax, and capital gains instantly. Supports both USD and ZiG with live exchange rates.",
  },
  {
    icon: Calendar,
    title: "Deadline Reminders",
    description: "Never miss a filing deadline. Automated reminders for VAT returns, PAYE, income tax, and NSSA submissions — via WhatsApp and email.",
  },
  {
    icon: Shield,
    title: "Fiscal Device Integration",
    description: "Receipts issued through Radbit's fiscal device are automatically recorded for tax purposes. No manual data entry for ZIMRA submissions.",
  },
  {
    icon: Receipt,
    title: "Receipt Compliance Check",
    description: "Upload or describe a receipt — Radbit checks if it meets ZIMRA FDG requirements. Catch compliance issues before ZIMRA does.",
  },
  {
    icon: Landmark,
    title: "Tax Threshold Monitoring",
    description: "Radbit tracks your turnover against ZIMRA's VAT registration and fiscal device thresholds. Alerts when you're approaching a compliance trigger.",
  },
];

export default function TaxCopilotPageClient() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.06),transparent_60%)]" />

      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="container">
          <motion.div className="mx-auto max-w-3xl text-center" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Landmark className="size-4" />
              AI Tax Assistant
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              Your AI Tax Co-Pilot for{" "}
              <span className="text-gradient">ZIMRA Compliance</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground">
              Radbit&apos;s Tax Co-Pilot answers your ZIMRA questions, calculates VAT, tracks deadlines, and integrates with your fiscal device. Tax compliance for Zimbabwean SMEs, simplified.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/sign-up" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25">
                  Start Using Tax Co-Pilot
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/zimra-fiscal-device-registration" className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-8 text-sm font-medium">
                  Register Fiscal Device
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container">
          <motion.div className="mx-auto mb-12 max-w-2xl text-center" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={itemVariants} className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
              Tax Compliance{" "}
              <span className="text-gradient">Simplified</span>
            </motion.h2>
          </motion.div>
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <motion.div
                key={f.title} className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
                variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
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

      <section className="py-16 sm:py-24">
        <div className="container">
          <motion.div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-12" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={itemVariants} className="text-center">
              <Landmark className="mx-auto mb-4 size-12 text-primary" />
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Never Miss a Tax{" "}
                <span className="text-gradient">Deadline Again</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                VAT returns, PAYE, income tax, NSSA — Radbit tracks every deadline and sends you reminders. Combined with your fiscal device, your tax data is always ready for submission.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="size-4 text-green-500" /> Real-time ZIMRA guidance</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="size-4 text-green-500" /> Multi-currency support</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="size-4 text-green-500" /> Free tier available</div>
              </div>
              <Button asChild className="mt-8">
                <Link href="/sign-up" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25">
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

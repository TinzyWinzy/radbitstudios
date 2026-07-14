"use client";

import { motion } from "framer-motion";
import { FileCheck, Shield, Bell, TrendingUp, ScrollText, ArrowRight, CheckCircle, Award } from "lucide-react";
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
    icon: FileCheck,
    title: "Document Management",
    description: "Upload and store all your PRAZ compliance documents in one place. Radbit tracks expiry dates and version history automatically.",
  },
  {
    icon: Award,
    title: "Readiness Scoring",
    description: "Get a real-time PRAZ readiness score based on your uploaded documents. Know exactly where you stand before tenders close.",
  },
  {
    icon: Bell,
    title: "Expiry Alerts",
    description: "Receive notifications 60, 30, and 7 days before any compliance document expires. Never get disqualified from a tender again.",
  },
  {
    icon: Shield,
    title: "Auto-Compliance Checks",
    description: "Radbit cross-references your documents against PRAZ requirements for each tender category. Identifies gaps before you bid.",
  },
  {
    icon: ScrollText,
    title: "Tender Matching",
    description: "Only see tenders you're qualified to win. Radbit filters opportunities based on your current compliance status and certifications.",
  },
  {
    icon: TrendingUp,
    title: "Compliance Trends",
    description: "Track your compliance score over time. See how improvements in your documentation translate to more tender opportunities.",
  },
];

export default function PrazCompliancePageClient() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.06),transparent_60%)]" />

      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="container">
          <motion.div className="mx-auto max-w-3xl text-center" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Award className="size-4" />
              PRAZ Compliance Hub
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              Stay PRAZ Compliant,{" "}
              <span className="text-gradient">Win More Tenders</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground">
              PRAZ compliance is required for all public procurement in Zimbabwe. Radbit tracks your documents, alerts you before expiry, and matches you with tenders you&apos;re qualified to win.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/sign-up" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25">
                  Check Your PRAZ Readiness
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tender-compliance-bridge" className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-8 text-sm font-medium">
                  See Tender Compliance
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
              Your PRAZ Compliance{" "}
              <span className="text-gradient">Dashboard</span>
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
              <Shield className="mx-auto mb-4 size-12 text-primary" />
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Get Tender-Ready in{" "}
                <span className="text-gradient">Minutes</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Upload your PRAZ documents, get your readiness score, and start bidding on tenders you&apos;re qualified to win. Radbit handles the compliance tracking so you can focus on winning.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="size-4 text-green-500" /> Free compliance check</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="size-4 text-green-500" /> Automated expiry alerts</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="size-4 text-green-500" /> Tender-matched opportunities</div>
              </div>
              <Button asChild className="mt-8">
                <Link href="/sign-up" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25">
                  Start Your Compliance Check
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

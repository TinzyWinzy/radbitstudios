"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight, CheckCircle, Globe, Smartphone, Users, FileCheck, Lock } from "lucide-react";
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
    icon: Shield,
    title: "Milestone-Based Releases",
    description: "Funds are held securely and released only when agreed milestones are met. Both parties approve each stage before payment is made.",
  },
  {
    icon: Lock,
    title: "Multi-Currency Support",
    description: "Deposits and payouts in USD, ZiG, and ZAR. Radbit handles conversion at competitive rates through licensed payment partners.",
  },
  {
    icon: FileCheck,
    title: "Trust Seal Verified",
    description: "Every SME on the platform has a verified Trust Seal score. Know exactly who you're investing in with full transparency on compliance and operations.",
  },
  {
    icon: Smartphone,
    title: "Manage via WhatsApp",
    description: "Deposit funds, check escrow status, and approve milestone releases — all from WhatsApp. No app download needed.",
  },
  {
    icon: Users,
    title: "Dispute Resolution",
    description: "Radbit provides mediation for any disagreements. Escrow funds remain locked until resolution, protecting both investor and SME.",
  },
  {
    icon: Globe,
    title: "Diaspora-First Design",
    description: "Built for Zimbabweans abroad investing back home. Simple onboarding, international payment support, and real-time status updates.",
  },
];

const steps = [
  { number: "1", title: "Find an SME", desc: "Browse verified SMEs with Trust Seal scores on the Investor Portal." },
  { number: "2", title: "Deposit Funds", desc: "Deposit into escrow via mobile money, bank transfer, or card. Funds are held securely." },
  { number: "3", title: "Milestone Tracking", desc: "Both parties agree on milestones. As each is completed and verified, funds are released." },
  { number: "4", title: "Completion", desc: "When all milestones are met, the final payment is released. Full transaction history is recorded." },
];

export default function EscrowPageClient() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.06),transparent_60%)]" />

      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="container">
          <motion.div className="mx-auto max-w-3xl text-center" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Shield className="size-4" />
              Secure Escrow
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              Invest in Zimbabwe with{" "}
              <span className="text-gradient">Escrow Protection</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground">
              Radbit&apos;s escrow service protects diaspora investors and Zimbabwean SMEs. Funds are released only when agreed milestones are met — giving both sides peace of mind.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/sign-up?redirect=/investor-portal" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25">
                  Start Investing
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/diaspora" className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-8 text-sm font-medium">
                  Learn About Diaspora
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
              How Escrow{" "}
              <span className="text-gradient">Works</span>
            </motion.h2>
          </motion.div>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <motion.div
                key={s.number} className="relative rounded-xl border border-border/50 bg-card p-6 text-center"
                variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{s.number}</div>
                <h3 className="font-headline text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container">
          <motion.div className="mx-auto mb-12 max-w-2xl text-center" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={itemVariants} className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
              Features Designed for{" "}
              <span className="text-gradient">Trust & Transparency</span>
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
              <Globe className="mx-auto mb-4 size-12 text-primary" />
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Invest in Zimbabwe{" "}
                <span className="text-gradient">With Confidence</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Every investment is protected by escrow, every SME is Trust Seal verified, and every milestone is tracked. Radbit makes diaspora investing safe and transparent.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="size-4 text-green-500" /> Trust Seal verified SMEs</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="size-4 text-green-500" /> Milestone-based protection</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="size-4 text-green-500" /> Multi-currency support</div>
              </div>
              <Button asChild className="mt-8">
                <Link href="/sign-up?redirect=/investor-portal" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25">
                  Start Investing Today
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

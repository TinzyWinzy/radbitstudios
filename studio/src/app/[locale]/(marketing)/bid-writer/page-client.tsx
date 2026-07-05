"use client";

import { motion } from "framer-motion";
import { FileText, Sparkles, Shield, Clock, DollarSign, ArrowRight, CheckCircle, PenTool } from "lucide-react";
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
    icon: Sparkles,
    title: "AI-Powered Writing",
    description: "Describe your business and the tender — Radbit's AI generates a professional, compliant bid proposal in minutes, not days.",
  },
  {
    icon: Shield,
    title: "PRAZ Auto-Compliance",
    description: "Every bid is checked against PRAZ requirements. No more disqualifications for missing clauses or incorrect formatting.",
  },
  {
    icon: DollarSign,
    title: "Smart Pricing Engine",
    description: "AI analyzes tender value, your costs, and market rates to suggest optimal pricing. Maximize win rate without leaving money on the table.",
  },
  {
    icon: Clock,
    title: "Deadline Tracker",
    description: "Never miss a bid deadline. Radbit tracks tender closing dates and prioritizes your pipeline so you always submit on time.",
  },
  {
    icon: FileText,
    title: "Template Library",
    description: "Access a library of winning bid templates for construction, IT, professional services, and more. Customize in one click.",
  },
  {
    icon: PenTool,
    title: "Collaborative Editing",
    description: "Invite team members to review and edit bids in real-time. Track changes, add comments, and approve before submission.",
  },
];

export default function BidWriterPageClient() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.06),transparent_60%)]" />

      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="container">
          <motion.div className="mx-auto max-w-3xl text-center" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <FileText className="size-4" />
              AI-Powered Bidding
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              Write Winning Tender Bids{" "}
              <span className="text-gradient">10x Faster</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground">
              Radbit's AI Bid Writer generates professional, PRAZ-compliant bid proposals from a simple description. Stop spending days on paperwork — start winning more tenders.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/sign-up" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25">
                  Start Writing Bids
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
              Everything You Need to{" "}
              <span className="text-gradient">Win Tenders</span>
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
              <PenTool className="mx-auto mb-4 size-12 text-primary" />
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                From Description to{" "}
                <span className="text-gradient">Winning Bid</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Tell us about your business and the tender opportunity. Our AI generates a complete, compliant bid proposal — ready for review and submission.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="size-4 text-green-500" /> No templates to start from</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="size-4 text-green-500" /> PRAZ compliant by default</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="size-4 text-green-500" /> Free tier available</div>
              </div>
              <Button asChild className="mt-8">
                <Link href="/sign-up" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25">
                  Write Your First Bid
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

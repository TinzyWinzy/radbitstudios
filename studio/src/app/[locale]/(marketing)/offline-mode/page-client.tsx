"use client";

import { motion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw, Smartphone, Cloud, Shield, ArrowRight, CheckCircle } from "lucide-react";
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
    icon: WifiOff,
    title: "Works Without Internet",
    description: "Issue receipts even when you have no connectivity. Radbit's fiscal device queues receipts locally until a connection is available.",
  },
  {
    icon: RefreshCw,
    title: "Auto-Sync When Connected",
    description: "Receipts sync automatically to ZIMRA's FDG when internet returns. No manual intervention, no data loss.",
  },
  {
    icon: Cloud,
    title: "Cloud Backup",
    description: "All receipts are backed up securely to the cloud. Access your full receipt history from any device, anytime.",
  },
  {
    icon: Shield,
    title: "Zero Data Loss",
    description: "Local queue stores every receipt with full compliance data. Even prolonged outages won't lose a single transaction.",
  },
  {
    icon: Smartphone,
    title: "Works on Any Device",
    description: "Use Radbit on your smartphone, tablet, or laptop. No dedicated hardware — fiscal compliance runs on devices you already own.",
  },
  {
    icon: Wifi,
    title: "Connectivity-Aware",
    description: "Radbit detects your connection status and switches between online and offline mode automatically. You don't need to think about it.",
  },
];

export default function OfflineModePageClient() {
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
              <WifiOff className="size-4" />
              Offline-First Design
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              Fiscal Compliance That Works{" "}
              <span className="text-gradient">With or Without Internet</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground">
              Zimbabwe's connectivity is unreliable. Radbit's fiscal device works offline, queues receipts, and syncs automatically when you're back online. No downtime, no penalties.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/zimra-fiscal-device-registration" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40">
                  Register Your Fiscal Device
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Link href="/compliant-receipts" className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-8 text-sm font-medium transition-colors hover:bg-accent">
                See Compliant Receipts
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
              Built for{" "}
              <span className="text-gradient">Zimbabwe's Internet</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-muted-foreground">
              Hardware fiscal devices stop working when connectivity drops. Radbit's software FDG keeps going.
            </motion.p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-card p-8">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                <WifiOff className="size-6" />
              </div>
              <h3 className="font-headline text-lg font-semibold">Hardware Fiscal Devices</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">✕</span>
                  Stop working when internet drops
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">✕</span>
                  Require expensive installation
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">✕</span>
                  Need dedicated hardware purchase
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">✕</span>
                  Service and maintenance costs
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-8">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                <Wifi className="size-6" />
              </div>
              <h3 className="font-headline text-lg font-semibold text-green-600">Radbit Software FDG</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-500" />
                  Works offline, syncs later
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-500" />
                  No installation required
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-500" />
                  Runs on devices you own
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-500" />
                  Zero maintenance
                </li>
              </ul>
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
              How Offline Mode{" "}
              <span className="text-gradient">Works</span>
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
              <Link href="/vat-threshold-alerts" className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">VAT Threshold Alerts</Link>
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
              <WifiOff className="mx-auto mb-4 size-12 text-primary" />
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Never Let Connectivity{" "}
                <span className="text-gradient">Stop Your Business</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Register your software fiscal device today and get compliance that works everywhere in Zimbabwe.
              </p>
              <Button asChild className="mt-8">
                <Link href="/zimra-fiscal-device-registration" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40">
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

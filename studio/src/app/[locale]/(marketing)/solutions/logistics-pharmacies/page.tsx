"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Truck, Package, AlertTriangle, ClipboardList, Shield,
  BarChart, Bell, ChevronRight, CheckCircle2, Database,
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
    icon: <Database className="h-5 w-5" />,
    title: "Manual Data Feeds",
    body: "Hours wasted copying data between spreadsheets, ERPs, and supplier portals. One typo and the entire shipment is delayed.",
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: "EDI Exceptions",
    body: "Trading partners reject purchase orders over formatting issues. Each exception costs 30+ minutes of manual debugging.",
  },
  {
    icon: <Truck className="h-5 w-5" />,
    title: "Fleet Scheduling Chaos",
    body: "Spreadsheet-based dispatching leads to missed windows, empty backhauls, and drivers waiting hours at loading docks.",
  },
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: "Error-Prone Inventory",
    body: "Pharmacy stockouts and overstocks cost millions. Without real-time visibility, expiry management becomes guesswork.",
  },
];

const solutions = [
  {
    icon: <BarChart className="h-5 w-5" />,
    title: "Live Dashboards",
    body: "Real-time visibility across your entire supply chain — fleet positions, warehouse库存, order status, all in one pane of glass.",
    tags: ["Real-time", "Supply Chain", "Analytics"],
  },
  {
    icon: <Bell className="h-5 w-5" />,
    title: "Automated Alerts",
    body: "Smart notifications for EDI rejections, delivery delays, inventory thresholds, and compliance deadlines before they become crises.",
    tags: ["Alerts", "EDI", "Compliance"],
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "AI Data Feed Cleaner",
    body: "Autonomous agents that normalize supplier feeds, flag anomalies, and reconcile EDI transactions without human intervention.",
    tags: ["AI Agents", "Data Quality", "EDI"],
  },
  {
    icon: <Package className="h-5 w-5" />,
    title: "Smart Fleet Dispatch",
    body: "AI-powered route optimization, load matching, and real-time ETA updates that cut fuel costs and improve on-time delivery.",
    tags: ["Fleet", "Route Opt", "Fuel Savings"],
  },
];

const features = [
  {
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: "EDI Transaction Automation",
    body: "Auto-detect formatting errors, suggest corrections, and resubmit EDI 850/856/810 transactions in seconds.",
  },
  {
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: "Pharmacy Expiry Tracking",
    body: "AI scans batch records and predicts expiry risks. Get alerts 60 days before any stock line expires.",
  },
  {
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: "Supplier Scorecards",
    body: "Automatically grade supplier performance — on-time delivery, fill rates, EDI compliance — updated daily.",
  },
  {
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: "Load-Shedding Resilience",
    body: "Offline-capable mobile apps for drivers and warehouse staff. Syncs automatically when connectivity returns.",
  },
];

export default function LogisticsPharmaciesPage() {
  useEffect(() => {
    document.title = "Logistics & Pharmacy Automation — AI Agent Workforce | Radbit";
  }, []);

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
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <motion.div style={{ opacity, y }} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/[0.07] text-sm font-medium text-primary/80 mb-8"
          >
            <Truck className="h-3.5 w-3.5" />
            Logistics & Pharmacy Automation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-white"
          >
            Banish Spreadsheet Hell
            <br />
            <span className="text-gradient">Automate Your Operations</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Stop fighting manual data feeds, EDI exceptions, and fleet scheduling chaos. Deploy an AI Agent Workforce that keeps your logistics and pharmacy operations running 24/7 — even during load-shedding.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="font-headline text-sm tracking-wider">
              <Link href="/assessment">
                Start Your Digital Readiness Assessment
                <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-headline text-sm tracking-wider border border-white/20 text-white/60 hover:bg-white/5 hover:text-white">
              <Link href="/toolkit">Explore AI Toolkit</Link>
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
              Manual Operations Are <span className="text-gradient">Costing You</span>
            </h2>
            <p className="text-white/60 max-w-lg mx-auto text-base">
              Every hour spent on spreadsheets and EDI firefighting is an hour not spent growing your business.
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
              AI Agent Workforce for <span className="text-gradient">Logistics & Pharmacy</span>
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
              Everything You Need to <span className="text-gradient">Scale Operations</span>
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
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
        <div className="container relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-white">
              Ready to Automate?
              <br />
              <span className="text-gradient">Start Your Readiness Assessment.</span>
            </h2>
            <p className="text-base md:text-lg text-white/60 max-w-lg mx-auto">
              5 minutes to a personalized automation roadmap. No credit card required.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Button asChild size="lg" className="font-headline text-sm tracking-wider px-8">
              <Link href="/assessment">
                Start Your Digital Readiness Assessment
                <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

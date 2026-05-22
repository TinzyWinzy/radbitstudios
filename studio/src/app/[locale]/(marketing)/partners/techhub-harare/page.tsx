"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  Bot,
  FileSearch,
  Calendar,
  ChevronRight,
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  Monitor,
  Gift,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "Tech Hub Harare × Radbit SME Hub — AI Tools for Zimbabwe's Founders",
  description:
    "Exclusive partnership: Startup Cloud Access Program, AI Agent Workforce, and Tender Intelligence for Tech Hub Harare members. Join the AI in Business Workshop.",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-sm font-medium text-primary mb-8"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Official Tech Hub Harare Partner
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-white"
        >
          Tech Hub Harare <span className="text-muted-foreground/50">×</span>{" "}
          <span className="text-gradient">Radbit SME Hub</span>
          <br />
          <span className="text-2xl sm:text-3xl md:text-4xl text-white/80">
            AI Tools for Zimbabwe&apos;s Founders
          </span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
        >
          Zimbabwe&apos;s leading tech community meets the AI platform built for local SMEs.
          Access startup-grade cloud credits, deploy AI agents, and win government tenders — all
          through your Tech Hub membership.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="font-headline text-sm tracking-wider gap-2">
            <Link href="/assessment">
              Start Free Assessment <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-headline text-sm tracking-wider">
            <Link href="#workshop">
              <BookOpen className="h-4 w-4" /> AI in Business Workshop
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

function ValuePropsSection() {
  const props = [
    {
      icon: <Cloud className="h-5 w-5" />,
      title: "Startup Cloud Access Program",
      body: "Free cloud credits from leading providers. Deploy your MVP, host your website, or run AI workloads without burning through your seed capital. Exclusive to Tech Hub members.",
    },
    {
      icon: <Bot className="h-5 w-5" />,
      title: "AI Agent Workforce",
      body: "Deploy autonomous AI agents for customer support, content generation, bookkeeping, and lead qualification. Your 24/7 team that never misses a beat — even during load-shedding.",
    },
    {
      icon: <FileSearch className="h-5 w-5" />,
      title: "Tender Intelligence",
      body: "AI-curated tender opportunities from 12+ government departments and state enterprises. Get matched, alerted, and proposal-ready. Your unfair advantage in public procurement.",
    },
  ];

  return (
    <section className="relative py-20 md:py-28">
      <div className="container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center space-y-3 mb-14"
        >
          <motion.span
            variants={fadeUp}
            className="font-headline text-xs tracking-[0.3em] text-primary uppercase"
          >
            Co-Branded Value
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-headline text-3xl md:text-4xl font-bold tracking-tighter text-white"
          >
            Everything You Need to <span className="text-gradient">Launch & Scale</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/60 max-w-lg mx-auto text-base">
            Three pillars. One platform. Built for Zimbabwean tech founders.
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {props.map((p) => (
            <motion.div key={p.title} variants={fadeUp}>
              <Card className="h-full bg-white/[0.03] border-white/10 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary mb-2">
                    {p.icon}
                  </div>
                  <CardTitle className="font-headline text-lg text-white">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/60 text-sm leading-relaxed">
                    {p.body}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function WorkshopSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="workshop" className="relative py-20 md:py-28 border-t border-white/10">
      <div className="container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center space-y-3 mb-10">
            <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">
              Workshop
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter text-white">
              AI in Business Workshop
            </h2>
            <p className="text-white/60 max-w-xl mx-auto text-base">
              A hands-on session for Tech Hub Harare members. Learn how to deploy AI agents,
              automate tenders, and access cloud credits — in one afternoon.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-5">
              {[
                { icon: <Monitor className="h-4 w-4" />, label: "Live demos of AI Agent Workforce" },
                { icon: <Cloud className="h-4 w-4" />, label: "Set up your Cloud Access account on the spot" },
                { icon: <FileSearch className="h-4 w-4" />, label: "See real tender matches for your startup" },
                { icon: <Users className="h-4 w-4" />, label: "Network with fellow Tech Hub founders" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
              <div className="pt-4">
                <p className="text-sm text-white/50 italic">
                  Limited seats. Tech Hub members get priority booking.
                </p>
              </div>
            </div>

            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader>
                <CardTitle className="font-headline text-lg text-white">Register Your Interest</CardTitle>
                <CardDescription className="text-white/50 text-sm">
                  We&apos;ll email you the next workshop date.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-6 space-y-2">
                    <Sparkles className="h-8 w-8 text-primary mx-auto" />
                    <p className="text-white font-medium">You&apos;re registered!</p>
                    <p className="text-sm text-white/50">
                      Check your inbox for workshop details.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="workshop-name" className="text-sm text-white/70 mb-1.5 block">
                        Full Name
                      </label>
                      <Input
                        id="workshop-name"
                        type="text"
                        placeholder="Tendai Mukanya"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="workshop-email" className="text-sm text-white/70 mb-1.5 block">
                        Email Address
                      </label>
                      <Input
                        id="workshop-email"
                        type="email"
                        placeholder="tendai@startup.co.zw"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>
                    <Button type="submit" className="w-full font-headline gap-2">
                      <Calendar className="h-4 w-4" /> Register for Workshop
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function OfferSection() {
  return (
    <section className="relative py-16 md:py-20 border-t border-white/10 bg-white/[0.02]">
      <div className="container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-2xl mx-auto text-center space-y-6"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-sm font-medium text-yellow-400">
            <Gift className="h-3.5 w-3.5" />
            Exclusive Tech Hub Offer
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-white">
            Your Partner Discount Awaits
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/60 text-base leading-relaxed">
            Tech Hub Harare members get <strong className="text-white">30% off</strong> the first 3 months of any
            Radbit paid plan. Use code <span className="inline-block px-3 py-1 rounded-md bg-primary/15 border border-primary/30 text-primary font-mono text-sm font-bold">TECHHUB30</span> at checkout.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Button asChild size="lg" className="font-headline text-sm tracking-wider gap-2">
              <Link href="/sign-up?ref=techhub">
                Claim Your Discount <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default function TechHubHararePage() {
  useEffect(() => {
    document.title =
      "Tech Hub Harare × Radbit SME Hub — AI Tools for Zimbabwe's Founders";
  }, []);

  return (
    <div className="flex flex-col w-full min-h-full bg-background overflow-x-hidden">
      <HeroSection />
      <ValuePropsSection />
      <WorkshopSection />
      <OfferSection />
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        <div className="container">
          <p>© {new Date().getFullYear()} Radbit. Built in partnership with Tech Hub Harare.</p>
        </div>
      </footer>
    </div>
  );
}

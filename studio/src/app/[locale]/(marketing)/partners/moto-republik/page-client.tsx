"use client";

import { motion } from "framer-motion";
import {
  Palette,
  PenTool,
  Megaphone,
  Image,
  FileText,
  ArrowRight,
  Gift,
  Music,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


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
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-background to-background pointer-events-none" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-sm font-medium text-purple-400 mb-8"
        >
          <Music className="h-3.5 w-3.5" />
          Official Moto Republik Partner
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-white"
        >
          Moto Republik <span className="text-muted-foreground/50">×</span>{" "}
          <span className="text-gradient">Radbit SME Hub</span>
          <br />
          <span className="text-2xl sm:text-3xl md:text-4xl text-white/80">
            Creative Entrepreneurship Meets AI
          </span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
        >
          Zimbabwe&apos;s creative hub meets the AI platform that supercharges your craft.
          Generate logos, write copy, automate marketing, and focus on what you do best —
          creating. Built for the Moto Republik community.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="font-headline text-sm tracking-wider gap-2">
            <Link href="/assessment">
              Start Free Assessment <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-headline text-sm tracking-wider">
            <Link href="/toolkit">Explore AI Toolkit</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

function CreativeAIAgentsSection() {
  const agents = [
    {
      icon: <Image className="h-5 w-5" />,
      title: "AI Graphic Design Agent",
      body: "Generate logos, social media graphics, flyers, and brand assets in seconds. Describe your vision — the agent delivers production-ready designs.",
      tag: "Design",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Content Creation Agent",
      body: "Blog posts, captions, video scripts, and ad copy tailored to Zimbabwean audiences. Train it on your brand voice and watch it write.",
      tag: "Writing",
    },
    {
      icon: <Megaphone className="h-5 w-5" />,
      title: "Automated Marketing Agent",
      body: "Schedule campaigns across WhatsApp, Instagram, and email. AI optimizes send times, A/B tests copy, and reports performance — hands free.",
      tag: "Marketing",
    },
    {
      icon: <PenTool className="h-5 w-5" />,
      title: "Brand Identity Agent",
      body: "From mood boards to full brand guidelines. Colour palettes, typography, and visual identity — all generated from a brief.",
      tag: "Branding",
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "Social Media Manager Agent",
      body: "Plan, create, and schedule 30 days of content in one sitting. AI analyzes engagement patterns and adjusts your strategy automatically.",
      tag: "Social",
    },
    {
      icon: <Palette className="h-5 w-5" />,
      title: "Creative Brief Agent",
      body: "Turn client conversations into structured creative briefs. Save hours of back-and-forth and deliver exactly what the client needs.",
      tag: "Workflow",
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
            className="font-headline text-xs tracking-[0.3em] text-purple-400 uppercase"
          >
            AI Agent Workforce
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-headline text-3xl md:text-4xl font-bold tracking-tighter text-white"
          >
            Your Creative <span className="text-gradient">AI Team</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-white/60 max-w-lg mx-auto text-base"
          >
            Six specialized AI agents. One platform. Unlimited creativity.
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
        >
          {agents.map((a) => (
            <motion.div key={a.title} variants={fadeUp}>
              <Card className="h-full bg-white/[0.03] border-white/10 hover:border-purple-500/30 transition-all duration-300">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 mb-2">
                    {a.icon}
                  </div>
                  <CardTitle className="font-headline text-sm text-white">{a.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/60 text-sm leading-relaxed mb-3">
                    {a.body}
                  </CardDescription>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    {a.tag}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CreativeProcessSection() {
  return (
    <section className="relative py-20 md:py-28 border-t border-white/10 bg-white/[0.02]">
      <div className="container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center space-y-3 mb-12">
            <span className="font-headline text-xs tracking-[0.3em] text-purple-400 uppercase">
              For Creatives, By Creatives
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter text-white">
              From Idea to <span className="text-gradient">Impact</span>
            </h2>
            <p className="text-white/60 max-w-lg mx-auto text-base">
              Whether you&apos;re a graphic designer, content creator, or agency owner —
              Radbit gives you the tools to deliver faster and charge more.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="space-y-6">
            {[
              {
                step: "01",
                title: "Describe Your Project",
                body: "Tell the AI agent what you need — a logo, a campaign, a brand identity. Natural language. No templates.",
              },
              {
                step: "02",
                title: "AI Generates Drafts",
                body: "Get multiple variations in seconds. Refine, remix, and iterate until it's perfect.",
              },
              {
                step: "03",
                title: "Deliver & Scale",
                body: "Export in any format, publish directly to social, or hand off to clients. Your capacity just multiplied.",
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="flex gap-5 p-5 rounded-xl border border-white/10 bg-white/[0.03]"
              >
                <span className="font-headline text-2xl font-bold text-purple-400 shrink-0 leading-none">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-headline text-base font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function OfferSection() {
  return (
    <section className="relative py-16 md:py-20 border-t border-white/10">
      <div className="container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-2xl mx-auto text-center space-y-6"
        >
          <motion.div
            variants={fadeIn}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-sm font-medium text-purple-400"
          >
            <Gift className="h-3.5 w-3.5" />
            Exclusive Moto Republik Offer
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-white"
          >
            Special Rate for Creatives
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-white/60 text-base leading-relaxed"
          >
            Moto Republik members get{" "}
            <strong className="text-white">free access to the AI Graphic Design Agent</strong> on
            the Growth plan, plus{" "}
            <strong className="text-white">20% off annual subscriptions</strong>. Use code{" "}
            <span className="inline-block px-3 py-1 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-400 font-mono text-sm font-bold">
              MOTO20
            </span>{" "}
            at checkout.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Button
              asChild
              size="lg"
              className="font-headline text-sm tracking-wider gap-2 bg-purple-600 hover:bg-purple-500"
            >
              <Link href="/sign-up?ref=moto">
                Claim Your Discount <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default function MotoRepublikPage() {
  return (
    <div className="flex flex-col w-full min-h-full bg-background overflow-x-hidden">
      <HeroSection />
      <CreativeAIAgentsSection />
      <CreativeProcessSection />
      <OfferSection />
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        <div className="container">
          <p>
            © {new Date().getFullYear()} Radbit. Built in partnership with Moto Republik.
          </p>
        </div>
      </footer>
    </div>
  );
}

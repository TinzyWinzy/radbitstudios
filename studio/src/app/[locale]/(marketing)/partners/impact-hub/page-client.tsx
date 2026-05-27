"use client";

import { motion } from "framer-motion";
import {
  Leaf,
  Sun,
  FileSearch,
  ArrowRight,
  Gift,
  TreePine,
  Wind,
  Heart,
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
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-background to-background pointer-events-none" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/10 text-sm font-medium text-green-400 mb-8"
        >
          <Leaf className="h-3.5 w-3.5" />
          Official Impact Hub Harare Partner
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-foreground"
        >
          Impact Hub Harare <span className="text-muted-foreground/50">×</span>{" "}
          <span className="text-gradient">Radbit SME Hub</span>
          <br />
          <span className="text-2xl sm:text-3xl md:text-4xl text-foreground/80">
            Sustainable Innovation Powered by AI
          </span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-6 text-base md:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed"
        >
          Zimbabwe&apos;s home for sustainable innovation meets AI-driven intelligence.
          Track green energy tenders, access sustainability grants, and scale your
          climate action impact — powered by Radbit.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="font-headline text-sm tracking-wider gap-2">
            <Link href="/assessment">
              Start Free Assessment <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-headline text-sm tracking-wider">
            <Link href="/tenders">Explore Green Tenders</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

function FocusSection() {
  const focuses = [
    {
      icon: <Sun className="h-5 w-5" />,
      title: "Green Energy",
      body: "Solar, mini-grid, and renewable energy projects across Zimbabwe. Get AI-curated tender alerts from ZERA, ZESA, and international development partners.",
      tag: "Renewable Energy",
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: "Sustainability Grants",
      body: "Match your NGO or social enterprise with sustainability grants from UNDP, GEF, AfDB, and local climate funds. AI reads the criteria so you don't have to.",
      tag: "Grant Matching",
    },
    {
      icon: <TreePine className="h-5 w-5" />,
      title: "Climate Action",
      body: "Track carbon credits, reforestation programs, and climate resilience initiatives. Align your projects with Zimbabwe's National Climate Policy and NDCs.",
      tag: "Climate Intelligence",
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
            className="font-headline text-xs tracking-[0.3em] text-green-400 uppercase"
          >
            Sustainability Focus
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-headline text-3xl md:text-4xl font-bold tracking-tighter text-foreground"
          >
            AI That Drives <span className="text-gradient">Climate Impact</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-foreground/60 max-w-lg mx-auto text-base">
            Purpose-built tools for Zimbabwe&apos;s green economy pioneers.
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {focuses.map((f) => (
            <motion.div key={f.title} variants={fadeUp}>
              <Card className="h-full bg-foreground/[0.03] border-foreground/10 hover:border-green-500/30 transition-all duration-300">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center text-green-400 mb-2">
                    {f.icon}
                  </div>
                  <CardTitle className="font-headline text-lg text-foreground">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/60 text-sm leading-relaxed mb-4">
                    {f.body}
                  </CardDescription>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 border border-green-500/20 text-green-400">
                    {f.tag}
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

function TenderTrackingSection() {
  return (
    <section className="relative py-20 md:py-28 border-t border-foreground/10 bg-foreground/[0.02]">
      <div className="container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto"
        >
          <motion.div variants={stagger} className="space-y-6">
            <motion.span
              variants={fadeUp}
              className="font-headline text-xs tracking-[0.3em] text-green-400 uppercase"
            >
              Tender Intelligence
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="font-headline text-3xl md:text-4xl font-bold tracking-tighter text-foreground"
            >
              Tenders Aligned with <span className="text-gradient">Your Mission</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-foreground/60 text-base leading-relaxed">
              Radbit&apos;s AI engine scans every published tender from government, NGOs, and
              development partners — and surfaces opportunities that match your green energy
              or sustainability focus. No more scrolling through irrelevant listings.
            </motion.p>
            <motion.ul variants={stagger} className="space-y-3">
              {[
                "ZERA renewable energy licences and RFPs",
                "UNDP / GEF climate adaptation grants",
                "AfDB green infrastructure projects",
                "NGO sustainability programme partnerships",
                "Carbon credit registry opportunities",
              ].map((item) => (
                <motion.li
                  key={item}
                  variants={fadeUp}
                  className="flex items-center gap-2 text-sm text-foreground/70"
                >
                  <Leaf className="h-3.5 w-3.5 text-green-400 shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
            <motion.div variants={fadeUp}>
              <Button asChild size="lg" className="font-headline text-sm tracking-wider gap-2">
                <Link href="/tenders">
                  <FileSearch className="h-4 w-4" /> View Live Tenders
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div variants={fadeIn} className="hidden md:flex justify-center">
            <div className="relative w-full max-w-sm aspect-square">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20" />
              <div className="absolute inset-4 rounded-xl bg-green-500/10 border border-green-500/10 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Wind className="h-12 w-12 text-green-400 mx-auto" />
                  <p className="text-green-300 font-headline font-bold text-lg">Green Tender Watch</p>
                  <p className="text-green-400/60 text-xs">AI-curated. Mission-aligned.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function OfferSection() {
  return (
    <section className="relative py-16 md:py-20 border-t border-foreground/10">
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-sm font-medium text-green-400"
          >
            <Gift className="h-3.5 w-3.5" />
            Exclusive Impact Hub Offer
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-foreground"
          >
            Partner Discount for Changemakers
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-foreground/60 text-base leading-relaxed"
          >
            Impact Hub Harare members receive{" "}
            <strong className="text-foreground">25% off their first 6 months</strong> of any Radbit
            plan. Use code{" "}
            <span className="inline-block px-3 py-1 rounded-md bg-green-500/15 border border-green-500/30 text-green-400 font-mono text-sm font-bold">
              IMPACT25
            </span>{" "}
            at checkout.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Button
              asChild
              size="lg"
              className="font-headline text-sm tracking-wider gap-2 bg-green-600 hover:bg-green-500"
            >
              <Link href="/sign-up?ref=impacthub">
                Claim Your Discount <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default function ImpactHubPage() {
  return (
    <div className="flex flex-col w-full min-h-full bg-background overflow-x-hidden">
      <HeroSection />
      <FocusSection />
      <TenderTrackingSection />
      <OfferSection />
      <footer className="border-t border-foreground/10 py-8 text-center text-sm text-foreground/40">
        <div className="container">
          <p>
            © {new Date().getFullYear()} Radbit. Built in partnership with Impact Hub Harare.
          </p>
        </div>
      </footer>
    </div>
  );
}

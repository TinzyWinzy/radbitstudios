"use client";

import { useRef, useEffect, lazy, Suspense, useState } from "react";
import { ChevronRight, BarChart, Lightbulb, TrendingUp, Users, Briefcase, Sparkles, ArrowRight, Star, Shield, Zap } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticButton } from "@/components/magnetic-button";
import { TiltCard } from "@/components/tilt-card";
import { AnimatedCounter } from "@/components/animated-counter";
import { GyeNyame, Sankofa, Dwennimmen } from "@/components/adinkra-symbols";
import { ChevronPattern } from "@/components/chevron-pattern";
import { AdUnit } from "@/components/adsense";
import { registerVisibilityHandler } from "@/lib/device";

const WaveField = lazy(() => import("@/components/wave-field").then(m => ({ default: m.WaveField })));
const GreatZimbabweScene = dynamic(
  () => import("@/components/three/great-zimbabwe-scene").then(m => ({ default: m.GreatZimbabweScene })),
  { ssr: false }
);

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

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -40]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.98]);

  return (
    <section ref={sectionRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <motion.div style={{ opacity, y, scale }} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.07] text-sm font-medium text-white/80 mb-8"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Digital sovereignty for Zimbabwean enterprises
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-white"
        >
          <span className="text-gradient">Build. Scale.</span>
          <br />
          <span className="text-white/90">Own Your Future.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
        >
          AI-driven tools, community intelligence, and tender access — built for Zimbabwean entrepreneurs who refuse to wait.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <MagneticButton asChild size="default" className="font-headline text-sm tracking-wider border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60 px-6">
            <Link href="/assessment">
              Start Free Assessment
              <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </MagneticButton>
          <MagneticButton asChild size="default" variant="outline" className="font-headline text-sm tracking-wider border border-primary/20 text-primary/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40 px-6">
            <Link href="/toolkit">Explore AI Toolkit</Link>
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-6 text-sm text-white/50"
        >
          <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-primary" />No credit card</span>
          <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-secondary" />Free tier available</span>
          <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-accent" />5 min assessment</span>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: useTransform(scrollYProgress, [0, 0.3], [0, 1]) }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  );
}

function TrustedBySection() {
  return (
    <section className="relative py-10 border-y border-white/10 bg-white/[0.02]">
      <div className="container">
        <p className="text-center text-xs tracking-[0.3em] text-white/50 uppercase mb-6 font-headline">Trusted by enterprises across Zimbabwe</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {["Harare Tech Hub", "Zim-Artisans", "Mutare Digital", "Bulawayo Labs", "Chiredi Agri"].map((name) => (
            <span key={name} className="text-sm font-headline font-bold tracking-wider text-white/40 hover:text-white/70 transition-colors">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const steps = [
    {
      icon: <BarChart className="h-4 w-4" />,
      title: "Assess",
      body: "15-minute readiness test. Know your baseline.",
      symbol: <Sankofa className="h-8 w-8 text-primary/20" />,
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      title: "Act",
      body: "AI insights. Personalized roadmap. Real results.",
      symbol: <GyeNyame className="h-8 w-8 text-primary/20" />,
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Grow",
      body: "Tenders, network, dashboard — your edge.",
      symbol: <Dwennimmen className="h-8 w-8 text-primary/20" />,
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-20 md:py-28">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center space-y-3 mb-12"
        >
          <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">How it works</span>
          <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-white">
            3 Steps to <span className="text-gradient">Sovereignty</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-0 bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="relative group p-8 md:p-10 hover:bg-white/[0.02] transition-colors duration-300"
            >
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity duration-300">
                {step.symbol}
              </div>
              <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                    {step.icon}
                  </div>
                  <span className="font-headline text-xs tracking-[0.2em] text-primary/70">0{i + 1}</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-white">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <MagneticButton asChild variant="outline" className="font-headline text-xs tracking-wider border border-primary/20 text-primary/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40">
            <Link href="/sign-up">
              Start Your Journey <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <BarChart className="h-4 w-4" />,
      title: "Readiness Assessment",
      body: "Radar-chart analysis of your digital maturity. Know exactly where to focus.",
      tags: ["Strengths", "Gaps", "Score"],
      href: "/assessment",
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      title: "AI Agent Workforce",
      body: "Deploy agents for logo design, content, projections — from your dashboard.",
      tags: ["Design", "Content", "Automation"],
      href: "/toolkit",
    },
    {
      icon: <Briefcase className="h-4 w-4" />,
      title: "Tender Intelligence",
      body: "AI-curated opportunities relevant to your industry. Never miss a bid.",
      tags: ["Opportunities", "Alerts", "Bids"],
      href: "/tenders",
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: "SME Network",
      body: "Connect, share, collaborate. Your next partner is one post away.",
      tags: ["Network", "Collaborate", "Support"],
      href: "/community",
    },
  ];

  return (
    <section className="relative py-20 md:py-28">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center space-y-3 mb-12"
        >
          <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">What you get</span>
          <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-white">
            Tools That <span className="text-gradient">Multiply</span> You
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <TiltCard>
                <Link href={feature.href}>
                  <div className="group relative rounded-xl border border-white/10 bg-white/[0.03] p-8 hover:border-primary/30 transition-all duration-300 hover:bg-white/[0.05] h-full">
                    <div className="relative z-10 space-y-5">
                      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                        {feature.icon}
                      </div>
                      <h3 className="font-headline text-xl font-bold text-white">{feature.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{feature.body}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {feature.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/[0.06] border border-white/10 text-white/50">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            <MagneticButton asChild variant="outline" className="font-headline text-xs tracking-wider border border-primary/20 text-primary/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40">
              <Link href="/sign-in">Sign In</Link>
            </MagneticButton>
            <MagneticButton asChild className="font-headline text-xs tracking-wider border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60">
              <Link href="/sign-up">Get Started <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MetricsSection() {
  return (
    <section className="relative py-16 md:py-20">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-0 bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10"
        >
          {[
            { value: 5000, suffix: "+", label: "SMEs Assessed", icon: <Shield className="h-4 w-4 text-primary" /> },
            { value: 300, suffix: "+", label: "Monthly Tenders", icon: <Zap className="h-4 w-4 text-secondary" /> },
            { value: 85, suffix: "%", label: "Report Growth in 3 Months", icon: <TrendingUp className="h-4 w-4 text-accent" /> },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-8 md:p-10 text-center group hover:bg-white/[0.02] transition-colors duration-300"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                {metric.icon}
                <span className="font-headline text-xs tracking-[0.2em] text-white/50 uppercase">Impact</span>
              </div>
              <div className="text-white">
                <span className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                  <AnimatedCounter to={metric.value} suffix={metric.suffix} />
                </span>
              </div>
              <p className="text-sm text-white/60 font-medium mt-2">{metric.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function UserStoriesSection() {
  const stories = [
    {
      name: "Tafadzwa M.",
      business: "Fresh Foods, Harare",
      role: "Founder",
      quote: "Radbit showed me where to focus. The assessment alone was worth it — I went from overwhelmed to a clear roadmap in 15 minutes.",
      metric: "2x revenue in 6 months",
      tags: ["Assessment", "Roadmap"],
      initials: "TM",
    },
    {
      name: "Rudo D.",
      business: "Zim-Artisans, Bulawayo",
      role: "Creative Director",
      quote: "Connected with a supplier through the community forum. We're now collaborating on exports to South Africa.",
      metric: "4 new export partners",
      tags: ["Community", "Network"],
      initials: "RD",
    },
    {
      name: "Chipo M.",
      business: "Tech Innovations, Mutare",
      role: "CEO",
      quote: "The financial projections tool helped us close seed funding. Practical, tailored, and actually useful for the Zimbabwean market.",
      metric: "$50K seed funding",
      tags: ["AI Tools", "Funding"],
      initials: "CM",
    },
  ];

  return (
    <section className="relative py-20 md:py-28">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center space-y-3 mb-10"
        >
          <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">User Stories</span>
          <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-white">
            Real Results from <span className="text-gradient">Real Entrepreneurs</span>
          </h2>
          <p className="text-white/60 max-w-lg mx-auto text-base">
            See how Zimbabwean SMEs are using Radbit to grow, connect, and compete.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto"
        >
          {stories.map((story) => (
            <motion.div
              key={story.name}
              variants={itemVariants}
              className="group relative"
            >
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-b from-primary/30 to-secondary/30 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
              <div className="relative rounded-xl border border-white/10 bg-white/[0.03] p-6 h-full flex flex-col group-hover:bg-white/[0.05] transition-colors duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-xs font-bold text-black">{story.initials}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className="h-3 w-3 fill-primary/80 text-primary/80" />
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                    <Sparkles className="h-3 w-3" />
                    {story.metric}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">&ldquo;{story.quote}&rdquo;</p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
                  <p className="font-headline text-sm font-bold text-white/90">{story.name}</p>
                  <p className="text-xs text-white/50">{story.business} &middot; {story.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-white/50 mb-4">Join 5,000+ SMEs already on Radbit</p>
          <MagneticButton asChild size="default" className="font-headline text-sm tracking-wider border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60">
            <Link href="/sign-up">
              Create Your Free Account <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden border-t border-white/10">
      <Suspense fallback={null}>
        <WaveField
          className="absolute inset-0 z-0 opacity-10"
          waveCount={1}
          speed={0.1}
          amplitude={15}
          mouseReactivity={0.1}
        />
      </Suspense>
      <div className="container relative z-10 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-white">
            Your Next Move.
            <br />
            <span className="text-gradient">Start Today.</span>
          </h2>
          <p className="text-base md:text-lg text-white/60 max-w-lg mx-auto">
            No card required. 15 minutes to your first insights.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <MagneticButton asChild size="lg" className="font-headline text-sm tracking-wider border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 hover:border-primary/60 animate-glow-pulse px-8">
            <Link href="/assessment">
              Start Free Assessment
              <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="relative border-t border-white/10 bg-black/60">
      <ChevronPattern variant="divider" direction="down" className="absolute -top-16 opacity-30" />
      <div className="container pt-20 pb-12">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="font-headline text-xl font-bold tracking-wide text-white">RADBIT</span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              Digital sovereignty for Zimbabwean enterprises.
            </p>
            <div className="flex gap-3">
              <GyeNyame className="h-5 w-5 text-primary/40" />
              <Dwennimmen className="h-5 w-5 text-primary/40" />
              <Sankofa className="h-5 w-5 text-primary/40" />
            </div>
          </div>
          {[
            {
              title: "Platform",
              links: [
                { href: "/assessment", label: "Assessment" },
                { href: "/toolkit", label: "AI Toolkit" },
                { href: "/community", label: "Community" },
                { href: "/tenders", label: "Tenders" },
              ],
            },
            {
              title: "Company",
              links: [
                { href: "#", label: "About" },
                { href: "#", label: "Contact" },
                { href: "#", label: "Privacy" },
                { href: "#", label: "Terms" },
              ],
            },
            {
              title: "Connect",
              links: [
                { href: "#", label: "Facebook" },
                { href: "#", label: "X / Twitter" },
                { href: "#", label: "LinkedIn" },
              ],
            },
          ].map(group => (
            <div key={group.title}>
              <h3 className="font-headline text-sm font-bold tracking-wider mb-5 text-white/80">{group.title}</h3>
              <ul className="space-y-3">
                {group.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/50 hover:text-white/90 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} Radbit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [scrollValue, setScrollValue] = useState(0);

  useEffect(() => {
    document.title = "Radbit — Digital Sovereignty for Zimbabwean Enterprises";
    registerVisibilityHandler(() => {}, () => {});

    const unsubscribe = scrollProgress.on("change", (v) => setScrollValue(v));
    return () => unsubscribe();
  }, [scrollProgress]);

  return (
    <div ref={containerRef} className="flex flex-col w-full min-h-full bg-background overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <GreatZimbabweScene className="w-full h-full" scrollProgress={scrollValue} />
      </div>
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/30 via-background/60 to-background pointer-events-none" />

      <div className="relative z-10">
        <HeroSection />
        <TrustedBySection />
        <HowItWorksSection />
        <FeaturesSection />
        <MetricsSection />
        <UserStoriesSection />
        <section className="container mx-auto py-8 max-w-4xl relative z-10">
          <AdUnit slot="landing-content" format="rectangle" className="min-h-[90px]" />
        </section>
        <CTASection />
        <FooterSection />
      </div>
    </div>
  );
}

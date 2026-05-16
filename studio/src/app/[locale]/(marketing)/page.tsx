"use client";

import { useRef, useEffect, lazy, Suspense } from "react";
import { ChevronRight, BarChart, Lightbulb, TrendingUp, Users, Briefcase, Sparkles, Quote } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticButton } from "@/components/magnetic-button";
import { TiltCard } from "@/components/tilt-card";
import { AnimatedCounter } from "@/components/animated-counter";
import { GyeNyame, Sankofa, Dwennimmen } from "@/components/adinkra-symbols";
import { ChevronPattern } from "@/components/chevron-pattern";
import { AdUnit } from "@/components/adsense";
import { registerVisibilityHandler } from "@/lib/device";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const ParticleField = lazy(() => import("@/components/particle-field").then(m => ({ default: m.ParticleField })));
const WaveField = lazy(() => import("@/components/wave-field").then(m => ({ default: m.WaveField })));

function useParallax(ref: React.RefObject<HTMLElement | null>, offset: [number, number] = [0, 0]) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  return useTransform(scrollYProgress, [0, 1], offset);
}

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgY = useParallax(sectionRef, [0, -80]);
  const midY = useParallax(sectionRef, [0, -40]);
  const fgY = useParallax(sectionRef, [0, -20]);

  return (
    <section ref={sectionRef} className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      <Suspense fallback={null}>
        <WaveField
          className="absolute inset-0 z-0 opacity-40"
          waveCount={5}
          speed={0.4}
          amplitude={50}
          mouseReactivity={0.6}
        />
      </Suspense>
      <Suspense fallback={null}>
        <ParticleField
          className="absolute inset-0 z-[1]"
          particleCount={120}
          mouseRadius={200}
          connectionDistance={150}
          depthLayers={3}
          showTrails={true}
          waveDistortion={true}
          orbitStrength={0.03}
        />
      </Suspense>
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-background/0 via-background/0 to-background" />
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-[2]">
        <ChevronPattern variant="background" className="text-primary" />
      </motion.div>
      <motion.div style={{ y: midY }} className="absolute inset-0 z-[3] pointer-events-none">
        <GyeNyame className="absolute -top-10 -right-10 w-72 h-72 text-primary/[0.04] dark:text-primary/[0.02]" />
        <Sankofa className="absolute top-1/3 -left-16 w-56 h-56 text-primary/[0.03] dark:text-primary/[0.015]" />
      </motion.div>
      <motion.div style={{ y: fgY }} className="absolute inset-0 z-[3] pointer-events-none">
        <Dwennimmen className="absolute bottom-1/4 right-1/4 w-32 h-32 text-primary/[0.05] dark:text-primary/[0.025]" />
      </motion.div>
      <div className="container relative z-10 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Digital sovereignty for Zimbabwean enterprises
            </div>
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]">
              <span className="text-gradient bg-[length:200%_100%] animate-gradient-shift">
                Build. Scale.
              </span>
              <br />
              <span>Own Your Future.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              AI-driven tools, community intelligence, and tender access — built for Zimbabwean entrepreneurs who refuse to wait.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <MagneticButton asChild size="lg" className="font-headline text-base tracking-wider">
              <Link href="/assessment">
                Start Free Assessment
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </MagneticButton>
            <MagneticButton asChild size="lg" variant="outline" className="font-headline text-base tracking-wider">
              <Link href="/toolkit">Explore AI Toolkit</Link>
            </MagneticButton>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex items-center justify-center gap-8 text-xs text-muted-foreground pt-4"
          >
            <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-primary" />No credit card</span>
            <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-secondary" />Free tier available</span>
            <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-accent" />5 min assessment</span>
          </motion.div>
        </div>
      </div>
      <ChevronPattern variant="divider" direction="down" className="absolute bottom-0 z-10" />
    </section>
  );
}

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const floatY1 = useParallax(sectionRef, [0, -60]);
  const floatY2 = useParallax(sectionRef, [0, 40]);
  const steps = [
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Assess",
      body: "15-minute readiness test. Know your baseline.",
      symbol: <Sankofa className="h-12 w-12 text-primary/10" />,
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Act",
      body: "AI insights. Personalized roadmap. Real results.",
      symbol: <GyeNyame className="h-12 w-12 text-primary/10" />,
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Grow",
      body: "Tenders, network, dashboard — your edge.",
      symbol: <Dwennimmen className="h-12 w-12 text-primary/10" />,
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.03]" />
      <motion.div style={{ y: floatY1 }} className="absolute inset-0 z-0 pointer-events-none">
        <Sankofa className="absolute top-16 left-1/4 w-40 h-40 text-primary/[0.03] dark:text-primary/[0.015]" />
      </motion.div>
      <motion.div style={{ y: floatY2 }} className="absolute inset-0 z-0 pointer-events-none">
        <Dwennimmen className="absolute bottom-16 right-1/4 w-36 h-36 text-primary/[0.025] dark:text-primary/[0.012]" />
      </motion.div>
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center space-y-4 mb-16"
        >
          <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">How it works</span>
          <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight">
            3 Steps to Digital
            <span className="text-gradient bg-[length:200%_100%] animate-gradient-shift"> Sovereignty</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          <svg
            className="absolute top-1/2 left-[15%] right-[15%] h-px hidden md:block -translate-y-1/2 text-primary/20"
            viewBox="0 0 100 1"
            preserveAspectRatio="none"
          >
            <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="currentColor" strokeDasharray="4 4" />
          </svg>
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center gap-6 p-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <div className="absolute top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {step.symbol}
                </div>
                <h3 className="font-headline text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const floatY = useParallax(sectionRef, [0, -70]);
  const features = [
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Readiness Assessment",
      body: "Radar-chart analysis of your digital maturity. Know exactly where to focus.",
      tags: ["Strengths", "Gaps", "Score"],
      href: "/assessment",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI Agent Workforce",
      body: "Deploy agents for logo design, content, projections — from your dashboard.",
      tags: ["Design", "Content", "Automation"],
      href: "/toolkit",
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Tender Intelligence",
      body: "AI-curated opportunities relevant to your industry. Never miss a bid.",
      tags: ["Opportunities", "Alerts", "Bids"],
      href: "/tenders",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "SME Network",
      body: "Connect, share, collaborate. Your next partner is one post away.",
      tags: ["Network", "Collaborate", "Support"],
      href: "/community",
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-muted/30" />
      <ChevronPattern variant="background" className="text-primary opacity-[0.02]" />
      <motion.div style={{ y: floatY }} className="absolute inset-0 z-0 pointer-events-none">
        <GyeNyame className="absolute top-1/2 -translate-y-1/2 -right-20 w-80 h-80 text-primary/[0.02] dark:text-primary/[0.01]" />
      </motion.div>
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center space-y-4 mb-16"
        >
          <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">What you get</span>
          <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight">
            Tools That <span className="text-gradient bg-[length:200%_100%] animate-gradient-shift">Multiply</span> You
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <TiltCard>
                <Link href={feature.href}>
                  <div className="group relative h-full rounded-2xl border border-border/50 bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
                      <GyeNyame className="w-full h-full text-primary" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="font-headline text-xl font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.body}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {feature.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/5 border border-primary/10 text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ChevronRight className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const floatY = useParallax(sectionRef, [0, -50]);
  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <ChevronPattern variant="background" className="text-primary opacity-[0.02]" />
      <motion.div style={{ y: floatY }} className="absolute inset-0 z-0 pointer-events-none">
        <Dwennimmen className="absolute top-1/4 left-1/6 w-48 h-48 text-primary/[0.03] dark:text-primary/[0.015]" />
        <Sankofa className="absolute bottom-1/4 right-1/6 w-40 h-40 text-secondary/[0.03] dark:text-secondary/[0.015]" />
      </motion.div>
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            { value: 5000, suffix: "+", label: "SMEs Assessed", color: "text-primary" },
            { value: 300, suffix: "+", label: "Monthly Tenders", color: "text-secondary" },
            { value: 85, suffix: "%", label: "Report Growth in 3 Months", color: "text-accent" },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-2xl border border-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative text-center p-8 space-y-3">
                <ChevronPattern variant="border" className="justify-center mb-4" />
                <div className={metric.color}>
                  <span className="font-headline text-5xl md:text-6xl font-bold tracking-tighter">
                    <AnimatedCounter to={metric.value} suffix={metric.suffix} />
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const floatY = useParallax(sectionRef, [0, 60]);
  const testimonials = [
    {
      name: "Tafadzwa M.",
      role: "Fresh Foods, Harare",
      quote: "Radbit showed me where to focus. The assessment alone was worth it — I went from overwhelmed to a clear roadmap in 15 minutes.",
    },
    {
      name: "Rudo D.",
      role: "Zim-Artisans, Bulawayo",
      quote: "Connected with a supplier through the community forum. We're now collaborating on exports. This is more than software — it's an ecosystem.",
    },
    {
      name: "Chipo M.",
      role: "Tech Innovations, Mutare",
      quote: "The financial projections tool helped us close seed funding. Practical, tailored, and actually useful for the Zimbabwean market.",
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.02]" />
      <motion.div style={{ y: floatY }} className="absolute inset-0 z-0 pointer-events-none">
        <GyeNyame className="absolute -top-10 -right-10 w-64 h-64 text-primary/[0.04] dark:text-primary/[0.02]" />
        <Dwennimmen className="absolute -bottom-10 -left-10 w-52 h-52 text-primary/[0.03] dark:text-primary/[0.015]" />
      </motion.div>
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center space-y-4 mb-16"
        >
          <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">Voices</span>
          <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight">
            Built for <span className="text-gradient bg-[length:200%_100%] animate-gradient-shift">Zimbabwe</span>
          </h2>
        </motion.div>
        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay()]}
          className="w-full max-w-3xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((t, i) => (
              <CarouselItem key={i}>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="p-1"
                >
                  <div className="relative rounded-2xl border border-border/50 bg-card p-8 md:p-12 text-center">
                    <Quote className="absolute top-6 left-6 h-8 w-8 text-primary/10" />
                    <Dwennimmen className="absolute bottom-6 right-6 h-8 w-8 text-primary/5" />
                    <div className="relative z-10 space-y-6 max-w-lg mx-auto">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mx-auto flex items-center justify-center">
                        <span className="font-headline text-xl font-bold text-primary">{t.name.charAt(0)}</span>
                      </div>
                      <p className="text-base text-muted-foreground leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                      <div>
                        <p className="font-headline font-bold">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <Suspense fallback={null}>
        <WaveField
          className="absolute inset-0 z-0 opacity-30"
          waveCount={3}
          speed={0.2}
          amplitude={35}
          mouseReactivity={0.4}
        />
      </Suspense>
      <Suspense fallback={null}>
        <ParticleField
          className="absolute inset-0 z-[1]"
          particleCount={60}
          mouseRadius={150}
          connectionDistance={100}
          depthLayers={2}
          showTrails={true}
          waveDistortion={true}
        />
      </Suspense>
      <div className="absolute inset-0 z-[2] bg-gradient-to-r from-primary/10 via-background/80 to-secondary/10" />
      <ChevronPattern variant="divider" direction="up" className="absolute top-0 z-10" />
      <div className="container relative z-10 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <h2 className="font-headline text-4xl md:text-6xl font-bold tracking-tight">
            Your Next Move.
            <br />
            <span className="text-gradient bg-[length:200%_100%] animate-gradient-shift">Start Today.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            No card required. 15 minutes to your first insights.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MagneticButton asChild size="lg" className="font-headline text-base tracking-wider animate-glow-pulse">
            <Link href="/assessment">
              Start Free Assessment
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="relative bg-card border-t border-border/50">
      <ChevronPattern variant="divider" direction="down" className="absolute -top-16" />
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="font-headline text-xl font-bold tracking-wide">RADBIT</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Digital sovereignty for Zimbabwean enterprises.
            </p>
            <div className="flex gap-3">
              <GyeNyame className="h-5 w-5 text-primary/30" />
              <Dwennimmen className="h-5 w-5 text-primary/30" />
              <Sankofa className="h-5 w-5 text-primary/30" />
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
              <h3 className="font-headline text-sm font-bold tracking-wider mb-4">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border/30 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Radbit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  useEffect(() => {
    document.title = "Radbit — Digital Sovereignty for Zimbabwean Enterprises";
    registerVisibilityHandler(
      () => {},
      () => {}
    );
  }, []);

  return (
    <div className="flex flex-col w-full min-h-full bg-background overflow-x-hidden">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <MetricsSection />
      <TestimonialsSection />
      <section className="container mx-auto py-8 max-w-4xl">
        <AdUnit slot="landing-content" format="rectangle" className="min-h-[90px]" />
      </section>
      <CTASection />
      <FooterSection />
    </div>
  );
}

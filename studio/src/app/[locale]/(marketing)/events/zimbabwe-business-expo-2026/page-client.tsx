"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  Sparkles,
  Gift,
  Users,
  ChevronRight,
  Monitor,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";


const EXPO_DATE = new Date("2026-12-18T00:00:00").getTime();

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function useCountdown(target: number): Countdown {
  const calc = useCallback((): Countdown => {
    const diff = Math.max(0, target - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [target]);

  const [countdown, setCountdown] = useState<Countdown>(calc);

  useEffect(() => {
    const interval = setInterval(() => setCountdown(calc()), 1000);
    return () => clearInterval(interval);
  }, [calc]);

  return countdown;
}

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
  const c = useCountdown(EXPO_DATE);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-background to-background pointer-events-none" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-sm font-medium text-amber-400 mb-8"
        >
          <Calendar className="h-3.5 w-3.5" />
          December 18, 2026 — Golden Conifer Conference Centre, Harare
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-foreground"
        >
          Zimbabwe Business
          <br />
          <span className="text-gradient">Expo 2026</span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-6 text-base md:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed"
        >
          Zimbabwe&apos;s premier B2B networking and business development event. Connect with
          industry leaders, diaspora investors, and government stakeholders — all under one roof.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-10 grid grid-cols-4 gap-4 max-w-md mx-auto"
        >
          {[
            { value: c.days, label: "Days" },
            { value: c.hours, label: "Hours" },
            { value: c.minutes, label: "Minutes" },
            { value: c.seconds, label: "Seconds" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3 text-center"
            >
              <div className="font-headline text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-foreground/40 uppercase tracking-wider mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="font-headline text-sm tracking-wider gap-2 bg-amber-600 hover:bg-amber-500 text-foreground">
            <Link href="#register">
              <Ticket className="h-4 w-4" /> Register Now
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-headline text-sm tracking-wider">
            <Link href="#demo">
              <Monitor className="h-4 w-4" /> Book a Live Demo
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

function EventDetailsSection() {
  return (
    <section className="relative py-16 md:py-20 border-t border-foreground/10 bg-foreground/[0.02]">
      <div className="container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            {
              icon: <Calendar className="h-5 w-5" />,
              title: "Date & Time",
              body: "December 18, 2026\n8:00 AM — 5:00 PM CAT",
            },
            {
              icon: <MapPin className="h-5 w-5" />,
              title: "Venue",
              body: "Golden Conifer Conference Centre\nHarare, Zimbabwe",
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: "Expected Attendance",
              body: "500+ delegates\n50+ exhibitors\n20+ speakers",
            },
          ].map((item) => (
            <motion.div key={item.title} variants={fadeUp}>
              <Card className="h-full bg-foreground/[0.03] border-foreground/10">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 mb-2">
                    {item.icon}
                  </div>
                  <CardTitle className="font-headline text-lg text-foreground">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/60 text-sm whitespace-pre-line leading-relaxed">
                    {item.body}
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

function RegistrationSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    interest: "B2B Attendee",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="register" className="relative py-20 md:py-28">
      <div className="container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center space-y-3 mb-10">
            <span className="font-headline text-xs tracking-[0.3em] text-amber-400 uppercase">
              Registration
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter text-foreground">
              Secure Your <span className="text-gradient">Spot</span>
            </h2>
            <p className="text-foreground/60 max-w-lg mx-auto text-base">
              Choose your attendee type and register for Zimbabwe&apos;s biggest B2B expo of 2026.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="bg-foreground/[0.03] border-foreground/10 max-w-lg mx-auto">
              <CardHeader>
                <CardTitle className="font-headline text-lg text-foreground">Register for Expo 2026</CardTitle>
                <CardDescription className="text-foreground/50 text-sm">
                  Fill in your details to reserve your pass.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8 space-y-3">
                    <Sparkles className="h-10 w-10 text-amber-400 mx-auto" />
                    <p className="text-foreground font-headline font-bold text-lg">Registration Confirmed!</p>
                    <p className="text-sm text-foreground/50">
                      We&apos;ll send your ticket and event details to{" "}
                      <span className="text-amber-400">{formData.email}</span>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="expo-name" className="text-sm text-foreground/70 mb-1.5 block">
                        Full Name
                      </label>
                      <Input
                        id="expo-name"
                        type="text"
                        placeholder="Tatenda Chigumira"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-foreground/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="expo-email" className="text-sm text-foreground/70 mb-1.5 block">
                        Email Address
                      </label>
                      <Input
                        id="expo-email"
                        type="email"
                        placeholder="tatenda@business.co.zw"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-foreground/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="expo-company" className="text-sm text-foreground/70 mb-1.5 block">
                        Company / Organisation
                      </label>
                      <Input
                        id="expo-company"
                        type="text"
                        placeholder="Acme Zimbabwe (Pvt) Ltd"
                        value={formData.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        required
                        className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-foreground/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="expo-interest" className="text-sm text-foreground/70 mb-1.5 block">
                        Interest Type
                      </label>
                      <select
                        id="expo-interest"
                        value={formData.interest}
                        onChange={(e) => handleChange("interest", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="B2B Attendee" className="bg-background">
                          B2B Attendee
                        </option>
                        <option value="Diaspora Investor" className="bg-background">
                          Diaspora Investor
                        </option>
                        <option value="Exhibitor" className="bg-background">
                          Exhibitor
                        </option>
                      </select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full font-headline gap-2 bg-amber-600 hover:bg-amber-500 text-foreground"
                    >
                      <Ticket className="h-4 w-4" /> Register Now
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

function LiveDemoSection() {
  return (
    <section id="demo" className="relative py-20 md:py-28 border-t border-foreground/10 bg-foreground/[0.02]">
      <div className="container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto"
        >
          <motion.div variants={stagger} className="space-y-6">
            <motion.span
              variants={fadeUp}
              className="font-headline text-xs tracking-[0.3em] text-amber-400 uppercase"
            >
              At the Expo
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="font-headline text-3xl md:text-4xl font-bold tracking-tighter text-foreground"
            >
              Book a <span className="text-gradient">Live Demo</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-foreground/60 text-base leading-relaxed"
            >
              Visit the Radbit booth at the Zimbabwe Business Expo 2026 for a personalised demo.
              See how AI agents, tender intelligence, and digital readiness assessments can
              transform your business — live, in person.
            </motion.p>
            <motion.ul variants={stagger} className="space-y-3">
              {[
                "Live AI Agent Workforce demonstrations",
                "Personalised Digital Readiness Assessment",
                "Tender Intelligence platform walkthrough",
                "Exclusive expo-only pricing packages",
              ].map((item) => (
                <motion.li
                  key={item}
                  variants={fadeUp}
                  className="flex items-center gap-2 text-sm text-foreground/70"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
            <motion.div variants={fadeUp}>
              <Button asChild size="lg" className="font-headline text-sm tracking-wider gap-2">
                <a href="mailto:radbit@culturalcoder.co.zw?subject=Expo%202026%20Demo%20Booking&body=Hi%2C%20I'd%20like%20to%20book%20a%20Radbit%20demo%20at%20the%20Zimbabwe%20Business%20Expo%202026.">
                  <Calendar className="h-4 w-4" /> Book Your Demo Slot
                </a>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div variants={fadeIn} className="hidden md:flex justify-center">
            <div className="relative w-full max-w-sm aspect-square">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20" />
              <div className="absolute inset-4 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Monitor className="h-12 w-12 text-amber-400 mx-auto" />
                  <p className="text-amber-300 font-headline font-bold text-lg">Booth #12</p>
                  <p className="text-amber-400/60 text-xs">Radbit SME Hub</p>
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-sm font-medium text-amber-400"
          >
            <Gift className="h-3.5 w-3.5" />
            Expo Exclusive Offer
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-foreground"
          >
            Register with EXPO2026
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-foreground/60 text-base leading-relaxed"
          >
            Use partner code{" "}
            <span className="inline-block px-3 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-sm font-bold">
              EXPO2026
            </span>{" "}
            when registering to receive{" "}
            <strong className="text-foreground">15% off your first Radbit subscription</strong> and a
            free Digital Readiness Assessment report.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="font-headline text-sm tracking-wider gap-2 bg-amber-600 hover:bg-amber-500 text-foreground"
            >
              <Link href="/assessment?ref=expo2026">
                Start Free Assessment <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-headline text-sm tracking-wider">
              <Link href="/sign-up?ref=expo2026">
                Sign Up with EXPO2026 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default function ZimbabweBusinessExpoPage() {
  return (
    <div className="flex flex-col w-full min-h-full bg-background overflow-x-hidden">
      <HeroSection />
      <EventDetailsSection />
      <RegistrationSection />
      <LiveDemoSection />
      <OfferSection />
      <footer className="border-t border-foreground/10 py-8 text-center text-sm text-foreground/40">
        <div className="container">
          <p>
            © {new Date().getFullYear()} Radbit. Official Technology Partner of Zimbabwe Business Expo 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}

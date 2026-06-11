"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, Users, TrendingUp, ArrowRight, Mail, Sparkles, Shield, BarChart, Lightbulb } from "lucide-react";
import { MagneticButton } from "@/components/magnetic-button";
import { GradientOrb } from "@/components/animations/scroll-effects";
import { ChevronPattern } from "@/components/chevron-pattern";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const services = [
  {
    icon: <Building2 className="h-5 w-5" />,
    title: "Business Structuring",
    body: "Expert guidance on structuring your enterprise for growth, compliance, and investment readiness — tailored to Zimbabwe's regulatory environment.",
  },
  {
    icon: <BarChart className="h-5 w-5" />,
    title: "Digital Readiness Audit",
    body: "Comprehensive assessment of your digital capabilities with actionable recommendations calibrated to Zimbabwean infrastructure realities.",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Growth Strategy",
    body: "Data-driven growth plans leveraging AI insights and market intelligence specific to Zimbabwean industry sectors.",
  },
];

const differentiators = [
  {
    icon: <Shield className="h-4 w-4" />,
    title: "Africa-First Approach",
    body: "Strategy built for load-shedding, multi-currency volatility, and mobile-money-first economies — not adapted from markets that don't share these challenges.",
  },
  {
    icon: <Lightbulb className="h-4 w-4" />,
    title: "AI-Augmented",
    body: "Every engagement is amplified by Radbit's AI infrastructure — from market analysis to compliance monitoring and performance tracking.",
  },
  {
    icon: <Users className="h-4 w-4" />,
    title: "Local Expertise",
    body: "Deep knowledge of ZIMRA, PRAZ, NSSA, and RBZ regulatory frameworks. Your strategy reflects the real regulatory surface area you operate in.",
  },
];

export default function ConsultancyPage() {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0 opacity-20 pointer-events-none"><GradientOrb /></div>
      <div className="container relative z-10 py-12 md:py-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Now Accepting New Clients
          </span>
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Expert Consultancy for the <span className="text-gradient">African Enterprise</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Combine AI infrastructure with human expertise. Navigate compliance, structure for growth,
            and seize opportunities — with guidance that understands Zimbabwe&apos;s economic reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MagneticButton asChild size="lg" className="font-headline text-sm tracking-wider border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 hover:border-primary/60">
              <a href="mailto:hanzohanic@gmail.com?subject=Consultancy%20Enquiry">
                <Mail className="mr-1.5 h-4 w-4" />
                Book a Free Consultation
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </MagneticButton>
            <MagneticButton asChild size="lg" className="font-headline text-sm tracking-wider border border-foreground/10 bg-card/50 text-foreground hover:bg-card">
              <Link href="/assessment">
                Take Free Assessment
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </MagneticButton>
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-20"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary mb-5">
                {service.icon}
              </div>
              <h3 className="font-headline text-lg font-bold text-foreground mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Why Radbit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center space-y-3 mb-10"
        >
          <h2 className="font-headline text-fluid-3xl font-bold tracking-tighter text-foreground">
            Why Radbit <span className="text-gradient">Consultancy</span>
          </h2>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20"
        >
          {differentiators.map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="text-center space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                {item.icon}
              </div>
              <h3 className="font-headline text-sm font-bold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px] mx-auto">{item.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center border-t border-border pt-12">
          <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
            Ready to Take the First Step?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Book a free 15-minute discovery call. No pitch, no pressure — just practical advice.
          </p>
          <MagneticButton asChild size="lg" className="font-headline text-sm tracking-wider border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 hover:border-primary/60">
            <a href="mailto:hanzohanic@gmail.com?subject=Discovery%20Call">
              <Mail className="mr-1.5 h-4 w-4" />
              Book Discovery Call
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </MagneticButton>
        </div>
      </div>
      <ChevronPattern variant="divider" direction="down" className="opacity-20" />
    </div>
  );
}

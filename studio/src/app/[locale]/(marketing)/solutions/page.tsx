"use client";
/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Zap,
  Sparkles,
  Globe,
  Shield,
  Brain,
  Palette,
  Code,
  Mail,
  MessageCircle,
  Loader2,
  User,
  Building2,
  Briefcase,
  Star,
  Target,
  Rocket,
  Award,
  Clock,
  Boxes,
  TrendingUp,
  Database,
  Code2,
  Lock,
  CreditCard,
  Phone,
} from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { subscriptionPlans } from "@/lib/subscriptions";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/scroll-reveal";
import { Card3D, MagneticElement } from "@/components/animations/interactive-cards";
import { AnimatedCounter } from "@/components/animations/animated-text";
import { GradientOrb } from "@/components/animations/scroll-effects";
import { getSuggestedPackage } from "@/services/onboarding-engine-client";
import type { Persona, PersonaAnswers } from "@/types/project";

// ─── Persona Config ────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    id: "individual" as Persona,
    label: "For Myself",
    description: "Individual / Freelancer",
    icon: <User className="h-4 w-4" />,
  },
  {
    id: "sme" as Persona,
    label: "For My Business",
    description: "SME",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    id: "enterprise" as Persona,
    label: "For Enterprise",
    description: "Large Organization",
    icon: <Briefcase className="h-4 w-4" />,
  },
];

const NEED_OPTIONS: { value: PersonaAnswers["need"]; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "online-store", label: "Online Store" },
  { value: "business-software", label: "Business Software" },
  { value: "consulting", label: "Consulting" },
  { value: "ai-tools", label: "AI Tools" },
  { value: "not-sure", label: "Not Sure" },
];

const BUDGET_OPTIONS: { value: PersonaAnswers["budget"]; label: string }[] = [
  { value: "under-500", label: "< $500" },
  { value: "500-2000", label: "$500 – $2,000" },
  { value: "2000-10000", label: "$2,000 – $10,000" },
  { value: "over-10000", label: "$10,000+" },
  { value: "not-sure", label: "Not Sure" },
];

// ─── Web Packages ─────────────────────────────────────────────────────────────

const WEB_PACKAGES = [
  {
    name: "Starter Site",
    price: 150,
    tagline: "Get online fast",
    features: [
      "1-page business site",
      "Contact form",
      "Mobile responsive",
      "Hosting setup",
      "1 revision round",
      ".co.zw domain (1st year)",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Business Site",
    price: 400,
    tagline: "Showcase your brand",
    features: [
      "5-page responsive site",
      "Content management (CMS)",
      "SEO basics",
      "Google Analytics",
      "Blog page",
      "2 revision rounds",
      "Hosting + domain (1st year)",
      "5 custom email addresses",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "E-Commerce",
    price: 1000,
    tagline: "Sell online",
    features: [
      "Online store setup",
      "EcoCash / Stripe payments",
      "Product management",
      "Order on WhatsApp",
      "Inventory tracking",
      "3 revision rounds",
      "Hosting + domain (1st year)",
      "10 custom email addresses",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Custom Web App",
    price: 2500,
    tagline: "Built for your workflow",
    features: [
      "Bespoke web application",
      "API integration",
      "Database design",
      "User authentication & roles",
      "Custom admin dashboard",
      "6 months support & maintenance",
      "Performance optimization",
    ],
    cta: "Request Quote",
    popular: false,
  },
];

// ─── ERP Tiers ─────────────────────────────────────────────────────────────────

const ERP_TIERS = [
  {
    name: "ERP Starter",
    price: 49,
    tagline: "Essential business tools",
    features: [
      "Cloud-hosted ERP",
      "5 users included",
      "Inventory management",
      "Accounting (GL, P&L, Balance Sheet)",
      "Invoicing & quotations",
      "ZIMRA FDMS compliant",
      "Email support",
      "Monthly backups",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "ERP Business",
    price: 149,
    tagline: "Scale your operations",
    features: [
      "Everything in Starter",
      "25 users included",
      "HR & payroll module",
      "CRM & vendor management",
      "Procurement & purchase orders",
      "Multi-branch support",
      "WhatsApp support",
      "Monthly reports & analytics",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "ERP Enterprise",
    price: 399,
    tagline: "Full operational control",
    features: [
      "Everything in Business",
      "Unlimited users",
      "Custom modules",
      "API integrations",
      "On-premise deployment option",
      "SLA guarantee",
      "Dedicated account manager",
      "24/7 priority support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
  {
    name: "Custom ERP",
    price: null,
    tagline: "Built to your workflows",
    features: [
      "Fully bespoke system",
      "Custom module development",
      "Legacy system migration",
      "Data pipeline & analytics",
      "Training & documentation",
      "Ongoing maintenance & support",
      "Dedicated project team",
    ],
    cta: "Request Quote",
    popular: false,
  },
];

// ─── Professional Services ─────────────────────────────────────────────────────

const PROFESSIONAL_SERVICES = [
  {
    name: "Cybersecurity Audit",
    icon: <Shield className="h-6 w-6" />,
    price: 500,
    description: "Protect your digital assets with expert security assessment.",
    features: [
      "Vulnerability assessment",
      "Penetration testing",
      "Network & firewall review",
      "Compliance report (ISO, GDPR)",
      "Remediation plan",
      "Follow-up consultation",
    ],
    cta: "Book Audit",
  },
  {
    name: "Business Strategy",
    icon: <Brain className="h-6 w-6" />,
    price: 800,
    description: "Shape your growth trajectory with tailored strategies.",
    features: [
      "Market analysis",
      "Growth roadmap",
      "Financial projections",
      "Competitive positioning",
      "3-month advisory",
      "Monthly progress reviews",
    ],
    cta: "Get Started",
  },
  {
    name: "Brand Management",
    icon: <Palette className="h-6 w-6" />,
    price: 600,
    description: "Cultivate a strong brand identity for lasting impact.",
    features: [
      "Logo design",
      "Brand guidelines",
      "Social media kit",
      "Business stationery",
      "6-month support",
      "Brand audit & refresh",
    ],
    cta: "Get Started",
  },
  {
    name: "AI/ML Integration",
    icon: <Code className="h-6 w-6" />,
    price: 2000,
    description: "Harness AI to drive innovation in your business.",
    features: [
      "Custom AI solution design",
      "Data pipeline setup",
      "Model training & testing",
      "Production deployment",
      "Performance monitoring",
      "Ongoing optimization",
    ],
    cta: "Request Quote",
  },
];

// ─── Consultancy Services (animated grid) ──────────────────────────────────────

const CONSULTANCY_SERVICES = [
  {
    title: "Custom Enterprise Architectures",
    description:
      "Systems built for how your business actually works — not generic software you have to adapt to. Handles your specific workflows, compliance rules, and operational quirks.",
    icon: Code2,
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    title: "Asset & Margin Protection",
    description:
      "We monitor the things that eat your margins — compliance fines, supply chain disruptions, operational leaks. You get alerts before problems cost you money.",
    icon: Shield,
    color: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-500",
  },
  {
    title: "Business Strategy",
    description:
      "Growth plans based on SADC realities, not Western textbooks. Market entry, operational improvements, and compliance roadmaps that work in this region.",
    icon: TrendingUp,
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-500",
  },
  {
    title: "Brand Management",
    description:
      "Visual identity, messaging, and market positioning that make your business look as credible as any global competitor — to partners, investors, and government buyers.",
    icon: Palette,
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
  {
    title: "Operational Multipliers",
    description:
      "Automate the daily tasks you shouldn't be doing yourself — inventory tracking, invoicing, compliance checks. You only step in when something unusual happens.",
    icon: Database,
    color: "from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-500",
  },
  {
    title: "Agentic System Automation",
    description:
      "Your system drafts tenders, runs compliance checks, reconciles ledgers, and produces the documentation partners demand — all on its own, in the background.",
    icon: Brain,
    color: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-500",
  },
];

// ─── Maturity Journey ──────────────────────────────────────────────────────────

const MATURITY_STEPS = [
  { title: "First Step", description: "Basic digital presence", icon: Target },
  { title: "Connected", description: "Website + social + email", icon: Globe },
  { title: "Automated", description: "Processes digitized", icon: Zap },
  { title: "Intelligent", description: "Data + AI insights", icon: Brain },
  { title: "Scaled", description: "Enterprise ready", icon: Rocket },
];

// ─── Differentiators ───────────────────────────────────────────────────────────

const DIFFERENTIATORS = [
  {
    title: "Africa-First Approach",
    description:
      "We understand the local context — infrastructure constraints, mobile-first users, and regional compliance requirements.",
    icon: Globe,
  },
  {
    title: "End-to-End Delivery",
    description:
      "From strategy to design to development to deployment. One team, one accountability, zero handoff friction.",
    icon: Boxes,
  },
  {
    title: "Emerging Tech Expertise",
    description:
      "Our team is fluent in AI, machine learning, and blockchain — not just buzzwords, but production-ready implementations.",
    icon: Zap,
  },
  {
    title: "Rapid Turnaround",
    description:
      "Agile methodology with 2-week sprints. See progress weekly, pivot when needed, launch faster than competitors.",
    icon: Clock,
  },
];

// ─── Stats ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 100, prefix: "$", suffix: "+", label: "Starting Budget" },
  { value: 24, suffix: "h", label: "Response Time" },
  { value: 100, suffix: "%", label: "Commitment" },
  { value: 15, suffix: "+", label: "Countries Served" },
];

// ─── FAQ ───────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Do you accept ZiG payments?",
    a: "Yes. We accept ZiG at the prevailing interbank rate (~26 ZiG per USD). EcoCash and bank transfers are available for ZiG payments.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept EcoCash, PayNow (Zimbabwe), PayFast (South Africa), Stripe (credit/debit cards), bank transfers, and ZiG cash. All payments are processed securely.",
  },
  {
    q: "How long does a web project take?",
    a: "Starter sites: 3-5 business days. Business sites: 1-2 weeks. E-commerce: 2-3 weeks. Custom web apps: 4-8 weeks depending on scope.",
  },
  {
    q: "Do ERP systems include training?",
    a: "Yes. All ERP packages include initial training. Starter: 2 hours. Business: 5 hours. Enterprise: unlimited training sessions.",
  },
  {
    q: "Is there a free trial for the AI platform?",
    a: "The Free plan gives you a full experience with limited credits. You can use every feature before committing to a paid plan.",
  },
];

// ─── Form Schema ───────────────────────────────────────────────────────────────

const formSchema = z.object({
  audience: z.enum(["myself", "my-business", "not-sure"]),
  need: z.enum([
    "website",
    "online-store",
    "business-software",
    "consulting",
    "ai-tools",
    "not-sure",
  ]),
  budget: z.enum(["under-500", "500-2000", "2000-10000", "over-10000", "not-sure"]),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  workEmail: z.string().email("Please enter a valid email address"),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  serviceInterest: z.string().optional(),
  budgetRange: z.string().optional(),
  message: z
    .string()
    .min(10, "Please tell us a bit more about your project")
    .max(1000),
  referralSource: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getWebPackets(persona: Persona): typeof WEB_PACKAGES {
  if (persona === "individual") return WEB_PACKAGES.slice(0, 3);
  if (persona === "enterprise")
    return WEB_PACKAGES.filter((p) => p.name === "Custom Web App");
  return WEB_PACKAGES;
}

function getErpTiers(persona: Persona): typeof ERP_TIERS {
  if (persona === "enterprise")
    return ERP_TIERS.filter((t) => t.name === "Custom ERP");
  if (persona === "individual") return [];
  return ERP_TIERS;
}

function getServices(persona: Persona): typeof PROFESSIONAL_SERVICES {
  if (persona === "enterprise")
    return PROFESSIONAL_SERVICES.filter((s) => s.name === "AI/ML Integration");
  if (persona === "individual") return [];
  return PROFESSIONAL_SERVICES;
}

function getConsultancy(persona: Persona): typeof CONSULTANCY_SERVICES {
  if (persona === "enterprise") return CONSULTANCY_SERVICES;
  if (persona === "sme") return CONSULTANCY_SERVICES;
  return CONSULTANCY_SERVICES.slice(0, 3);
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SolutionsPage() {
  const [persona, setPersona] = useState<Persona>("individual");
  const [quickNeed, setQuickNeed] = useState<PersonaAnswers["need"]>("website");
  const [quickBudget, setQuickBudget] =
    useState<PersonaAnswers["budget"]>("500-2000");

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const suggestion = getSuggestedPackage(persona, quickNeed, quickBudget);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      audience: "myself",
      need: "website",
      budget: "500-2000",
      fullName: "",
      workEmail: "",
      companyName: "",
      industry: "",
      serviceInterest: "",
      budgetRange: "",
      message: "",
      referralSource: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        form.setError("root", {
          message: result.error || "Something went wrong",
        });
      }
    } catch {
      form.setError("root", {
        message: "Failed to submit. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const webPackets = getWebPackets(persona);
  const erpTiers = getErpTiers(persona);
  const services = getServices(persona);
  const consultancy = getConsultancy(persona);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <GradientOrb />

      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-20 md:pt-32 pb-12 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-30" />
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="h-3.5 w-3.5" />
              operational systems for SADC businesses
            </motion.div>

            <motion.h1
              className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Systems That Work for <span className="text-gradient">SADC Businesses</span>.
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We help you win tenders you'd normally lose on technicalities. Automate the daily operations that eat your time. And build the verified records you need to attract serious partners and investors.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <MagneticElement intensity={0.2}>
                <motion.a
                  href="#contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-foreground text-background font-semibold rounded-xl hover:bg-foreground/90 transition-colors group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book a Free Consultation
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </motion.a>
              </MagneticElement>
              <motion.a
                href="#solutions"
                className="inline-flex items-center justify-center px-8 py-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Solutions
              </motion.a>
            </motion.div>

            <motion.p
              className="mt-6 text-sm text-muted-foreground/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Projects start from{" "}
              <span className="text-primary font-semibold">$100 USD</span>
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─── Persona Selector ────────────────────────────────────────────── */}
      <section className="border-t border-border py-8 md:py-12">
        <div className="container max-w-5xl">
          <ScrollReveal className="text-center mb-6">
            <h2 className="font-headline text-2xl font-bold mb-2">
              Who is this for?
            </h2>
            <p className="text-muted-foreground text-sm">
              Select your profile to see tailored solutions
            </p>
          </ScrollReveal>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {PERSONAS.map((p) => (
              <motion.button
                key={p.id}
                onClick={() => setPersona(p.id)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                  persona === p.id
                    ? "bg-foreground text-background shadow-lg"
                    : "border border-border/50 bg-card/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {p.icon}
                <span>{p.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Quick Need + Budget Selectors */}
          <div className="max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-medium">
                  What do you need?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {NEED_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuickNeed(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        quickNeed === opt.value
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-medium">
                  Budget range?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BUDGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuickBudget(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        quickBudget === opt.value
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended for You */}
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={suggestion}
          >
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
              <div className="inline-flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  Recommended for you
                </span>
              </div>
              <p className="font-headline text-xl font-bold">{suggestion}</p>
              <motion.a
                href="#contact"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                whileHover={{ x: 3 }}
              >
                Get started <ArrowRight className="h-3.5 w-3.5" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Solutions Grid ─────────────────────────────────────────────── */}
      <section id="solutions" className="border-t border-border py-12 md:py-20">
        <div className="container max-w-6xl">
          {/* Web Packages */}
          {webPackets.length > 0 && (
            <section className="mb-10 md:mb-20 content-visibility-auto">
              <ScrollReveal className="text-center mb-10">
                <h2 className="font-headline text-3xl font-bold mb-3">
                  Web Packages
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Professional websites and web applications, designed and built
                  for the African market. All prices in USD.
                </p>
              </ScrollReveal>

              <StaggerContainer
                className={`grid gap-6 ${
                  webPackets.length <= 3
                    ? "md:grid-cols-3"
                    : "md:grid-cols-2 lg:grid-cols-4"
                }`}
                staggerDelay={0.1}
              >
                {webPackets.map((pkg) => (
                  <StaggerItem key={pkg.name} direction="up">
                    <div
                      className={`relative rounded-xl border p-6 flex flex-col h-full ${
                        pkg.popular
                          ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
                          : "border-border/50 bg-card/30"
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          Most Popular
                        </span>
                      )}
                      <h3 className="font-headline text-lg font-bold mb-1">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        {pkg.tagline}
                      </p>
                      <div className="mb-6">
                        <span className="text-3xl font-bold font-headline">
                          From ${pkg.price}
                        </span>
                        <span className="text-muted-foreground text-sm ml-1">
                          one-time
                        </span>
                      </div>
                      <ul className="space-y-2 mb-8 flex-1">
                        {pkg.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <motion.a
                        href="#contact"
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          pkg.popular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border border-border/50 hover:bg-muted/50"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {pkg.cta}
                        <ArrowRight className="h-4 w-4" />
                      </motion.a>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <p className="text-center text-xs text-muted-foreground mt-6">
                Hosting from $2/mo after 1st year. Domain renewal from $5/yr.
                Prices may vary based on feature additions.
              </p>
            </section>
          )}

          {/* AI Platform (SME only) */}
          {persona === "sme" && (
            <section className="mb-10 md:mb-20 content-visibility-auto">
              <ScrollReveal className="text-center mb-10">
                <h2 className="font-headline text-3xl font-bold mb-3">
                  AI Platform
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  AI-powered tools for assessments, tender intelligence,
                  mentorship, and compliance — built for Zimbabwean SMEs.
                </p>
              </ScrollReveal>

              <StaggerContainer
                className="grid md:grid-cols-3 lg:grid-cols-5 gap-6"
                staggerDelay={0.08}
              >
                {subscriptionPlans.map((plan) => (
                  <StaggerItem key={plan.name} direction="up">
                    <div
                      className={`relative rounded-xl border p-6 flex flex-col h-full ${
                        plan.name === "Growth"
                          ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
                          : "border-border/50 bg-card/30"
                      }`}
                    >
                      {plan.name === "Tender Starter" && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          Best for Tenders
                        </span>
                      )}
                      <h3 className="font-headline text-lg font-bold mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                        {plan.description}
                      </p>
                      <div className="mb-6">
                        {plan.price === 0 && plan.name === "Free" ? (
                          <span className="text-3xl font-bold font-headline">
                            Free
                          </span>
                        ) : plan.price === 0 ? (
                          <span className="text-3xl font-bold font-headline">
                            Custom
                          </span>
                        ) : (
                          <>
                            <span className="text-3xl font-bold font-headline">
                              ${plan.price}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              /mo
                            </span>
                          </>
                        )}
                      </div>
                      <ul className="space-y-2 mb-8 flex-1">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      {plan.name === "Enterprise" ? (
                        <motion.a
                          href="#contact"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-border/50 hover:bg-muted/50 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Contact Sales
                          <ArrowRight className="h-4 w-4" />
                        </motion.a>
                      ) : (
                        <Link
                          href={
                            plan.price === 0 && plan.name === "Free"
                              ? "/sign-up"
                              : `/sign-up?plan=${plan.name
                                  .toLowerCase()
                                  .replace(/\s+/g, "_")}`
                          }
                          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            plan.name === "Growth" || plan.name === "Pro"
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "border border-border/50 hover:bg-muted/50"
                          }`}
                        >
                          {plan.price === 0 && plan.name === "Free"
                            ? "Get Started Free"
                            : `Start ${plan.name}`}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </section>
          )}

          {/* ERP Systems */}
          {erpTiers.length > 0 && (
            <section className="mb-10 md:mb-20 content-visibility-auto">
              <ScrollReveal className="text-center mb-10">
                <h2 className="font-headline text-3xl font-bold mb-3">
                  ERP Systems
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Streamline operations with integrated accounting, inventory,
                  HR, and CRM. ZIMRA FDMS compliant. All prices in USD.
                </p>
              </ScrollReveal>

              <StaggerContainer
                className={`grid gap-6 ${
                  erpTiers.length <= 3
                    ? "md:grid-cols-3"
                    : "md:grid-cols-2 lg:grid-cols-4"
                }`}
                staggerDelay={0.1}
              >
                {erpTiers.map((tier) => (
                  <StaggerItem key={tier.name} direction="up">
                    <div
                      className={`relative rounded-xl border p-6 flex flex-col h-full ${
                        tier.popular
                          ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
                          : "border-border/50 bg-card/30"
                      }`}
                    >
                      {tier.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          Most Popular
                        </span>
                      )}
                      <h3 className="font-headline text-lg font-bold mb-1">
                        {tier.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        {tier.tagline}
                      </p>
                      <div className="mb-6">
                        {tier.price === null ? (
                          <span className="text-3xl font-bold font-headline">
                            Custom
                          </span>
                        ) : (
                          <>
                            <span className="text-3xl font-bold font-headline">
                              ${tier.price}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              /mo
                            </span>
                          </>
                        )}
                      </div>
                      <ul className="space-y-2 mb-8 flex-1">
                        {tier.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <motion.a
                        href="#contact"
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          tier.popular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border border-border/50 hover:bg-muted/50"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {tier.cta}
                        <ArrowRight className="h-4 w-4" />
                      </motion.a>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </section>
          )}

          {/* Professional Services */}
          {services.length > 0 && (
            <section className="mb-10 md:mb-20 content-visibility-auto">
              <ScrollReveal className="text-center mb-10">
                <h2 className="font-headline text-3xl font-bold mb-3">
                  Professional Services
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Expert consultancy to protect, grow, and transform your
                  business. Project-based or retainer pricing.
                </p>
              </ScrollReveal>

              <StaggerContainer
                className="grid md:grid-cols-2 gap-6"
                staggerDelay={0.1}
              >
                {services.map((svc) => (
                  <StaggerItem key={svc.name} direction="up">
                    <div className="rounded-xl border border-border/50 bg-card/30 p-6 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                          {svc.icon}
                        </div>
                        <div>
                          <h3 className="font-headline text-lg font-bold">
                            {svc.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {svc.description}
                          </p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="text-2xl font-bold font-headline">
                          From ${svc.price}
                        </span>
                        <span className="text-muted-foreground text-sm ml-1">
                          one-time
                        </span>
                      </div>
                      <ul className="space-y-2 mb-6 flex-1">
                        {svc.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <motion.a
                        href="#contact"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-border/50 hover:bg-muted/50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {svc.cta}
                        <ArrowRight className="h-4 w-4" />
                      </motion.a>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </section>
          )}
        </div>
      </section>

      {/* ─── Consultancy Services Grid (Animated) ──────────────────────── */}
      {persona !== "individual" && (
        <section className="py-12 md:py-20 border-t border-border content-visibility-auto">
          <div className="container">
            <ScrollReveal className="text-center mb-8 md:mb-16">
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
                What We Build
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Each solution works on its own or plugs into the others. Start with what you need most. Add more as you grow.
              </p>
            </ScrollReveal>

            <StaggerContainer
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              staggerDelay={0.1}
            >
              {consultancy.map((service, index) => {
                const Icon = service.icon;
                return (
                  <StaggerItem key={service.title} direction="scale">
                    <Card3D intensity={5}>
                      <motion.div
                        className={`group p-4 md:p-8 rounded-2xl border border-border bg-gradient-to-br ${service.color} backdrop-blur-sm hover:border-primary/30 transition-all duration-300 h-full`}
                        onMouseEnter={() => setHoveredService(index)}
                        onMouseLeave={() => setHoveredService(null)}
                        whileHover={{ y: -5 }}
                      >
                        <motion.div
                          className="w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center mb-6"
                          animate={{
                            rotate:
                              hoveredService === index
                                ? [0, -10, 10, 0]
                                : 0,
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon
                            className={`w-6 h-6 ${service.iconColor}`}
                          />
                        </motion.div>
                        <h3 className="font-headline text-xl font-semibold mb-3">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {service.description}
                        </p>
                        <motion.div
                          className="mt-4 flex items-center text-sm font-medium text-primary"
                          initial={{ x: -10 }}
                          animate={{
                            x: hoveredService === index ? 0 : -10,
                          }}
                        >
                          Learn more{" "}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </motion.div>
                      </motion.div>
                    </Card3D>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ─── Digital Maturity Journey ───────────────────────────────────── */}
      <section className="py-12 md:py-20 border-t border-border overflow-hidden content-visibility-auto">
        <div className="container">
          <ScrollReveal className="text-center mb-8 md:mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Your Digital Maturity Journey
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every business is at a different stage. We meet you where you are
              and take you where you need to be.
            </p>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            <StaggerContainer
              className="grid md:grid-cols-5 gap-4"
              staggerDelay={0.15}
            >
              {MATURITY_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <StaggerItem key={step.title} direction="up">
                    <motion.div
                      className="relative text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 font-bold text-primary text-lg">
                        <StepIcon className="w-6 h-6" />
                      </motion.div>
                      <h3 className="font-semibold text-sm mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground/70 text-xs">
                        {step.description}
                      </p>
                      {i < MATURITY_STEPS.length - 1 && (
                        <motion.div
                          className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px"
                          style={{
                            background:
                              "linear-gradient(to right, rgba(var(--primary), 0.5), transparent)",
                          }}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          transition={{
                            duration: 0.8,
                            delay: i * 0.2,
                          }}
                        />
                      )}
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ─── Why Radbit + Stats ──────────────────────────────────────────── */}
      <section className="py-12 md:py-20 border-t border-border content-visibility-auto">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <ScrollReveal>
                <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-6">
                  Why African Businesses Choose Radbit
                </h2>
              </ScrollReveal>
              <div className="space-y-6">
                {DIFFERENTIATORS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <ScrollReveal
                      key={item.title}
                      delay={i * 0.1}
                      direction="left"
                    >
                      <motion.div
                        className="flex gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors"
                        whileHover={{ x: 10 }}
                      >
                        <motion.div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                          <Icon className="w-4 h-4 text-primary" />
                        </motion.div>
                        <div>
                          <h3 className="font-semibold mb-1">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>

            <StaggerContainer
              className="grid grid-cols-2 gap-4"
              staggerDelay={0.1}
            >
              {STATS.map((stat) => (
                <StaggerItem key={stat.label} direction="scale">
                  <motion.div
                    className="p-6 rounded-2xl border border-border bg-muted/20 text-center hover:border-primary/30 transition-colors"
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="font-headline text-3xl font-bold text-primary mb-2">
                      <AnimatedCounter
                        value={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                        duration={2}
                      />
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {stat.label}
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ─── Lead Capture Form ──────────────────────────────────────────── */}
      <section
        id="contact"
        className="py-12 md:py-20 border-t border-border content-visibility-auto"
      >
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <ScrollReveal className="text-center mb-8 md:mb-12">
              <motion.div
                className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-4 w-4" />
                Deploy Your Armor
              </motion.div>
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Deploy Your Operational Armor
              </h2>
              <p className="text-muted-foreground">
                Tell us about your enterprise structure. We will return a tailored protection stack within 24 hours.
              </p>
            </ScrollReveal>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center p-4 md:p-8 rounded-2xl border border-primary/30 bg-primary/5"
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      delay: 0.2,
                    }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="font-headline text-2xl font-bold mb-2">
                    Inquiry Received!
                  </h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. We will review your project and
                    respond within 24 hours.
                  </p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setSubmitted(false)}
                    >
                      Submit Another Inquiry
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <StaggerContainer staggerDelay={0.05}>
                        {/* ── 3 New Persona Fields ── */}
                        <StaggerItem>
                          <div className="rounded-xl border border-border/50 bg-card/30 p-5 mb-2">
                            <h4 className="font-headline font-semibold text-sm mb-4 flex items-center gap-2">
                              <Star className="h-4 w-4 text-primary" />
                              Tell us about yourself
                            </h4>
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="audience"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Who is this for? *
                                    </FormLabel>
                                    <FormControl>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <SelectTrigger className="bg-muted/50 border-border">
                                          <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="myself">
                                            Myself
                                          </SelectItem>
                                          <SelectItem value="my-business">
                                            My Business
                                          </SelectItem>
                                          <SelectItem value="not-sure">
                                            Not Sure
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="need"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      What do you need? *
                                    </FormLabel>
                                    <FormControl>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <SelectTrigger className="bg-muted/50 border-border">
                                          <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="website">
                                            Website
                                          </SelectItem>
                                          <SelectItem value="online-store">
                                            Online Store
                                          </SelectItem>
                                          <SelectItem value="business-software">
                                            Business Software
                                          </SelectItem>
                                          <SelectItem value="consulting">
                                            Consulting
                                          </SelectItem>
                                          <SelectItem value="ai-tools">
                                            AI Tools
                                          </SelectItem>
                                          <SelectItem value="not-sure">
                                            Not Sure
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="budget"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Budget range? *
                                    </FormLabel>
                                    <FormControl>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <SelectTrigger className="bg-muted/50 border-border">
                                          <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="under-500">
                                            &lt; $500
                                          </SelectItem>
                                          <SelectItem value="500-2000">
                                            $500 – $2,000
                                          </SelectItem>
                                          <SelectItem value="2000-10000">
                                            $2,000 – $10,000
                                          </SelectItem>
                                          <SelectItem value="over-10000">
                                            $10,000+
                                          </SelectItem>
                                          <SelectItem value="not-sure">
                                            Not Sure
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </StaggerItem>

                        {/* ── Existing Form Fields ── */}
                        <StaggerItem>
                          <div className="grid sm:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="John Doe"
                                      {...field}
                                      className="bg-muted/50 border-border"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="workEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Work Email *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="john@company.com"
                                      type="email"
                                      {...field}
                                      className="bg-muted/50 border-border"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </StaggerItem>

                        <StaggerItem>
                          <div className="grid sm:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="companyName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Acme Inc"
                                      {...field}
                                      className="bg-muted/50 border-border"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="industry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Industry</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="bg-muted/50 border-border">
                                        <SelectValue placeholder="Select your industry" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="agriculture">
                                        Agriculture
                                      </SelectItem>
                                      <SelectItem value="retail">
                                        Retail & Wholesale
                                      </SelectItem>
                                      <SelectItem value="manufacturing">
                                        Manufacturing
                                      </SelectItem>
                                      <SelectItem value="technology">
                                        Technology
                                      </SelectItem>
                                      <SelectItem value="financial">
                                        Financial Services
                                      </SelectItem>
                                      <SelectItem value="healthcare">
                                        Healthcare
                                      </SelectItem>
                                      <SelectItem value="education">
                                        Education
                                      </SelectItem>
                                      <SelectItem value="hospitality">
                                        Hospitality & Tourism
                                      </SelectItem>
                                      <SelectItem value="transport">
                                        Transport & Logistics
                                      </SelectItem>
                                      <SelectItem value="construction">
                                        Construction
                                      </SelectItem>
                                      <SelectItem value="mining">
                                        Mining
                                      </SelectItem>
                                      <SelectItem value="energy">
                                        Energy
                                      </SelectItem>
                                      <SelectItem value="other">
                                        Other
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </StaggerItem>

                        <StaggerItem>
                          <div className="grid sm:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="serviceInterest"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Service of Interest
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="bg-muted/50 border-border">
                                        <SelectValue placeholder="Select a service" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                       <SelectItem value="enterprise-arch">
                                        Custom Enterprise Architectures
                                      </SelectItem>
                                      <SelectItem value="asset-protection">
                                        Asset & Margin Protection
                                      </SelectItem>
                                      <SelectItem value="strategy">
                                        Business Strategy
                                      </SelectItem>
                                      <SelectItem value="brand">
                                        Brand Management
                                      </SelectItem>
                                      <SelectItem value="operational-multiplier">
                                        Operational Multipliers
                                      </SelectItem>
                                      <SelectItem value="agentic-auto">
                                        Agentic System Automation
                                      </SelectItem>
                                      <SelectItem value="other">
                                        Other / Not Sure
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="budgetRange"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Estimated Budget
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="bg-muted/50 border-border">
                                        <SelectValue placeholder="Select budget range" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="100-500">
                                        $100 – $500 USD
                                      </SelectItem>
                                      <SelectItem value="500-2000">
                                        $500 – $2,000 USD
                                      </SelectItem>
                                      <SelectItem value="2000-5000">
                                        $2,000 – $5,000 USD
                                      </SelectItem>
                                      <SelectItem value="5000-10000">
                                        $5,000 – $10,000 USD
                                      </SelectItem>
                                      <SelectItem value="10000+">
                                        $10,000+ USD
                                      </SelectItem>
                                      <SelectItem value="not-sure">
                                        Not Sure Yet
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </StaggerItem>

                        <StaggerItem>
                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Project Brief *
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell us about your project, goals, timeline, and any specific requirements..."
                                    rows={5}
                                    {...field}
                                    className="bg-muted/50 border-border resize-none"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </StaggerItem>

                        <StaggerItem>
                          <FormField
                            control={form.control}
                            name="referralSource"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  How did you hear about us?
                                  (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Google, Social Media, Referral, etc."
                                    {...field}
                                    className="bg-muted/50 border-border"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </StaggerItem>

                        <StaggerItem>
                          {form.formState.errors.root && (
                            <p className="text-sm text-destructive">
                              {form.formState.errors.root.message}
                            </p>
                          )}

                          <MagneticElement intensity={0.1}>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-foreground text-background hover:bg-foreground/90 font-semibold py-6"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  <span className="flex items-center justify-center">
                                    Submit Inquiry{" "}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </span>
                                )}
                              </Button>
                            </motion.div>
                          </MagneticElement>

                          <p className="text-center text-xs text-muted-foreground/60 mt-4">
                            We respect your privacy. Your information will
                            never be shared with third parties.
                          </p>
                        </StaggerItem>
                      </StaggerContainer>
                    </form>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─── Assessment CTA (SME) ────────────────────────────────────────── */}
      {persona === "sme" && (
        <section className="border-t border-border py-12 md:py-16 content-visibility-auto">
          <div className="container max-w-3xl text-center">
            <ScrollReveal>
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">
                Don&apos;t Know Your Exposure?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Run the 3-minute Operational Stress-Tester. We will surface your critical failure points and prescribe the exact armor layer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/solutions#diagnostic"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Target className="h-4 w-4" />
                  Run Stress-Tester
                </Link>
                <motion.a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium border border-border/50 hover:bg-muted/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <Mail className="h-4 w-4" />
                  Talk to an Expert
                </motion.a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-border py-12 md:py-20 content-visibility-auto">
        <div className="container max-w-3xl">
          <ScrollReveal className="text-center mb-8 md:mb-12">
            <h2 className="font-headline text-fluid-2xl font-bold">
              Frequently Asked Questions
            </h2>
          </ScrollReveal>
          <div className="space-y-4">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border/50 bg-card/50"
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="font-medium">{item.q}</span>
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust Signals ───────────────────────────────────────────────── */}
      <section className="border-t border-border py-8">
        <div className="container text-center">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary/60" /> Secure Payments</span>
            <span className="inline-flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-primary/60" /> EcoCash · PayNow · Stripe</span>
            <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-primary/60" /> ZiG · USD · ZAR · BWP</span>
            <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary/60" /> Support via WhatsApp &amp; Email</span>
          </div>
        </div>
      </section>

      {/* ─── Footer CTA ──────────────────────────────────────────────────── */}
      <section className="border-t border-border py-12 md:py-20 content-visibility-auto">
        <div className="container">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="inline-block mb-6"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Award className="w-12 h-12 text-primary mx-auto" />
            </motion.div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight mb-4">
                Ready to <span className="text-gradient">Arm Your Enterprise</span>?
              </h2>
              <p className="text-muted-foreground mb-8">
                Whether you need tender armor, executive multipliers, or a global partner passport — we deploy the stack together.
              </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticElement intensity={0.2}>
                <motion.a
                  href="#contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-foreground text-background font-semibold rounded-xl hover:bg-foreground/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.a>
              </MagneticElement>
              <motion.a
                href="https://wa.me/263781334474"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp Us
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

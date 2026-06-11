"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
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
import { Loader2, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import {
  Code2, Shield, TrendingUp, Palette, Database, Brain,
  Globe, Boxes, Zap, Clock, Rocket, Target, Award,
} from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/animations/scroll-reveal";
import { Card3D, MagneticElement } from "@/components/animations/interactive-cards";
import { AnimatedCounter } from "@/components/animations/animated-text";
import { GradientOrb } from "@/components/animations/scroll-effects";

const services = [
  {
    title: "Software Development",
    description: "Bespoke desktop, mobile, and web applications built for your exact business needs — from MVPs to enterprise platforms.",
    icon: Code2,
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    title: "Cybersecurity Consultancy",
    description: "Protect your digital assets with security audits, threat assessment, compliance frameworks, and ongoing protection strategies.",
    icon: Shield,
    color: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-500",
  },
  {
    title: "Business Strategy",
    description: "Data-driven growth roadmaps, market entry strategies, operational optimization, and digital transformation planning.",
    icon: TrendingUp,
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-500",
  },
  {
    title: "Brand Management",
    description: "Cultivate a powerful brand identity: visual systems, messaging frameworks, and market positioning for lasting impact.",
    icon: Palette,
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
  {
    title: "ERP Systems",
    description: "Streamline operations with integrated enterprise resource planning: inventory, finance, HR, and supply chain in one system.",
    icon: Database,
    color: "from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-500",
  },
  {
    title: "AI, ML & Blockchain",
    description: "Harness emerging tech: predictive analytics, intelligent automation, smart contracts, and decentralized solutions.",
    icon: Brain,
    color: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-500",
  },
];

const maturitySteps = [
  { title: "First Step", description: "Basic digital presence", icon: Target },
  { title: "Connected", description: "Website + social + email", icon: Globe },
  { title: "Automated", description: "Processes digitized", icon: Zap },
  { title: "Intelligent", description: "Data + AI insights", icon: Brain },
  { title: "Scaled", description: "Enterprise ready", icon: Rocket },
];

const differentiators = [
  {
    title: "Africa-First Approach",
    description: "We understand the local context — infrastructure constraints, mobile-first users, and regional compliance requirements.",
    icon: Globe,
  },
  {
    title: "End-to-End Delivery",
    description: "From strategy to design to development to deployment. One team, one accountability, zero handoff friction.",
    icon: Boxes,
  },
  {
    title: "Emerging Tech Expertise",
    description: "Our team is fluent in AI, machine learning, and blockchain — not just buzzwords, but production-ready implementations.",
    icon: Zap,
  },
  {
    title: "Rapid Turnaround",
    description: "Agile methodology with 2-week sprints. See progress weekly, pivot when needed, launch faster than competitors.",
    icon: Clock,
  },
];

const stats = [
  { value: 100, prefix: "$", suffix: "+", label: "Starting Budget" },
  { value: 24, suffix: "h", label: "Response Time" },
  { value: 100, suffix: "%", label: "Commitment" },
  { value: 15, suffix: "+", label: "Countries Served" },
];

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  workEmail: z.string().email("Please enter a valid email address"),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  serviceInterest: z.string().optional(),
  budgetRange: z.string().optional(),
  message: z.string().min(10, "Please tell us a bit more about your project").max(1000),
  referralSource: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ConsultancyClient() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
        form.setError("root", { message: result.error || "Something went wrong" });
      }
    } catch {
      form.setError("root", { message: "Failed to submit. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <GradientOrb />

      {/* Hero */}
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
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Now Accepting New Clients
            </motion.div>

            <motion.h1
              className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Transform Your Business with{" "}
              <motion.span
                className="text-gradient inline-block"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Radbit
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              From your first digital step to full-scale enterprise intelligence — we partner with African SMEs to build technology that drives growth, security, and lasting brand impact.
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
                href="#services"
                className="inline-flex items-center justify-center px-8 py-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Services
              </motion.a>
            </motion.div>

            <motion.p
              className="mt-6 text-sm text-muted-foreground/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Projects start from <span className="text-primary font-semibold">$100 USD</span>
            </motion.p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-12 md:py-20 border-t border-border content-visibility-auto">
        <div className="container">
          <ScrollReveal className="text-center mb-8 md:mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
              What We Do
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comprehensive technology solutions tailored to the unique challenges and opportunities of African businesses.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            {services.map((service, index) => {
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
                          rotate: hoveredService === index ? [0, -10, 10, 0] : 0,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className={`w-6 h-6 ${service.iconColor}`} />
                      </motion.div>
                      <h3 className="font-headline text-xl font-semibold mb-3">{service.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                      <motion.div
                        className="mt-4 flex items-center text-sm font-medium text-primary"
                        initial={{ x: -10 }}
                        animate={{ x: hoveredService === index ? 0 : -10 }}
                      >
                        Learn more <ArrowRight className="ml-1 h-4 w-4" />
                      </motion.div>
                    </motion.div>
                  </Card3D>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Digital Maturity */}
      <section className="py-12 md:py-20 border-t border-border overflow-hidden content-visibility-auto">
        <div className="container">
          <ScrollReveal className="text-center mb-8 md:mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Your Digital Maturity Journey
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every business is at a different stage. We meet you where you are and take you where you need to be.
            </p>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            <StaggerContainer className="grid md:grid-cols-5 gap-4" staggerDelay={0.15}>
              {maturitySteps.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <StaggerItem key={step.title} direction="up">
                    <motion.div
                      className="relative text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 font-bold text-primary text-lg"
                        whileHover={{
                          backgroundColor: "rgba(var(--primary), 0.2)",
                          borderColor: "rgba(var(--primary), 0.5)",
                        }}
                      >
                        <StepIcon className="w-6 h-6" />
                      </motion.div>
                      <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                      <p className="text-muted-foreground/70 text-xs">{step.description}</p>
                      {i < maturitySteps.length - 1 && (
                        <motion.div
                          className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px"
                          style={{ background: "linear-gradient(to right, rgba(var(--primary), 0.5), transparent)" }}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          transition={{ duration: 0.8, delay: i * 0.2 }}
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

      {/* Why Radbit */}
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
                {differentiators.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <ScrollReveal key={item.title} delay={i * 0.1} direction="left">
                      <motion.div
                        className="flex gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors"
                        whileHover={{ x: 10 }}
                      >
                        <motion.div
                          className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="w-4 h-4 text-primary" />
                        </motion.div>
                        <div>
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-muted-foreground text-sm">{item.description}</p>
                        </div>
                      </motion.div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>

            <StaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.1}>
              {stats.map((stat) => (
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
                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Lead Capture Form */}
      <section id="contact" className="py-12 md:py-20 border-t border-border content-visibility-auto">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <ScrollReveal className="text-center mb-8 md:mb-12">
              <motion.div
                className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-4 w-4" />
                Start Your Journey
              </motion.div>
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Start Your Transformation
              </h2>
              <p className="text-muted-foreground">
                Tell us about your project. We will respond within 24 hours with a tailored roadmap.
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
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="font-headline text-2xl font-bold mb-2">Inquiry Received!</h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. We will review your project and respond within 24 hours.
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <StaggerContainer staggerDelay={0.05}>
                        <StaggerItem>
                          <div className="grid sm:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} className="bg-muted/50 border-border" />
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
                                    <Input placeholder="john@company.com" type="email" {...field} className="bg-muted/50 border-border" />
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
                                    <Input placeholder="Acme Inc" {...field} className="bg-muted/50 border-border" />
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
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-muted/50 border-border">
                                        <SelectValue placeholder="Select your industry" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="agriculture">Agriculture</SelectItem>
                                      <SelectItem value="retail">Retail & Wholesale</SelectItem>
                                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                      <SelectItem value="technology">Technology</SelectItem>
                                      <SelectItem value="financial">Financial Services</SelectItem>
                                      <SelectItem value="healthcare">Healthcare</SelectItem>
                                      <SelectItem value="education">Education</SelectItem>
                                      <SelectItem value="hospitality">Hospitality & Tourism</SelectItem>
                                      <SelectItem value="transport">Transport & Logistics</SelectItem>
                                      <SelectItem value="construction">Construction</SelectItem>
                                      <SelectItem value="mining">Mining</SelectItem>
                                      <SelectItem value="energy">Energy</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
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
                                  <FormLabel>Service of Interest</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-muted/50 border-border">
                                        <SelectValue placeholder="Select a service" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="software">Software Development</SelectItem>
                                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                                      <SelectItem value="strategy">Business Strategy</SelectItem>
                                      <SelectItem value="brand">Brand Management</SelectItem>
                                      <SelectItem value="erp">ERP Systems</SelectItem>
                                      <SelectItem value="ai">AI / ML / Blockchain</SelectItem>
                                      <SelectItem value="other">Other / Not Sure</SelectItem>
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
                                  <FormLabel>Estimated Budget</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-muted/50 border-border">
                                        <SelectValue placeholder="Select budget range" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="100-500">$100 – $500 USD</SelectItem>
                                      <SelectItem value="500-2000">$500 – $2,000 USD</SelectItem>
                                      <SelectItem value="2000-5000">$2,000 – $5,000 USD</SelectItem>
                                      <SelectItem value="5000-10000">$5,000 – $10,000 USD</SelectItem>
                                      <SelectItem value="10000+">$10,000+ USD</SelectItem>
                                      <SelectItem value="not-sure">Not Sure Yet</SelectItem>
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
                                <FormLabel>Project Brief *</FormLabel>
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
                                <FormLabel>How did you hear about us? (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Google, Social Media, Referral, etc." {...field} className="bg-muted/50 border-border" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </StaggerItem>

                        <StaggerItem>
                          {form.formState.errors.root && (
                            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                          )}

                          <MagneticElement intensity={0.1}>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                                    Submit Inquiry <ArrowRight className="ml-2 h-4 w-4" />
                                  </span>
                                )}
                              </Button>
                            </motion.div>
                          </MagneticElement>

                          <p className="text-center text-xs text-muted-foreground/60 mt-4">
                            We respect your privacy. Your information will never be shared with third parties.
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

      {/* Footer CTA */}
      <section className="py-12 md:py-20 border-t border-border content-visibility-auto">
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
              Ready to Take the First Step?
            </h2>
            <p className="text-muted-foreground mb-8">
              Whether you need a simple website, a full ERP system, or AI-powered insights — we build it together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticElement intensity={0.2}>
                <motion.a
                  href="mailto:hello@radbitstudios.co.zw"
                  className="inline-flex items-center justify-center px-8 py-4 bg-foreground text-background font-semibold rounded-xl hover:bg-foreground/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Email Us Directly
                </motion.a>
              </MagneticElement>
              <span className="inline-flex items-center justify-center px-8 py-4 text-muted-foreground">
                hello@radbitstudios.co.zw
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Code2, Shield, TrendingUp, Palette, Database, Brain,
  Globe, Boxes, Zap, Clock,
} from "lucide-react";

const services = [
  {
    title: "Software Development",
    description: "Bespoke desktop, mobile, and web applications built for your exact business needs — from MVPs to enterprise platforms.",
    icon: Code2,
  },
  {
    title: "Cybersecurity Consultancy",
    description: "Protect your digital assets with security audits, threat assessment, compliance frameworks, and ongoing protection strategies.",
    icon: Shield,
  },
  {
    title: "Business Strategy",
    description: "Data-driven growth roadmaps, market entry strategies, operational optimization, and digital transformation planning.",
    icon: TrendingUp,
  },
  {
    title: "Brand Management",
    description: "Cultivate a powerful brand identity: visual systems, messaging frameworks, and market positioning for lasting impact.",
    icon: Palette,
  },
  {
    title: "ERP Systems",
    description: "Streamline operations with integrated enterprise resource planning: inventory, finance, HR, and supply chain in one system.",
    icon: Database,
  },
  {
    title: "AI, ML & Blockchain",
    description: "Harness emerging tech: predictive analytics, intelligent automation, smart contracts, and decentralized solutions.",
    icon: Brain,
  },
];

const maturitySteps = [
  { title: "First Step", description: "Basic digital presence" },
  { title: "Connected", description: "Website + social + email" },
  { title: "Automated", description: "Processes digitized" },
  { title: "Intelligent", description: "Data + AI insights" },
  { title: "Scaled", description: "Enterprise ready" },
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
  { value: "$100+", label: "Starting Project Budget" },
  { value: "24h", label: "Response Time" },
  { value: "100%", label: "Client Commitment" },
  { value: "African", label: "Focus Market" },
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
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-30" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Now Accepting New Clients
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-6">
              Transform Your Business with{" "}
              <span className="text-gradient">Radbit Inc</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-8 leading-relaxed max-w-2xl mx-auto">
              From your first digital step to full-scale enterprise intelligence — we partner with African SMEs to build technology that drives growth, security, and lasting brand impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors"
              >
                Book a Free Consultation
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/20 rounded-xl hover:bg-white/5 transition-colors"
              >
                Explore Services
              </a>
            </div>
            <p className="mt-6 text-sm text-white/40">
              Projects start from <span className="text-primary font-semibold">$100 USD</span>
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20 border-t border-white/5">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
              What We Do
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Comprehensive technology solutions tailored to the unique challenges and opportunities of African businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/20 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-headline text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Digital Maturity */}
      <section className="py-20 border-t border-white/5">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Your Digital Maturity Journey
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Every business is at a different stage. We meet you where you are and take you where you need to be.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-4">
              {maturitySteps.map((step, i) => (
                <div key={step.title} className="relative text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 font-bold text-primary text-lg">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                  <p className="text-white/40 text-xs">{step.description}</p>
                  {i < maturitySteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Radbit */}
      <section className="py-20 border-t border-white/5">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Why African Businesses Choose Radbit
              </h2>
              <div className="space-y-6">
                {differentiators.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-white/50 text-sm">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center"
                >
                  <div className="font-headline text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture Form */}
      <section id="contact" className="py-20 border-t border-white/5">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Start Your Transformation
              </h2>
              <p className="text-white/50">
                Tell us about your project. We will respond within 24 hours with a tailored roadmap.
              </p>
            </div>

            {submitted ? (
              <div className="text-center p-8 rounded-2xl border border-primary/30 bg-primary/5">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-headline text-2xl font-bold mb-2">Inquiry Received!</h3>
                <p className="text-white/60">
                  Thank you for reaching out. We will review your project and respond within 24 hours.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setSubmitted(false)}
                >
                  Submit Another Inquiry
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="bg-white/5 border-white/10" />
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
                            <Input placeholder="john@company.com" type="email" {...field} className="bg-white/5 border-white/10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Inc" {...field} className="bg-white/5 border-white/10" />
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
                              <SelectTrigger className="bg-white/5 border-white/10">
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

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="serviceInterest"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service of Interest</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/10">
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
                              <SelectTrigger className="bg-white/5 border-white/10">
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
                            className="bg-white/5 border-white/10 resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referralSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did you hear about us? (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Google, Social Media, Referral, etc." {...field} className="bg-white/5 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.formState.errors.root && (
                    <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black hover:bg-white/90 font-semibold py-6"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Inquiry"
                    )}
                  </Button>

                  <p className="text-center text-xs text-white/30">
                    We respect your privacy. Your information will never be shared with third parties.
                  </p>
                </form>
              </Form>
            )}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Ready to Take the First Step?
            </h2>
            <p className="text-white/50 mb-8">
              Whether you need a simple website, a full ERP system, or AI-powered insights — we build it together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@radbitstudios.co.zw"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors"
              >
                Email Us Directly
              </a>
              <span className="inline-flex items-center justify-center px-8 py-4 text-white/50">
                hello@radbitstudios.co.zw
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

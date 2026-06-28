"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { AuthContext } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  Users, TrendingUp, Award, Share2, DollarSign,
  Sparkles, ArrowRight, CheckCircle2, Loader2,
  Palette, Briefcase, Calculator, TreePine, GraduationCap, Wrench,
} from "lucide-react";
import { MagneticButton } from "@/components/magnetic-button";
import { GradientOrb } from "@/components/animations/scroll-effects";
import { ChevronPattern } from "@/components/chevron-pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auth } from "@/lib/firebase/firebase";

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

const steps = [
  {
    icon: <Users className="h-5 w-5" />,
    title: "Sign Up",
    body: "Create your partner account in under 2 minutes. No fees, no commitments.",
  },
  {
    icon: <Share2 className="h-5 w-5" />,
    title: "Share Your Link",
    body: "Share your unique referral link with your network. We handle the rest.",
  },
  {
    icon: <DollarSign className="h-5 w-5" />,
    title: "Earn Commission",
    body: "Get paid for every client who signs up through your link. Payouts monthly.",
  },
];

const tiers = [
  {
    name: "Scout",
    icon: <Users className="h-5 w-5" />,
    clients: "0–5 clients",
    rate: "10% commission",
    desc: "Perfect for getting started. Share links and earn from every referral.",
    highlight: "from-slate-500/10 to-slate-400/10",
    border: "border-slate-500/20",
  },
  {
    name: "Builder",
    icon: <TrendingUp className="h-5 w-5" />,
    clients: "6–20 clients",
    rate: "15% commission",
    desc: "Proven referrers earn more. Your network is your net worth.",
    highlight: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-500/20",
  },
  {
    name: "Alliance",
    icon: <Award className="h-5 w-5" />,
    clients: "20+ clients",
    rate: "20% commission",
    desc: "Top-tier partners get maximum rates. Priority support and early access.",
    highlight: "from-purple-500/10 to-pink-500/10",
    border: "border-purple-500/20",
  },
];

const partnerTypes = [
  { icon: <Palette className="h-4 w-4" />, label: "Designer / Creative", value: "designer" },
  { icon: <Briefcase className="h-4 w-4" />, label: "Marketing Agency", value: "agency" },
  { icon: <Calculator className="h-4 w-4" />, label: "Accountant / Bookkeeper", value: "accountant" },
  { icon: <TreePine className="h-4 w-4" />, label: "Tourism Consultant", value: "tourism" },
  { icon: <Wrench className="h-4 w-4" />, label: "IT Technician", value: "it" },
  { icon: <GraduationCap className="h-4 w-4" />, label: "Other", value: "other" },
];

export default function PartnerSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [partnerType, setPartnerType] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const router = useRouter();
  const { user, signUp } = useContext(AuthContext);
  const { toast } = useToast();

  useEffect(() => {
    if (user && isComplete) {
      router.push("/partners/dashboard");
    }
  }, [user, isComplete, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name.trim() || name.trim().length < 2) {
      toast({ title: "Validation Error", description: "Name must be at least 2 characters", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!email.trim()) {
      toast({ title: "Validation Error", description: "Email is required", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      toast({ title: "Validation Error", description: "Password must be at least 8 characters", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, { phone: phone?.trim() || "", name: name.trim() });

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Sign up succeeded but no user returned");

      const idToken = await currentUser.getIdToken();
      const res = await fetch("/api/partner/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, name: name.trim(), phone, partnerType, bio }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create partner profile");
      }

      setReferralCode(data.referralCode || "");
      setIsComplete(true);
      toast({ title: "Welcome to the Partner Programme!", description: "Redirecting to your dashboard..." });
    } catch (error: unknown) {
      toast({
        title: "Sign Up Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="relative min-h-[70vh] flex items-center justify-center">
        <div className="absolute top-0 right-0 opacity-20 pointer-events-none"><GradientOrb /></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="font-headline text-3xl font-bold tracking-tight mb-3">
            You&apos;re In!
          </h1>
          <p className="text-muted-foreground mb-4">
            Your partner profile is live. Share your referral link to start earning:
          </p>
          {referralCode && (
            <div className="bg-muted/50 rounded-xl p-4 mb-6 border border-border">
              <p className="text-sm font-mono text-primary font-bold tracking-wider text-center">
                radbitstudios.co.zw/?ref={referralCode}
              </p>
            </div>
          )}
          <MagneticButton asChild size="lg" className="font-headline text-sm tracking-wider border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 hover:border-primary/60">
            <Link href="/partners/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    );
  }

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
            Now Open — Apply Free
          </span>
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Earn Commission Growing <span className="text-gradient">Zimbabwe&apos;s Digital Economy</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            You already know businesses that need websites, compliance tools, and digital infrastructure.
            Turn that trust into recurring income — no caps, no exclusivity, no upfront cost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MagneticButton asChild size="lg" className="font-headline text-sm tracking-wider border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 hover:border-primary/60">
              <a href="#signup">
                Apply as a Partner
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </MagneticButton>
            <MagneticButton asChild size="lg" className="font-headline text-sm tracking-wider border border-foreground/10 bg-card/50 text-foreground hover:bg-card">
              <Link href="/consultancy">
                Learn About Our Services
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </MagneticButton>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="max-w-4xl mx-auto mb-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to start earning recurring commissions.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="relative rounded-xl border border-border bg-card p-6 text-center"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-bold">
                  {idx + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  {step.icon}
                </div>
                <h3 className="font-headline font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tiers */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="max-w-4xl mx-auto mb-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter mb-4">
              Partner <span className="text-gradient">Tiers</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The more clients you refer, the higher your commission rate.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {tiers.map((tier) => (
              <motion.div
                key={tier.name}
                variants={itemVariants}
                className={`rounded-xl border ${tier.border} bg-gradient-to-br ${tier.highlight} p-6 text-center`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  {tier.icon}
                </div>
                <h3 className="font-headline font-bold text-xl mb-1">{tier.name}</h3>
                <p className="text-xs font-mono text-primary font-semibold mb-2">{tier.clients}</p>
                <p className="text-2xl font-bold text-foreground mb-3">{tier.rate}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{tier.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Who Should Join */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="max-w-4xl mx-auto mb-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter mb-4">
              Who Should <span className="text-gradient">Join</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              If you already work with SMEs, you&apos;re a perfect fit.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerTypes.map((type) => (
              <motion.div
                key={type.value}
                variants={itemVariants}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  {type.icon}
                </div>
                <span className="font-medium text-sm">{type.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          id="signup"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="max-w-lg mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="font-headline text-2xl font-bold tracking-tight mb-2">
                Become a Partner
              </h2>
              <p className="text-sm text-muted-foreground">
                Free to join. Start earning immediately.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+263 77 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-type">I am a...</Label>
                <Select
                  value={partnerType}
                  onValueChange={setPartnerType}
                  disabled={isLoading}
                >
                  <SelectTrigger id="partner-type" className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {partnerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Experience (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your network and experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-headline tracking-wider border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Join Partner Programme
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already a partner?{" "}
              <Link href="/partners/dashboard" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      <ChevronPattern variant="divider" direction="down" className="opacity-20" />
    </div>
  );
}

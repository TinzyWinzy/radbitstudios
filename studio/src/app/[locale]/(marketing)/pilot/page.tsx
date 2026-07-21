"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/components/analytics/ga4";

export default function PilotPage() {
  const [step, setStep] = useState<"info" | "form">("info");
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [industry, setIndustry] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [currentTools, setCurrentTools] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !business || !email) {
      toast({ title: "Required fields", description: "Please fill in your name, business name, and email.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          workEmail: email,
          companyName: business,
          phone,
          message: `Pilot Application\nBusiness: ${business}\nIndustry: ${industry}\nPain point: ${painPoint}\nCurrent tools: ${currentTools}`,
          source: "pilot",
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      trackEvent("generate_lead", "pilot", "application_submitted");
      toast({ title: "Application received!", description: "We will reply within 48 hours to schedule a 10-minute diagnostic call." });
      setName(""); setBusiness(""); setIndustry(""); setPainPoint(""); setCurrentTools(""); setPhone(""); setEmail("");
      setStep("info");
    } catch {
      toast({
        title: "Failed to submit",
        description: "Please email us directly at hanzohanic@gmail.com",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container py-12 md:py-24 max-w-4xl">
      {step === "info" ? (
        <div className="space-y-10">
          <div className="space-y-4">
            <h1 className="font-headline text-fluid-4xl font-bold tracking-tighter">
              Early Access — <span className="text-gradient">Radbit Ops</span>
            </h1>
            <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed">
              Radbit Ops is in pilot phase. We are working with a small group of Zimbabwean businesses to refine the system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-headline text-lg font-bold">What it covers</h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Tender alerts matched to your business profile",
                  "Compliance deadline tracking (ZIMRA, PRAZ, NSSA)",
                  "Document storage with version history",
                  "ZIMRA workflow reminders and checklists",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-headline text-lg font-bold">Pilot terms</h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Pilot pricing: USD 49 per month during the pilot",
                  "We ask for structured feedback every two weeks",
                  "Permission to publish a case study if results are positive",
                  "This is not a finished enterprise product. It is a working system that improves weekly based on what pilot users need.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
            <p className="text-sm text-amber-400/80 leading-relaxed">
              <strong className="text-amber-300">Important:</strong> Radbit Ops is not a finished enterprise product. It is a working system in active development. By applying, you agree to provide structured feedback and understand that functionality will evolve during the pilot period.
            </p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="font-headline text-base font-bold mb-2">After the pilot</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pilot participants get first access to paid plans starting at $15/mo when the platform launches. Your pilot feedback shapes the feature set and pricing. You keep your account and data through the transition.
            </p>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-headline text-sm tracking-wider px-8"
              onClick={() => setStep("form")}
            >
              Apply for Early Access <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="font-headline text-2xl font-bold tracking-tight">Apply for Pilot Access</h1>
            <p className="text-sm text-muted-foreground">
              We will reply within 48 hours to schedule a 10-minute diagnostic call. No payment is collected on this page.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business">Business name</Label>
              <Input id="business" value={business} onChange={e => setBusiness(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {["Agriculture", "Manufacturing", "Retail", "Financial Services", "Professional Services", "Technology", "Hospitality", "Logistics", "Construction", "Other"].map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="painPoint">Biggest admin pain point</Label>
              <Textarea id="painPoint" rows={3} value={painPoint} onChange={e => setPainPoint(e.target.value)} placeholder="e.g. I keep missing tax deadlines, my tender documents are scattered across emails and WhatsApp..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentTools">Current tools (if any)</Label>
              <Input id="currentTools" value={currentTools} onChange={e => setCurrentTools(e.target.value)} placeholder="e.g. Excel, QuickBooks, nothing" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone / WhatsApp</Label>
              <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+263 7X XXX XXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" disabled={sending} className="w-full font-headline text-sm tracking-wider">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {sending ? "Submitting..." : "Submit Application"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            No payment collected here. Payment happens after the diagnostic call.
          </p>
        </div>
      )}
    </div>
  );
}

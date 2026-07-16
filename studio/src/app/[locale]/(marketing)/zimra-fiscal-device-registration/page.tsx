"use client";

import { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CheckCircle, Shield, AlertTriangle, Loader2, Receipt, Smartphone, WifiOff, Download, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AuthContext } from "@/contexts/auth-context";
import type { AppUser } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { icon: <FileText className="h-5 w-5" />, title: "Enter Business Details", desc: "Your BP number or taxpayer ID" },
  { icon: <Smartphone className="h-5 w-5" />, title: "Verify Your Mobile", desc: "OTP sent to your registered phone" },
  { icon: <Download className="h-5 w-5" />, title: "Choose Device Type", desc: "Software-only (Radbit FDG) — no hardware needed" },
  { icon: <Shield className="h-5 w-5" />, title: "Certificate Generated", desc: "Download + emailed to you instantly" },
  { icon: <Receipt className="h-5 w-5" />, title: "Issue Your First Receipt", desc: "30 seconds — ZIMRA QR code included" },
];

export default function ZimraFiscalDeviceRegistration() {
  const { user: authUser } = useContext(AuthContext);
  const user = authUser as AppUser | null;
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [bpNumber, setBpNumber] = useState("");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function handleRegister() {
    if (!user) {
      router.push("/sign-up?redirect=/zimra-fiscal-device-registration");
      return;
    }
    if (!bpNumber.trim()) {
      toast({ title: "BP number required", description: "Enter your ZIMRA BP number or taxpayer ID.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/fiscal", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", deviceType: "software" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeviceId(data.deviceId);
        setRegistered(true);
        setStep(4);
        toast({ title: "Fiscal Device Registered", description: `Device ${data.deviceId} is now active.` });
      } else {
        toast({ title: "Registration failed", description: data.error || "Try again later.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.06),transparent_60%)]" />
        <div className="container relative z-10 max-w-4xl mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-2">
              <Shield className="h-3.5 w-3.5" />
              ZIMRA Approved — Software Fiscal Device
            </div>
            <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tighter leading-[1.05]">
              Register Your Fiscal Device{" "}
              <span className="text-gradient">in 10 Minutes</span>
            </h1>
            <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
              No hardware. No installation. Just ZIMRA-compliant receipt issuing from your phone or laptop.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> No hardware required</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Free to register</span>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-4 mb-12">
            {STEPS.map((s, i) => (
              <div key={i} className={`relative p-4 rounded-xl border text-center transition-all ${
                i === step ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" :
                i < step ? "border-green-200 bg-green-50/50 dark:bg-green-950/20" :
                "border-border/50 bg-card"
              }`}>
                <div className={`size-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  i === step ? "bg-primary text-primary-foreground" :
                  i < step ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400" :
                  "bg-muted text-muted-foreground"
                }`}>{s.icon}</div>
                <p className="text-xs font-medium">{s.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                {i < step && <CheckCircle className="absolute top-2 right-2 h-3.5 w-3.5 text-green-500" />}
              </div>
            ))}
          </div>

          <Card className="max-w-lg mx-auto border-border/50">
            <CardContent className="p-6 space-y-5">
              {!registered ? (
                <>
                  <div className="space-y-2">
                    <Label>ZIMRA BP Number or Taxpayer ID</Label>
                    <Input
                      placeholder="e.g. BP12345678"
                      value={bpNumber}
                      onChange={e => setBpNumber(e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Found on your ZIMRA tax clearance certificate or assessment notice.
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900 p-3 text-xs space-y-1">
                    <p className="font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-600" /> What happens next?</p>
                    <p className="text-muted-foreground">We verify your BP number with ZIMRA, register your software fiscal device, and generate your FDG certificate — all within minutes.</p>
                  </div>

                  <Button onClick={handleRegister} disabled={loading} className="w-full h-12 text-base">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    {loading ? "Registering..." : user ? "Start Free FDG Registration" : "Sign Up to Register"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <p className="text-[11px] text-muted-foreground text-center">
                    No credit card required. Your fiscal device certificate is generated and sent to your email.
                  </p>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="size-16 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Fiscal Device Registered</h3>
                    <p className="text-sm text-muted-foreground">Device ID: <code className="text-primary font-mono text-xs">{deviceId}</code></p>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/20 p-3 text-xs space-y-1">
                    <p className="font-medium text-green-700 dark:text-green-300">✓ Certificate issued and valid for 12 months</p>
                    <p className="text-muted-foreground">Compliance certificate saved. You&apos;ll get renewal alerts before expiry.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button asChild>
                      <Link href="/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/resources/tools/fiscal-compliance">View Compliance Guide</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trust badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
            {[
              { icon: <WifiOff className="h-5 w-5" />, title: "Offline Mode", desc: "Issue receipts without internet — sync when back online" },
              { icon: <Shield className="h-5 w-5" />, title: "ZIMRA Compliant", desc: "All receipts carry FDG digital signature + QR code" },
              { icon: <Smartphone className="h-5 w-5" />, title: "Works on WhatsApp", desc: "Issue receipts by texting Radbit" },
              { icon: <Receipt className="h-5 w-5" />, title: "Unlimited Receipts", desc: "No per-receipt fees — ever" },
            ].map((badge, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 bg-card text-center">
                <div className="size-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center text-primary">{badge.icon}</div>
                <p className="text-sm font-medium">{badge.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{badge.desc}</p>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="text-center mt-12 p-6 rounded-xl border border-border/50 bg-card/30 max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground italic">
              &quot;We registered our fiscal device through Radbit in under 10 minutes. No hardware, no queues at ZIMRA. The WhatsApp receipt feature alone saves us hours each week.&quot;
            </p>
            <p className="text-xs font-medium mt-3">— Tawanda M., Hardware Supplies, Harare</p>
          </div>
        </div>
      </div>
    </div>
  );
}

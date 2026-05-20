"use client";

import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/contexts/auth-context";
import { Loader2, Copy, Share2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildReferralUrl } from "@/hooks/use-utm";

const COPIED_DURATION = 2000;

export function ReferralSection() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const stored = sessionStorage.getItem("radbit_referral_code");
    if (stored) {
      setCode(stored);
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/referral/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to generate code");
      setCode(data.code);
      try {
        sessionStorage.setItem("radbit_referral_code", data.code);
      } catch {}
      toast({ title: "Referral code created!", description: `Your code is ${data.code}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    const url = buildReferralUrl("/sign-up", code);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_DURATION);
      toast({ title: "Copied!", description: "Referral link copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Please copy the link manually.", variant: "destructive" });
    }
  };

  const handleShare = () => {
    if (!code) return;
    const url = buildReferralUrl("/sign-up", code);
    const text = `Join me on Radbit SME Hub — the all-in-one platform for Zimbabwean businesses.\n\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Invite 3 business owners to join Radbit and earn <strong>100 AI credits</strong> each month.
          Your friend also gets <strong>50 bonus credits</strong> on sign-up.
        </p>
      </div>

      {!code ? (
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
          {loading ? "Generating..." : "Generate Your Referral Code"}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input value={code} readOnly className="font-mono text-lg text-center w-48" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link so new users automatically get your referral bonus:
          </p>
          <code className="block text-xs bg-muted p-2 rounded break-all">
            {buildReferralUrl("/sign-up", code)}
          </code>
        </div>
      )}
    </div>
  );
}

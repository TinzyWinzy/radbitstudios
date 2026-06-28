"use client";

import { useState, useEffect, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/auth-context";
import { db } from "@/lib/firebase/firebase";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Copy, CheckCircle2, Loader2, Share2, TrendingUp, Award,
  DollarSign, Users, ArrowUpRight, Clock, Sparkles, Bot,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Partner } from "@/types/partner";

export default function PartnerDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState("ecocash");
  const [payoutRecipient, setPayoutRecipient] = useState("");
  const [isPayingOut, setIsPayingOut] = useState(false);

  const [copilotBusinessType, setCopilotBusinessType] = useState("");
  const [copilotName, setCopilotName] = useState("");
  const [copilotDescription, setCopilotDescription] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotError, setCopilotError] = useState<string | null>(null);
  const [copilotResult, setCopilotResult] = useState<{ pitch: string; offer: string; whatsapp: string } | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const partnersSnap = await getDocs(
        query(collection(db, "partners"), where("uid", "==", user.uid), limit(1))
      );

      if (partnersSnap.empty) {
        setError("Partner profile not found. Please sign up first.");
        return;
      }

      const partnerDoc = partnersSnap.docs[0];
      const partnerData = { id: partnerDoc.id, ...partnerDoc.data() } as Partner;
      setPartner(partnerData);

      const commissionsSnap = await getDocs(
        query(
          collection(db, "commissions"),
          where("partnerId", "==", partnerDoc.id),
          orderBy("createdAt", "desc"),
          limit(20)
        )
      );
      setCommissions(commissionsSnap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt })));

      const payoutsSnap = await getDocs(
        query(
          collection(db, "payouts"),
          where("partnerId", "==", partnerDoc.id),
          orderBy("requestedAt", "desc"),
          limit(10)
        )
      );
      setPayouts(payoutsSnap.docs.map(d => ({ id: d.id, ...d.data(), requestedAt: d.data().requestedAt?.toDate?.() || d.data().requestedAt })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, authLoading, router, loadData]);

  const copyRefLink = () => {
    const refLink = `${window.location.origin}/?ref=${partner?.referralCode}`;
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      toast({ title: "Copied!", description: "Referral link copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePayout = async () => {
    if (!user) return;
    setIsPayingOut(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/partner/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, method: payoutMethod, recipient: payoutRecipient || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payout request failed");
      toast({ title: "Payout Requested", description: `$${data.amount.toFixed(2)} will be processed shortly.` });
      loadData();
    } catch (err: unknown) {
      toast({
        title: "Payout Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setIsPayingOut(false);
    }
  };

  const handleCopilot = async () => {
    if (!user) return;
    setCopilotLoading(true);
    setCopilotError(null);
    setCopilotResult(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/partner/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          businessType: copilotBusinessType,
          description: copilotDescription,
          name: copilotName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setCopilotResult({ pitch: data.pitch, offer: data.offer, whatsapp: data.whatsapp });
    } catch (err: unknown) {
      setCopilotError(err instanceof Error ? err.message : String(err));
    } finally {
      setCopilotLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="font-headline text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button variant="outline" onClick={() => router.push("/partners")}>
          Sign Up as Partner
        </Button>
      </div>
    );
  }

  const approvedTotal = commissions
    .filter(c => c.status === "approved")
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingTotal = commissions
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-headline text-2xl font-bold tracking-tight">Partner Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {partner?.name || "Partner"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Award className="h-4 w-4 text-primary" />
          <span className="font-semibold capitalize">{partner?.tier || "Scout"}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{(partner?.commissionRate || 0) * 100}% rate</span>
        </div>
      </div>

      {/* Referral Link Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Share2 className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Your referral link</p>
            <p className="text-sm font-mono font-semibold text-primary truncate">
              {typeof window !== "undefined"
                ? `${window.location.origin}/?ref=${partner?.referralCode}`
                : `/?ref=${partner?.referralCode}`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-primary/20"
            onClick={copyRefLink}
          >
            {copied ? (
              <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-green-500" /> Copied</>
            ) : (
              <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Link</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(partner?.totalEarned || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">${pendingTotal.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">${approvedTotal.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{partner?.clientCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Request */}
      {approvedTotal > 0 && (
        <Card className="border-green-500/20">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">
                ${approvedTotal.toFixed(2)} available for withdrawal
              </p>
              <p className="text-xs text-muted-foreground">
                Request a payout to your preferred method
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={payoutMethod} onValueChange={setPayoutMethod} disabled={isPayingOut}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecocash">Ecocash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="crypto">Crypto (USDT)</SelectItem>
                </SelectContent>
              </Select>
              {payoutMethod === "ecocash" && (
                <input
                  type="tel"
                  placeholder="+263 77 123 4567"
                  value={payoutRecipient}
                  onChange={(e) => setPayoutRecipient(e.target.value)}
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm w-40"
                  disabled={isPayingOut}
                />
              )}
              <Button
                size="sm"
                onClick={handlePayout}
                disabled={isPayingOut}
              >
                {isPayingOut ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" />
                )}
                Request Payout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Commissions</CardTitle>
          <CardDescription>Your latest referral earnings</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {commissions.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">
              No commissions yet. Share your referral link to start earning.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Rate</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-medium">{c.planName || "Referral"}</td>
                      <td className="p-3">${(c.amount || 0).toFixed(2)}</td>
                      <td className="p-3 hidden sm:table-cell text-muted-foreground">
                        {(c.rate || 0) * 100}%
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          c.status === "paid" ? "bg-green-500/10 text-green-500" :
                          c.status === "approved" ? "bg-blue-500/10 text-blue-500" :
                          "bg-amber-500/10 text-amber-500"
                        }`}>
                          {c.status === "paid" && <CheckCircle2 className="h-3 w-3" />}
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payout History</CardTitle>
          <CardDescription>Your withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">
              No payouts yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Method</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-medium">${(p.amount || 0).toFixed(2)}</td>
                      <td className="p-3 capitalize text-muted-foreground">{p.method}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.status === "sent" ? "bg-green-500/10 text-green-500" :
                          p.status === "processing" ? "bg-blue-500/10 text-blue-500" :
                          p.status === "failed" ? "bg-destructive/10 text-destructive" :
                          "bg-amber-500/10 text-amber-500"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">
                        {p.requestedAt ? new Date(p.requestedAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner Copilot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Partner Copilot
          </CardTitle>
          <CardDescription>
            Generate a sales pitch, offer, and WhatsApp message for a prospect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="copilot-type">Business Type</Label>
                <Input
                  id="copilot-type"
                  placeholder="e.g. Restaurant, Retail Shop, Accounting Firm"
                  value={copilotBusinessType}
                  onChange={(e) => setCopilotBusinessType(e.target.value)}
                  disabled={copilotLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copilot-name">Contact Name (optional)</Label>
                <Input
                  id="copilot-name"
                  placeholder="e.g. Tafadzwa"
                  value={copilotName}
                  onChange={(e) => setCopilotName(e.target.value)}
                  disabled={copilotLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="copilot-desc">Describe the Business</Label>
              <Textarea
                id="copilot-desc"
                placeholder="Tell us about the business — what they do, their challenges, size, location..."
                value={copilotDescription}
                onChange={(e) => setCopilotDescription(e.target.value)}
                disabled={copilotLoading}
                rows={3}
              />
            </div>
            <Button
              onClick={handleCopilot}
              disabled={copilotLoading || !copilotBusinessType || !copilotDescription}
              className="w-full sm:w-auto"
            >
              {copilotLoading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-4 w-4" />
              )}
              Generate Pitch
            </Button>

            {copilotError && (
              <p className="text-sm text-destructive">{copilotError}</p>
            )}

            {copilotResult && (
              <div className="space-y-4 border-t border-border pt-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                    <ArrowUpRight className="h-3.5 w-3.5 text-primary" /> Pitch
                  </h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-3">
                    {copilotResult.pitch}
                  </div>
                </div>
                {copilotResult.offer && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-primary" /> Offer
                    </h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-3">
                      {copilotResult.offer}
                    </div>
                  </div>
                )}
                {copilotResult.whatsapp && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                      <Share2 className="h-3.5 w-3.5 text-primary" /> WhatsApp Message
                    </h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-3 font-mono">
                      {copilotResult.whatsapp}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(copilotResult.whatsapp);
                        toast({ title: "Copied!", description: "WhatsApp message copied to clipboard." });
                      }}
                    >
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy Message
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

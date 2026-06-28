"use client";

import { useContext, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AuthContext } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Commission, Payout } from "@/types/partner";
import {
  ArrowLeft, Handshake, AlertTriangle, CheckCircle2, Loader2, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface PartnerWithData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  referralCode: string;
  tier: string;
  commissionRate: number;
  totalEarned: number;
  totalPaid: number;
  clientCount: number;
  status: string;
  createdAt?: { toDate?: () => Date } | Date;
  pendingCommissionTotal: number;
  approvedCommissionTotal: number;
  commissions: Commission[];
  payouts: Payout[];
}

export default function AdminPartnersPage() {
  const { user, role } = useContext(AuthContext);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "partners";

  const [partners, setPartners] = useState<PartnerWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const isAdmin = role === "admin" || role === "super_admin";

  const loadPartners = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/partners?token=${token}`);
      const data = await res.json();
      if (res.ok) setPartners(data.partners || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isAdmin) loadPartners();
  }, [user, isAdmin, loadPartners]);

  const adminAction = async (action: string, payload: Record<string, unknown>) => {
    if (!user) return;
    setProcessing(action);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, action, payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      toast({ title: "Success", description: `${action} completed.` });
      loadPartners();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertTriangle className="size-12 text-destructive" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">Admin access required.</p>
        <Button variant="outline" asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
      </div>
    );
  }

  const pendingPayouts = partners.flatMap(p =>
    p.payouts.filter(px => px.status === "pending").map(px => ({ ...px, partnerName: p.name }))
  );

  const pendingCommissions = partners.flatMap(p =>
    p.commissions.filter(c => c.status === "pending").map(c => ({ ...c, partnerName: p.name }))
  );

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-2xl font-bold flex items-center gap-2">
            <Handshake className="h-6 w-6 text-primary" />
            Partner Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage affiliates, commissions, and payouts.</p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="partners">Partners ({partners.length})</TabsTrigger>
          <TabsTrigger value="commissions">
            Commissions ({pendingCommissions.length})
          </TabsTrigger>
          <TabsTrigger value="payouts">
            Pending Payouts ({pendingPayouts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4 mt-4">
          {partners.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No partners yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Code</th>
                    <th className="text-left p-3 font-medium">Tier</th>
                    <th className="text-left p-3 font-medium">Rate</th>
                    <th className="text-left p-3 font-medium">Clients</th>
                    <th className="text-left p-3 font-medium">Earned</th>
                    <th className="text-left p-3 font-medium">Available</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </td>
                      <td className="p-3 font-mono text-xs">{p.referralCode}</td>
                      <td className="p-3 capitalize">{p.tier}</td>
                      <td className="p-3">{(p.commissionRate * 100)}%</td>
                      <td className="p-3">{p.clientCount}</td>
                      <td className="p-3">${(p.totalEarned || 0).toFixed(2)}</td>
                      <td className="p-3 font-semibold text-green-500">
                        ${(p.approvedCommissionTotal || 0).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <Badge variant={p.status === "active" ? "default" : "secondary"}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Select
                          onValueChange={(tier) =>
                            adminAction("update-tier", { partnerId: p.id, tier })
                          }
                          disabled={processing === "update-tier"}
                        >
                          <SelectTrigger className="h-8 w-28">
                            <SelectValue placeholder="Change tier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scout">Scout (10%)</SelectItem>
                            <SelectItem value="builder">Builder (15%)</SelectItem>
                            <SelectItem value="alliance">Alliance (20%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4 mt-4">
          {pendingCommissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No pending commissions.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Partner</th>
                    <th className="text-left p-3 font-medium">Plan</th>
                    <th className="text-left p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium">Rate</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCommissions.map((c, i) => (
                    <tr key={c.id || i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3">{c.partnerName}</td>
                      <td className="p-3">{c.planName || "Referral"}</td>
                      <td className="p-3">${(c.amount || 0).toFixed(2)}</td>
                      <td className="p-3">{(c.rate || 0) * 100}%</td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => adminAction("approve-commission", { commissionId: c.id })}
                          disabled={processing === "approve-commission"}
                        >
                          {processing === "approve-commission" ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          Approve
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4 mt-4">
          {pendingPayouts.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No pending payouts.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="default"
                  onClick={() => adminAction("process-all-payouts", {})}
                  disabled={processing === "process-all-payouts"}
                >
                  {processing === "process-all-payouts" ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpRight className="mr-1.5 h-4 w-4" />
                  )}
                  Process All Pending
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium">Partner</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Method</th>
                      <th className="text-left p-3 font-medium">Recipient</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayouts.map((p, i) => (
                      <tr key={p.id || i} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3">{p.partnerName}</td>
                        <td className="p-3 font-medium">${(p.amount || 0).toFixed(2)}</td>
                        <td className="p-3 capitalize">{p.method}</td>
                        <td className="p-3 text-xs font-mono">{p.recipient || "—"}</td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adminAction("process-payout", { payoutId: p.id })}
                            disabled={processing === "process-payout"}
                          >
                            {processing === "process-payout" ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                            Process
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

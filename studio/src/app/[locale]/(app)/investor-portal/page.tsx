"use client";

import { useState, useContext, useEffect, useCallback } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Globe, Sprout, Building2, Cpu, Factory, Stethoscope, Plane,
  Search, Handshake, Loader2, Check, ShieldCheck, Shield,
  Plus, Banknote,
} from "lucide-react";
import { AuthContext } from "@/contexts/auth-context";
import type { AppUser } from "@/types/user";
import type { TrustSeal } from "@/services/trust-seal";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

const SECTORS = [
  { id: "agri", label: "Agri", icon: <Sprout className="h-3.5 w-3.5" /> },
  { id: "real-estate", label: "Real Estate", icon: <Building2 className="h-3.5 w-3.5" /> },
  { id: "tech", label: "Tech", icon: <Cpu className="h-3.5 w-3.5" /> },
  { id: "manufacturing", label: "Manufacturing", icon: <Factory className="h-3.5 w-3.5" /> },
  { id: "healthcare", label: "Healthcare", icon: <Stethoscope className="h-3.5 w-3.5" /> },
  { id: "tourism", label: "Tourism", icon: <Plane className="h-3.5 w-3.5" /> },
];

interface SmeProfile {
  id: string;
  name: string;
  sector: string;
  description: string;
  revenue: string;
  prazStatus: string;
  readiness: number;
  trustSeal: TrustSeal | null;
}

interface Match {
  name: string;
  sector: string;
  status: string;
}

interface EscrowRecord {
  id: string;
  smeName: string;
  totalAmountUsd: number;
  status: string;
  currentMilestone: number;
  totalMilestones: number;
  createdAt: string;
}

export default function InvestorPortalPage() {
  const { user: authUser } = useContext(AuthContext);
  const user = authUser as AppUser | null;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [maxTicketSize, setMaxTicketSize] = useState("");
  const [targetSectors, setTargetSectors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [smes, setSmes] = useState<SmeProfile[]>([]);
  const [filteredSmes, setFilteredSmes] = useState<SmeProfile[]>([]);
  const [loadingSmes, setLoadingSmes] = useState(true);
  const [sectorFilter, setSectorFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const [interested, setInterested] = useState<Set<string>>(new Set());
  const [togglingInterest, setTogglingInterest] = useState<string | null>(null);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  const [expandedSeal, setExpandedSeal] = useState<Set<string>>(new Set());
  const [escrowSme, setEscrowSme] = useState<SmeProfile | null>(null);
  const [escrowAmount, setEscrowAmount] = useState("");
  const [milestoneInputs, setMilestoneInputs] = useState<string[]>([""]);
  const [creatingEscrow, setCreatingEscrow] = useState(false);
  const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
  const [loadingEscrows, setLoadingEscrows] = useState(false);

  const apiHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (!user) return {};
    const idToken = await user.getIdToken();
    return { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      setLoadingSmes(false);
      setLoadingMatches(false);
      return;
    }

    (async () => {
      try {
        const headers = await apiHeaders();
        if (!headers.Authorization) return;
        const res = await fetch('/api/diaspora/profile', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setCountryOfResidence(data.profile.countryOfResidence || '');
            setMaxTicketSize(data.profile.maxTicketSize || '');
            setTargetSectors(data.profile.targetSectors || []);
          }
        }
      } catch { /* silent */ }
      setLoadingProfile(false);
    })();
  }, [user, apiHeaders]);

  useEffect(() => {
    (async () => {
      setLoadingSmes(true);
      try {
        const res = await fetch('/api/diaspora/smes');
        if (res.ok) {
          const data = await res.json();
          setSmes(data.smes || []);
          setFilteredSmes(data.smes || []);
        }
      } catch { /* silent */ }
      setLoadingSmes(false);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const headers = await apiHeaders();
        if (!headers.Authorization) return;
        const res = await fetch('/api/diaspora/interest', { headers });
        if (res.ok) {
          const data = await res.json();
          const names = (data.interests || []).map((i: { smeName: string }) => i.smeName);
          setInterested(new Set(names));
        }
      } catch { /* silent */ }
    })();
  }, [user, apiHeaders]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoadingMatches(true);
      try {
        const headers = await apiHeaders();
        if (!headers.Authorization) return;
        const res = await fetch('/api/diaspora/matches', { headers });
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches || []);
        }
      } catch { /* silent */ }
      setLoadingMatches(false);
    })();
  }, [user, apiHeaders, interested]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoadingEscrows(true);
      try {
        const headers = await apiHeaders();
        if (!headers.Authorization) return;
        const res = await fetch('/api/escrow', { headers });
        if (res.ok) {
          const data = await res.json();
          setEscrows(data.escrows || []);
        }
      } catch { /* silent */ }
      setLoadingEscrows(false);
    })();
  }, [user, apiHeaders]);

  useEffect(() => {
    let result = smes;
    if (sectorFilter) {
      result = result.filter(s => {
        const map: Record<string, string[]> = {
          agri: ['Agriculture', 'Retail & Wholesale'],
          'real-estate': ['Construction', 'Real Estate'],
          tech: ['Technology'],
          manufacturing: ['Manufacturing'],
          healthcare: ['Healthcare'],
          tourism: ['Hospitality & Tourism', 'Transport & Logistics'],
        };
        return map[sectorFilter]?.includes(s.sector);
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q));
    }
    setFilteredSmes(result);
  }, [sectorFilter, searchQuery, smes]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/diaspora/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, countryOfResidence, maxTicketSize, targetSectors }),
      });
      if (res.ok) {
        setSaved(true);
        toast({ title: "Profile saved", description: "Your investor profile is now active." });
      } else {
        toast({ title: "Save failed", description: "Try again later.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Save failed", description: "Network error.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  function toggleSector(sectorId: string) {
    setTargetSectors(prev =>
      prev.includes(sectorId) ? prev.filter(s => s !== sectorId) : [...prev, sectorId],
    );
    setSaved(false);
  }

  async function toggleInterest(smeName: string, smeSector: string) {
    if (!user) return;
    setTogglingInterest(smeName);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/diaspora/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, smeName, smeSector }),
      });
      if (res.ok) {
        const data = await res.json();
        setInterested(prev => {
          const next = new Set(prev);
          if (data.action === 'removed') next.delete(smeName);
          else next.add(smeName);
          return next;
        });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update interest.", variant: "destructive" });
    } finally {
      setTogglingInterest(null);
    }
  }

  function trustSealColor(status: string): string {
    switch (status) {
      case 'green': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-300';
      case 'amber': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300';
      case 'red': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-300';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  }

  async function createEscrowForSme() {
    if (!user || !escrowSme || !escrowAmount) return;
    setCreatingEscrow(true);
    try {
      const idToken = await user.getIdToken();
      const milestones = milestoneInputs.filter(m => m.trim()).map((desc, i) => ({
        id: `milestone-${i + 1}`,
        description: desc.trim(),
        percentage: Math.round(100 / milestoneInputs.filter(m => m.trim()).length),
        status: 'pending' as const,
      }));
      const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);
      if (milestones.length > 0 && totalPercentage !== 100) {
        milestones[milestones.length - 1].percentage += 100 - totalPercentage;
      }
      const res = await fetch('/api/escrow', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          smeUserId: escrowSme.id,
          smeName: escrowSme.name,
          totalAmountUsd: Number(escrowAmount),
          milestones: milestones.length > 0
            ? milestones
            : [{ id: 'milestone-1', description: 'Full disbursement', percentage: 100, status: 'pending' }],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Escrow Created', description: `$${escrowAmount} escrow for ${escrowSme.name} is pending.` });
        setEscrowSme(null);
        setEscrowAmount("");
        setMilestoneInputs([""]);
        const headers = await apiHeaders();
        const escrowRes = await fetch('/api/escrow', { headers });
        if (escrowRes.ok) setEscrows((await escrowRes.json()).escrows || []);
      } else {
        toast({ title: 'Failed', description: data.error || 'Could not create escrow', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error creating escrow.', variant: 'destructive' });
    } finally {
      setCreatingEscrow(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Handshake className="h-7 w-7 text-primary" />
          Investor Portal
        </h1>
        <p className="text-muted-foreground mt-2">
          Match with verified, PRAZ-compliant Zimbabwean SMEs seeking investment.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex overflow-x-auto gap-1 pb-1 md:overflow-visible md:pb-0 [&>*]:shrink-0">
          <TabsTrigger value="profile" className="gap-2">
            <Globe className="h-4 w-4" />
            My Profile
          </TabsTrigger>
          <TabsTrigger value="browse" className="gap-2">
            <Search className="h-4 w-4" />
            Browse SMEs
          </TabsTrigger>
          <TabsTrigger value="matches" className="gap-2">
            <Handshake className="h-4 w-4" />
            My Matches {matches.length > 0 && `(${matches.length})`}
          </TabsTrigger>
          <TabsTrigger value="escrows" className="gap-2">
            <Banknote className="h-4 w-4" />
            Escrows {escrows.length > 0 && `(${escrows.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Investor Profile</CardTitle>
              <CardDescription>Set your investment criteria to get matched with qualified SMEs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingProfile ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Country of Residence</Label>
                    <Select value={countryOfResidence} onValueChange={setCountryOfResidence}>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="sa">South Africa</SelectItem>
                        <SelectItem value="eu">Europe</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Maximum Ticket Size</Label>
                    <Select value={maxTicketSize} onValueChange={setMaxTicketSize}>
                      <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10000">Up to $10,000</SelectItem>
                        <SelectItem value="50000">$10,000 – $50,000</SelectItem>
                        <SelectItem value="100000">$50,000 – $100,000</SelectItem>
                        <SelectItem value="250000">$100,000 – $250,000</SelectItem>
                        <SelectItem value="500000">$250,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Sectors</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SECTORS.map(sector => (
                        <label key={sector.id} className="flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:bg-accent/50 cursor-pointer transition-colors">
                          <Checkbox
                            checked={targetSectors.includes(sector.id)}
                            onCheckedChange={() => toggleSector(sector.id)}
                          />
                          <div className="flex items-center gap-1.5 text-sm">
                            {sector.icon}
                            {sector.label}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button onClick={saveProfile} disabled={saving || !countryOfResidence || !maxTicketSize || targetSectors.length === 0} className="w-full">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : saved && <Check className="h-4 w-4 mr-2" />}
                    {saving ? "Saving..." : saved ? "Saved" : "Save Profile"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or sector..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sectorFilter} onValueChange={v => setSectorFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sectors</SelectItem>
                {SECTORS.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadingSmes ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardHeader className="pb-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-3 w-24 mt-2" /></CardHeader>
                  <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-9 w-full mt-3" /></CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSmes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{sectorFilter || searchQuery ? 'No SMEs match your filters.' : 'No SMEs available right now. Check back soon.'}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredSmes.map(sme => (
                <Card key={sme.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{sme.name}</CardTitle>
                        <CardDescription>{sme.sector} • {sme.revenue}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={sme.prazStatus === 'Verified' ? 'default' : 'outline'}>
                          {sme.prazStatus === 'Verified' ? <ShieldCheck className="h-3 w-3 mr-1" /> : null}
                          {sme.prazStatus}
                        </Badge>
                        {sme.trustSeal && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border cursor-pointer ${trustSealColor(sme.trustSeal.status)}`}
                                  onClick={() => setExpandedSeal(prev => {
                                    const next = new Set(prev);
                                    if (next.has(sme.id)) next.delete(sme.id); else next.add(sme.id);
                                    return next;
                                  })}
                                >
                                  <Shield size={8} />
                                  Trust {sme.trustSeal.status.toUpperCase()}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-xs max-w-[200px]">
                                Overall score: {sme.trustSeal.overallScore}/100
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span>Readiness:</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${sme.readiness}%` }} />
                      </div>
                      <span className="font-medium">{sme.readiness}%</span>
                    </div>

                    {/* Trust Seal breakdown */}
                    {sme.trustSeal && expandedSeal.has(sme.id) && (
                      <div className="mb-3 p-3 rounded-lg border bg-card space-y-2 text-xs">
                        <p className="font-semibold flex items-center gap-1 text-xs mb-1">
                          <Shield className="h-3 w-3" />
                          Trust Seal — {sme.trustSeal.overallScore}/100 ({sme.trustSeal.status.toUpperCase()})
                        </p>
                        {Object.entries(sme.trustSeal.dimensions).map(([key, dim]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${dim.status === 'green' ? 'bg-green-500' : dim.status === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`} />
                              <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                              {!dim.available && <span className="text-[10px] text-muted-foreground">(pending)</span>}
                            </div>
                            <span className="font-medium">{dim.available ? `${dim.score}/100` : '—'}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant={interested.has(sme.name) ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleInterest(sme.name, sme.sector)}
                        disabled={togglingInterest === sme.name}
                      >
                        {togglingInterest === sme.name ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        ) : interested.has(sme.name) ? (
                          <Check className="h-3.5 w-3.5 mr-1.5" />
                        ) : null}
                        {interested.has(sme.name) ? "Interested" : "Express Interest"}
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setEscrowSme(sme); setEscrowAmount(""); setMilestoneInputs([""]); }}
                            >
                              <Banknote className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Deposit via Escrow</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>My Matches</CardTitle>
              <CardDescription>Mutual-interest matches will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMatches ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Handshake className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No matches yet. Browse SMEs and express interest to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{m.name}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary shrink-0">
                            <Shield size={8} />
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{m.sector}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {m.status === 'Matched' && (
                          <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                            <Link href={`/investor-portal?snapshot=${encodeURIComponent(m.name)}`}>
                              View Snapshot
                            </Link>
                          </Button>
                        )}
                        <Badge variant={m.status === 'Matched' ? 'default' : 'outline'}>
                          {m.status === 'Matched' && <Check className="h-3 w-3 mr-1" />}
                          {m.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="escrows">
          <Card>
            <CardHeader>
              <CardTitle>My Escrows</CardTitle>
              <CardDescription>Active milestone-based escrow deposits to SMEs</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEscrows ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : escrows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Banknote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No escrows yet. Browse SMEs and deposit via escrow to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {escrows.map(e => (
                    <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{e.smeName}</p>
                        <p className="text-xs text-muted-foreground">
                          ${e.totalAmountUsd.toLocaleString()} • Milestone {e.currentMilestone}/{e.totalMilestones}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={
                            e.status === 'completed' ? 'default' :
                            e.status === 'funded' || e.status === 'active' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {e.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Escrow deposit dialog */}
      <Dialog open={!!escrowSme} onOpenChange={(o) => { if (!o) setEscrowSme(null); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Deposit via Escrow</DialogTitle>
            <DialogDescription>
              Fund {escrowSme?.name} with milestone-based escrow. Funds are released as milestones are verified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 10000"
                value={escrowAmount}
                onChange={e => setEscrowAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Milestones</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setMilestoneInputs([...milestoneInputs, ""])}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add milestone
                </Button>
              </div>
              {milestoneInputs.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Milestone ${i + 1} description`}
                    value={m}
                    onChange={e => {
                      const next = [...milestoneInputs];
                      next[i] = e.target.value;
                      setMilestoneInputs(next);
                    }}
                    className="text-sm"
                  />
                  {milestoneInputs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => setMilestoneInputs(milestoneInputs.filter((_, j) => j !== i))}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground">
                Funds split equally across milestones. At least one milestone required.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscrowSme(null)}>Cancel</Button>
            <Button
              onClick={createEscrowForSme}
              disabled={creatingEscrow || !escrowAmount || Number(escrowAmount) <= 0 || milestoneInputs.filter(m => m.trim()).length === 0}
            >
              {creatingEscrow ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {creatingEscrow ? 'Creating...' : 'Create Escrow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
} from "lucide-react";
import { AuthContext } from "@/contexts/auth-context";
import type { AppUser } from "@/types/user";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

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
}

interface Match {
  name: string;
  sector: string;
  status: string;
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
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary">
                          <Shield size={8} />
                          Verified by Radbit
                        </span>
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
                    <Button
                      variant={interested.has(sme.name) ? "default" : "outline"}
                      size="sm"
                      className="w-full"
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
      </Tabs>
    </div>
  );
}

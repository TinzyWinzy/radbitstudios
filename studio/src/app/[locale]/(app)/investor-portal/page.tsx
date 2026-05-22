"use client";

import { useState, useContext, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Globe, Sprout, Building2, Cpu, Factory, Stethoscope, Plane,
  Search, Handshake, Loader2, Check, ShieldCheck,
} from "lucide-react";
import { AuthContext } from "@/contexts/auth-context";
import type { AppUser } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

const SECTORS = [
  { id: "agri", label: "Agri", icon: <Sprout className="h-3.5 w-3.5" /> },
  { id: "real-estate", label: "Real Estate", icon: <Building2 className="h-3.5 w-3.5" /> },
  { id: "tech", label: "Tech", icon: <Cpu className="h-3.5 w-3.5" /> },
  { id: "manufacturing", label: "Manufacturing", icon: <Factory className="h-3.5 w-3.5" /> },
  { id: "healthcare", label: "Healthcare", icon: <Stethoscope className="h-3.5 w-3.5" /> },
  { id: "tourism", label: "Tourism", icon: <Plane className="h-3.5 w-3.5" /> },
];

const DEMO_SMES = [
  { name: "ZimAgri Solutions", sector: "Agri", revenue: "$50K–$200K", prazStatus: "Verified", readiness: 100 },
  { name: "BuildTech Construction", sector: "Real Estate", revenue: "$200K–$500K", prazStatus: "Verified", readiness: 85 },
  { name: "DataFlow Systems", sector: "Tech", revenue: "$100K–$300K", prazStatus: "Pending", readiness: 70 },
  { name: "GreenPak Manufacturing", sector: "Manufacturing", revenue: "$500K–$1M", prazStatus: "Verified", readiness: 95 },
  { name: "HealthServe Pharmacy", sector: "Healthcare", revenue: "$50K–$150K", prazStatus: "Verified", readiness: 80 },
  { name: "SafariNow Lodges", sector: "Tourism", revenue: "$100K–$250K", prazStatus: "Verified", readiness: 90 },
];

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

  const [interested, setInterested] = useState<Set<string>>(new Set());
  const [matches] = useState<{ name: string; sector: string; status: string }[]>([]);

  useEffect(() => {
    document.title = "Investor Portal — Radbit";
  }, []);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/diaspora/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          userId: user.uid,
          countryOfResidence,
          maxTicketSize,
          targetSectors,
        }),
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

  function toggleInterest(name: string) {
    setInterested(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
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
        <TabsList>
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
            My Matches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Investor Profile</CardTitle>
              <CardDescription>Set your investment criteria to get matched with qualified SMEs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse">
          <div className="grid gap-4 md:grid-cols-2">
            {DEMO_SMES.map((sme, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{sme.name}</CardTitle>
                      <CardDescription>{sme.sector} • {sme.revenue}</CardDescription>
                    </div>
                    <Badge variant={sme.prazStatus === 'Verified' ? 'default' : 'outline'}>
                      {sme.prazStatus === 'Verified' ? <ShieldCheck className="h-3 w-3 mr-1" /> : null}
                      {sme.prazStatus}
                    </Badge>
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
                    onClick={() => toggleInterest(sme.name)}
                  >
                    {interested.has(sme.name) ? "Interested ✓" : "Express Interest"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>My Matches</CardTitle>
              <CardDescription>Mutual-interest matches will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Handshake className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No matches yet. Browse SMEs and express interest to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.sector}</p>
                      </div>
                      <Badge>{m.status}</Badge>
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

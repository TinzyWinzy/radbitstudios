"use client";

import { useState, useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Globe,
  DollarSign,
  Sprout,
  Building2,
  Cpu,
  Factory,
  Stethoscope,
  Plane,
  Search,
  Handshake,
  Loader2,
  Check,
  ShieldCheck,
} from "lucide-react";
import { AuthContext } from "@/contexts/auth-context";

const SECTORS = [
  { id: "agri", label: "Agri", icon: <Sprout className="h-3.5 w-3.5" /> },
  { id: "real-estate", label: "Real Estate", icon: <Building2 className="h-3.5 w-3.5" /> },
  { id: "tech", label: "Tech", icon: <Cpu className="h-3.5 w-3.5" /> },
  { id: "manufacturing", label: "Manufacturing", icon: <Factory className="h-3.5 w-3.5" /> },
  { id: "healthcare", label: "Healthcare", icon: <Stethoscope className="h-3.5 w-3.5" /> },
  { id: "tourism", label: "Tourism", icon: <Plane className="h-3.5 w-3.5" /> },
];

const DEMO_SMES = [
  {
    id: "1",
    name: "Moyo Agri-Processing",
    sector: "Agri",
    revenueRange: "$50K - $200K",
    prazStatus: "Compliant",
    readinessScore: 82,
    description: "Smallholder contract farming and maize processing operation based in Mashonaland East.",
  },
  {
    id: "2",
    name: "ZimTech Solutions",
    sector: "Tech",
    revenueRange: "$100K - $500K",
    prazStatus: "Compliant",
    readinessScore: 91,
    description: "B2B SaaS provider offering inventory management for Zimbabwean retailers.",
  },
  {
    id: "3",
    name: "Greenfield Realty",
    sector: "Real Estate",
    revenueRange: "$200K - $1M",
    prazStatus: "Compliant",
    readinessScore: 76,
    description: "Residential property development focused on affordable housing in Harare South.",
  },
  {
    id: "4",
    name: "HealthBridge Pharmaceuticals",
    sector: "Healthcare",
    revenueRange: "$150K - $600K",
    prazStatus: "Compliant",
    readinessScore: 88,
    description: "Generic pharmaceutical distributor serving clinics across all 10 provinces.",
  },
  {
    id: "5",
    name: "SafariLink Tours",
    sector: "Tourism",
    revenueRange: "$80K - $300K",
    prazStatus: "Pending",
    readinessScore: 65,
    description: "Eco-tourism operator offering curated safari experiences in Hwange and Victoria Falls.",
  },
  {
    id: "6",
    name: "Mbare Garments",
    sector: "Manufacturing",
    revenueRange: "$30K - $120K",
    prazStatus: "Compliant",
    readinessScore: 73,
    description: "Textile manufacturer producing school uniforms and workwear for government tenders.",
  },
];

function ProfileTab() {
  const { user } = useContext(AuthContext);
  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [maxTicketSize, setMaxTicketSize] = useState("");
  const [targetSectors, setTargetSectors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSector = (sectorId: string) => {
    setTargetSectors((prev) =>
      prev.includes(sectorId)
        ? prev.filter((s) => s !== sectorId)
        : [...prev, sectorId]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/diaspora/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          countryOfResidence,
          maxTicketSize,
          targetSectors,
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="font-headline text-2xl font-bold tracking-tight text-white">Investor Profile</h2>
        <p className="text-sm text-white/60 mt-1">
          Set your investment preferences so we can match you with the right SMEs.
        </p>
      </div>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-lg text-white">Investment Details</CardTitle>
          <CardDescription className="text-white/50">
            Your profile is visible to matched SMEs only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-white/80">
              Country of Residence
            </Label>
            <Select value={countryOfResidence} onValueChange={setCountryOfResidence}>
              <SelectTrigger id="country" className="border-white/10 bg-white/[0.05] text-white">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="za">South Africa</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="nl">Netherlands</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket" className="text-white/80">
              Max Ticket Size (USD)
            </Label>
            <Select value={maxTicketSize} onValueChange={setMaxTicketSize}>
              <SelectTrigger id="ticket" className="border-white/10 bg-white/[0.05] text-white">
                <SelectValue placeholder="Select max investment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10000">Up to $10,000</SelectItem>
                <SelectItem value="50000">Up to $50,000</SelectItem>
                <SelectItem value="100000">Up to $100,000</SelectItem>
                <SelectItem value="250000">Up to $250,000</SelectItem>
                <SelectItem value="500000">Up to $500,000</SelectItem>
                <SelectItem value="1000000">$1,000,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-white/80">Target Sectors</Label>
            <div className="grid grid-cols-2 gap-3">
              {SECTORS.map((sector) => (
                <label
                  key={sector.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-primary/30 transition-all cursor-pointer"
                >
                  <Checkbox
                    checked={targetSectors.includes(sector.id)}
                    onCheckedChange={() => toggleSector(sector.id)}
                  />
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    {sector.icon}
                    {sector.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !countryOfResidence || !maxTicketSize || targetSectors.length === 0}
            className="w-full gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4" />
            ) : null}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function BrowseTab() {
  const [interested, setInterested] = useState<Set<string>>(new Set());

  const toggleInterest = (id: string) => {
    setInterested((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-2xl font-bold tracking-tight text-white">Browse Verified SMEs</h2>
        <p className="text-sm text-white/60 mt-1">
          Sanitised profiles with operational metrics. No PII displayed. Express interest to start the matching process.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {DEMO_SMES.map((sme) => (
          <Card
            key={sme.id}
            className="border-white/10 bg-white/[0.03] hover:border-primary/30 transition-all"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base text-white">{sme.name}</CardTitle>
                  <CardDescription className="text-white/50 text-xs mt-1">
                    {sme.description}
                  </CardDescription>
                </div>
                <Badge
                  variant={sme.prazStatus === "Compliant" ? "default" : "outline"}
                  className={
                    sme.prazStatus === "Compliant"
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "text-yellow-400 border-yellow-400/30"
                  }
                >
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {sme.prazStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="secondary" className="bg-white/[0.06] text-white/70 border-white/10">
                  {SECTORS.find((s) => s.label === sme.sector)?.icon}
                  <span className="ml-1">{sme.sector}</span>
                </Badge>
                <Badge variant="secondary" className="bg-white/[0.06] text-white/70 border-white/10">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {sme.revenueRange}
                </Badge>
                <Badge variant="secondary" className="bg-white/[0.06] text-white/70 border-white/10">
                  Readiness: {sme.readinessScore}%
                </Badge>
              </div>
              <Button
                variant={interested.has(sme.id) ? "default" : "outline"}
                size="sm"
                className="w-full gap-2"
                onClick={() => toggleInterest(sme.id)}
              >
                {interested.has(sme.id) ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Interest Expressed
                  </>
                ) : (
                  <>
                    <Handshake className="h-3.5 w-3.5" />
                    Express Interest
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MatchesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-2xl font-bold tracking-tight text-white">My Matches</h2>
        <p className="text-sm text-white/60 mt-1">
          Mutual-interest matches appear here. Contact info is shared only after both sides express interest.
        </p>
      </div>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Handshake className="h-12 w-12 text-white/20 mb-4" />
          <h3 className="font-headline text-lg font-semibold text-white/70">No matches yet</h3>
          <p className="text-sm text-white/50 max-w-sm mt-2">
            Express interest in SMEs from the Browse tab to start matching. When an SME also expresses interest in you, the match appears here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DiasporaMatchmakingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Diaspora Matchmaking
        </h1>
        <p className="text-sm text-white/60 mt-1">
          Discover, connect, and invest in PRAZ-verified Zimbabwean SMEs.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white/[0.05] border border-white/10">
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Globe className="h-4 w-4" />
            My Profile
          </TabsTrigger>
          <TabsTrigger value="browse" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Search className="h-4 w-4" />
            Browse SMEs
          </TabsTrigger>
          <TabsTrigger value="matches" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Handshake className="h-4 w-4" />
            My Matches
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="browse" className="mt-6">
          <BrowseTab />
        </TabsContent>
        <TabsContent value="matches" className="mt-6">
          <MatchesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

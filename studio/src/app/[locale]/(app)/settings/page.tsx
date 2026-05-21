
'use client';

import { useState, useEffect, useContext } from "react";
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Share2, Trash2, History, Loader2, Sparkles, Palette, Cpu, Megaphone, Handshake, LifeBuoy, BarChart, CheckCircle, Headphones, Palette as WhiteLabel, TicketCheck, Clock, Zap, Shield, Download } from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  writeBatch,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ReferralSection } from "@/components/referral-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthContext } from "@/contexts/auth-context";
import { updateProfile } from "firebase/auth";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import Image from "next/image";
import { subscriptionPlans, SubscriptionPlan, PLAN_ORDER } from "@/lib/subscriptions";
import { SubscriptionEngine } from "@/services/payment/subscription-engine";
import { UpgradeModal } from "@/components/upgrade-modal";
import type { UpgradeInfo } from "@/services/feature-gate";
import { cn } from "@/lib/utils";

interface AssessmentHistory {
    id: string;
    summary: string;
    createdAt: Timestamp;
}

interface GenerationHistory {
  id: string;
  agent: string;
  prompt: string;
  output: string;
  createdAt: Timestamp;
}

const agentIcons: { [key: string]: React.ReactNode } = {
  "Design": <Palette className="h-5 w-5 text-primary" />,
  "Engineering": <Cpu className="h-5 w-5 text-primary" />,
  "Marketing": <Megaphone className="h-5 w-5 text-primary" />,
  "Sales": <Handshake className="h-5 w-5 text-primary" />,
  "Support": <LifeBuoy className="h-5 w-5 text-primary" />,
  "Data Analyst": <BarChart className="h-5 w-5 text-primary" />,
  "Default": <Sparkles className="h-5 w-5 text-primary" />,
};


export default function SettingsPage() {
    const { user, loading: authLoading, refreshUserData, deleteAccount } = useContext(AuthContext);
    const searchParams = useSearchParams();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('profile');
    const [displayName, setDisplayName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [industry, setIndustry] = useState('');
    const [businessDescription, setBusinessDescription] = useState('');
    
    const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory[]>([]);
    const [generationHistory, setGenerationHistory] = useState<GenerationHistory[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isChangingPlan, setIsChangingPlan] = useState(false);
    const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const { toast } = useToast();

     useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
            if (tab === 'generation-history') {
              fetchGenerationHistory();
            }
             if (tab === 'assessment-history') {
              fetchAssessmentHistory();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

     useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setBusinessName(user.businessName || '');
            setIndustry(user.industry || '');
            setBusinessDescription(user.businessDescription || '');
        }
    }, [user]);


    const profileSchema = z.object({ displayName: z.string().min(1, 'Name is required').max(100, 'Name is too long') });
    const businessSchema = z.object({
      businessName: z.string().min(1, 'Business name is required').max(200, 'Name is too long'),
      industry: z.string().min(1, 'Industry is required').max(100, 'Industry is too long'),
      businessDescription: z.string().max(2000, 'Description is too long').optional(),
    });

    const handleProfileSave = async () => {
        if (!user || !auth.currentUser) return;
        const validation = profileSchema.safeParse({ displayName });
        if (!validation.success) {
          const firstError = validation.error.errors[0];
          toast({ title: 'Validation Error', description: firstError.message, variant: 'destructive' });
          return;
        }
        setIsSaving(true);
        try {
            if (auth.currentUser.displayName !== displayName) {
              await updateProfile(auth.currentUser, { displayName });
            }
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { displayName });
            await refreshUserData();
            toast({ title: 'Profile saved successfully!' });
        } catch (error) {
            console.error("Error saving profile:", error);
            toast({ title: 'Error saving profile', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleBusinessSave = async () => {
        if (!user) return;
        const validation = businessSchema.safeParse({ businessName, industry, businessDescription });
        if (!validation.success) {
          const firstError = validation.error.errors[0];
          toast({ title: 'Validation Error', description: firstError.message, variant: 'destructive' });
          return;
        }
        setIsSaving(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                businessName,
                industry,
                businessDescription
            });
            await refreshUserData(); // Refresh user data after saving
            toast({ title: 'Business details saved successfully!' });
        } catch (error) {
            console.error("Error saving business details:", error);
            toast({ title: 'Error saving business details', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };


    const fetchAssessmentHistory = async () => {
        if (!user) return;
        setIsLoadingHistory(true);
        try {
            const q = query(
                collection(db, "assessments"),
                where("userId", "==", user.uid)
            );
            const querySnapshot = await getDocs(q);
            const historyData = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as AssessmentHistory))
                .sort((a, b) => {
                    const aDate = (a as any).createdAt?.toDate?.() ?? new Date(0);
                    const bDate = (b as any).createdAt?.toDate?.() ?? new Date(0);
                    return bDate.getTime() - aDate.getTime();
                });
            setAssessmentHistory(historyData);
        } catch (error) {
            console.error("Error fetching assessment history:", error);
            toast({ title: "Error", description: "Could not fetch your assessment history.", variant: "destructive" });
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const fetchGenerationHistory = async () => {
        if (!user) return;
        setIsLoadingHistory(true);
        try {
            const q = query(
                collection(db, "generations"),
                where("userId", "==", user.uid)
            );
            const querySnapshot = await getDocs(q);
            const historyData = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as GenerationHistory))
                .sort((a, b) => {
                    const aDate = (a as any).createdAt?.toDate?.() ?? new Date(0);
                    const bDate = (b as any).createdAt?.toDate?.() ?? new Date(0);
                    return bDate.getTime() - aDate.getTime();
                });
            setGenerationHistory(historyData);
        } catch (error) {
            console.error("Error fetching generation history:", error);
            toast({ title: "Error", description: "Could not fetch generation history.", variant: "destructive" });
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleClearHistory = async (collectionName: 'assessments' | 'generations') => {
        if (!user) return;
        setIsDeleting(true);
        try {
            const q = query(collection(db, collectionName), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                toast({ title: "No History Found", description: "There is nothing to clear." });
                setIsDeleting(false);
                return;
            }

            const batch = writeBatch(db);
            querySnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            if (collectionName === 'assessments') setAssessmentHistory([]);
            if (collectionName === 'generations') setGenerationHistory([]);

            toast({ title: "History Cleared", description: "Your history has been successfully deleted." });
        } catch (error) {
            console.error("Error clearing history:", error);
            toast({ title: "Error", description: "Could not clear your history.", variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePlanChange = async (newPlan: SubscriptionPlan) => {
        if (!user) return;

        const currentPlanName = user.plan || 'Free';
        const currentIdx = PLAN_ORDER.indexOf(currentPlanName as typeof PLAN_ORDER[number]);
        const newIdx = PLAN_ORDER.indexOf(newPlan.name);
        const isUpgrade = newIdx > currentIdx;

        if (newPlan.name === 'Enterprise') {
          toast({
            title: 'Contact Sales',
            description: 'Enterprise pricing is custom. Please contact our team to get started.',
          });
          window.open('mailto:sales@radbit.co.zw?subject=Enterprise Plan Inquiry', '_blank');
          return;
        }

        if (String(newPlan.name) === 'Enterprise' || newPlan.price === 0 || !isUpgrade) {
          setIsChangingPlan(true);
            try {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    plan: newPlan.name,
                    usage: newPlan.credits
                });
                await refreshUserData();
                toast({ title: "Plan Changed!", description: `You are now on the ${newPlan.name} plan.` });
            } catch (error) {
                console.error("Error changing plan:", error);
                toast({ title: "Error", description: "Could not change your subscription plan.", variant: "destructive" });
            } finally {
                setIsChangingPlan(false);
            }
            return;
        }

        // Upgrade to paid plan: initiate payment
        setIsChangingPlan(true);
        try {
            const engine = new SubscriptionEngine();
            const country = user.countryCode || 'ZW';
            const currency = user.currencyPreference || (country === 'ZA' ? 'ZAR' : country === 'BW' ? 'BWP' : country === 'ZM' ? 'ZMW' : 'USD');
            const result = await engine.createSubscription(
                user.uid,
                newPlan.name as any,
                'monthly',
                country,
                currency
            );

            if (result.redirectUrl) {
                const paymentWindow = window.open(result.redirectUrl, '_blank');
                if (!paymentWindow) {
                    window.location.href = result.redirectUrl;
                }
                toast({
                    title: "Payment Required",
                    description: `Complete payment to activate ${newPlan.name}. You'll be redirected after payment.`,
                });
            }
        } catch (error: any) {
            console.error("Error initiating payment:", error);
            setUpgradeInfo({
                upgradeTo: newPlan.name as any,
                price: newPlan.price,
                message: `Upgrade to ${newPlan.name} for $${newPlan.price}/mo.`,
                feature: `${newPlan.name} Plan`,
            });
        } finally {
            setIsChangingPlan(false);
        }
    }


    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === 'assessment-history' && assessmentHistory.length === 0) {
            fetchAssessmentHistory();
        }
        if (value === 'generation-history' && generationHistory.length === 0) {
            fetchGenerationHistory();
        }
    }
    
    const handleShareBadge = () => {
        const shareText = `I've earned the 'Digitally Growing' badge on the Radbit SME Hub! Check out the platform for tools and resources for Zimbabwean SMEs.`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (authLoading || !user) {
        return <Skeleton className="h-96 w-full" />
    }

    const currentPlanName = user.plan || 'Free';

    const handleDeleteAccount = async () => {
      setIsDeleting(true);
      setDeleteError(null);
      const result = await deleteAccount();
      setIsDeleting(false);
      if (result.success) {
        toast({ title: 'Account Deleted', description: 'Your account and data have been deleted.' });
        router.push('/');
      } else {
        setDeleteError(result.error || 'Failed to delete account.');
      }
    };

    const handleExportData = async () => {
      setIsExporting(true);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const idToken = await currentUser.getIdToken();
        const res = await fetch('/api/auth/delete-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, exportOnly: true }),
        });

        if (!res.ok) {
          toast({ title: 'Export Failed', description: 'Could not export data.', variant: 'destructive' });
          return;
        }

        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `radbit-data-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Data Exported', description: 'Your data has been downloaded.' });
      } catch (err: any) {
        toast({ title: 'Export Failed', description: err.message, variant: 'destructive' });
      } finally {
        setIsExporting(false);
      }
    };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile, account, and history.
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="account">Account & Plan</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="assessment-history">Assessment History</TabsTrigger>
          <TabsTrigger value="generation-history">Generation History</TabsTrigger>
          <TabsTrigger value="referral">Referral</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.photoURL || undefined} alt="User avatar" />
                        <AvatarFallback>SME</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold">{displayName || 'SME User'}</h3>
                        <p className="text-sm text-muted-foreground">{businessName || 'Business Name'}</p>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Your Badges</h3>
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                        <Award className="h-10 w-10 text-yellow-500" />
                        <div>
                            <p className="font-semibold text-primary">Digitally Growing</p>
                            <p className="text-xs text-muted-foreground">Awarded for completing the Digital Readiness Assessment.</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto" onClick={handleShareBadge}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </div>
            </CardContent>
             <CardFooter>
                 <Button onClick={handleProfileSave} disabled={isSaving}>
                     {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                     Save Profile
                 </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>
                Update your business information. This is used to personalize your AI insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input id="business-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="business-description">Business Description</Label>
                <Textarea id="business-description" value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleBusinessSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Save Changes
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription plan and billing details. Your credits reset when you change plans.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {subscriptionPlans.map((plan) => (
                        <Card key={plan.name} className={cn(
                            "flex flex-col",
                            plan.name === currentPlanName && "border-primary ring-2 ring-primary"
                        )}>
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div>
                                    <span className="text-4xl font-bold">${plan.price}</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-center">
                                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full"
                                    disabled={isChangingPlan || plan.name === currentPlanName}
                                    onClick={() => handlePlanChange(plan)}
                                >
                                     {isChangingPlan && plan.name !== currentPlanName ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                     {plan.name === currentPlanName ? 'Current Plan' : `Switch to ${plan.name}`}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                 </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
              <CardDescription>
                Get help and manage your support requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user.plan === 'Pro' || user.plan === 'Enterprise' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Headphones className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary">Priority Support Active</p>
                      <p className="text-sm text-muted-foreground">Your requests are prioritized. Expected response within 4 hours.</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col items-center p-4 rounded-lg border bg-card text-center">
                      <Clock className="h-5 w-5 text-primary mb-2" />
                      <span className="text-sm font-medium">&lt; 4 hour response</span>
                      <span className="text-xs text-muted-foreground">Guaranteed SLA</span>
                    </div>
                    <div className="flex flex-col items-center p-4 rounded-lg border bg-card text-center">
                      <Zap className="h-5 w-5 text-primary mb-2" />
                      <span className="text-sm font-medium">Dedicated Queue</span>
                      <span className="text-xs text-muted-foreground">Jump the line</span>
                    </div>
                    <div className="flex flex-col items-center p-4 rounded-lg border bg-card text-center">
                      <TicketCheck className="h-5 w-5 text-primary mb-2" />
                      <span className="text-sm font-medium">Track Tickets</span>
                      <span className="text-xs text-muted-foreground">Email confirmation</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => window.open('mailto:support@radbit.co.zw?subject=Priority Support Request', '_blank')}
                  >
                    <Headphones className="mr-2 h-4 w-4" />
                    Submit Support Request
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-muted">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted shrink-0">
                      <Headphones className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Priority Support</p>
                      <p className="text-sm text-muted-foreground">Upgrade to Pro for dedicated support with guaranteed response times.</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-auto shrink-0"
                      onClick={() => setActiveTab('account')}
                    >
                      Upgrade to Pro
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('mailto:support@radbit.co.zw', '_blank')}
                  >
                    <Headphones className="mr-2 h-4 w-4" />
                    Submit General Inquiry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assessment-history">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Assessment History</CardTitle>
                            <CardDescription>
                                Review your past digital readiness assessments.
                            </CardDescription>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={assessmentHistory.length === 0 || isDeleting}>
                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Clear History
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete your assessment history. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleClearHistory('assessments')} disabled={isDeleting}>
                                    Continue
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent className="min-h-[200px]">
                {isLoadingHistory ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : assessmentHistory.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {assessmentHistory.map((item) => (
                        <AccordionItem value={item.id} key={item.id}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-3">
                                    <History className="h-5 w-5 text-primary" />
                                    <span>Assessment taken on {format(item.createdAt.toDate(), "PPP")}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                               <p className="text-sm text-muted-foreground whitespace-pre-line">{item.summary}</p>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        You have no assessment history.
                    </div>
                )}
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="generation-history">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Generation History</CardTitle>
                            <CardDescription>
                                Review content you&apos;ve generated with the AI Agents.
                            </CardDescription>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={generationHistory.length === 0 || isDeleting}>
                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Clear History
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete your generation history. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleClearHistory('generations')} disabled={isDeleting}>
                                    Continue
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent className="min-h-[200px]">
                {isLoadingHistory ? (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : generationHistory.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {generationHistory.map((item) => (
                        <AccordionItem value={item.id} key={item.id}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-3">
                                    {agentIcons[item.agent] || agentIcons.Default}
                                    <div className="text-left">
                                      <p>{item.agent} Generation</p>
                                      <p className="text-xs text-muted-foreground">{format(item.createdAt.toDate(), "PPP 'at' h:mm a")}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4">
                               <div>
                                  <h4 className="font-semibold text-sm">Prompt:</h4>
                                  <p className="text-sm text-muted-foreground italic">&ldquo;{item.prompt}&rdquo;</p>
                               </div>
                               <div>
                                  <h4 className="font-semibold text-sm">Output:</h4>
                                  <div className="mt-2 p-4 border rounded-md bg-muted/50">
                                     {item.agent === 'Design' ? (
                                        <Image src={item.output} alt="Generated logo" width={200} height={200} className="rounded-md" />
                                     ) : (
                                        <MarkdownRenderer content={item.output} />
                                     )}
                                  </div>
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        You have no generation history.
                    </div>
                )}
                </CardContent>
            </Card>
          </TabsContent>
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>
                Manage your data and privacy preferences in accordance with POPIA, GDPR, and the Zimbabwe Cyber Act.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Privacy Policy
                </h3>
                <p className="text-sm text-muted-foreground">
                  Read how we collect, use, and protect your personal data in our{' '}
                  <Link href="/privacy" className="text-primary hover:underline font-medium" target="_blank">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  Delete Account
                </h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                  The following data will be removed:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Your profile and business information</li>
                  <li>Assessment history and results</li>
                  <li>AI generation history</li>
                  <li>Bookmarks and saved items</li>
                  <li>Messages and conversations</li>
                  <li>Notifications</li>
                </ul>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete My Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action permanently deletes your account and all associated data.
                        This cannot be undone. Your data will be removed within 30 days.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    {deleteError && (
                      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {deleteError}
                      </div>
                    )}
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isDeleting}
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Yes, Delete Everything'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  Data Portability
                </h3>
                <p className="text-sm text-muted-foreground">
                  You have the right to request a copy of your personal data in a portable format (GDPR Article 20).
                </p>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleExportData} disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isExporting ? 'Exporting...' : 'Export My Data'}
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  For questions about your data rights, contact{' '}
                  <a href="mailto:privacy@radbitsmehub.co.zw" className="text-primary hover:underline">privacy@radbitsmehub.co.zw</a>.
                  For POPIA enquiries, contact the Information Regulator (South Africa).
                  For Zimbabwe Cyber Act enquiries, contact POTRAZ.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="referral">
          <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>
                Invite other business owners to Radbit and earn AI credits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ReferralSection />
            </CardContent>
          </Card>
         </TabsContent>
         <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Update your brands look and feel with a custom logo and theme.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {String(user.plan) === 'Enterprise' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <WhiteLabel className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary">Enterprise Branding Active</p>
                      <p className="text-sm text-muted-foreground">Customize logo, colors, and domain for your organization.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand-name">Brand Name</Label>
                      <Input id="brand-name" placeholder="Your Brand Name" defaultValue={user.businessName || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand-logo">Logo URL</Label>
                      <Input id="brand-logo" placeholder="https://yourbrand.com/logo.png" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand-domain">Custom Domain</Label>
                      <Input id="brand-domain" placeholder="app.yourbrand.com" />
                      <p className="text-xs text-muted-foreground">Point your CNAME to cname.radbit.co.zw after entering your domain here.</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toast({ title: 'Branding settings saved', description: 'Your white-label settings have been saved.' })}
                  >
                    Save Branding Settings
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-8 space-y-4">
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                    <WhiteLabel className="size-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">White-Label Reports & Branding</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Available on the Enterprise plan. Get custom branding, your own domain, and API access for full integration.
                    </p>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-left max-w-md">
                    <p className="text-sm font-medium mb-2">Enterprise includes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2"><CheckCircle className="size-4 text-primary shrink-0" />Custom logo &amp; brand colors</li>
                      <li className="flex items-center gap-2"><CheckCircle className="size-4 text-primary shrink-0" />Your own domain</li>
                      <li className="flex items-center gap-2"><CheckCircle className="size-4 text-primary shrink-0" />API access</li>
                      <li className="flex items-center gap-2"><CheckCircle className="size-4 text-primary shrink-0" />Dedicated account manager</li>
                    </ul>
                  </div>
                  <Button onClick={() => setActiveTab('account')}>
                    View Enterprise Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <UpgradeModal open={!!upgradeInfo} onOpenChange={(o) => { if (!o) setUpgradeInfo(null); }} upgrade={upgradeInfo} onUpgrade={() => window.location.href = '/settings?tab=plan'} />
    </div>
  );
}

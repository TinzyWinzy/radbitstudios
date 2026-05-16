
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
import { Award, Share2, Trash2, History, Loader2, Sparkles, Palette, Cpu, Megaphone, Handshake, LifeBuoy, BarChart, CheckCircle } from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  writeBatch,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase/firebase";
import { useToast } from "@/hooks/use-toast";
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
import { subscriptionPlans, SubscriptionPlan } from "@/lib/subscriptions";
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
    const { user, loading: authLoading, refreshUserData } = useContext(AuthContext);
    const searchParams = useSearchParams();

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
            setBusinessName((user as any).businessName || '');
            setIndustry((user as any).industry || '');
            setBusinessDescription((user as any).businessDescription || '');
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
                where("userId", "==", user.uid), 
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const historyData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as AssessmentHistory[];
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
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const historyData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as GenerationHistory[];
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

        setIsChangingPlan(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                plan: newPlan.name,
                usage: newPlan.credits
            });
            await refreshUserData();
            toast({
                title: "Plan Changed!",
                description: `You are now on the ${newPlan.name} plan.`
            })
        } catch (error) {
            console.error("Error changing plan:", error);
            toast({ title: "Error", description: "Could not change your subscription plan.", variant: "destructive" });
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

    const currentPlanName = (user as any).plan || 'Free';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile, account, and history.
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="account">Account & Plan</TabsTrigger>
          <TabsTrigger value="assessment-history">Assessment History</TabsTrigger>
          <TabsTrigger value="generation-history">Generation History</TabsTrigger>
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
      </Tabs>
    </div>
  );
}

import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import { db } from '@/lib/firebase/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, ArrowRight, BarChart, Building2, Sparkles } from 'lucide-react';

const INDUSTRIES = [
  'Retail & Wholesale', 'Manufacturing', 'Agriculture', 'Technology',
  'Financial Services', 'Healthcare', 'Education', 'Hospitality & Tourism',
  'Transport & Logistics', 'Construction', 'Creative & Media', 'Professional Services',
  'Other',
];

export function OnboardingWizard() {
  const { user, refreshUserData } = useContext(AuthContext);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const profileComplete = !!(user as any)?.businessName && !!((user as any)?.industry);
  const onboardingDone = dismissed || (profileComplete && hasAssessment);

  const checkAssessment = useCallback(async () => {
    if (!user) return;
    const assessmentsSnap = await getDoc(doc(db, 'assessments', user.uid));
    if (assessmentsSnap.exists()) {
      setHasAssessment(true);
    }
  }, [user]);

  useEffect(() => {
    if (!user || dismissed) return;
    if (profileComplete) {
      checkAssessment();
    }
  }, [user, dismissed, profileComplete, checkAssessment]);

  async function saveProfile() {
    if (!user || !businessName.trim() || !industry) return;
    setSaving(true);
    await updateDoc(doc(db, 'users', user.uid), {
      businessName: businessName.trim(),
      industry,
      businessDescription: businessDescription.trim(),
    });
    await refreshUserData();
    setSaving(false);
  }

  async function dismiss() {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { dismissedOnboarding: true }).catch(() => {});
    setDismissed(true);
  }

  if (onboardingDone) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-headline font-semibold">Welcome to Radbit!</h3>
            <p className="text-sm text-muted-foreground">Complete these steps to unlock your dashboard</p>
          </div>
        </div>
        <button onClick={dismiss} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Skip for now
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${profileComplete ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${hasAssessment ? 'bg-primary' : 'bg-muted'}`} />
      </div>

      {!profileComplete && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="size-4 text-primary" />
            Step 1: Tell us about your business
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ob-business-name">Business Name</Label>
              <Input id="ob-business-name" placeholder="e.g. Tariro's General Dealer" value={businessName} onChange={e => setBusinessName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ob-industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="ob-industry"><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ob-description">Brief Business Description (optional)</Label>
            <Input id="ob-description" placeholder="What does your business do?" value={businessDescription} onChange={e => setBusinessDescription(e.target.value)} />
          </div>
          <Button onClick={saveProfile} disabled={!businessName.trim() || !industry || saving}>
            {saving ? 'Saving...' : 'Save & Continue'}
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      )}

      {profileComplete && !hasAssessment && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Profile Complete</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <BarChart className="size-4 text-primary" />
            Step 2: Take your Digital Readiness Assessment
          </div>
          <p className="text-sm text-muted-foreground">
            Find out how digitally ready your business is. Takes 5 minutes.
          </p>
          <Button onClick={() => window.location.href = '/assessment'}>
            Take Assessment
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      )}

      {profileComplete && hasAssessment && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Assessment Complete</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You&apos;re all set! View your assessment results and explore AI tools.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => window.location.href = '/assessment'}>
              View Results
            </Button>
            <Button variant="outline" onClick={dismiss}>
              Got it, let&apos;s go!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/auth-context';
import type { AppUser } from '@/types/user';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, doc, updateDoc, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, CheckCircle, Circle, ArrowRight, Sparkles } from 'lucide-react';

const INDUSTRIES = [
  'Retail & Wholesale', 'Manufacturing', 'Agriculture', 'Technology',
  'Financial Services', 'Healthcare', 'Education', 'Hospitality & Tourism',
  'Transport & Logistics', 'Construction', 'Creative & Media', 'Professional Services',
  'Other',
];

export function OnboardingWizard() {
  const router = useRouter();
  const { user, refreshUserData } = useContext(AuthContext);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const profileComplete = !!(user as AppUser)?.businessName && !!((user as AppUser)?.industry);
  const allDone = profileComplete && hasAssessment;

  const checkAssessment = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'assessments'), where('userId', '==', user.uid), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setHasAssessment(true);
      }
    } catch (err) {
      console.warn('[OnboardingWizard] Failed to check assessment:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (profileComplete) {
      checkAssessment();
    }
  }, [user, profileComplete, checkAssessment]);

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

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div role="button" tabIndex={0} onClick={() => setCollapsed(!collapsed)} onKeyDown={(e) => e.key === 'Enter' && setCollapsed(!collapsed)} className="flex items-center gap-3 flex-1 text-left cursor-pointer">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-headline font-semibold">
              {allDone ? 'Getting Started' : 'Welcome to Radbit!'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {allDone
                ? 'All steps complete. Explore your dashboard below.'
                : `Step ${profileComplete ? '2' : '1'} of 2 — ${profileComplete ? 'Take your assessment' : 'Tell us about your business'}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {allDone && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Done ✓</span>
            )}
            {collapsed ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronUp className="size-4 text-muted-foreground" />}
          </div>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="flex gap-2 mb-6">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${profileComplete ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${hasAssessment ? 'bg-primary' : 'bg-muted'}`} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {profileComplete ? (
                <CheckCircle className="size-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="size-4 text-muted-foreground shrink-0" />
              )}
              <span className={`text-sm font-medium ${profileComplete ? 'text-green-600 dark:text-green-400' : ''}`}>
                Complete your business profile
              </span>
            </div>

            {!profileComplete && (
              <div className="pl-6 space-y-4 border-l-2 border-primary/20 ml-[7px]">
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

            <div className="flex items-center gap-2">
              {hasAssessment ? (
                <CheckCircle className="size-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="size-4 text-muted-foreground shrink-0" />
              )}
              <span className={`text-sm font-medium ${hasAssessment ? 'text-green-600 dark:text-green-400' : ''}`}>
                Take Digital Readiness Assessment
              </span>
            </div>

            {profileComplete && !hasAssessment && (
              <div className="pl-6 border-l-2 border-primary/20 ml-[7px] space-y-3">
                <p className="text-sm text-muted-foreground">
                  Find out how digitally ready your business is. Takes 5 minutes.
                </p>
                <Button size="sm" onClick={() => router.push('/assessment')}>
                  Take Assessment
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

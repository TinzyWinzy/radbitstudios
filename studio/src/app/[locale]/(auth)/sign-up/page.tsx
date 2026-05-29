'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthContext } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { z } from 'zod';
import { useUtm, getStoredUtm } from '@/hooks/use-utm';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const { user, signUp, signInWithGoogle } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const intentPlan = searchParams.get('plan');

  useUtm();

  useEffect(() => {
    document.title = 'Create Account — Radbit';
  }, []);

  useEffect(() => {
    if (user) {
      const utm = getStoredUtm();
      if (utm.ref) {
        user.getIdToken().then((idToken) => {
          const payload = JSON.stringify({ idToken, referralCode: utm.ref });
          navigator.sendBeacon('/api/referral/apply', new Blob([payload], { type: 'application/json' }));
        });
      }
      if (intentPlan) {
        sessionStorage.setItem('radbit_signup_plan', intentPlan);
      }
      const nextPlan = intentPlan || sessionStorage.getItem('radbit_signup_plan');
      if (nextPlan) {
        router.push(`/settings?tab=account&upgradeTo=${nextPlan.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`);
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router, intentPlan]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!acceptedPrivacy) {
      toast({ title: 'Consent Required', description: 'Please accept the Privacy Policy to continue.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    const validation = signUpSchema.safeParse({ email, password, confirmPassword });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({ title: 'Validation Error', description: firstError.message, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, { phone: phone?.trim() || '' });
    } catch (error: unknown) {
      toast({
        title: 'Sign Up Failed',
        description: (error instanceof Error ? error.message : String(error)) || '',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
        await signInWithGoogle();
    } catch (error: unknown) {
        toast({
            title: 'Google Sign In Failed',
            description: (error instanceof Error ? error.message : String(error)) || '',
            variant: 'destructive',
        })
    } finally {
        setIsGoogleLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-headline text-2xl font-bold tracking-tight">Create Your Account</h1>
        <p className="text-sm text-muted-foreground">Join the Radbit ecosystem</p>
      </div>

      <Button
        variant="outline"
        className="w-full h-11 font-medium border-primary/20 text-primary/80 hover:text-primary hover:border-primary/40 hover:bg-primary/5"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.logo className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-primary/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-primary/50">Or email</span>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || isGoogleLoading}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+263 77 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading || isGoogleLoading}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">Used for WhatsApp alerts on tenders and deadlines</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || isGoogleLoading}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading || isGoogleLoading}
            required
            className="h-11"
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="privacy-consent"
            checked={acceptedPrivacy}
            onChange={e => setAcceptedPrivacy(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0"
          />
          <label htmlFor="privacy-consent" className="text-xs text-muted-foreground leading-relaxed">
            I agree to the{' '}
            <Link href="/privacy" className="text-primary hover:underline font-medium" target="_blank">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="text-primary hover:underline font-medium" target="_blank">
              Terms of Service
            </Link>
            . I consent to the collection and processing of my personal data as described.
          </label>
        </div>
        <Button type="submit" className="w-full h-11 font-headline tracking-wider border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60" disabled={isLoading || isGoogleLoading || !acceptedPrivacy}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              Create Account <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already a member?{' '}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

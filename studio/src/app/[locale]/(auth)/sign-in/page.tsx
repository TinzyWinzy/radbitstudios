'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Icons } from '@/components/icons';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const { user, signIn, signInWithGoogle } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    document.title = 'Sign In — Radbit';
  }, []);

  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect') || '/dashboard';
      const refreshCookie = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const token = await currentUser.getIdToken();
          await fetch('/api/auth/refresh-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token }),
          });
        }
        router.push(redirectTo);
      };
      refreshCookie();
    }
  }, [user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const validation = signInSchema.safeParse({ email, password });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({ title: 'Validation Error', description: firstError.message, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      await signIn(email, password);
    } catch (error: unknown) {
      toast({
        title: 'Sign In Failed',
        description: (error instanceof Error ? error.message : String(error)) || '',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({ title: 'Enter your email first', description: 'Please enter your email address above, then click Forgot Password.', variant: 'default' });
      return;
    }
    const emailCheck = z.string().email().safeParse(email);
    if (!emailCheck.success) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: 'Check your inbox', description: 'If an account exists with that email, a password reset link has been sent.', variant: 'default' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: 'Error', description: message || 'Could not send reset email. Please try again.', variant: 'destructive' });
    } finally {
      setIsResetting(false);
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
        <h1 className="font-headline text-2xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your Radbit account</p>
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

      <form onSubmit={handleSignIn} className="space-y-4">
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || isGoogleLoading}
            required
            className="h-11"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={isResetting || isLoading || isGoogleLoading}
            className="text-sm text-primary hover:underline"
          >
            {isResetting ? 'Sending...' : 'Forgot password?'}
          </button>
        </div>
        <Button type="submit" className="w-full h-11 font-headline tracking-wider border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60" disabled={isLoading || isGoogleLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign In <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-semibold text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

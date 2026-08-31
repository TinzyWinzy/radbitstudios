'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { X, Cookie, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { CONSENT_REVIEW_EVENT, useConsent } from '@/hooks/use-consent';

export function CookieBanner() {
  const { showBanner, preferences, acceptAll, acceptNecessary, updatePreferences } = useConsent();
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [reviewRequested, setReviewRequested] = useState(false);

  useEffect(() => {
    const handleReview = () => {
      setAnalyticsConsent(preferences.analytics);
      setMarketingConsent(preferences.marketing);
      setReviewRequested(true);
      setShowCustomize(true);
    };
    window.addEventListener(CONSENT_REVIEW_EVENT, handleReview);
    return () => window.removeEventListener(CONSENT_REVIEW_EVENT, handleReview);
  }, [preferences.analytics, preferences.marketing]);

  if (!showBanner && !reviewRequested) return null;

  const handleSaveCustom = () => {
    updatePreferences({ analytics: analyticsConsent, marketing: marketingConsent });
    setShowCustomize(false);
    setReviewRequested(false);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
      role="dialog"
      aria-modal={showCustomize ? "true" : "false"}
      aria-label="Cookie consent settings"
    >
      <Card className="max-w-2xl mx-auto shadow-lg border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardContent className={showCustomize ? 'pb-2 pt-4' : 'py-4'}>
          {!showCustomize ? (
            <div className="flex items-start gap-3">
              <Cookie className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
              <div className="space-y-1.5 flex-1">
                <p className="text-sm font-medium">We use cookies</p>
                <p className="text-xs text-muted-foreground">
                  We use essential cookies for authentication and security. Analytics cookies help
                  us improve the platform. See our{' '}
                  <Link href="/privacy" className="underline text-primary hover:no-underline">
                    Privacy Policy
                  </Link>{' '}
                  for details.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cookie Preferences</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCustomize(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-2 rounded-md bg-muted/50 cursor-not-allowed opacity-60">
                  <input type="checkbox" checked disabled className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Necessary</p>
                    <p className="text-xs text-muted-foreground">Authentication, session management, security</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={e => setAnalyticsConsent(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Analytics</p>
                    <p className="text-xs text-muted-foreground">Usage patterns, page views, feature adoption</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={e => setMarketingConsent(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Marketing</p>
                    <p className="text-xs text-muted-foreground">Personalized content and offers</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className={`flex ${showCustomize ? 'justify-end' : 'justify-between'} gap-2 pb-4 px-4 pt-0`}>
          {!showCustomize ? (
            <>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowCustomize(true)} aria-expanded={showCustomize}>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Customize
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={acceptNecessary}>
                  Reject All
                </Button>
                <Button size="sm" className="text-xs" onClick={acceptAll}>
                  Accept All
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => { acceptNecessary(); setReviewRequested(false); }}>
                Reject All
              </Button>
              <Button size="sm" className="text-xs" onClick={handleSaveCustom}>
                Save Preferences
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

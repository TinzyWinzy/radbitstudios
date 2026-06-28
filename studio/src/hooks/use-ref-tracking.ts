"use client";

import { useEffect, useRef } from "react";
import { setRefCookie, getRefCookie } from "@/lib/cookies";
import { getStoredUtm } from "@/hooks/use-utm";

/**
 * Parses the ref code from URL params.
 */
function getRefFromUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return new URLSearchParams(window.location.search).get("ref") || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Tracks a partner referral click:
 * 1. Checks URL for ?ref= param
 * 2. Stores ref in a 90-day cookie
 * 3. Sends a beacon to track the click server-side
 *
 * Call this once at the app root or on marketing pages.
 */
export function useRefTracking() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;

    const refCode = getRefFromUrl();
    if (!refCode) return;

    // Set 90-day cookie so it persists across pages
    setRefCookie(refCode);

    // Track the click server-side (fire-and-forget)
    try {
      const payload = JSON.stringify({
        refCode,
        landingPage: window.location.pathname + window.location.search,
        device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      });
      navigator.sendBeacon(
        "/api/partner/track",
        new Blob([payload], { type: "application/json" })
      );
    } catch {
      // Beacon failed silently — cookie still set
    }

    tracked.current = true;
  }, []);
}

/**
 * Returns the referral code from cookie or sessionStorage (UTM).
 */
export function getAttributionRef(): string | undefined {
  // Check 90-day cookie first (from partner referral)
  const cookieRef = getRefCookie();
  if (cookieRef) return cookieRef;

  // Fall back to UTM session storage (from existing referral system)
  const utm = getStoredUtm();
  return utm.ref;
}

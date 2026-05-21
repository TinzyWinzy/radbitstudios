"use client";

import { useEffect, useRef } from "react";

interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  ref?: string;
}

function parseUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
    ref: params.get("ref") || undefined,
  };
}

const STORAGE_KEY = "radbit_utm";

export function useUtm() {
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current) return;
    const utm = parseUtm();
    if (Object.values(utm).some(Boolean)) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
        saved.current = true;
      } catch {}
    }
  }, []);
}

export function getStoredUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}

export function buildReferralUrl(baseUrl: string, code: string): string {
  const url = new URL(baseUrl, typeof window !== "undefined" ? window.location.origin : "https://radbitstudios.co.zw");
  url.searchParams.set("ref", code);
  url.searchParams.set("utm_source", "referral");
  url.searchParams.set("utm_medium", "share");
  url.searchParams.set("utm_campaign", code);
  return url.toString();
}

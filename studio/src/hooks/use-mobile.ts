"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Detect if the user is on a mobile device or has a small screen.
 * Used to reduce animation complexity for better performance.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Detect low-end devices based on hardware concurrency and memory.
 * Falls back to false on unsupported browsers.
 */
export function useIsLowEnd(): boolean {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
    setIsLowEnd(cores <= 4 || memory <= 4);
  }, []);

  return isLowEnd;
}

/**
 * Throttle a function using requestAnimationFrame.
 */
export function useThrottledScroll(callback: () => void) {
  const rafRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => callbackRef.current());
  };
}

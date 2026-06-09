"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getDeviceCapabilities, type DeviceTier } from "@/lib/device";

interface DeviceContextValue {
  tier: DeviceTier;
  prefersReducedMotion: boolean;
  isTouchDevice: boolean;
  saveData: boolean;
  reducedAnimations: boolean;
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [caps, setCaps] = useState<DeviceContextValue>({
    tier: 'high',
    prefersReducedMotion: false,
    isTouchDevice: false,
    saveData: false,
    reducedAnimations: false,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const d = getDeviceCapabilities();
    const conn = d.connection;
    setCaps({
      tier: d.tier,
      prefersReducedMotion: d.prefersReducedMotion,
      isTouchDevice: d.isTouchDevice,
      saveData: conn.saveData,
      reducedAnimations: d.prefersReducedMotion || d.tier === 'low',
    });
    setMounted(true);
  }, []);

  return (
    <DeviceContext.Provider value={caps}>
      {mounted ? children : <div className="contents">{children}</div>}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error('useDevice must be used within DeviceProvider');
  return ctx;
}

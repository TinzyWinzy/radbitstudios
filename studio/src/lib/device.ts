// Device capability detection for adaptive rendering

export type DeviceTier = 'low' | 'medium' | 'high';

export interface DeviceCapabilities {
  tier: DeviceTier;
  memory: number | null;  // GB
  cores: number | null;
  connection: {
    effectiveType: string | null;
    downlink: number | null;
    rtt: number | null;
    saveData: boolean;
  };
  prefersReducedMotion: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
}

export function getDeviceCapabilities(): DeviceCapabilities {
  const conn = (navigator as any).connection;
  const memory = (navigator as any).deviceMemory ?? null;
  const cores = navigator.hardwareConcurrency ?? null;

  // Determine device tier based on memory + cores
  let tier: DeviceTier = 'high';
  if (memory && memory <= 2) {
    tier = 'low';
  } else if ((memory && memory <= 4) || (cores && cores <= 4)) {
    tier = 'medium';
  }

  return {
    tier,
    memory,
    cores,
    connection: {
      effectiveType: conn?.effectiveType ?? null,
      downlink: conn?.downlink ?? null,
      rtt: conn?.rtt ?? null,
      saveData: conn?.saveData ?? false,
    },
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio,
  };
}

// Image quality override based on device capabilities
export function getImageQuality(): number {
  const caps = getDeviceCapabilities();

  if (caps.connection.saveData) return 0.6;
  if (caps.tier === 'low') return 0.7;
  if (caps.connection.effectiveType === '3g' || caps.connection.effectiveType === '2g') return 0.7;
  return 1.0;
}

// Should we use blur placeholders?
export function shouldUseBlurPlaceholders(): boolean {
  const caps = getDeviceCapabilities();
  if (caps.tier === 'low') return false;
  if (caps.connection.saveData) return false;
  if (caps.connection.effectiveType === '2g') return false;
  return true;
}

// Should we reduce animations?
export function shouldReduceAnimations(): boolean {
  const caps = getDeviceCapabilities();
  if (caps.prefersReducedMotion) return true;
  if (caps.tier === 'low') return true;
  return false;
}

// Unload heavy components when tab is hidden
export function registerVisibilityHandler(
  onHidden: () => void,
  onVisible: () => void
): () => void {
  const handleVisibility = () => {
    if (document.hidden) {
      onHidden();
    } else {
      onVisible();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}

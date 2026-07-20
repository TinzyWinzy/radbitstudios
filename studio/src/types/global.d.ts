/* ── Global Type Augmentations ──────────────────────────────────────────
   Non-standard browser APIs and third-party globals.
   ─────────────────────────────────────────────────────────────────── */

interface NetworkInformation {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: EventListener) => void;
  removeEventListener?: (type: string, listener: EventListener) => void;
}

declare global {
  interface NavigatorUAData {
    platform?: string;
  }

  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
    deviceMemory?: number;
    userAgentData?: NavigatorUAData;
  }

  interface Window {
    adsbygoogle: unknown[];
  }
}

export {};

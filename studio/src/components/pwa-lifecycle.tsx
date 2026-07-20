"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function PwaLifecycle() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(registration => {
      registration.update().catch(() => undefined);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) worker.postMessage({ type: "SKIP_WAITING" });
        });
      });
    }).catch(() => undefined);

    if (isStandalone() || localStorage.getItem("radbit-install-dismissed") === "1") return;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    if (ios) {
      setShowIosHelp(true);
      const timer = window.setTimeout(() => setVisible(true), 2500);
      return () => { window.clearTimeout(timer); window.removeEventListener("beforeinstallprompt", handler); };
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setInstallEvent(null);
  }

  function dismiss() {
    localStorage.setItem("radbit-install-dismissed", "1");
    setVisible(false);
  }

  if (!visible || (!installEvent && !showIosHelp)) return null;
  return <aside aria-label="Install Radbit" className="frost-surface fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[100] mx-auto max-w-xl rounded-2xl p-4 sm:inset-x-auto sm:right-5 sm:mx-0">
    <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{showIosHelp ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}</span><div className="min-w-0 flex-1"><p className="font-medium">Install Radbit</p><p className="mt-1 text-sm leading-5 text-muted-foreground">{showIosHelp ? <>For the full iPhone or iPad experience, tap <strong className="text-foreground">Share</strong>, then <strong className="text-foreground">Add to Home Screen</strong>.</> : "Install the app for faster access, standalone display and offline continuity."}</p>{installEvent && <button type="button" onClick={install} className="decision-link mt-3 inline-flex min-h-10 items-center bg-primary px-4 text-sm font-semibold text-primary-foreground">Install app</button>}</div><button type="button" aria-label="Dismiss install guidance" onClick={dismiss} className="decision-link grid h-10 w-10 shrink-0 place-items-center text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button></div>
  </aside>;
}

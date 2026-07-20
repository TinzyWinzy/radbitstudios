"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { AlertTriangle, Check, CloudOff, Loader2 } from "lucide-react";
import { AuthContext } from "@/contexts/auth-context";
import { getHttpMutationSummary, syncHttpMutations } from "@/services/offline";

export function OfflineSyncManager() {
  const { user } = useContext(AuthContext);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [summary, setSummary] = useState({ pending: 0, failed: 0, conflicts: 0 });
  const [recentlySynced, setRecentlySynced] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setSummary(await getHttpMutationSummary(user.uid));
  }, [user]);

  const synchronize = useCallback(async () => {
    if (!user || !navigator.onLine) return;
    setSyncing(true);
    try {
      const result = await syncHttpMutations(user.uid);
      if (result.sent > 0) {
        setRecentlySynced(true);
        window.setTimeout(() => setRecentlySynced(false), 3500);
      }
      await refresh();
    } finally {
      setSyncing(false);
    }
  }, [refresh, user]);

  useEffect(() => {
    setOnline(navigator.onLine);
    refresh();
    synchronize();
    const onOnline = () => { setOnline(true); synchronize(); };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("radbit-sync-state", refresh);
    const timer = window.setInterval(synchronize, 60_000);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("radbit-sync-state", refresh);
      window.clearInterval(timer);
    };
  }, [refresh, synchronize]);

  if (online && !syncing && summary.pending === 0 && summary.failed === 0 && summary.conflicts === 0 && !recentlySynced) return null;
  const problem = summary.failed + summary.conflicts;
  return <div role="status" aria-live="polite" className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-3 z-[90] flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur sm:left-5">
    {!online ? <CloudOff className="h-4 w-4 text-primary" /> : syncing ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : problem ? <AlertTriangle className="h-4 w-4 text-primary" /> : <Check className="h-4 w-4 text-[hsl(var(--radbit-mineral))]" />}
    <span>{!online ? `Offline${summary.pending ? ` · ${summary.pending} waiting` : ""}` : syncing ? "Synchronizing changes…" : problem ? `${problem} change${problem === 1 ? "" : "s"} need attention` : recentlySynced ? "Changes synchronized" : `${summary.pending} waiting to sync`}</span>
  </div>;
}

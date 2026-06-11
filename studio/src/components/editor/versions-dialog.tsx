"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { listVersions, restoreVersion, type Version } from "@/services/version.service";
import { History, RotateCcw, Loader2, Clock } from "lucide-react";

interface Props {
  collectionName: string;
  docId: string;
  userId: string;
  onRestore: () => void;
}

export function VersionsDialog({ collectionName, docId, userId, onRestore }: Props) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listVersions(collectionName, docId).then(v => {
      setVersions(v);
      setLoading(false);
    });
  }, [open, collectionName, docId]);

  const handleRestore = async (versionId: string) => {
    if (!confirm("Restore this version? Current state will be saved as a backup.")) return;
    setRestoring(versionId);
    try {
      await restoreVersion(collectionName, docId, versionId, userId);
      onRestore();
      setOpen(false);
    } catch (e) {
      console.error("Restore failed:", e);
    }
    setRestoring(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="mr-2 h-4 w-4" /> Versions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : versions.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No previous versions saved. Versions are created automatically when you save edits.
          </p>
        ) : (
          <div className="space-y-2">
            {versions.map((v) => {
              const date = v.savedAt?.toDate?.();
              const time = date
                ? date.toLocaleDateString("en-ZW", {
                    year: "numeric", month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })
                : "Unknown date";

              return (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{time}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {v.savedBy || "Unknown"}
                        {v.label ? ` — ${v.label}` : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => v.id && handleRestore(v.id)}
                    disabled={restoring === v.id}
                    className="shrink-0 ml-2"
                  >
                    {restoring === v.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

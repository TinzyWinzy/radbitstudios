"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, Sparkles, ArrowRight, CheckCircle2, Info, Upload, ClipboardList, FileCheck } from "lucide-react";
import type { OnboardingChecklist, ChecklistItem as ChecklistItemType } from "@/types/project";

const TYPE_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  info: "secondary",
  upload: "outline",
  action: "default",
  decision: "secondary",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  info: <Info className="h-3.5 w-3.5" />,
  upload: <Upload className="h-3.5 w-3.5" />,
  action: <ClipboardList className="h-3.5 w-3.5" />,
  decision: <FileCheck className="h-3.5 w-3.5" />,
};

export function ChecklistView() {
  const [checklist, setChecklist] = useState<OnboardingChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchChecklist();
  }, []);

  async function fetchChecklist() {
    setLoading(true);
    try {
      const res = await fetch("/api/checklist");
      const json = await res.json();
      setChecklist(json.checklist);
    } catch (e) {
      console.error("[ChecklistView] Failed to fetch checklist:", e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleItem(item: ChecklistItemType) {
    if (!checklist) return;
    const newStatus = item.status === "pending" ? "completed" : "pending";
    setToggling(item.id);

    try {
      const res = await fetch("/api/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklistId: checklist.id,
          itemId: item.id,
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const updatedItems: ChecklistItemType[] = checklist.items.map(i =>
        i.id === item.id ? { ...i, status: newStatus as "pending" | "completed" } : i
      );
      const allDone = updatedItems.every(i => i.status === "completed");

      setChecklist({
        ...checklist,
        items: updatedItems,
        ...(allDone ? { completedAt: { toDate: () => new Date() } as any } : {}),
      });
    } catch (e) {
      console.error("[ChecklistView] Failed to toggle item:", e);
    } finally {
      setToggling(null);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 rounded mt-0.5 shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!checklist) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Onboarding Checklist
          </CardTitle>
          <CardDescription>
            Complete your onboarding checklist to get started with your project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <Sparkles className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No checklist yet</p>
            <p className="text-xs text-muted-foreground/70 mb-4 max-w-sm">
              Complete the onboarding form to generate a personalized checklist tailored to your needs.
            </p>
            <Button asChild>
              <a href="/onboarding">
                Take Onboarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = checklist.items.filter(i => i.status === "completed").length;
  const totalCount = checklist.items.length;
  const allDone = completedCount === totalCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Onboarding Checklist
        </CardTitle>
        <CardDescription>
          {allDone
            ? "All onboarding steps completed!"
            : `${completedCount} of ${totalCount} items completed`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!allDone && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round((completedCount / totalCount) * 100)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {allDone ? (
            <motion.div
              key="all-done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center text-center py-8"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-green-500/15 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-lg font-semibold">All done!</p>
              <p className="text-sm text-muted-foreground mt-1">
                You&apos;ve completed all onboarding steps.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {checklist.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                    item.status === "completed"
                      ? "bg-muted/30 border-muted"
                      : "bg-card border-border hover:bg-muted/20"
                  }`}
                >
                  <Checkbox
                    checked={item.status === "completed"}
                    disabled={toggling === item.id}
                    onCheckedChange={() => toggleItem(item)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p
                        className={`text-sm font-medium ${
                          item.status === "completed" ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {item.task}
                      </p>
                      <Badge
                        variant={TYPE_BADGE_VARIANTS[item.type] || "secondary"}
                        className="gap-1 px-1.5 py-0 text-[10px]"
                      >
                        {TYPE_ICONS[item.type]}
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

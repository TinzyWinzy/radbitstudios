"use client";

import { ChecklistView } from "@/components/checklist-view";
import { ClipboardCheck } from "lucide-react";

export default function ChecklistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          Onboarding Checklist
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your onboarding progress and complete required steps.
        </p>
      </div>

      <ChecklistView />
    </div>
  );
}

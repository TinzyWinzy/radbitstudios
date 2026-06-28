"use client";

import { ChecklistView } from "@/components/checklist-view";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ChecklistPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Onboarding Checklist
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your onboarding progress and complete required steps.
          </p>
        </div>
      </div>

      <ChecklistView />
    </div>
  );
}

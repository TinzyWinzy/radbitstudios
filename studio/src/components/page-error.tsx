"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface PageErrorProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  reset?: () => void;
}

export function PageError({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  backHref = "/dashboard",
  backLabel = "Go to Dashboard",
  reset,
}: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <AlertCircle className="size-12 text-destructive" />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground max-w-md">{description}</p>
      <div className="flex gap-3">
        {reset && <Button onClick={reset}>Try again</Button>}
        <Button variant="outline" asChild>
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </div>
  );
}

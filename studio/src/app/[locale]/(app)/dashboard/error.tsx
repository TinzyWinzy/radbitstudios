"use client";

import { PageError } from "@/components/page-error";

export default function DashboardError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      title="Dashboard Error"
      description="Failed to load your dashboard. Please try again."
      reset={reset}
      backHref="/dashboard"
      backLabel="Go to Dashboard"
    />
  );
}

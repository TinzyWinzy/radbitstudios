"use client";

import { PageError } from "@/components/page-error";

export default function TendersError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      title="Tenders Error"
      description="Failed to load tenders. Please try again."
      reset={reset}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  );
}

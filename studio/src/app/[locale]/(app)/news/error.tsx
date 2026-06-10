"use client";

import { PageError } from "@/components/page-error";

export default function NewsError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      title="News Error"
      description="Failed to load business news. Please try again."
      reset={reset}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  );
}

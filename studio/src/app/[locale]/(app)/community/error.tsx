"use client";

import { PageError } from "@/components/page-error";

export default function CommunityError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      title="Community Error"
      description="Failed to load the community forum. Please try again."
      reset={reset}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  );
}

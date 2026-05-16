
"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";

export default function AuthError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-4 text-center">
        <Link href="/" className="flex items-center gap-2">
          <Icons.logo className="size-8 shrink-0" />
          <span className="text-2xl font-semibold">Radbit SME Hub</span>
        </Link>
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">Please try again or go back.</p>
        <div className="flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

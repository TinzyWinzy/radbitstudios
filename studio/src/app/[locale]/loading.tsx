import { Icons } from "@/components/icons";

export default function LocaleLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background" role="status" aria-label="Loading page">
      <Icons.logo className="size-12 animate-pulse" />
      <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}

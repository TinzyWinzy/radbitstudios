import { Icons } from "@/components/icons";

export default function MarketingLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 border-border/50 backdrop-blur-lg">
        <div className="container flex h-14 items-center">
          <Icons.logo className="size-6 shrink-0" />
          <span className="font-semibold text-foreground">Radbit</span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div role="status" aria-label="Loading page content">
          <Icons.logo className="size-10 animate-pulse shrink-0" />
        </div>
      </main>
    </div>
  );
}

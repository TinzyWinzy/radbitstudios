
import { Icons } from "@/components/icons";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Icons.logo className="size-10 animate-pulse shrink-0" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

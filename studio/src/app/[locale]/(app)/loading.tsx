import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading dashboard">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

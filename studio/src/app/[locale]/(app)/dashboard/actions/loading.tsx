import { Skeleton } from "@/components/ui/skeleton";

export default function ActionCentreLoading() {
  return <div className="space-y-8"><div className="space-y-3"><Skeleton className="h-4 w-28" /><Skeleton className="h-10 w-64" /><Skeleton className="h-4 w-full max-w-xl" /></div><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-[30rem] rounded-2xl" /></div>;
}

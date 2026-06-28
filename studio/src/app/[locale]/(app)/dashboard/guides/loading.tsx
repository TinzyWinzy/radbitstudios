import { Skeleton } from "@/components/ui/skeleton";

export default function GuidesLoading() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div>
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="ml-auto h-9 w-28 rounded-md" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

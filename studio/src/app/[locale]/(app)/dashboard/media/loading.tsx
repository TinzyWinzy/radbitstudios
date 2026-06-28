import { Skeleton } from "@/components/ui/skeleton";

export default function MediaLoading() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </div>
        <Skeleton className="ml-auto h-9 w-28 rounded-md" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

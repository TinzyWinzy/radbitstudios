import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="size-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56 mt-1" />
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-1.5 flex-1 rounded-full" />
          <Skeleton className="h-1.5 flex-1 rounded-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
        <Skeleton className="h-10 rounded-lg mt-4" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between pb-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="size-6 rounded" />
            </div>
            <Skeleton className="h-4 w-40 mt-2" />
            <Skeleton className="h-4 w-20 mt-3" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border bg-card p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-36 mt-1" />
            </div>
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <Skeleton className="h-6 w-24 mb-1" />
          <Skeleton className="h-4 w-44 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

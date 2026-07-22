import { Skeleton } from "@/components/ui/skeleton";

/** Loading placeholder mirroring the pick-of-day card's backdrop + poster + info layout. */
export function PickOfDaySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      {/* Backdrop strip skeleton */}
      <Skeleton className="h-28 sm:h-36 w-full rounded-none" />
      <div className="relative -mt-12 sm:-mt-16 flex flex-col sm:flex-row gap-5 p-5 sm:p-6">
        <Skeleton className="mx-auto w-32 shrink-0 sm:mx-0 sm:w-36 aspect-[2/3] rounded-xl" />
        <div className="flex flex-col gap-3 flex-1">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-7 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full rounded-lg mt-1" />
          <Skeleton className="h-4 w-5/6 rounded-lg" />
          <Skeleton className="h-4 w-4/5 rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg mt-1" />
        </div>
      </div>
    </div>
  );
}

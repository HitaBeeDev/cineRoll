import { AppHeader } from "@/components/app-header";

/** Instant dashboard skeleton for the profile route — see watchlist/loading.tsx. */
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        {/* Header: avatar + name/email */}
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-[#12121c]" />
          <div className="space-y-2">
            <div className="h-7 w-48 animate-pulse rounded bg-[#111120]" />
            <div className="h-3 w-40 animate-pulse rounded bg-[#0f0f18]" />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-8 flex flex-wrap gap-x-12 gap-y-5 border-t border-[#1e1e2a] pt-7">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-7 w-10 animate-pulse rounded bg-[#111120]" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-[#0f0f18]" />
            </div>
          ))}
        </div>

        {/* Action cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-[#1e1e2a] bg-[#0d0d1a]"
            />
          ))}
        </div>

        {/* Recommendations */}
        <div className="mt-16">
          <div className="h-6 w-56 animate-pulse rounded bg-[#111120]" />
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] animate-pulse rounded-lg bg-[#111120]"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

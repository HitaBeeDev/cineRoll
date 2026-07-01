import { AppHeader } from "@/components/app-header";

/** Instant skeleton for the history route — see watchlist/loading.tsx. */
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        <div className="h-8 w-56 animate-pulse rounded bg-[#111120]" />
        <div className="mt-3 h-3 w-24 animate-pulse rounded bg-[#0f0f18]" />
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-md border border-white/[0.08] bg-[#11111a]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

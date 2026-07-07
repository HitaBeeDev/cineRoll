import { AppHeader } from "@/components/app-header";

/** Instant navigation feedback for the lists route (mirrors the page shell). */
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto w-full max-w-5xl px-6 py-12 lg:px-10">
        <div className="h-3 w-28 animate-pulse rounded bg-[#111120]" />
        <div className="mt-4 h-8 w-52 animate-pulse rounded bg-[#111120]" />
        <div className="mt-3 h-3 w-64 animate-pulse rounded bg-[#0f0f18]" />
        <div className="mt-8 h-[50px] w-full animate-pulse rounded-xl bg-[#111120]" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border border-white/[0.08] bg-[#11111a]" />
          ))}
        </div>
      </div>
    </main>
  );
}

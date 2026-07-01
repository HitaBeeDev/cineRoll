import { AppHeader } from "@/components/app-header";

/**
 * Instant navigation feedback for the settings route. Without this, the
 * force-dynamic page leaves the previous screen frozen until the server render
 * resolves — so a dropdown click feels like it did nothing. Mirrors the page's
 * shell + three section cards (Account, Avatar, Password) to avoid a layout jump.
 */
export default function Loading() {
  return (
    <main className="min-h-screen bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
        <div className="h-8 w-40 animate-pulse rounded bg-[#111120]" />

        {/* Account */}
        <section className="mt-10 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-7">
          <div className="h-3 w-20 animate-pulse rounded bg-[#111120]" />
          <div className="mt-5 flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-full bg-[#12121c]" />
            <div className="space-y-2">
              <div className="h-4 w-36 animate-pulse rounded bg-[#111120]" />
              <div className="h-3 w-48 animate-pulse rounded bg-[#0f0f18]" />
            </div>
          </div>
          <div className="mt-7 h-9 w-28 animate-pulse rounded bg-[#111120]" />
        </section>

        {/* Avatar */}
        <section className="mt-6 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-7">
          <div className="h-3 w-16 animate-pulse rounded bg-[#111120]" />
          <div className="mt-2 h-3 w-64 animate-pulse rounded bg-[#0f0f18]" />
          <div className="mt-5 flex flex-wrap gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-11 w-11 animate-pulse rounded-full bg-[#12121c]"
              />
            ))}
          </div>
        </section>

        {/* Password */}
        <section className="mt-6 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-7">
          <div className="h-3 w-32 animate-pulse rounded bg-[#111120]" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-[#0f0f18]" />
          <div className="mt-4 space-y-4">
            <div className="h-12 w-full animate-pulse rounded-xl bg-[#10101d]" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-[#10101d]" />
            <div className="h-11 w-40 animate-pulse rounded-xl bg-[#111120]" />
          </div>
        </section>
      </div>
    </main>
  );
}

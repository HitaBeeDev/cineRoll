import { Bookmark } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { apiFetch } from "@/lib/apiWithAuth";
import { AppHeader } from "@/components/app-header";
import { RetryButton } from "@/components/retry-button";
import { WatchlistGrid, type WatchlistEntry } from "@/components/watchlist-grid";

export const metadata: Metadata = {
  title: "Your Watchlist | CineRoll",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// A failed load must be distinguishable from a genuinely empty watchlist —
// otherwise a 500 / dropped connection renders the same "you saved nothing"
// screen. The discriminated result lets the page show an error + retry instead.
type WatchlistResult =
  | {
      status: "ok";
      entries: WatchlistEntry[];
      nextCursor: string | null;
      total: number | null;
    }
  | { status: "error" };

async function fetchWatchlist(): Promise<WatchlistResult> {
  const res = await apiFetch("/api/user/watchlist");
  if (!res.ok) return { status: "error" };

  const data = (await res.json().catch(() => null)) as {
    watchlist?: WatchlistEntry[];
    nextCursor?: string | null;
    total?: number | null;
  } | null;
  if (!data) return { status: "error" };

  return {
    status: "ok",
    entries: data.watchlist ?? [],
    nextCursor: data.nextCursor ?? null,
    total: data.total ?? null,
  };
}

export default async function WatchlistPage() {
  const session = await auth();
  if (!session?.user) redirect(`/auth/signin`);

  // Kick the fetch off but don't block the shell on it. The title paints
  // instantly; the count + grid (which share this one round-trip) stream in
  // behind a skeleton — same pattern as the profile page.
  const resultPromise = fetchWatchlist();

  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 rounded font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#9a9aac] underline-offset-4 transition-colors hover:text-[#e8453c] hover:underline focus-visible:text-[#e8453c] focus-visible:underline focus-visible:outline-none"
        >
          <span aria-hidden>←</span> Back to profile
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          Your Watchlist
        </h1>

        <Suspense fallback={<WatchlistSkeleton />}>
          <WatchlistBody resultPromise={resultPromise} />
        </Suspense>
      </div>
    </main>
  );
}

async function WatchlistBody({
  resultPromise,
}: {
  resultPromise: Promise<WatchlistResult>;
}) {
  const result = await resultPromise;

  if (result.status === "error") {
    return (
      <div className="mt-10 flex flex-col items-center gap-5 rounded-xl border border-[#e8453c]/25 bg-[#0d0d1a] px-6 py-20 text-center">
        <p className="max-w-sm font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#9a9aac]">
          We couldn’t load your watchlist. This is usually a hiccup on our end —
          check your connection and try again.
        </p>
        <RetryButton />
      </div>
    );
  }

  const total = result.total ?? result.entries.length;

  return (
    <>
      <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#9a9aac]">
        {total} {total === 1 ? "film" : "films"} saved
      </p>

      <div className="mt-8">
        {result.entries.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-[#1e1e2a] bg-[#0d0d1a] px-6 py-10 text-center">
            {/* Ghost posters: a visual cue that saved films land in this grid,
                with the save (bookmark) affordance called out on the center
                slot so the empty state reads as intentional, not hollow. */}
            <div className="flex items-end gap-2.5" aria-hidden>
              <div className="aspect-[2/3] w-12 rounded-md border border-dashed border-[#2a2a3c] bg-[#0b0b14]" />
              <div className="flex aspect-[2/3] w-14 items-center justify-center rounded-md border border-dashed border-[#3a3a50] bg-[#0b0b14]">
                <Bookmark className="h-5 w-5 text-[#7a7a8c]" />
              </div>
              <div className="aspect-[2/3] w-12 rounded-md border border-dashed border-[#2a2a3c] bg-[#0b0b14]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F5F5F0]">
                Nothing saved yet
              </h2>
              <p className="mx-auto max-w-md font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-[#9a9aac]">
                Save films from rolls, recommendations, or film pages and they’ll
                appear here.
              </p>
            </div>

            {/* Primary = random discovery (roll); secondary = manual discovery
                (browse), so an empty watchlist offers both ways to fill it. */}
            <div className="flex flex-col items-center gap-3">
              <Link
                href={`/`}
                className="inline-flex items-center rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
              >
                Roll a film
              </Link>
              <Link
                href="/browse"
                className="inline-flex items-center rounded font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#9a9aac] underline-offset-4 transition-colors hover:text-[#e8453c] hover:underline focus-visible:text-[#e8453c] focus-visible:underline focus-visible:outline-none"
              >
                Browse films
              </Link>
            </div>
          </div>
        ) : (
          <WatchlistGrid
            entries={result.entries}
            initialNextCursor={result.nextCursor}
          />
        )}
      </div>
    </>
  );
}

/** Placeholder count + poster grid shown while the watchlist streams in. */
function WatchlistSkeleton() {
  return (
    <>
      <div className="mt-2 h-3 w-28 animate-pulse rounded bg-[#111120]" />
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] animate-pulse rounded-md border border-white/[0.08] bg-[#11111a]"
          />
        ))}
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { apiFetch } from "@/lib/apiWithAuth";
import { AppHeader } from "@/components/app-header";
import { HistoryGrid, type WatchedEntry } from "@/components/history-grid";
import { RetryButton } from "@/components/retry-button";

export const metadata: Metadata = {
  title: "Watch History | CineRoll",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type RawWatchedEntry = WatchedEntry & { doNotSuggest: boolean };

// A failed load must be distinguishable from a genuinely empty history —
// otherwise a 500 / dropped connection renders the same "nothing watched yet"
// screen. The discriminated result lets the page show an error + retry instead.
type WatchedResult =
  | {
      status: "ok";
      entries: WatchedEntry[];
      nextCursor: string | null;
      total: number | null;
    }
  | { status: "error" };

async function fetchWatched(): Promise<WatchedResult> {
  const res = await apiFetch("/api/user/watched");
  if (!res.ok) return { status: "error" };

  const data = (await res.json().catch(() => null)) as {
    watched?: RawWatchedEntry[];
    nextCursor?: string | null;
    total?: number | null;
  } | null;
  if (!data) return { status: "error" };

  // Exclude "Not Interested" entries (doNotSuggest) — those are hidden, not watched.
  return {
    status: "ok",
    entries: (data.watched ?? []).filter((e) => !e.doNotSuggest),
    nextCursor: data.nextCursor ?? null,
    total: data.total ?? null,
  };
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect(`/auth/signin`);

  const result = await fetchWatched();
  const total =
    result.status === "ok" ? result.total ?? result.entries.length : null;

  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          Watch History
        </h1>
        {total !== null && (
          <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
            {total} {total === 1 ? "film" : "films"} watched
          </p>
        )}

        <div className="mt-10">
          {result.status === "error" ? (
            <div className="flex flex-col items-center gap-5 rounded-xl border border-[#e8453c]/25 bg-[#0d0d1a] px-6 py-20 text-center">
              <p className="max-w-sm font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#9a9aac]">
                We couldn’t load your watch history. This is usually a hiccup on
                our end — check your connection and try again.
              </p>
              <RetryButton />
            </div>
          ) : result.entries.length === 0 ? (
            <div className="flex flex-col items-center gap-5 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-20 text-center">
              <p className="max-w-sm font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#9a9aac]">
                No watched films yet. Mark anything watched from a roll or film
                page — with a rating — and it builds your history here.
              </p>
              <Link
                href={`/`}
                className="inline-flex items-center rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
              >
                Roll a film
              </Link>
            </div>
          ) : (
            <HistoryGrid
              entries={result.entries}
              initialNextCursor={result.nextCursor}
            />
          )}
        </div>
      </div>
    </main>
  );
}

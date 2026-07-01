import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { apiFetch } from "@/lib/apiWithAuth";
import { AppHeader } from "@/components/app-header";
import { HistoryGrid, type WatchedEntry } from "@/components/history-grid";

export const metadata: Metadata = {
  title: "Watch History | CineRoll",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type RawWatchedEntry = WatchedEntry & { doNotSuggest: boolean };

async function fetchWatched(): Promise<{ entries: WatchedEntry[]; nextCursor: string | null }> {
  const res = await apiFetch("/api/user/watched");
  if (!res.ok) return { entries: [], nextCursor: null };
  const data = (await res.json().catch(() => ({}))) as {
    watched?: RawWatchedEntry[];
    nextCursor?: string | null;
  };
  // Exclude "Not Interested" entries (doNotSuggest) — those are hidden, not watched.
  return {
    entries: (data.watched ?? []).filter((e) => !e.doNotSuggest),
    nextCursor: data.nextCursor ?? null,
  };
}

async function fetchWatchedCount(): Promise<number | null> {
  const res = await apiFetch("/api/user/summary");
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as { watched?: number };
  return data.watched ?? null;
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect(`/auth/signin`);

  const [{ entries: watched, nextCursor }, watchedCount] = await Promise.all([
    fetchWatched(),
    fetchWatchedCount(),
  ]);
  const total = watchedCount ?? watched.length;

  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          Watch History
        </h1>
        <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
          {total} {total === 1 ? "film" : "films"} watched
        </p>

        <div className="mt-10">
          {watched.length === 0 ? (
            <div className="flex flex-col items-center gap-5 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-20 text-center">
              <p className="max-w-sm font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#888899]">
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
            <HistoryGrid entries={watched} initialNextCursor={nextCursor} />
          )}
        </div>
      </div>
    </main>
  );
}

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

async function fetchWatched(): Promise<WatchedEntry[]> {
  const res = await apiFetch("/api/user/watched");
  if (!res.ok) return [];
  const data = (await res.json().catch(() => ({}))) as { watched?: RawWatchedEntry[] };
  // Exclude "Not Interested" entries (doNotSuggest) — those are hidden, not watched.
  return (data.watched ?? []).filter((e) => !e.doNotSuggest);
}

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/signin`);

  const watched = await fetchWatched();

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          Watch History
        </h1>
        <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
          {watched.length} {watched.length === 1 ? "film" : "films"} watched
        </p>

        <div className="mt-10">
          {watched.length === 0 ? (
            <div className="flex flex-col items-center gap-5 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-20 text-center">
              <p className="font-[family-name:var(--font-geist-mono)] text-sm text-[#888899]">
                No watched films yet — roll something and mark it watched
              </p>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
              >
                Roll a film
              </Link>
            </div>
          ) : (
            <HistoryGrid entries={watched} locale={locale} />
          )}
        </div>
      </div>
    </main>
  );
}

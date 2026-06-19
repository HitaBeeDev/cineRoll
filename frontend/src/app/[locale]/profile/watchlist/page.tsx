import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { apiFetch } from "@/lib/apiWithAuth";
import { AppHeader } from "@/components/app-header";
import { WatchlistGrid, type WatchlistEntry } from "@/components/watchlist-grid";

export const metadata: Metadata = {
  title: "Your Watchlist | CineRoll",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function fetchWatchlist(): Promise<{ entries: WatchlistEntry[]; nextCursor: string | null }> {
  const res = await apiFetch("/api/user/watchlist");
  if (!res.ok) return { entries: [], nextCursor: null };
  const data = (await res.json().catch(() => ({}))) as {
    watchlist?: WatchlistEntry[];
    nextCursor?: string | null;
  };
  return { entries: data.watchlist ?? [], nextCursor: data.nextCursor ?? null };
}

async function fetchSavedCount(): Promise<number | null> {
  const res = await apiFetch("/api/user/summary");
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as { watchlist?: number };
  return data.watchlist ?? null;
}

export default async function WatchlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/signin`);

  const [{ entries: watchlist, nextCursor }, savedCount] = await Promise.all([
    fetchWatchlist(),
    fetchSavedCount(),
  ]);
  const total = savedCount ?? watchlist.length;

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          Your Watchlist
        </h1>
        <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
          {total} {total === 1 ? "film" : "films"} saved
        </p>

        <div className="mt-10">
          {watchlist.length === 0 ? (
            <div className="flex flex-col items-center gap-5 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-20 text-center">
              <p className="font-[family-name:var(--font-geist-mono)] text-sm text-[#888899]">
                Your watchlist is empty — roll some films to get started
              </p>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
              >
                Roll a film
              </Link>
            </div>
          ) : (
            <WatchlistGrid entries={watchlist} locale={locale} initialNextCursor={nextCursor} />
          )}
        </div>
      </div>
    </main>
  );
}

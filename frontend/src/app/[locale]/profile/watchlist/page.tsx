import type { Metadata } from "next";
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

async function fetchWatchlist(): Promise<WatchlistEntry[]> {
  const res = await apiFetch("/api/user/watchlist");
  if (!res.ok) return [];
  const data = (await res.json().catch(() => ({}))) as { watchlist?: WatchlistEntry[] };
  return data.watchlist ?? [];
}

export default async function WatchlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/signin`);

  const watchlist = await fetchWatchlist();

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          Your Watchlist
        </h1>
        <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
          {watchlist.length} {watchlist.length === 1 ? "film" : "films"} saved
        </p>

        {/* Empty state lands in the next checklist item. */}
        <div className="mt-10">
          <WatchlistGrid entries={watchlist} locale={locale} />
        </div>
      </div>
    </main>
  );
}

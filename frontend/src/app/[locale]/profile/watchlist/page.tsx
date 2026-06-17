import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { apiFetch } from "@/lib/apiWithAuth";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "Your Watchlist | CineRoll",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type WatchlistFilm = {
  id: string;
  slug: string;
  title: string;
  year: number | null;
};

type WatchlistEntry = { id: string; film: WatchlistFilm };

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

        {/* Film grid + empty state land in the next checklist items. */}
        <ul className="mt-10 space-y-2">
          {watchlist.map(({ id, film }) => (
            <li key={id}>
              <Link
                href={`/${locale}/film/${film.slug}`}
                className="text-[#F5F5F0] underline-offset-2 hover:text-[#e8453c] hover:underline"
              >
                {film.title}
                {film.year ? ` (${film.year})` : ""}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

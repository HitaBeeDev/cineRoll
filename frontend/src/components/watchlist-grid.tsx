"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { removeFilmFromWatchlist } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export type WatchlistFilm = {
  id: string;
  slug: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
  genres: string[];
  contentType: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  oscarWins: number;
  oscarNominations: number;
  ggWins: number;
  ggNominations: number;
  cannesWins: number;
  cannesNominations: number;
  berlinWins: number;
  berlinNominations: number;
};

export type WatchlistEntry = { id: string; film: WatchlistFilm };

function awardSummary(film: WatchlistFilm): string | null {
  const wins =
    film.oscarWins + film.ggWins + film.cannesWins + film.berlinWins;
  const noms =
    film.oscarNominations +
    film.ggNominations +
    film.cannesNominations +
    film.berlinNominations;
  if (wins > 0) return `${wins} award ${wins === 1 ? "win" : "wins"}`;
  if (noms > 0) return `${noms} ${noms === 1 ? "nomination" : "nominations"}`;
  return null;
}

const PAGE_SIZE = 20;

export function WatchlistGrid({
  entries,
  initialNextCursor = null,
}: {
  entries: WatchlistEntry[];
  initialNextCursor?: string | null;
}) {
  const { toast } = useToast();
  const [films, setFilms] = useState(entries);
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadMore() {
    if (loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/user/watchlist?cursor=${encodeURIComponent(nextCursor)}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { watchlist?: WatchlistEntry[]; nextCursor?: string | null };
      setFilms((prev) => [...prev, ...(data.watchlist ?? [])]);
      setNextCursor(data.nextCursor ?? null);
    } catch {
      toast({ variant: "error", title: "Couldn't load more", description: "Check your connection and try again." });
    } finally {
      setLoadingMore(false);
    }
  }

  async function remove(film: WatchlistFilm) {
    if (removing.has(film.id)) return;
    setRemoving((prev) => new Set(prev).add(film.id));

    // Optimistic removal; restore on failure.
    const previous = films;
    setFilms((prev) => prev.filter((e) => e.film.id !== film.id));

    try {
      await removeFilmFromWatchlist(film.id);
      toast({ title: "Removed from watchlist", description: film.title });
    } catch {
      setFilms(previous);
      toast({
        variant: "error",
        title: "Couldn't remove",
        description: "Check your connection and try again.",
      });
    } finally {
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(film.id);
        return next;
      });
    }
  }

  return (
    <>
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {films.map(({ id, film }) => {
        const summary = awardSummary(film);
        const primaryGenre = film.genres[0] ?? film.contentType;
        return (
          <div key={id} className="group relative min-w-0">
            <Link
              href={`/film/${film.slug}`}
              aria-label={`${film.title}${film.year ? ` (${film.year})` : ""}`}
              className="block outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-[#08080d]"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-white/[0.08] bg-[#11111a] shadow-[0_18px_40px_rgba(0,0,0,0.34)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/[0.18]">
                {film.posterUrl ? (
                  <Image
                    src={film.posterUrl}
                    alt={`${film.title} poster`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#151520,#0b0b12)]">
                    <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.32em] text-[#555064]">
                      No Poster
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.04]" />
              </div>
            </Link>

            {/* Remove button */}
            <button
              type="button"
              aria-label={`Remove ${film.title} from watchlist`}
              disabled={removing.has(film.id)}
              onClick={() => void remove(film)}
              className={cn(
                "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full",
                "border border-white/15 bg-black/65 text-white/70 backdrop-blur-md",
                "transition-colors hover:border-[#e8453c]/60 hover:text-[#e8453c]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </button>

            <div className="pt-3">
              <h3 className="line-clamp-1 text-[14px] font-semibold leading-snug text-[#eeeaf6] sm:text-[15px]">
                {film.title}
              </h3>
              <p className="mt-1 line-clamp-1 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#9d98ad]">
                {film.year ?? "—"}
                {primaryGenre ? <span className="text-[#6f6a80]"> · {primaryGenre}</span> : null}
              </p>
              {summary ? (
                <p className="mt-1 line-clamp-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#D4AF37]">
                  {summary}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
      {nextCursor ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="inline-flex items-center rounded-xl border border-white/15 bg-[#0d0d1a] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#cfcadb] transition-colors hover:border-[#e8453c]/60 hover:text-[#e8453c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </>
  );
}

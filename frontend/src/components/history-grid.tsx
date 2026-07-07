"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { markFilmWatched, removeFilmWatched } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

export type WatchedFilm = {
  id: string;
  slug: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
  genres: string[];
  contentType: string | null;
};

export type WatchedEntry = {
  id: string;
  sentiment: "like" | "dislike" | null;
  film: WatchedFilm;
};

const PAGE_SIZE = 20;

export function HistoryGrid({
  entries,
  initialNextCursor = null,
}: {
  entries: WatchedEntry[];
  initialNextCursor?: string | null;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState(entries);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadMore() {
    if (loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/user/watched?cursor=${encodeURIComponent(nextCursor)}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as {
        watched?: WatchedEntry[];
        nextCursor?: string | null;
      };
      // "Not interested" rows are already excluded server-side.
      const page = data.watched ?? [];
      setItems((prev) => [...prev, ...page]);
      setNextCursor(data.nextCursor ?? null);
    } catch {
      toast({ variant: "error", title: "Couldn't load more", description: "Check your connection and try again." });
    } finally {
      setLoadingMore(false);
    }
  }

  function setBusyFor(filmId: string, on: boolean) {
    setBusy((prev) => {
      const next = new Set(prev);
      if (on) next.add(filmId);
      else next.delete(filmId);
      return next;
    });
  }

  async function reRate(film: WatchedFilm, value: "like" | "dislike") {
    if (busy.has(film.id)) return;
    const current = items.find((e) => e.film.id === film.id);
    const previous = current?.sentiment ?? null;
    // Tapping the active choice again clears it.
    const next = previous === value ? null : value;

    setItems((prev) =>
      prev.map((e) => (e.film.id === film.id ? { ...e, sentiment: next } : e)),
    );
    setBusyFor(film.id, true);
    try {
      await markFilmWatched(film.id, false, next);
    } catch {
      setItems((prev) =>
        prev.map((e) =>
          e.film.id === film.id ? { ...e, sentiment: previous } : e,
        ),
      );
      toast({
        variant: "error",
        title: "Couldn't save",
        description: "Check your connection and try again.",
      });
    } finally {
      setBusyFor(film.id, false);
    }
  }

  async function remove(film: WatchedFilm) {
    if (busy.has(film.id)) return;
    setBusyFor(film.id, true);

    const previous = items;
    setItems((prev) => prev.filter((e) => e.film.id !== film.id));
    try {
      await removeFilmWatched(film.id);
      toast({ title: "Removed from history", description: film.title });
    } catch {
      setItems(previous);
      toast({
        variant: "error",
        title: "Couldn't remove",
        description: "Check your connection and try again.",
      });
    } finally {
      setBusyFor(film.id, false);
    }
  }

  return (
    <>
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map(({ id, sentiment, film }) => {
        const primaryGenre = film.genres[0] ?? film.contentType;
        const disabled = busy.has(film.id);
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
                    src={tmdbImageUrl(film.posterUrl, "w342") ?? film.posterUrl}
                    alt={`${film.title} poster`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    placeholder="blur"
                    blurDataURL={blurDataUrl(null)}
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

            {/* Remove */}
            <button
              type="button"
              aria-label={`Remove ${film.title} from history`}
              disabled={disabled}
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

              {/* Sentiment shown + re-rate shortcut */}
              <div className="mt-2 flex items-center gap-2">
                <ReRateButton
                  tone="like"
                  active={sentiment === "like"}
                  disabled={disabled}
                  onClick={() => void reRate(film, "like")}
                  icon={<ThumbsUp className="h-3.5 w-3.5" aria-hidden />}
                  label="Liked it"
                />
                <ReRateButton
                  tone="dislike"
                  active={sentiment === "dislike"}
                  disabled={disabled}
                  onClick={() => void reRate(film, "dislike")}
                  icon={<ThumbsDown className="h-3.5 w-3.5" aria-hidden />}
                  label="Disliked it"
                />
              </div>
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

function ReRateButton({
  tone,
  active,
  disabled,
  onClick,
  icon,
  label,
}: {
  tone: "like" | "dislike";
  active: boolean;
  disabled?: boolean | undefined;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const toneClasses =
    tone === "like"
      ? active
        ? "border-[#3fb950]/50 bg-[#3fb950]/15 text-[#7ee787]"
        : "border-[#1e1e2a] text-[#888899] hover:border-[#3fb950]/45 hover:text-[#7ee787]"
      : active
        ? "border-[#e8453c]/50 bg-[#e8453c]/12 text-[#e8453c]"
        : "border-[#1e1e2a] text-[#888899] hover:border-[#e8453c]/45 hover:text-[#e8453c]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        toneClasses,
      )}
    >
      {icon}
    </button>
  );
}

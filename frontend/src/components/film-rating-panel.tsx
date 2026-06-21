"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { fetchFilmStatus, saveFilmRating } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

type RatingPanelProps = {
  filmId: string;
  filmTitle: string;
  averageRating: number | null;
  ratingCount: number;
};

const RATING_VALUES = Array.from({ length: 19 }, (_, index) => 1 + index * 0.5);

function formatRating(value: number): string {
  return value.toFixed(1);
}

export function FilmRatingPanel({
  filmId,
  filmTitle,
  averageRating,
  ratingCount,
}: RatingPanelProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isSessionLoading = status === "loading";
  const { toast } = useToast();
  const [watched, setWatched] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [loadedFilmId, setLoadedFilmId] = useState<string | null>(null);
  const statusLoaded = loadedFilmId === filmId;

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    void fetchFilmStatus(filmId)
      .then((status) => {
        if (cancelled) return;
        setWatched(status.watched && !status.doNotSuggest);
        setUserRating(status.rating);
      })
      .catch(() => {
        // Non-blocking: the aggregate rating still renders for everyone.
      })
      .finally(() => {
        if (!cancelled) setLoadedFilmId(filmId);
      });

    return () => {
      cancelled = true;
    };
  }, [filmId, isAuthenticated]);

  const displayRating = hoverRating ?? userRating ?? averageRating;
  const selectedLabel = useMemo(() => {
    if (hoverRating !== null) return `Rate ${formatRating(hoverRating)}`;
    if (userRating !== null) return `Your rating ${formatRating(userRating)}`;
    if (averageRating !== null) return `Average ${formatRating(averageRating)}`;
    return "No ratings yet";
  }, [averageRating, hoverRating, userRating]);

  async function handleRate(rating: number) {
    if (!isAuthenticated || !watched || pending) return;
    const previous = userRating;
    setUserRating(rating);
    setPending(true);
    try {
      await saveFilmRating(filmId, rating);
      toast({
        variant: "success",
        title: "Rating saved",
        description: `${filmTitle} · ${formatRating(rating)}/10`,
      });
    } catch {
      setUserRating(previous);
      toast({
        variant: "error",
        title: "Couldn't save rating",
        description: "Check your connection and try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-7 w-full max-w-[520px] border border-white/12 bg-black/25 px-5 py-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.5em] text-white/32">
            CineRoll Rating
          </p>
          <div className="flex items-center gap-3">
            <RatingStars value={averageRating} size="md" />
            <span className="font-[family-name:var(--font-display)] text-3xl font-bold leading-none text-[#F8F8F4]">
              {averageRating === null ? "—" : formatRating(averageRating)}
            </span>
            <span className="pb-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-white/35">
              {ratingCount === 1 ? "1 rating" : `${ratingCount} ratings`}
            </span>
          </div>
        </div>

        <div className="min-w-[220px]">
          <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.28em] text-white/42">
            {selectedLabel}
          </p>
          <div
            className="relative inline-flex"
            onMouseLeave={() => setHoverRating(null)}
          >
            <RatingStars value={displayRating} size="lg" />
            <div
              className="absolute inset-0 grid"
              style={{ gridTemplateColumns: `repeat(${RATING_VALUES.length}, minmax(0, 1fr))` }}
            >
            {RATING_VALUES.map((rating) => (
              <button
                key={rating}
                type="button"
                disabled={!isAuthenticated || !watched || pending || !statusLoaded}
                aria-label={`Rate ${formatRating(rating)} out of 10`}
                onMouseEnter={() => setHoverRating(rating)}
                onFocus={() => setHoverRating(rating)}
                onBlur={() => setHoverRating(null)}
                onClick={() => void handleRate(rating)}
                className={cn(
                  "h-8 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                  "disabled:cursor-not-allowed",
                  !isAuthenticated || !watched || !statusLoaded ? "opacity-45" : "hover:opacity-100",
                )}
              />
            ))}
            </div>
          </div>
          <RatingHint
            isAuthenticated={isAuthenticated}
            isSessionLoading={isSessionLoading}
            statusLoaded={statusLoaded}
            watched={watched}
          />
        </div>
      </div>
    </div>
  );
}

function RatingHint({
  isAuthenticated,
  isSessionLoading,
  statusLoaded,
  watched,
}: {
  isAuthenticated: boolean;
  isSessionLoading: boolean;
  statusLoaded: boolean;
  watched: boolean;
}) {
  if (isSessionLoading || (isAuthenticated && !statusLoaded)) {
    return (
      <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-white/35">
        Checking account
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/signin"
        className="mt-3 inline-block font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#e8453c] transition-colors hover:text-white"
      >
        Sign in to rate
      </Link>
    );
  }

  if (!watched) {
    return (
      <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-white/35">
        Mark watched to rate
      </p>
    );
  }

  return (
    <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-white/35">
      Half-step rating
    </p>
  );
}

function RatingStars({
  value,
  size,
}: {
  value: number | null;
  size: "sm" | "md" | "lg";
}) {
  const starValue = value === null ? 0 : value / 2;
  const iconSize =
    size === "lg" ? "h-7 w-7" : size === "md" ? "h-4 w-4" : "h-3 w-3";

  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, starValue - index));
        return (
          <span key={index} className={cn("relative inline-flex", iconSize)}>
            <Star className={cn("absolute inset-0 text-white/18", iconSize)} />
            <span
              className="absolute inset-0 overflow-hidden text-[#e8453c]"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className={cn("fill-current", iconSize)} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

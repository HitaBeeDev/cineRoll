"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { fetchFilmStatus, saveFilmRating } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

const STAR_GOLD = "#E3B53E";

type RatingPanelProps = {
  filmId: string;
  filmTitle: string;
};

const RATING_VALUES = Array.from({ length: 19 }, (_, index) => 1 + index * 0.5);

function formatRating(value: number): string {
  return value.toFixed(1);
}

export function FilmRatingPanel({ filmId, filmTitle }: RatingPanelProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const { toast } = useToast();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    void fetchFilmStatus(filmId)
      .then((s) => {
        if (!cancelled) setUserRating(s.rating);
      })
      .catch(() => {
        /* non-blocking */
      });
    return () => {
      cancelled = true;
    };
  }, [filmId, isAuthenticated]);

  const displayValue = hoverRating ?? selected ?? userRating;
  const dirty = selected !== null && selected !== userRating;
  const buttonLabel = saving
    ? "Saving"
    : isAuthenticated && userRating !== null
      ? dirty
        ? "Update"
        : "Submitted"
      : "Submit";

  async function handleSubmit() {
    if (saving) return;
    if (!isAuthenticated) {
      toast({
        title: "Sign in to rate this",
        description: filmTitle,
        action: {
          label: "Sign in",
          href: `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
        },
        duration: 7000,
      });
      return;
    }
    if (selected === null || !dirty) return;
    const previous = userRating;
    setSaving(true);
    try {
      await saveFilmRating(filmId, selected);
      setUserRating(selected);
      toast({
        variant: "success",
        title: "Rating saved",
        description: `${filmTitle} · ${formatRating(selected)}/10`,
      });
    } catch {
      setUserRating(previous);
      toast({
        variant: "error",
        title: "Couldn't save rating",
        description: "Check your connection and try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-[#1e1e30] bg-[#0c0c14] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          className="relative inline-flex"
          onMouseLeave={() => setHoverRating(null)}
        >
          <RatingStars value={displayValue} />
          <div
            className="absolute inset-0 grid"
            style={{ gridTemplateColumns: `repeat(${RATING_VALUES.length}, minmax(0, 1fr))` }}
          >
            {RATING_VALUES.map((rating) => (
              <button
                key={rating}
                type="button"
                disabled={saving}
                aria-label={`Rate ${formatRating(rating)} out of 10`}
                onMouseEnter={() => setHoverRating(rating)}
                onFocus={() => setHoverRating(rating)}
                onBlur={() => setHoverRating(null)}
                onClick={() => setSelected(rating)}
                className="h-9 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-default"
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={saving || (isAuthenticated && !dirty)}
          className="bg-[#e8453c] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

function RatingStars({ value }: { value: number | null }) {
  const starValue = value === null ? 0 : value / 2;

  return (
    <span className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, starValue - index));
        return (
          <span key={index} className="relative inline-flex h-8 w-8">
            <Star className="absolute inset-0 h-8 w-8 text-white/18" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%`, color: STAR_GOLD }}
            >
              <Star className="h-8 w-8 fill-current" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

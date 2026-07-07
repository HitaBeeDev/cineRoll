"use client";

import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { fetchFilmStatus, saveFilmRating } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { setPendingRating, takePendingRating } from "@/lib/pending-intent";
import { cn } from "@/lib/utils";

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
  const pathname = usePathname();
  const callbackUrl = pathname;
  const [userRating, setUserRating] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const persistRating = useCallback(
    async (rating: number, previous: number | null) => {
      setSaving(true);
      try {
        await saveFilmRating(filmId, rating);
        setUserRating(rating);
        setSelected(rating);
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
        setSaving(false);
      }
    },
    [filmId, filmTitle, toast],
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    void fetchFilmStatus(filmId)
      .then((s) => {
        if (cancelled) return;
        setUserRating(s.rating);
        // Resume a rating the user picked before signing in.
        const pending = takePendingRating(filmId);
        if (pending !== null && pending !== s.rating) {
          void persistRating(pending, s.rating);
        }
      })
      .catch(() => {
        /* non-blocking */
      });
    return () => {
      cancelled = true;
    };
  }, [filmId, isAuthenticated, persistRating]);

  const displayValue = hoverRating ?? selected ?? userRating;
  const dirty = selected !== null && selected !== userRating;
  // The submit only earns the loud accent when there's something to do:
  // a pending change, or an unauthenticated user we want to nudge to sign in.
  const intent = !isAuthenticated || dirty;
  const buttonLabel = saving
    ? "Saving"
    : isAuthenticated && userRating !== null
      ? dirty
        ? "Update"
        : "Submitted"
      : "Submit";

  function requestSignIn(rating: number | null) {
    // Show the pick behind the modal, stash it so it survives the round-trip,
    // then raise the auth modal. On return we replay it automatically.
    if (rating !== null) {
      setSelected(rating);
      setPendingRating(filmId, rating);
    }
    setAuthOpen(true);
  }

  function handleStar(rating: number) {
    if (saving) return;
    if (!isAuthenticated) {
      requestSignIn(rating);
      return;
    }
    setSelected(rating);
  }

  async function handleSubmit() {
    if (saving) return;
    if (!isAuthenticated) {
      requestSignIn(selected ?? userRating);
      return;
    }
    if (selected === null || !dirty) return;
    await persistRating(selected, userRating);
  }

  return (
    <>
    <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-x-6 gap-y-4 border border-[#1e1e30] bg-[#0c0c14] px-5 py-4">
      {/* Stars + live value — the primary interaction, kept as one tight unit. */}
      <div className="flex items-center gap-3.5">
        <div
          className="relative inline-flex transition-transform duration-200 hover:scale-[1.04]"
          onMouseLeave={() => setHoverRating(null)}
        >
          <RatingStars value={displayValue} active={displayValue !== null} />
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
                onClick={() => handleStar(rating)}
                className="h-9 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-default"
              />
            ))}
          </div>
        </div>

        <span className="flex min-w-[3.5ch] items-baseline gap-0.5 tabular-nums">
          <span
            className="font-[family-name:var(--font-display)] text-xl font-semibold leading-none transition-colors"
            style={{ color: displayValue !== null ? STAR_GOLD : "#3a3a4e" }}
          >
            {displayValue !== null ? formatRating(displayValue) : "—"}
          </span>
          {displayValue !== null && (
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-white/30">/10</span>
          )}
        </span>
      </div>

      {/* Supporting confirm — recessive until there's a change worth saving. */}
      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={saving || (isAuthenticated && !dirty)}
        className={cn(
          "px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed",
          intent
            ? "bg-[#e8453c] text-[#09090f] hover:bg-[#d5342b] disabled:opacity-40"
            : "border border-[#26263c] text-[#6a6a84] hover:border-[#33334d] hover:text-[#8a8aa6]",
        )}
      >
        {buttonLabel}
      </button>
    </div>
    <AuthDialog
      open={authOpen}
      onOpenChange={setAuthOpen}
      callbackUrl={callbackUrl}
      title={`Sign in to rate ${filmTitle}`}
    />
    </>
  );
}

function RatingStars({ value, active }: { value: number | null; active: boolean }) {
  const starValue = value === null ? 0 : value / 2;

  return (
    <span className="flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, starValue - index));
        return (
          <span key={index} className="relative inline-flex h-8 w-8">
            <Star className="absolute inset-0 h-8 w-8 text-white/25" />
            <span
              className="absolute inset-0 overflow-hidden transition-[width] duration-150 ease-out"
              style={{
                width: `${fill * 100}%`,
                color: STAR_GOLD,
                filter: active ? `drop-shadow(0 0 6px ${STAR_GOLD}66)` : undefined,
              }}
            >
              <Star className="h-8 w-8 fill-current" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

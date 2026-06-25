"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { fetchFilmStatus, saveFilmRating } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

// Gold stars tie the rating to CineRoll's prestige/award language; the CTA
// stays red (the brand/interactive colour).
const STAR_GOLD = "#E3B53E";

// localStorage key for a rating a signed-out user picked before signing in — so
// the rating survives the auth round-trip and auto-applies on return.
const pendingKey = (filmId: string) => `cineroll:pending-rating:${filmId}`;

type RatingPanelProps = {
  filmId: string;
  filmTitle: string;
  averageRating: number | null;
  ratingCount: number;
  genres: string[];
  year: number;
  hasAwards: boolean;
};

const RATING_VALUES = Array.from({ length: 19 }, (_, index) => 1 + index * 0.5);

function formatRating(value: number): string {
  return value.toFixed(1);
}

/** Qualitative read of a numeric rating, mirroring how the recommender treats
 *  it as a taste signal (≥7 positive, ≤4 negative). */
function ratingMood(value: number): string {
  if (value >= 9) return "Perfect match";
  if (value >= 7.5) return "Strong match";
  if (value >= 6) return "Good match";
  if (value >= 4) return "Mixed";
  return "Not your taste";
}

// The surfaces the rating-fed taste profile ACTUALLY powers (verified against
// the backend: recommend() for Recommendations, getPersonalizedRandomFilm for
// Daily Picks, and the profile itself). Similar Films (film-to-film) and Mood
// Match (prompt-based) don't read the taste profile, so they're excluded — no
// fabricated algorithmic claims.
const IMPROVES = ["Daily Picks", "Recommendations", "Taste Profile"] as const;

/** A short, real description of the film's taste traits the rating will weight:
 *  its genres, era and award status — the exact features the profile vectors key on. */
function tasteTraits(genres: string[], year: number, hasAwards: boolean): string {
  const decade = `${Math.floor(year / 10) * 10}s`;
  const parts = genres.slice(0, 2).map((g) => g.toLowerCase());
  parts.push(`${decade} classics`);
  if (hasAwards) parts.push("award winners");
  if (parts.length <= 1) return parts[0] ?? "this kind of film";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

export function FilmRatingPanel({
  filmId,
  filmTitle,
  averageRating,
  ratingCount,
  genres,
  year,
  hasAwards,
}: RatingPanelProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isSessionLoading = status === "loading";
  const { toast } = useToast();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  // A signed-out, locally-chosen rating awaiting "Save to Taste Profile".
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadedFilmId, setLoadedFilmId] = useState<string | null>(null);
  const statusLoaded = loadedFilmId === filmId;

  const traits = useMemo(
    () => tasteTraits(genres, year, hasAwards),
    [genres, year, hasAwards],
  );

  const persistRating = useCallback(
    async (rating: number, previous: number | null) => {
      setUserRating(rating);
      setSaving(true);
      try {
        await saveFilmRating(filmId, rating);
        toast({
          variant: "success",
          title: "Rating saved · taste profile updated",
          description: `${filmTitle} · ${formatRating(rating)}/10 — ${ratingMood(rating)}`,
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

  // Load any existing rating for signed-in users.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    void fetchFilmStatus(filmId)
      .then((s) => {
        if (!cancelled) setUserRating(s.rating);
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

  // After a signed-out user signs in via "Save to Taste Profile", apply the
  // rating they picked before the auth round-trip.
  useEffect(() => {
    if (!isAuthenticated || !statusLoaded || userRating !== null) return;
    const stored = window.localStorage.getItem(pendingKey(filmId));
    if (!stored) return;
    window.localStorage.removeItem(pendingKey(filmId));
    const rating = Number(stored);
    if (Number.isFinite(rating) && rating >= 1 && rating <= 10) {
      void persistRating(rating, null);
    }
  }, [isAuthenticated, statusLoaded, userRating, filmId, persistRating]);

  const hasRatings = ratingCount > 0;
  const hasUserRating = userRating !== null;
  const displayRating = hoverRating ?? pendingRating ?? userRating ?? averageRating;
  const heading = hasUserRating ? "Your Rating" : "Shape Your Recommendations";

  const copy = useMemo(() => {
    if (hasUserRating)
      return `Your score is feeding your taste profile, refining picks for ${traits}.`;
    return `Rate ${filmTitle} to help CineRoll learn your taste for ${traits}.`;
  }, [hasUserRating, filmTitle, traits]);

  function onStar(rating: number) {
    if (saving) return;
    if (isAuthenticated) void persistRating(rating, userRating);
    else setPendingRating(rating);
  }

  function saveViaSignin() {
    if (pendingRating == null) return;
    try {
      window.localStorage.setItem(pendingKey(filmId), String(pendingRating));
    } catch {
      // Private mode etc. — sign-in still works, the rating just won't persist.
    }
    const callback = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.href = `/auth/signin?callbackUrl=${callback}`;
  }

  const showConfirm = !isAuthenticated && pendingRating !== null;

  return (
    <div className="relative overflow-hidden border border-[#1e1e30] bg-gradient-to-br from-[#13110c] via-[#0c0c14] to-[#0a0a10] p-6 sm:p-7">
      <div
        className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${STAR_GOLD}1f, transparent 70%)` }}
      />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        {/* ── Taste signal ─────────────────────────────────────────── */}
        <div className="max-w-md">
          <p
            className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.42em]"
            style={{ color: `${STAR_GOLD}cc` }}
          >
            Your Taste Signal
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-[#F2F2F6]">
            {heading}
          </h3>
          <p className="mt-2 text-[0.85rem] leading-6 text-[#9a9ab4]">{copy}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
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
                    disabled={saving || isSessionLoading}
                    aria-label={`Rate ${formatRating(rating)} out of 10`}
                    onMouseEnter={() => setHoverRating(rating)}
                    onFocus={() => setHoverRating(rating)}
                    onBlur={() => setHoverRating(null)}
                    onClick={() => onStar(rating)}
                    className="h-8 cursor-pointer transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                ))}
              </div>
            </div>

            {!showConfirm && (
              <RatingStatus
                isSessionLoading={isSessionLoading}
                userRating={userRating}
              />
            )}
          </div>

          {/* Signed-out save prompt — interact first, sign in only to save. */}
          {showConfirm && pendingRating !== null && (
            <div className="mt-5 border-l-2 pl-4" style={{ borderColor: `${STAR_GOLD}66` }}>
              <p className="font-[family-name:var(--font-display)] text-base font-bold text-[#F2F2F6]">
                {formatRating(pendingRating)} selected
                <span className="ml-2 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  {ratingMood(pendingRating)}
                </span>
              </p>
              <p className="mt-1 text-[0.85rem] leading-6 text-[#9a9ab4]">
                Save this rating to your Taste Profile and improve future matches.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={saveViaSignin}
                  className="inline-flex items-center bg-[#e8453c] px-4 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c14]"
                >
                  Save to Taste Profile
                </button>
                <button
                  type="button"
                  onClick={() => setPendingRating(null)}
                  className="px-3 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
                >
                  Not now
                </button>
              </div>
            </div>
          )}

          {isAuthenticated && hasUserRating && (
            <p
              className="mt-4 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em]"
              style={{ color: `${STAR_GOLD}cc` }}
            >
              ✓ Counted toward your taste profile
            </p>
          )}
        </div>

        {/* ── Algorithmic value + community ────────────────────────── */}
        <div className="flex flex-col gap-6 lg:items-end lg:text-right">
          <div>
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.4em] text-white/35">
              Improves
            </p>
            <div className="mt-3 flex flex-wrap gap-2 lg:justify-end">
              {IMPROVES.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[3px] border border-[#2a2a3e] bg-[#0e0e18] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#9a9ab4]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {hasRatings && (
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.4em] text-white/35">
                Community
              </p>
              <div className="mt-2.5 flex items-center gap-2.5 lg:justify-end">
                <RatingStars value={averageRating} size="sm" />
                <span className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-[#F8F8F4]">
                  {averageRating === null ? "—" : formatRating(averageRating)}
                </span>
                <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-white/35">
                  {ratingCount === 1 ? "1 rating" : `${ratingCount} ratings`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingStatus({
  isSessionLoading,
  userRating,
}: {
  isSessionLoading: boolean;
  userRating: number | null;
}) {
  if (isSessionLoading) {
    return (
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-white/35">
        Checking account…
      </span>
    );
  }

  if (userRating !== null) {
    return (
      <span className="flex items-baseline gap-2">
        <span
          className="font-[family-name:var(--font-display)] text-xl font-bold leading-none"
          style={{ color: STAR_GOLD }}
        >
          {formatRating(userRating)}
        </span>
        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-white/55">
          {ratingMood(userRating)}
        </span>
      </span>
    );
  }

  return (
    <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-white/45">
      Choose your rating
    </span>
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
    size === "lg" ? "h-7 w-7" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, starValue - index));
        return (
          <span key={index} className={cn("relative inline-flex", iconSize)}>
            <Star className={cn("absolute inset-0 text-white/18", iconSize)} />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%`, color: STAR_GOLD }}
            >
              <Star className={cn("fill-current", iconSize)} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

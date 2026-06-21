"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { FilterBar } from "@/components/filter-bar";
import { AppHeader } from "@/components/app-header";
import { useSession } from "next-auth/react";
import {
  fetchRandom,
  fetchFilms,
  fetchGenres,
  fetchOnboardingTasteCards,
  saveOnboardingGenres,
  type RollFilm,
  type TasteCardFilm,
} from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { useFilters } from "@/hooks/useFilters";
import { cn } from "@/lib/utils";
import { pushRollHistory, TASTE_SEED_STORAGE_KEY } from "@/lib/home-storage";
import { FilmCard } from "@/components/home/film-card";
import { RollHistoryDrawer } from "@/components/home/roll-history-drawer";
import { FirstVisitOnboarding } from "@/components/home/first-visit-onboarding";
import {
  ZeroResultsEmpty,
  FilmCardEmpty,
  FilmCardSkeleton,
} from "@/components/home/empty-states";

const ONBOARDED_STORAGE_KEY = "cineroll_onboarded";
const ONBOARDED_COOKIE = "cineroll_onboarded";
const TASTE_SEED_SYNCED_KEY = "cineroll_taste_seed_synced";
const PERSONALIZED_ROLL_KEY = "cineroll_personalized_roll";
const SESSION_HIDDEN_FILMS_KEY = "cineroll_session_hidden_films";
const MAX_GUEST_REROLL_ATTEMPTS = 5;

/** Persist the onboarding flag where the server can read it. `page.tsx` reads
 *  this cookie via `cookies()` to decide server-side whether to render
 *  onboarding, so returning visitors never flash the onboarding screen. Mirrors
 *  the localStorage flag (kept as the migration bridge). 1-year; `lax` so it
 *  rides along on the top-level navigation that loads the page. */
function markOnboardedCookie() {
  try {
    document.cookie = `${ONBOARDED_COOKIE}=true; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // Cookie write unavailable — the localStorage flag still gates this session.
  }
}

function readSessionHiddenFilmIds(): string[] {
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(SESSION_HIDDEN_FILMS_KEY) ?? "[]",
    ) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function hideFilmForSession(filmId: string) {
  try {
    const next = [
      filmId,
      ...readSessionHiddenFilmIds().filter((id) => id !== filmId),
    ].slice(0, 100);
    window.sessionStorage.setItem(SESSION_HIDDEN_FILMS_KEY, JSON.stringify(next));
    return next.length;
  } catch {
    return 0;
  }
}

export function HomeClient({
  initialOnboarded,
  hero,
}: {
  initialOnboarded: boolean;
  hero: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Onboarding runs before sign-in, so the taste seed lands in localStorage.
  // Once signed in, flush its genres to the account (once per user) to seed the
  // cold-start taste profile.
  useEffect(() => {
    if (!userId) return;
    try {
      if (window.localStorage.getItem(TASTE_SEED_SYNCED_KEY) === userId) return;
      const raw = window.localStorage.getItem(TASTE_SEED_STORAGE_KEY);
      if (!raw) return;
      const seed = JSON.parse(raw) as { genres?: unknown };
      const genres = Array.isArray(seed.genres)
        ? seed.genres.filter((g): g is string => typeof g === "string")
        : [];
      if (genres.length === 0) return;
      void saveOnboardingGenres(genres)
        .then(() => {
          window.localStorage.setItem(TASTE_SEED_SYNCED_KEY, userId);
        })
        .catch(() => {
          // Non-blocking: a failed flush retries on the next mount.
        });
    } catch {
      // localStorage unavailable — skip.
    }
  }, [userId]);

  // "Roll from my taste" opt-in (signed-in only), persisted to localStorage.
  // Lazy init is safe: the toggle only renders under the client-only `userId`
  // gate, so there's no SSR markup to mismatch on hydration.
  const [personalizedRoll, setPersonalizedRoll] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(PERSONALIZED_ROLL_KEY) === "1";
    } catch {
      return false;
    }
  });
  function togglePersonalizedRoll() {
    setPersonalizedRoll((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(PERSONALIZED_ROLL_KEY, next ? "1" : "0");
      } catch {
        // localStorage unavailable — keep the in-memory preference.
      }
      return next;
    });
  }

  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();
  const [film, setFilm] = useState<RollFilm | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  const [isCountLoading, setIsCountLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  // The onboarding decision is made on the server from the `cineroll_onboarded`
  // cookie and handed in as `initialOnboarded`, so the correct branch is
  // server-rendered with no first-visit flash and no hydration mismatch.
  const [onboardingState, setOnboardingState] = useState<"show" | "done">(
    initialOnboarded ? "done" : "show",
  );
  const [tasteCards, setTasteCards] = useState<TasteCardFilm[]>([]);
  const [tasteCardsStatus, setTasteCardsStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [shouldAutoRoll, setShouldAutoRoll] = useState(false);

  const handleRollRef = useRef<() => Promise<void>>(async () => {});
  const filmCardRef = useRef<HTMLDivElement>(null);

  // Migration bridge for visitors who onboarded before it moved to a cookie:
  // they still carry the localStorage flag but no cookie, so the server would
  // show onboarding again. Detect that, set the cookie, and skip to the app.
  // Runs once and self-heals (a one-time flash at most for those users).
  useEffect(() => {
    if (initialOnboarded) return;
    const id = window.setTimeout(() => {
      try {
        if (window.localStorage.getItem(ONBOARDED_STORAGE_KEY) === "true") {
          markOnboardedCookie();
          setOnboardingState("done");
        }
      } catch {
        // localStorage unavailable — leave onboarding as the server decided.
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [initialOnboarded]);

  useEffect(() => {
    if (onboardingState !== "show") return;
    let cancelled = false;
    const id = window.setTimeout(() => {
      setTasteCardsStatus("loading");
      void fetchOnboardingTasteCards()
        .then((films) => {
          if (cancelled) return;
          setTasteCards(films);
          setTasteCardsStatus(films.length > 0 ? "ready" : "error");
        })
        .catch(() => {
          if (!cancelled) setTasteCardsStatus("error");
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [onboardingState]);

  // Fetch filter metadata + total film count
  useEffect(() => {
    void fetchGenres().then(setGenres);
    void fetchRandom()
      .then((r) => setTotalCount(r.total))
      .catch(() => {});
  }, []);

  // Space key fires roll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (
        e.code === "Space" &&
        !e.repeat &&
        tag !== "INPUT" &&
        tag !== "TEXTAREA" &&
        tag !== "BUTTON"
      ) {
        e.preventDefault();
        void handleRollRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Count films matching active filters (debounced)
  useEffect(() => {
    if (!hasActiveFilters) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsCountLoading(true);
      void fetchFilms(filters, 1)
        .then((r) => {
          if (!cancelled) setFilteredCount(r.total);
        })
        .catch(() => {
          if (!cancelled) setFilteredCount(null);
        })
        .finally(() => {
          if (!cancelled) setIsCountLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters, hasActiveFilters]);

  const effectiveCount = hasActiveFilters ? filteredCount : null;
  const effectiveCountLoading = hasActiveFilters && isCountLoading;
  const displayCount: number | null = effectiveCountLoading ? null : (effectiveCount ?? totalCount);
  const isRollDisabled =
    isRolling ||
    (hasActiveFilters && effectiveCount === 0 && !effectiveCountLoading);
  const shouldPulse =
    hasActiveFilters && effectiveCount !== 0 && !isRolling && !shouldReduceMotion;

  async function handleRoll() {
    setIsRolling(true);
    setFilm(null);
    const isPersonalized = personalizedRoll && !!userId;
    void trackEvent({
      type: isPersonalized ? "roll_personalized" : "roll",
      context: {
        source: "home_roll",
        filters,
        hasActiveFilters,
      },
    });
    if (hasActiveFilters && !shouldReduceMotion) {
      setIsSearching(true);
      window.setTimeout(() => setIsSearching(false), 150);
    }
    try {
      // Signed-in users: the backend filters out films they marked "Not Interested".
      // With the taste toggle on, it returns a taste-weighted (ε-greedy) pick.
      let result = await fetchRandom(filters, userId, isPersonalized);
      const hiddenIds = userId ? [] : readSessionHiddenFilmIds();
      if (!userId && hiddenIds.length > 0) {
        const hidden = new Set(hiddenIds);
        for (
          let attempt = 0;
          attempt < MAX_GUEST_REROLL_ATTEMPTS && hidden.has(result.film.id);
          attempt++
        ) {
          result = await fetchRandom(filters);
        }
      }
      setFilm(result.film);
      setFilteredCount(result.total);
      pushRollHistory(result.film);
      void trackEvent({
        type: "impression",
        filmId: result.film.id,
        context: {
          source: "roll_result",
          filters,
          total: result.total,
        },
      });
      // Scroll to film card on mobile
      setTimeout(
        () =>
          filmCardRef.current?.scrollIntoView({
            behavior: shouldReduceMotion ? "auto" : "smooth",
            block: "start",
          }),
        100,
      );
    } catch (err) {
      const code =
        err instanceof Error
          ? (err as Error & { code?: string }).code
          : undefined;
      if (code === "NO_FILMS_FOUND") {
        setFilteredCount(0);
        toast({
          variant: "error",
          title: "No matches",
          description: "No films match your filters — try adjusting them.",
        });
      } else {
        toast({
          variant: "error",
          title: "Couldn't connect",
          description: "Check your connection and try again.",
        });
      }
    } finally {
      setIsRolling(false);
    }
  }

  function handleGuestHideForSession(filmId: string) {
    hideFilmForSession(filmId);
  }

  // Keep ref in sync so space-key handler always calls latest version
  useEffect(() => {
    handleRollRef.current = handleRoll;
  });

  useEffect(() => {
    if (!shouldAutoRoll) return;
    const timer = window.setTimeout(() => {
      setShouldAutoRoll(false);
      void handleRollRef.current();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [shouldAutoRoll]);

  // Screen-reader announcement for the roll result. The film card region is
  // otherwise silent on roll (only the pool counter has a live region), so a
  // sighted user sees the new film but an assistive-tech user gets nothing.
  // A concise polite message keeps the announcement from re-reading the whole
  // card on every animation.
  const rollAnnouncement = isRolling
    ? "Rolling for a film…"
    : film
      ? `Rolled: ${film.title}${film.year ? `, ${film.year}` : ""}.`
      : effectiveCount === 0
        ? "No films match your filters."
        : "";

  // Pool count display
  const poolCountStr = effectiveCountLoading
    ? "···"
    : effectiveCount !== null
      ? String(effectiveCount).padStart(3, "0")
      : totalCount !== null
        ? String(totalCount).padStart(3, "0")
        : "···";

  if (onboardingState === "show") {
    return (
      <FirstVisitOnboarding
        tasteCards={tasteCards}
        tasteCardsStatus={tasteCardsStatus}
        onRetryTasteCards={() => {
          setTasteCardsStatus("loading");
          void fetchOnboardingTasteCards()
            .then((films) => {
              setTasteCards(films);
              setTasteCardsStatus(films.length > 0 ? "ready" : "error");
            })
            .catch(() => setTasteCardsStatus("error"));
        }}
        onContinue={(seed) => {
          if (seed?.primaryGenre) {
            setFilter({ genre: seed.primaryGenre, page: 1 });
          }
          try {
            window.localStorage.setItem(ONBOARDED_STORAGE_KEY, "true");
          } catch {}
          markOnboardedCookie();
          setOnboardingState("done");
        }}
      />
    );
  }

  return (
    <div className="isolate flex flex-col h-screen overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />

      {/* ── Two-column body ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col lg:grid lg:grid-cols-12 lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        {/* LEFT: hero + filters + roll ──────────────────────────────── */}
        <div className="flex flex-col overflow-y-auto lg:overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 px-5 py-4 sm:px-8 lg:px-10 lg:py-5 lg:col-span-7">
          {/* Scroll region: hero + filters. Filters sit just above ROLL via mt-auto;
              when filters grow, the gap above them collapses first so ROLL never moves. */}
          <div className="flex flex-col lg:flex-1 lg:min-h-0 lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0">
          {/* Channel label */}
          <div className="flex items-center justify-between gap-3">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.25em] text-[#888899]">
              {"// CHANNEL 03 · TONIGHT"}
            </p>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full border border-[#1e1e2a] bg-[#11111b] px-3 text-[#888899]",
                "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em]",
                "transition hover:border-[#e8453c]/45 hover:text-[#F5F5F0]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
              )}
            >
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              History
            </button>
          </div>

          {/* Hero headline — server-rendered (see HomeHero) and passed in as
              `hero`. Font size is driven from this wrapper so the heading can
              still shrink when filters are active (it inherits `font-size`),
              while its markup stays in the server component / out of the client
              bundle. The stack moves up so it stays visible without scrolling. */}
          <div
            className={cn(
              "mt-2 transition-all duration-300",
              hasActiveFilters ? "mb-6" : "mb-10",
            )}
            style={{
              fontSize: hasActiveFilters
                ? "clamp(3.75rem,5.4vw,5.75rem)"
                : "clamp(4.5rem,6.5vw,7rem)",
            }}
          >
            {hero}
          </div>

          {/* Filters */}
          <FilterBar
            className="mt-auto"
            filters={filters}
            genres={genres}
            onFiltersChange={(updates) => {
              setFilter(updates);
              trackEvent({
                type: "filter_apply",
                context: {
                  source: "home",
                  updates,
                },
              });
            }}
            onClearFilters={() => {
              resetFilters();
              trackEvent({
                type: "filter_apply",
                context: {
                  source: "home",
                  action: "clear",
                },
              });
            }}
          />
          </div>

          {/* ROLL button + pool count + natural language CTA */}
          <div className="mt-6 shrink-0 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-4">
            {/* Marquee-border ROLL box */}
            <motion.div
              className="w-[185px] shrink-0 rounded-2xl border-2 border-dashed border-[#e8453c]/30 p-1.5"
              animate={shouldPulse ? {
                boxShadow: [
                  "0 0 0px rgba(232,69,60,0)",
                  "0 0 28px rgba(232,69,60,0.42)",
                  "0 0 0px rgba(232,69,60,0)",
                ],
              } : { boxShadow: "0 0 0px rgba(232,69,60,0)" }}
              transition={shouldPulse ? {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              } : { duration: 0.5 }}
            >
              <button
                onClick={() => void handleRoll()}
                disabled={isRollDisabled}
                aria-label={
                  isRolling ? "Rolling…"
                  : hasActiveFilters && effectiveCount === 0 ? "No matches"
                  : hasActiveFilters && effectiveCount !== null && !effectiveCountLoading
                    ? `Roll from ${effectiveCount} films`
                  : "Roll for a random film"
                }
                className={cn(
                  "flex h-[64px] w-full items-center justify-center rounded-xl",
                  "bg-[#e8453c] text-[#F5F5F0]",
                  "font-[family-name:var(--font-geist-mono)] font-bold uppercase",
                  "select-none transition-all duration-150",
                  "hover:bg-[#d5342b] hover:shadow-[0_0_40px_rgba(232,69,60,0.28)]",
                  "active:scale-[0.98]",
                  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
                )}
              >
                {isRolling ? (
                  <span className="text-xl tracking-[0.25em]">Rolling…</span>
                ) : hasActiveFilters && effectiveCount === 0 ? (
                  <span className="text-xl tracking-[0.25em]">No matches</span>
                ) : hasActiveFilters && effectiveCount !== null && !effectiveCountLoading ? (
                  <span className="flex flex-col items-center leading-tight gap-0.5">
                    <span className="text-xl tracking-[0.25em]">Roll</span>
                    <span className="text-[11px] tracking-[0.15em] font-normal normal-case opacity-80">
                      from {effectiveCount} films
                    </span>
                  </span>
                ) : (
                  <span className="text-xl tracking-[0.25em]">Roll</span>
                )}
              </button>
            </motion.div>

            {/* Pool counter — to the right of the ROLL box */}
            <div className="flex shrink-0 flex-col items-start gap-0.5">
              {effectiveCount === 0 ? (
                <p className="font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed tracking-wide text-[#9090a8] max-w-[180px]">
                  No films match —<br />
                  even we couldn&apos;t find that.<br />
                  Try relaxing a filter.
                </p>
              ) : (
                <>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
                    Reel Pool
                  </span>
                  <AnimatedPoolCount value={poolCountStr} />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={effectiveCountLoading ? "loading" : getCountTagline(displayCount)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-wide text-[#9090a8]"
                    >
                      {effectiveCountLoading ? "finding films…" : getCountTagline(displayCount)}
                    </motion.span>
                  </AnimatePresence>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
                    Press [Space] to spin
                  </span>
                </>
              )}
            </div>

            <Link
              href="/describe"
              className={cn(
                "inline-flex shrink-0 self-end items-center gap-1.5 rounded-full border border-[#2a2a3e] px-3 py-1.5",
                "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest text-[#F5F5F0]",
                "transition-colors hover:border-[#e8453c]/45 hover:text-[#e8453c]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
              )}
            >
              Can&apos;t decide? Describe it
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>

          {/* "Roll from my taste" toggle — signed-in only, opt-in */}
          {userId && (
            <button
              type="button"
              role="switch"
              aria-checked={personalizedRoll}
              onClick={togglePersonalizedRoll}
              className={cn(
                "mt-1 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5",
                "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                personalizedRoll
                  ? "border-[#e8453c]/45 bg-[#e8453c]/10 text-[#e8453c]"
                  : "border-[#2a2a3e] text-[#888899] hover:border-[#e8453c]/45 hover:text-[#e8453c]",
              )}
            >
              <span
                className={cn(
                  "relative h-3 w-5 rounded-full transition-colors",
                  personalizedRoll ? "bg-[#e8453c]" : "bg-[#2a2a3e]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-2 w-2 rounded-full bg-white transition-all",
                    personalizedRoll ? "left-2.5" : "left-0.5",
                  )}
                />
              </span>
              Roll from my taste
            </button>
          )}

          {/* Searching flicker */}
          <AnimatePresence>
            {isSearching && (
              <motion.p
                key="searching"
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.08 }}
                className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.25em] text-[#e8453c]/60"
              >
                Searching{effectiveCount !== null ? ` ${effectiveCount}` : ""} films…
              </motion.p>
            )}
          </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: film card ──────────────────────────────────────────── */}
        <div
          ref={filmCardRef}
          className={cn(
            "relative z-0",
            "border-t border-[#1a1a28] lg:border-t-0 lg:border-l",
            "lg:col-span-5",
            "min-h-[400px] lg:min-h-0 lg:flex lg:flex-col lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0",
            "p-4",
          )}
        >
          {/* Polite live region: announces the rolled film to screen readers. */}
          <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {rollAnnouncement}
          </p>
          <AnimatePresence mode="wait">
            {isRolling ? (
              <motion.div
                key="skeleton"
                layout={!shouldReduceMotion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: {
                    duration: shouldReduceMotion ? 0 : 0.15,
                    ease: "easeIn",
                  },
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.15,
                  ease: "easeOut",
                }}
              >
                <FilmCardSkeleton />
              </motion.div>
            ) : film ? (
              <motion.div
                key={film.id}
                layout={!shouldReduceMotion}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  transition: {
                    duration: shouldReduceMotion ? 0 : 0.15,
                    ease: "easeIn",
                  },
                }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 300, damping: 28 }
                }
              >
                <FilmCard
                  film={film}
                  isAuthenticated={Boolean(userId)}
                  onNotInterested={() => void handleRoll()}
                  onGuestHideForSession={handleGuestHideForSession}
                />
              </motion.div>
            ) : effectiveCount === 0 ? (
              <motion.div
                key="zero"
                layout={!shouldReduceMotion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: {
                    duration: shouldReduceMotion ? 0 : 0.15,
                    ease: "easeIn",
                  },
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.2,
                  ease: "easeOut",
                }}
                className="flex flex-col flex-1"
              >
                <ZeroResultsEmpty
                  onClear={resetFilters}
                  onClearAndRoll={() => {
                    resetFilters();
                    setShouldAutoRoll(true);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                layout={!shouldReduceMotion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: {
                    duration: shouldReduceMotion ? 0 : 0.15,
                    ease: "easeIn",
                  },
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.2,
                  ease: "easeOut",
                }}
                className="flex flex-col flex-1"
              >
                <FilmCardEmpty />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <RollHistoryDrawer
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}

function getCountTagline(count: number | null): string {
  if (count === null) return "films in the reel";
  if (count === 1) return "film. You know exactly what you want.";
  if (count <= 5) return "films. Very specific taste.";
  if (count <= 20) return "films. A good shortlist.";
  if (count <= 100) return "films. Ready to roll?";
  return "films. Feeling lucky?";
}

function AnimatedPoolCount({ value }: { value: string }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <span className="font-[family-name:var(--font-geist-mono)] text-[2rem] font-bold leading-none text-[#e8453c]">
        {value}
      </span>
    );
  }

  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      className="inline-flex font-[family-name:var(--font-geist-mono)] text-[2rem] font-bold leading-none text-[#e8453c]"
    >
      <span className="sr-only">{value}</span>
      {[...value].map((char, idx) => (
        <span
          key={idx}
          aria-hidden
          className="relative inline-block overflow-hidden leading-none"
        >
          {/* invisible sizer holds slot width/height while digit animates */}
          <span className="invisible select-none">{char}</span>
          <AnimatePresence mode="sync" initial={false}>
            <motion.span
              key={char}
              initial={{ y: "-110%" }}
              animate={{ y: "0%" }}
              exit={{ y: "110%" }}
              transition={{ duration: 0.28, ease: [0.33, 1, 0.68, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

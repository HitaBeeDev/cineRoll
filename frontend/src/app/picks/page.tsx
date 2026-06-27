"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bookmark, Star, Trophy, Clapperboard, ArrowUpRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { ShareButton } from "@/components/share-button";
import { fetchSeededRandom, type RollFilm } from "@/lib/api";
import { useFilmActions, AUTH_GATE_TITLE } from "@/hooks/useFilmActions";
import { formatRuntime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AwardRecord, FilterState } from "@cineroll/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cineroll.app";

/**
 * One restrained brand accent, used identically on every card (the small index
 * numeral only). The film stills carry all the colour; the chrome stays near
 * monochrome so a single accent keeps its meaning instead of three per-slot
 * colours competing for the eye.
 */
const ACCENT = "#e8453c";

type Slot = {
  num: string;
  label: string;
  icon: React.ReactNode;
  filters: Partial<FilterState>;
};

const PICK_SLOTS: Slot[] = [
  {
    num: "01",
    label: "Award Prestige",
    icon: <Trophy className="h-3.5 w-3.5" aria-hidden />,
    filters: { awardBodies: ["oscar"], winnerOnly: true, imdbRatingMin: 7.5 },
  },
  {
    num: "02",
    label: "World Cinema",
    icon: <Clapperboard className="h-3.5 w-3.5" aria-hidden />,
    filters: { awardBodies: ["cannes"], winnerOnly: true },
  },
  {
    num: "03",
    label: "Hidden Gem",
    icon: <Star className="h-3.5 w-3.5" aria-hidden />,
    // Genuinely obscure, not just well-rated: highly rated, but outside the
    // IMDb Top 250 and with no major award win — acclaimed films that flew
    // under the radar rather than canonical hits.
    filters: { imdbRatingMin: 7.5, imdbTopExclude: true, winsMax: 0 },
  },
];

type DailyPick = { film: RollFilm; slot: Slot };

// How many deterministic seed variants to try per slot while hunting for a
// decade/genre-diverse pick before settling for the seeded first choice.
const SEED_VARIANTS = 3;

const SLOT_FALLBACK_FILTERS: Record<string, Partial<FilterState>[]> = {
  "01": [
    { awardBodies: ["oscar"], winnerOnly: true },
    { awardBodies: ["oscar"] },
    {},
  ],
  "02": [
    { awardBodies: ["cannes"] },
    { awardBodies: ["cannes", "berlin"] },
    {},
  ],
  "03": [
    { imdbRatingMin: 7, imdbTopExclude: true },
    { imdbRatingMin: 7 },
    {},
  ],
};

function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

const AWARD_BODY_LABEL: Record<AwardRecord["awardBody"], string> = {
  oscar: "the Academy Awards",
  goldenglobe: "the Golden Globes",
  cannes: "the Festival de Cannes",
  berlin: "the Berlinale",
};

const FLAGSHIP_CATEGORY =
  /best picture|best motion picture|best film|palme d'?or|grand prix|best director|best foreign/i;

/** The most prestigious win in a set of award records, or null if none won. */
function topWin(records: AwardRecord[]): AwardRecord | null {
  const wins = records.filter((r) => r.won);
  if (wins.length === 0) return null;
  return wins.find((r) => FLAGSHIP_CATEGORY.test(r.category)) ?? wins[0] ?? null;
}

/** First sentence of a synopsis, so the fallback rationale stays one line like
 *  the award-derived ones instead of dumping a full plot paragraph. */
function firstSentence(text: string): string {
  const trimmed = text.trim();
  const end = trimmed.indexOf(". ");
  return end > 40 ? trimmed.slice(0, end + 1) : trimmed;
}

/**
 * One editorial sentence explaining *why* this film earned tonight's slot —
 * built from the film's real award + rating data, so the curation logic is
 * visible rather than the picks looking random. Falls back to the real synopsis
 * when a film carries no headline accolade.
 */
function rationaleFor(film: RollFilm, slot: Slot): string {
  const anyWin =
    topWin(film.oscarCategories) ??
    topWin(film.cannesCategories) ??
    topWin(film.ggCategories);

  if (slot.num === "01") {
    if (anyWin) {
      return `Won ${anyWin.category} at ${AWARD_BODY_LABEL[anyWin.awardBody]}, ${anyWin.awardYear}.`;
    }
    // Detail records may carry only nominations even when the film won — fall
    // back to the win counts so the headline accolade still shows, never a plot.
    const wins = film.oscarWins + film.ggWins + film.cannesWins;
    if (wins > 0) return `${wins} major award win${wins > 1 ? "s" : ""}, including the Academy Awards.`;
  }
  if (slot.num === "02") {
    const cannes = topWin(film.cannesCategories);
    if (cannes) return `${cannes.category} at ${AWARD_BODY_LABEL.cannes}, ${cannes.awardYear}.`;
    if (anyWin) return `An international standout — ${anyWin.category}, ${anyWin.awardYear}.`;
  }
  if (slot.num === "03" && film.imdbRating != null) {
    return `Rated ${film.imdbRating.toFixed(1)} on IMDb yet outside the Top 250 — acclaim the canon overlooked.`;
  }
  if (film.plot) return firstSentence(film.plot);
  return `Tonight's ${slot.label.toLowerCase()} pick.`;
}

/**
 * Resolve one slot's film. `excludeIds` (the films already chosen) guarantees no
 * duplicate across slots, so the first successful fetch is always a valid
 * fallback. Beyond that we try a few deterministic seed variants — each
 * excluding the candidates already seen so they differ — and return the first
 * whose decade and primary genre aren't already represented. If the curated
 * pool can't offer a diverse one, we keep the seeded first choice.
 */
async function selectPick(
  slot: Slot,
  day: string,
  usedIds: string[],
  usedDecades: Set<number>,
  usedGenres: Set<string>,
): Promise<DailyPick | null> {
  let fallback: DailyPick | null = null;
  const seen: string[] = [];

  for (let v = 0; v < SEED_VARIANTS; v++) {
    const seed = v === 0 ? `${day}:${slot.num}` : `${day}:${slot.num}:v${v}`;
    let film: RollFilm;
    try {
      ({ film } = await fetchSeededRandom(seed, slot.filters, [...usedIds, ...seen]));
    } catch {
      // Pool exhausted for this slot (or a transient error) — try the next seed.
      continue;
    }

    const pick: DailyPick = { film, slot };
    if (!fallback) fallback = pick;
    seen.push(film.id);

    const genre = film.genres[0];
    const decadeClash = usedDecades.has(decadeOf(film.year));
    const genreClash = genre != null && usedGenres.has(genre);
    if (!decadeClash && !genreClash) return pick;
  }

  if (fallback) return fallback;

  const relaxedFilters = SLOT_FALLBACK_FILTERS[slot.num] ?? [{}];
  for (let i = 0; i < relaxedFilters.length; i++) {
    const seed = `${day}:${slot.num}:fallback${i}`;
    try {
      const { film } = await fetchSeededRandom(seed, relaxedFilters[i], usedIds);
      return { film, slot };
    } catch {
      continue;
    }
  }

  return null;
}

export default function PicksPage() {
  const shouldReduceMotion = useReducedMotion();
  const [picks, setPicks] = useState<DailyPick[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPicks = useCallback(async () => {
    // UTC day, matching the backend's pick-of-day convention. The selection is
    // deterministic from this key, so every visitor sees the same three films
    // today and they roll over together at UTC midnight.
    const day = new Date().toISOString().split("T")[0] ?? "";
    const key = `cinepicks-${day}`;

    // Same-day revisits restore instantly. Because selection is now
    // deterministic per day, this cache can never disagree with a fresh
    // fetch — it only saves the round-trips and the loader flash.
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached) as Array<{ film: RollFilm; slot: { num: string } }>;
        const restored = parsed
          .map(({ film, slot }) => {
            const fullSlot = PICK_SLOTS.find((s) => s.num === slot.num);
            return fullSlot ? { film, slot: fullSlot } : null;
          })
          .filter((p): p is DailyPick => p !== null);
        const restoredSlots = new Set(restored.map((pick) => pick.slot.num));
        const hasEverySlot = PICK_SLOTS.every((slot) => restoredSlots.has(slot.num));
        if (restored.length === PICK_SLOTS.length && hasEverySlot) {
          setPicks(restored);
          setIsLoading(false);
          return;
        }
        localStorage.removeItem(key);
      }
    } catch {}

    // Pick slots in order, each excluding the films already chosen so the same
    // title can never fill two slots. The per-day+slot seed keeps each choice
    // deterministic; the diversity nudge inside selectPick spreads the picks
    // across decades and genres where the curated pools allow it.
    const newPicks: DailyPick[] = [];
    const usedIds: string[] = [];
    const usedDecades = new Set<number>();
    const usedGenres = new Set<string>();
    for (const slot of PICK_SLOTS) {
      const pick = await selectPick(slot, day, usedIds, usedDecades, usedGenres);
      if (!pick) continue;
      newPicks.push(pick);
      usedIds.push(pick.film.id);
      usedDecades.add(decadeOf(pick.film.year));
      const primaryGenre = pick.film.genres[0];
      if (primaryGenre) usedGenres.add(primaryGenre);
    }
    try {
      localStorage.setItem(key, JSON.stringify(newPicks));
    } catch {}
    setPicks(newPicks);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void loadPicks(), 0);
    return () => window.clearTimeout(id);
  }, [loadPicks]);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />

      <main>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.15, ease: "easeIn" } }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
              className="flex min-h-[60vh] items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-[3px] w-8 rounded-full bg-white/30"
                      animate={shouldReduceMotion ? {} : { opacity: [0.15, 0.7, 0.15] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                    />
                  ))}
                </div>
                <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#7a7a90]">
                  Curating today&apos;s selection
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="picks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.15, ease: "easeIn" } }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
            >
              {/* Three equal full-bleed editorial blocks — peers, not a hero
                  plus leftovers. Identical structure, identical metadata, one
                  restrained CTA each, so the eye reads them as a curated set. */}
              {picks.map((pick, i) => (
                <PickCard key={pick.film.id} pick={pick} index={i} dateLabel={dateLabel} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/**
 * Per-card quick actions: a real watchlist toggle (with the shared auth gate
 * for guests) and a working share button — wired to the same infrastructure as
 * the film detail page, not placeholder buttons.
 */
function PickActions({ film }: { film: RollFilm }) {
  const { status } = useSession();
  const pathname = usePathname();
  const {
    inWatchlist,
    watchlistPending,
    toggleWatchlist,
    authPrompt,
    closeAuthPrompt,
  } = useFilmActions({
    filmId: film.id,
    filmTitle: film.title,
    isAuthenticated: status === "authenticated",
    source: "daily_pick",
  });

  return (
    <>
      <button
        type="button"
        aria-pressed={inWatchlist}
        aria-label={inWatchlist ? "Saved to watchlist" : "Add to watchlist"}
        disabled={watchlistPending}
        onClick={() => void toggleWatchlist()}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          inWatchlist
            ? "border-white/30 bg-white/15 text-[#F5F5F0]"
            : "border-white/20 text-[#cfcfdc] hover:border-white/40 hover:text-[#F5F5F0]",
        )}
      >
        <Bookmark className="h-4 w-4" fill={inWatchlist ? "currentColor" : "none"} aria-hidden />
      </button>

      <ShareButton
        url={`${SITE_URL}/film/${film.slug}`}
        title={`Watch ${film.title} tonight — CineRoll picked it`}
        label=""
        ariaLabel="Share this pick"
        iconClassName="h-4 w-4"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-[#cfcfdc] transition-colors hover:border-white/40 hover:text-[#F5F5F0]"
      />

      <AuthDialog
        open={authPrompt !== null}
        onOpenChange={(open) => {
          if (!open) closeAuthPrompt();
        }}
        callbackUrl={pathname}
        title={authPrompt ? AUTH_GATE_TITLE[authPrompt] : undefined}
      />
    </>
  );
}

function PickCard({
  pick,
  index,
  dateLabel,
}: {
  pick: DailyPick;
  index: number;
  dateLabel: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { film, slot } = pick;
  const imageUrl = film.backdropUrl ?? film.posterUrl;
  const runtime = formatRuntime(film.runtime);
  const genre = film.genres[0];

  // One deterministic metadata row, identical on every card: year, runtime,
  // genre, then the two critic scores. Absent values are omitted (never shown
  // as placeholders) but the order never changes.
  const meta: string[] = [String(film.year)];
  if (runtime) meta.push(runtime);
  if (genre) meta.push(genre);

  return (
    <motion.article
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
      }
      className="group relative flex min-h-[100svh] items-end overflow-hidden"
    >
      {/* Backdrop */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={film.title}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
          priority={index === 0}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#09090f]" />
      )}

      {/* Legibility scrims — a soft full wash plus a guaranteed dark floor and a
          left-side gradient so the text column stays readable over ANY still,
          bright ones included, rather than hoping the image is dark. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/35 to-[#09090f]/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#09090f]/85 via-[#09090f]/30 to-transparent" />

      {/* Page context lives on the first film instead of a separate header bar,
          so you land on one full-bleed pick — the MUBI "one thing today" feel —
          and scroll through the set. */}
      {index === 0 && (
        <div className="absolute left-6 right-6 top-20 z-10 mx-auto flex max-w-screen-xl items-center gap-4 sm:left-10 sm:right-10 sm:top-24">
          <div className="flex flex-col gap-[3px]" aria-hidden>
            <div className="h-[2px] w-6" style={{ backgroundColor: ACCENT }} />
            <div className="h-[2px] w-3.5" style={{ backgroundColor: `${ACCENT}59` }} />
          </div>
          <h1
            className="font-[family-name:var(--font-geist-mono)] text-[11px] font-normal uppercase tracking-[0.35em]"
            style={{ color: ACCENT }}
          >
            Tonight&apos;s Picks
          </h1>
          <div className="hidden h-4 w-px bg-white/20 sm:block" />
          <p className="hidden font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#9a9aae] sm:block">
            {dateLabel}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-screen-xl px-6 pb-20 pt-24 sm:px-10 sm:pb-28">
        <div className="max-w-2xl">
          {/* Single-axis kicker: the curation category, plus the small brand
              numeral — the only accent colour on the card. */}
          <div className="mb-4 flex items-center gap-2.5">
            <span
              className="font-[family-name:var(--font-display)] text-base font-black leading-none"
              style={{ color: ACCENT }}
            >
              {slot.num}
            </span>
            <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#d4d4e0]">
              {slot.icon}
              {slot.label}
            </span>
          </div>

          <h2
            className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.04] text-[#F5F5F0] sm:text-6xl"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
          >
            {film.title}
          </h2>

          {/* Metadata row — identical structure on all three cards */}
          <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-wider text-[#a6a6ba]">
            {meta.map((m, i) => (
              <span key={m} className="flex items-center gap-2.5">
                {i > 0 && <span className="text-white/20" aria-hidden>·</span>}
                {m}
              </span>
            ))}
            {film.imdbRating != null && (
              <span className="flex items-center gap-2.5 text-[#d4d4e0]">
                <span className="text-white/20" aria-hidden>·</span>★ {film.imdbRating.toFixed(1)}
              </span>
            )}
            {film.rtScore != null && (
              <span className="flex items-center gap-2.5 text-[#d4d4e0]">
                <span className="text-white/20" aria-hidden>·</span>RT {film.rtScore}%
              </span>
            )}
          </div>

          {film.director && (
            <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-wider text-[#8a8a9e]">
              Dir. {film.director}
            </p>
          )}

          {/* The "why" — curation rationale built from real award/rating data */}
          <p className="mt-5 line-clamp-2 max-w-xl font-[family-name:var(--font-display)] text-lg leading-relaxed text-[#cfcfdc] sm:text-xl">
            {rationaleFor(film, slot)}
          </p>

          {/* One restrained CTA, identical on every card */}
          <div className="mt-7 flex items-center gap-2.5">
            <Link
              href={`/film/${film.slug}`}
              className="group/btn inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] backdrop-blur-sm transition-colors duration-150 hover:border-white/50 hover:bg-white/[0.1]"
            >
              <span>Watch Tonight</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </Link>
            <PickActions film={film} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

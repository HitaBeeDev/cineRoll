"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { RefreshCw, Share2, Trophy, Clapperboard } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { fetchRandom, type RollFilm } from "@/lib/api";
import { buildBattleCluster } from "@/lib/roll-battle-matchmaking";

const TOTAL_ROUNDS = 5;
// King-of-the-hill needs one seed plus one challenger per round.
const BATTLE_SET_SIZE = TOTAL_ROUNDS + 1;
// Over-fetch so matchmaking has room to pick a comparable cluster rather than
// being forced to use whatever random films turned up.
const CANDIDATE_POOL_SIZE = 18;

type Phase = "loading" | "battling" | "result" | "error";

async function fetchBattlePool(): Promise<RollFilm[]> {
  const results = await Promise.all(
    Array.from({ length: CANDIDATE_POOL_SIZE }, () => fetchRandom()),
  );
  const candidates = results.map((r) => r.film);
  return buildBattleCluster(candidates, BATTLE_SET_SIZE);
}

function formatRuntime(runtime: number | null): string {
  if (!runtime) return "";
  const h = Math.floor(runtime / 60);
  const m = runtime % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatAwardSummary(film: RollFilm): string {
  const nominations =
    film.oscarNominations + film.ggNominations + film.cannesNominations;
  const wins = film.oscarWins + film.ggWins + film.cannesWins;
  if (wins > 0 && nominations > 0)
    return `${wins} wins · ${nominations} nominations`;
  if (wins > 0) return wins === 1 ? "1 win" : `${wins} wins`;
  if (nominations > 0)
    return nominations === 1 ? "1 nomination" : `${nominations} nominations`;
  return "No major award records";
}

function awardWinCount(film: RollFilm): number {
  return film.oscarWins + film.ggWins + film.cannesWins;
}

function primaryGenre(film: RollFilm): string {
  return film.genres[0] ?? "archive";
}

function decadeLabel(film: RollFilm): string | null {
  const year = Number(film.releaseYear ?? film.year);
  if (!Number.isFinite(year)) return null;
  return `${Math.floor(year / 10) * 10}s`;
}

function buildMatchupContext(left: RollFilm, right: RollFilm): string {
  const leftGenre = primaryGenre(left);
  const rightGenre = primaryGenre(right);
  const leftDecade = decadeLabel(left);
  const rightDecade = decadeLabel(right);
  const leftIsDoc = left.genres.some((g) => g.toLowerCase() === "documentary");
  const rightIsDoc = right.genres.some((g) => g.toLowerCase() === "documentary");
  const leftRating = left.imdbRating;
  const rightRating = right.imdbRating;
  const runtimeGap =
    left.runtime != null && right.runtime != null
      ? Math.abs(left.runtime - right.runtime)
      : 0;

  if (leftGenre === rightGenre && leftGenre !== "archive") {
    return `${leftGenre} duel`;
  }

  if (leftIsDoc !== rightIsDoc) {
    return leftIsDoc ? "Documentary vs fiction" : "Fiction vs documentary";
  }

  if (leftDecade && rightDecade && leftDecade !== rightDecade) {
    return `${leftDecade} ${leftGenre.toLowerCase()} vs ${rightDecade} ${rightGenre.toLowerCase()}`;
  }

  if (runtimeGap >= 120) {
    return "Short watch vs marathon commitment";
  }

  if (
    leftRating != null &&
    rightRating != null &&
    Math.abs(leftRating - rightRating) >= 1
  ) {
    return "Archive underdog vs critical heavyweight";
  }

  return `${leftGenre} vs ${rightGenre}`;
}

function buildTasteSummary(picks: RollFilm[]): string {
  if (picks.length === 0) return "";

  const genreCounts = new Map<string, number>();
  const decadeCounts = new Map<string, number>();
  let longRuntime = 0;
  let highRated = 0;
  let awardWinners = 0;

  for (const film of picks) {
    const genre = primaryGenre(film);
    if (genre !== "archive") {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    }

    const decade = decadeLabel(film);
    if (decade) decadeCounts.set(decade, (decadeCounts.get(decade) ?? 0) + 1);

    if ((film.runtime ?? 0) >= 150) longRuntime += 1;
    if ((film.imdbRating ?? 0) >= 8) highRated += 1;
    if (awardWinCount(film) > 0) awardWinners += 1;
  }

  const topEntry = (counts: Map<string, number>): string | null => {
    const [entry] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return entry?.[0] ?? null;
  };

  const signals = [
    topEntry(genreCounts)?.toLowerCase(),
    topEntry(decadeCounts),
    highRated >= 3 ? "high-rated picks" : null,
    longRuntime >= 3 ? "long-form cinema" : null,
    awardWinners >= 3 ? "award winners" : null,
  ].filter(Boolean);

  if (signals.length === 0) {
    return "Your taste stayed balanced across the bracket.";
  }

  return `Your taste leaned toward ${signals.slice(0, 3).join(", ")}.`;
}

function nextBoutLabel(round: number, films: RollFilm[]): string {
  const next = films[round + 2];
  if (!next) return "Final decision";
  return `Next: ${primaryGenre(next).toLowerCase()} challenger`;
}

interface FilmCardProps {
  film: RollFilm;
  onPick: () => void;
  isPicked: boolean;
  isRejected: boolean;
  side: "left" | "right";
  reduced: boolean;
}

function FilmBattleCard({
  film,
  onPick,
  isPicked,
  isRejected,
  side,
  reduced,
}: FilmCardProps) {
  const genre = film.genres[0] ?? "";
  const runtime = formatRuntime(film.runtime);
  const imageUrl = film.posterUrl ?? film.backdropUrl;
  const totalWins = awardWinCount(film);

  return (
    <motion.button
      onClick={onPick}
      disabled={isPicked || isRejected}
      initial={reduced ? false : { opacity: 0, x: side === "left" ? -20 : 20 }}
      animate={{
        opacity: isRejected ? 0 : 1,
        x: isRejected
          ? side === "left"
            ? -360
            : 360
          : isPicked
            ? side === "left"
              ? 34
              : -34
            : 0,
        y: isPicked ? -12 : 0,
        rotate: isRejected
          ? side === "left"
            ? -8
            : 8
          : isPicked
            ? side === "left"
              ? 2
              : -2
            : 0,
        scale: isPicked ? 1.04 : isRejected ? 0.94 : 1,
      }}
      {...(!isPicked && !isRejected && !reduced
        ? { whileHover: { scale: 1.01 } }
        : {})}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="group relative flex h-full w-full will-change-transform flex-col overflow-hidden rounded-2xl border border-[#1e1e2a] bg-[#0d0d1a] text-left shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-default enabled:hover:border-[#e8453c]/55 enabled:hover:shadow-[0_0_34px_rgba(232,69,60,0.16)]"
      aria-label={`Pick ${film.title}`}
    >
      {/* Poster */}
      <div className="relative h-[min(46dvh,390px)] w-full overflow-hidden bg-[#07070d]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={film.title}
            fill
            sizes="(max-width: 768px) 45vw, 300px"
            className="object-cover transition duration-300 group-hover:brightness-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a28]">
            <Clapperboard className="h-10 w-10 text-[#2a2a3e]" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/80 via-transparent to-transparent" />

        {/* Winner overlay */}
        {isPicked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-[#e8453c]/15 ring-2 ring-inset ring-[#e8453c]/50"
          >
            <div className="rounded-full bg-[#e8453c] p-3 shadow-[0_0_20px_rgba(232,69,60,0.5)]">
              <Trophy className="h-5 w-5 text-[#F5F5F0]" />
            </div>
          </motion.div>
        )}

        {/* Award wins badge */}
        <div
          className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest ${
            totalWins > 0
              ? "border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37]"
              : "border-[#F5F5F0]/10 bg-[#09090f]/45 text-[#F5F5F0]/45"
          }`}
        >
          {totalWins === 1 ? "1 Win" : `${totalWins} Wins`}
        </div>

        {/* IMDb rating */}
        <div className="absolute bottom-2 right-2 rounded-md border border-[#F5F5F0]/10 bg-[#09090f]/80 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] backdrop-blur-sm">
          {film.imdbRating != null ? (
            <span className="text-[#F5F5F0]/70">★ {film.imdbRating.toFixed(1)}</span>
          ) : (
            <span className="text-[#F5F5F0]/30">No IMDb</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 px-3 py-2.5">
        <p className="truncate font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b6b6c8]">
          {film.year}
          {genre ? ` · ${genre}` : ""}
          {runtime ? ` · ${runtime}` : ""}
        </p>
        <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-sm font-bold leading-tight text-[#F5F5F0] sm:text-base">
          {film.title}
        </h3>
        {film.director && (
          <p className="truncate font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.1em] text-[#77778a]">
            Dir. {film.director}
          </p>
        )}
      </div>

      {/* Pick CTA */}
      <div className="px-3 pb-2.5">
        <div className="w-full rounded-xl border border-[#e8453c]/30 bg-[#e8453c]/10 py-2 text-center font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#e8453c] transition-all group-hover:border-[#e8453c]/70 group-hover:bg-[#e8453c]/20 group-hover:text-[#ff635a]">
          Advance This Film
        </div>
      </div>
    </motion.button>
  );
}

export default function RollBattlePage() {
  const reduced = useReducedMotion() ?? false;

  const [films, setFilms] = useState<RollFilm[]>([]);
  const [round, setRound] = useState(0);
  const [champion, setChampion] = useState<RollFilm | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [pickedFilms, setPickedFilms] = useState<RollFilm[]>([]);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  const loadFilms = useCallback(async () => {
    setPhase("loading");
    setRound(0);
    setChampion(null);
    setPickedId(null);
    setPickedFilms([]);
    setShareStatus("idle");
    try {
      const pool = await fetchBattlePool();
      setFilms(pool);
      setPhase("battling");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchBattlePool()
      .then((pool) => {
        if (ignore) return;
        setFilms(pool);
        setPhase("battling");
      })
      .catch(() => {
        if (!ignore) setPhase("error");
      });

    return () => {
      ignore = true;
    };
  }, []);

  const leftFilm: RollFilm | null = round === 0 ? (films[0] ?? null) : champion;
  const rightFilm: RollFilm | null = films[round + 1] ?? null;
  const selectedFilm =
    pickedId != null
      ? leftFilm?.id === pickedId
        ? leftFilm
        : rightFilm?.id === pickedId
          ? rightFilm
          : null
      : null;

  function handlePick(film: RollFilm) {
    if (pickedId !== null) return;
    setPickedId(film.id);
    setPickedFilms((current) => [...current, film]);
    const delay = reduced ? 0 : 650;
    setTimeout(() => {
      if (round < TOTAL_ROUNDS - 1) {
        setChampion(film);
        setRound((r) => r + 1);
        setPickedId(null);
      } else {
        setChampion(film);
        setPhase("result");
      }
    }, delay);
  }

  async function handleShare(film: RollFilm) {
    const shareUrl = new URL("/roll-battle/result", window.location.origin);
    shareUrl.searchParams.set("film", film.slug);
    const text = `🎬 Roll Battle picked "${film.title}" (${film.year}) as my film tonight! Try it on CineRoll: ${shareUrl.toString()}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Roll Battle Result",
          text,
          url: shareUrl.toString(),
        });
      } else {
        await navigator.clipboard.writeText(shareUrl.toString());
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 2000);
      }
    } catch {
      // user cancelled or clipboard blocked — no-op
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#09090f]">
      <AppHeader />

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-4 sm:px-6">
        {/* Loading */}
        {phase === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#e8453c]/30 border-t-[#e8453c]" />
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#555568]">
              Loading battle…
            </p>
          </div>
        )}

        {/* Error */}
        {phase === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <p className="font-[family-name:var(--font-geist-mono)] text-sm text-[#888899]">
              Couldn&apos;t load films. Please try again.
            </p>
            <button
              type="button"
              onClick={() => void loadFilms()}
              className="flex items-center gap-2 rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* Battle */}
        {phase === "battling" && leftFilm != null && rightFilm != null && (
          <div className="grid w-full max-w-5xl grid-cols-1 items-start gap-4 lg:grid-cols-[160px_minmax(0,672px)_160px]">
            <aside className="hidden pt-32 lg:block">
              <div className="border-l border-[#1e1e2a] pl-4">
                <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.24em] text-[#555568]">
                  {round === 0 ? "Opening Bout" : "Current Champion"}
                </p>
                <p className="mt-2 line-clamp-2 font-[family-name:var(--font-display)] text-base font-bold leading-tight text-[#F5F5F0]/80">
                  {round === 0 ? "No champion yet" : leftFilm.title}
                </p>
                <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#77778a]">
                  {round === 0
                    ? "First pick sets the bracket"
                    : `Advanced from round ${round}`}
                </p>
              </div>
            </aside>

            <div className="flex w-full flex-col gap-3">
            {/* Title + progress */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.35em] text-[#555568]">
                Roll Battle
              </span>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0] sm:text-3xl">
                Which film wins tonight?
              </h1>
              <p className="max-w-md text-sm leading-5 text-[#F5F5F0]/62">
                Pick the film you would save for tonight&apos;s screening. Five rounds decide your winner.
              </p>
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[#D4AF37]/80">
                {buildMatchupContext(leftFilm, rightFilm)}
              </p>
              <div className="flex items-center gap-1.5 pt-0.5">
                {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i < round
                        ? "w-5 bg-[#e8453c]"
                        : i === round
                          ? "w-5 bg-[#e8453c]/50"
                          : "w-3 bg-[#1e1e2a]"
                    }`}
                  />
                ))}
              </div>
              <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#555568]">
                Round {round + 1} of {TOTAL_ROUNDS}
              </p>
              <AnimatePresence mode="wait">
                {selectedFilm && (
                  <motion.p
                    key={selectedFilm.id}
                    initial={reduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? {} : { opacity: 0, y: -6 }}
                    className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#e8453c]"
                  >
                    {selectedFilm.title} advances.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Cards */}
            <AnimatePresence mode="wait">
              <motion.div
                key={round}
                initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                {...(reduced
                  ? {}
                  : { exit: { opacity: 0, y: -16, scale: 0.98 } })}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="mt-1 grid grid-cols-[1fr_36px_1fr] items-stretch gap-1.5 sm:mt-2 sm:gap-3"
              >
                <FilmBattleCard
                  film={leftFilm}
                  onPick={() => handlePick(leftFilm)}
                  isPicked={pickedId === leftFilm.id}
                  isRejected={pickedId !== null && pickedId !== leftFilm.id}
                  side="left"
                  reduced={reduced}
                />

                {/* VS divider */}
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e8453c]/55 bg-[#120d12] font-[family-name:var(--font-geist-mono)] text-[12px] font-bold uppercase tracking-widest text-[#ff635a] shadow-[0_0_32px_rgba(232,69,60,0.26)] ring-4 ring-[#e8453c]/5">
                    vs
                  </div>
                </div>

                <FilmBattleCard
                  film={rightFilm}
                  onPick={() => handlePick(rightFilm)}
                  isPicked={pickedId === rightFilm.id}
                  isRejected={pickedId !== null && pickedId !== rightFilm.id}
                  side="right"
                  reduced={reduced}
                />
              </motion.div>
            </AnimatePresence>
            </div>

            <aside className="hidden pt-32 lg:block">
              <div className="border-r border-[#1e1e2a] pr-4 text-right">
                <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.24em] text-[#555568]">
                  Bracket
                </p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-base font-bold leading-tight text-[#F5F5F0]/80">
                  {round === 0
                    ? `${TOTAL_ROUNDS} rounds total`
                    : `${TOTAL_ROUNDS - round} fights left`}
                </p>
                <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#77778a]">
                  {nextBoutLabel(round, films)}
                </p>
              </div>
            </aside>
          </div>
        )}

        {/* Result */}
        {phase === "result" && champion != null && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="flex w-full max-w-3xl flex-col gap-6"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.35em] text-[#D4AF37]">
                  Tonight&apos;s Film
                </span>
                <Trophy className="h-4 w-4 shrink-0 text-[#D4AF37]" />
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#F5F5F0] sm:text-4xl">
                {champion.title}
              </h1>
              <p className="max-w-md text-sm leading-6 text-[#F5F5F0]/62">
                Your winner tonight. {buildTasteSummary(pickedFilms)}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-[220px_1fr] sm:items-start">
              {(() => {
                const img = champion.posterUrl ?? champion.backdropUrl;
                return (
                  <div
                    className="relative mx-auto w-48 overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] shadow-[0_0_40px_rgba(212,175,55,0.10)] sm:w-full"
                    style={{ aspectRatio: "2/3" }}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={champion.title}
                        fill
                        sizes="(max-width: 640px) 192px, 220px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Clapperboard className="h-12 w-12 text-[#2a2a3e]" />
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#F5F5F0]/70">
                    {champion.year}
                  </span>
                  {formatRuntime(champion.runtime) && (
                    <span className="rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#F5F5F0]/70">
                      {formatRuntime(champion.runtime)}
                    </span>
                  )}
                  {champion.imdbRating != null ? (
                    <span className="rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#F5F5F0]/70">
                      IMDb {champion.imdbRating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#F5F5F0]/30">
                      No IMDb Score
                    </span>
                  )}
                  {champion.rtScore != null ? (
                    <span className="rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#F5F5F0]/70">
                      RT {champion.rtScore}%
                    </span>
                  ) : (
                    <span className="rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#F5F5F0]/30">
                      No RT Score
                    </span>
                  )}
                </div>

                {champion.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {champion.genres.slice(0, 4).map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full border border-[#e8453c]/25 bg-[#e8453c]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#e8453c]"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  {champion.director && (
                    <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#555568]">
                      Directed by{" "}
                      <span className="text-[#F5F5F0]/70">
                        {champion.director}
                      </span>
                    </p>
                  )}
                  <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#D4AF37]">
                    {formatAwardSummary(champion)}
                  </p>
                </div>

                {champion.plot && (
                  <p className="text-sm leading-6 text-[#F5F5F0]/65 sm:text-base sm:leading-7">
                    {champion.plot}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex w-full flex-col gap-3">
              <Link
                href={`/film/${champion.slug}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8453c] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
              >
                Watch This Tonight
              </Link>
              <button
                type="button"
                onClick={() => void handleShare(champion)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:border-[#2a2a3e]"
              >
                <Share2 className="h-3.5 w-3.5" />
                {shareStatus === "copied" ? "Copied!" : "Share My Winner"}
              </button>
              <button
                type="button"
                onClick={() => void loadFilms()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1a1a28] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#555568] transition-colors hover:text-[#888899]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

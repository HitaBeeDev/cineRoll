"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { RefreshCw, Share2, Trophy, Clapperboard } from "lucide-react";
import { SiteNavigation } from "@/components/site-navigation";
import { fetchRandom, type RollFilm } from "@/lib/api";

const TOTAL_ROUNDS = 5;
const POOL_SIZE = TOTAL_ROUNDS * 2;

type Phase = "loading" | "battling" | "result" | "error";

async function fetchBattlePool(): Promise<RollFilm[]> {
  const results = await Promise.all(
    Array.from({ length: POOL_SIZE }, () => fetchRandom()),
  );
  return results.map((r) => r.film);
}

function formatRuntime(runtime: number | null): string {
  if (!runtime) return "";
  const h = Math.floor(runtime / 60);
  const m = runtime % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface FilmCardProps {
  film: RollFilm;
  onPick: () => void;
  isPicked: boolean;
  isRejected: boolean;
  side: "left" | "right";
  reduced: boolean;
}

function FilmBattleCard({ film, onPick, isPicked, isRejected, side, reduced }: FilmCardProps) {
  const genre = film.genres[0] ?? "";
  const runtime = formatRuntime(film.runtime);
  const imageUrl = film.posterUrl ?? film.backdropUrl;
  const totalWins = film.oscarWins + film.ggWins + film.cannesWins;

  return (
    <motion.button
      onClick={onPick}
      disabled={isPicked || isRejected}
      initial={reduced ? false : { opacity: 0, x: side === "left" ? -20 : 20 }}
      animate={{
        opacity: isRejected ? 0.18 : 1,
        x: 0,
        scale: isPicked ? 1.02 : isRejected ? 0.97 : 1,
      }}
      {...(!isPicked && !isRejected && !reduced ? { whileHover: { scale: 1.01 } } : {})}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-[#1e1e2a] bg-[#0d0d1a] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-default"
      aria-label={`Pick ${film.title}`}
    >
      {/* Poster */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "2/3" }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={film.title}
            fill
            sizes="(max-width: 768px) 45vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
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
        {totalWins > 0 && (
          <div className="absolute left-2 top-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#D4AF37]">
            {totalWins === 1 ? "1 Win" : `${totalWins} Wins`}
          </div>
        )}

        {/* IMDb rating */}
        {film.imdbRating != null && (
          <div className="absolute bottom-2 right-2 rounded-md border border-[#F5F5F0]/10 bg-[#09090f]/80 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[8px] text-[#F5F5F0]/70 backdrop-blur-sm">
            ★ {film.imdbRating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        <p className="truncate font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.15em] text-[#555568]">
          {film.year}
          {genre ? ` · ${genre}` : ""}
          {runtime ? ` · ${runtime}` : ""}
        </p>
        <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-sm font-bold leading-tight text-[#F5F5F0] sm:text-base">
          {film.title}
        </h3>
        {film.director && (
          <p className="truncate font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.1em] text-[#555568]">
            Dir. {film.director}
          </p>
        )}
      </div>

      {/* Pick CTA */}
      <div className="px-3 pb-3">
        <div className="w-full rounded-xl border border-[#e8453c]/30 bg-[#e8453c]/10 py-2 text-center font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.2em] text-[#e8453c] transition-all group-hover:border-[#e8453c]/60 group-hover:bg-[#e8453c]/20">
          Pick This
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
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  const loadFilms = useCallback(async () => {
    setPhase("loading");
    setRound(0);
    setChampion(null);
    setPickedId(null);
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

  const leftFilm: RollFilm | null = films[round * 2] ?? null;
  const rightFilm: RollFilm | null = films[round * 2 + 1] ?? null;

  function handlePick(film: RollFilm) {
    if (pickedId !== null) return;
    setPickedId(film.id);
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
    const text = `🎬 Roll Battle picked "${film.title}" (${film.year}) as my film tonight! Try it on CineRoll.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Roll Battle Result", text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 2000);
      }
    } catch {
      // user cancelled or clipboard blocked — no-op
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#09090f]">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#1a1a28] bg-[#09090f]/90 px-5 py-3.5 backdrop-blur-sm sm:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-geist-mono)] text-sm font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:text-[#e8453c]"
        >
          Cine<span className="text-[#e8453c]">Roll</span>
        </Link>
        <SiteNavigation />
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
        {/* Loading */}
        {phase === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#e8453c]/30 border-t-[#e8453c]" />
            <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
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
          <div className="flex w-full max-w-2xl flex-col gap-5">
            {/* Title + progress */}
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#555568]">
                Roll Battle
              </span>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0] sm:text-3xl">
                Which film wins tonight?
              </h1>
              <div className="flex items-center gap-1.5 pt-1">
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
              <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
                Round {round + 1} of {TOTAL_ROUNDS}
              </p>
            </div>

            {/* Cards */}
            <AnimatePresence mode="wait">
              <motion.div
                key={round}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                {...(reduced ? {} : { exit: { opacity: 0 } })}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-[1fr_28px_1fr] items-start gap-1.5 sm:gap-3"
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
                <div className="flex h-full flex-col items-center justify-start pt-24 sm:pt-28">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e8453c]/25 bg-[#09090f] font-[family-name:var(--font-geist-mono)] text-[7px] font-bold uppercase tracking-widest text-[#e8453c]">
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
        )}

        {/* Result */}
        {phase === "result" && champion != null && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="flex w-full max-w-sm flex-col items-center gap-6 text-center"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#D4AF37]" />
                <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#D4AF37]">
                  Tonight&apos;s Film
                </span>
                <Trophy className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#F5F5F0] sm:text-4xl">
                {champion.title}
              </h1>
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-[#555568]">
                {champion.year}
                {champion.director ? ` · Dir. ${champion.director}` : ""}
              </p>
              {champion.imdbRating != null && (
                <p className="font-[family-name:var(--font-geist-mono)] text-sm text-[#F5F5F0]/50">
                  ★ IMDb {champion.imdbRating.toFixed(1)}
                </p>
              )}
            </div>

            {/* Poster */}
            {(() => {
              const img = champion.posterUrl ?? champion.backdropUrl;
              return img ? (
                <div
                  className="relative w-44 overflow-hidden rounded-xl border border-[#1e1e2a] shadow-[0_0_40px_rgba(212,175,55,0.10)]"
                  style={{ aspectRatio: "2/3" }}
                >
                  <Image src={img} alt={champion.title} fill sizes="176px" className="object-cover" />
                </div>
              ) : null;
            })()}

            {/* Actions */}
            <div className="flex w-full flex-col gap-3">
              <Link
                href={`/film/${champion.slug}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8453c] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
              >
                View Film Details
              </Link>
              <button
                type="button"
                onClick={() => void handleShare(champion)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:border-[#2a2a3e]"
              >
                <Share2 className="h-3.5 w-3.5" />
                {shareStatus === "copied" ? "Copied!" : "Share Result"}
              </button>
              <button
                type="button"
                onClick={() => void loadFilms()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1a1a28] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#555568] transition-colors hover:text-[#888899]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

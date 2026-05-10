"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Clapperboard, Eye, RefreshCw, Sparkles, Star, Trophy, XCircle } from "lucide-react";
import type { AwardRecord } from "@cineroll/types";
import { AppHeader } from "@/components/app-header";
import { fetchRandom, type RollFilm } from "@/lib/api";

type Phase = "loading" | "ready" | "revealed" | "error";
type BlindRound = { film: RollFilm; options: RollFilm[] };

async function fetchBlindFilm(): Promise<RollFilm> {
  const result = await fetchRandom();
  return result.film;
}

function shuffleFilms(films: RollFilm[]): RollFilm[] {
  return [...films].sort(() => Math.random() - 0.5);
}

async function fetchBlindRound(): Promise<BlindRound> {
  const films: RollFilm[] = [];
  const seen = new Set<string>();

  while (films.length < 4) {
    const nextFilm = await fetchBlindFilm();
    if (seen.has(nextFilm.id)) continue;
    seen.add(nextFilm.id);
    films.push(nextFilm);
  }

  const film = films[0];
  if (!film) throw new Error("No blind roll film found");

  return {
    film,
    options: shuffleFilms(films),
  };
}

function getAwards(film: RollFilm): AwardRecord[] {
  return [...film.oscarCategories, ...film.ggCategories, ...film.cannesCategories]
    .sort((a, b) => a.awardYear - b.awardYear || a.category.localeCompare(b.category));
}

function formatAwardBody(body: AwardRecord["awardBody"]): string {
  if (body === "oscar") return "Oscar";
  if (body === "goldenglobe") return "Golden Globe";
  return "Cannes";
}

function getDecade(year: number): string {
  return `${Math.floor(year / 10) * 10}s`;
}

function formatRuntime(runtime: number | null): string {
  if (!runtime) return "Unknown";
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export default function BlindRollPage() {
  const reduced = useReducedMotion() ?? false;
  const [film, setFilm] = useState<RollFilm | null>(null);
  const [options, setOptions] = useState<RollFilm[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [selectedFilmId, setSelectedFilmId] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);

  const loadFilm = useCallback(async () => {
    setPhase("loading");
    setOptions([]);
    setSelectedFilmId(null);
    setCorrect(null);
    try {
      const nextRound = await fetchBlindRound();
      setFilm(nextRound.film);
      setOptions(nextRound.options);
      setPhase("ready");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchBlindRound()
      .then((nextRound) => {
        if (ignore) return;
        setFilm(nextRound.film);
        setOptions(nextRound.options);
        setPhase("ready");
      })
      .catch(() => {
        if (!ignore) setPhase("error");
      });

    return () => {
      ignore = true;
    };
  }, []);

  const awards = useMemo(() => (film ? getAwards(film) : []), [film]);
  const totalNominations = film ? film.oscarNominations + film.ggNominations + film.cannesNominations : 0;
  const totalWins = film ? film.oscarWins + film.ggWins + film.cannesWins : 0;

  function handleReveal() {
    if (!film) return;
    setCorrect(selectedFilmId === film.id);
    setPhase("revealed");
  }

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />

      {phase === "revealed" && correct && (
        <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center">
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.55 }}
            animate={reduced ? { opacity: 0 } : { opacity: [0, 1, 1, 0], scale: [0.55, 1.12, 1, 1.18] }}
            transition={{ duration: 1.35, ease: "easeOut" }}
            className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[#4ade80]/45 bg-[#07110b]/78 shadow-[0_0_70px_rgba(74,222,128,0.28)] backdrop-blur-md"
          >
            <Trophy className="h-12 w-12 text-[#4ade80]" />
            {[
              { Icon: Star, x: -92, y: -54, rotate: -18 },
              { Icon: Sparkles, x: 86, y: -62, rotate: 12 },
              { Icon: CheckCircle2, x: -76, y: 70, rotate: 8 },
              { Icon: Star, x: 90, y: 62, rotate: 22 },
            ].map(({ Icon, x, y, rotate }, index) => (
              <motion.span
                key={`${x}-${y}`}
                initial={reduced ? false : { opacity: 0, x: 0, y: 0, scale: 0.3, rotate: 0 }}
                animate={
                  reduced
                    ? { opacity: 0 }
                    : { opacity: [0, 1, 1, 0], x, y, scale: [0.3, 1, 0.9, 0.75], rotate }
                }
                transition={{ duration: 1.15, delay: index * 0.06, ease: "easeOut" }}
                className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#111118]/90 text-[#D4AF37]"
              >
                <Icon className="h-5 w-5" />
              </motion.span>
            ))}
          </motion.div>
        </div>
      )}

      <main className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-3 sm:px-6 lg:gap-5 lg:py-4">
        <div className="relative flex shrink-0 flex-col gap-1.5 text-left">
          <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#e8453c]/70">
            Blind Roll
          </p>
          <h1 className="max-w-full text-balance font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:max-w-3xl lg:text-5xl lg:leading-none">
            Crack the festival case
          </h1>
          <p className="max-w-full text-sm leading-5 text-[#aaaabc] sm:max-w-2xl">
            Use the award trail, pick a suspect title, then open the vault.
          </p>
        </div>

        {phase === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#e8453c]/30 border-t-[#e8453c]" />
            <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
              Loading blind roll...
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 py-20 text-center">
            <p className="text-sm text-[#888899]">Couldn&apos;t load a film. Please try again.</p>
            <button
              type="button"
              onClick={() => void loadFilm()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8453c] px-5 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        )}

        {film && phase !== "loading" && phase !== "error" && (
          <div className="relative grid min-h-0 items-stretch gap-4 lg:grid-cols-[1fr_380px]">
            <div className="flex min-w-0 flex-col gap-3">
              <section className="relative overflow-hidden rounded-2xl border border-[#34344c] bg-[linear-gradient(145deg,rgba(18,18,31,0.98),rgba(8,8,14,0.98))] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#e8453c,#D4AF37,#e8453c)]" />
                <div className="mb-2.5 flex shrink-0 items-center justify-between gap-4">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.28em] text-[#e8453c]">
                    Case File
                  </p>
                  <div className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.16em] text-[#D4AF37]">
                    Classified
                  </div>
                </div>

                <div className="mb-3 grid shrink-0 gap-2 sm:grid-cols-4">
                  <div className="flex h-24 flex-col justify-between rounded-xl border border-[#2a2a3e] bg-[#09090f]/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.18em] text-[#77778b]">
                      Release Decade
                    </p>
                    <p className="font-[family-name:var(--font-display)] text-2xl font-bold">
                      {getDecade(film.year)}
                    </p>
                  </div>
                  <div className="flex h-24 flex-col justify-between rounded-xl border border-[#2a2a3e] bg-[#09090f]/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.18em] text-[#77778b]">
                      Runtime
                    </p>
                    <p className="font-[family-name:var(--font-display)] text-2xl font-bold">
                      {formatRuntime(film.runtime)}
                    </p>
                  </div>
                  <div className="flex h-24 flex-col justify-between rounded-xl border border-[#2a2a3e] bg-[#09090f]/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.18em] text-[#77778b]">
                      Total Nominations
                    </p>
                    <p className="font-[family-name:var(--font-display)] text-2xl font-bold">
                      {totalNominations}
                    </p>
                  </div>
                  <div className="flex h-24 flex-col justify-between rounded-xl border border-[#2a2a3e] bg-[#09090f]/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.18em] text-[#77778b]">
                      Total Wins
                    </p>
                    <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#D4AF37]">
                      {totalWins}
                    </p>
                  </div>
                </div>

                <div className={awards.length > 3 ? "grid gap-2 sm:grid-cols-2" : "space-y-2"}>
                  {awards.length > 0 ? (
                    awards.map((award, index) => (
                      <div
                        key={`${award.awardBody}-${award.awardYear}-${award.category}-${award.nominee}-${index}`}
                        className="flex min-h-20 flex-col gap-2 rounded-xl border border-[#2a2a3e] bg-[#09090f]/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.2em] text-[#e8453c]">
                            {formatAwardBody(award.awardBody)} · {award.awardYear}
                          </p>
                          <p className="mt-1 line-clamp-2 font-[family-name:var(--font-display)] text-base font-bold leading-tight">
                            {award.category}
                          </p>
                          <p className="mt-1 truncate text-xs text-[#aaaabc]">{award.nominee}</p>
                        </div>
                        <span className="w-fit shrink-0 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.16em] text-[#D4AF37]">
                          {award.won ? "Won" : "Nominated"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-[#222232] bg-[#09090f] p-5 text-sm text-[#888899]">
                      No award records are available for this blind roll.
                    </div>
                  )}
                </div>
              </section>

              <section className="relative overflow-hidden rounded-2xl border border-[#34344c] bg-[#0d0d1a] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
                <div className="mb-2.5">
                  <div>
                    <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.28em] text-[#D4AF37]">
                      Suspect Lineup
                    </p>
                    <p className="mt-1 text-sm text-[#888899]">Choose the title that matches the clues.</p>
                  </div>
                </div>

                {phase === "revealed" && (
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={[
                      "mb-2 flex items-center justify-between gap-3 rounded-xl border px-3 py-2",
                      correct
                        ? "border-[#4ade80]/45 bg-[#4ade80]/10 text-[#bbf7d0]"
                        : "border-[#e8453c]/45 bg-[#e8453c]/10 text-[#fecaca]",
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {correct ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4ade80]" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-[#e8453c]" />
                      )}
                      <p className="truncate font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.18em]">
                        {correct ? "Correct pick" : "Case missed"}
                      </p>
                    </div>
                    <p className="hidden text-xs text-[#d4d4df] sm:block">
                      {correct ? "You cracked the hidden film." : `Answer: ${film.title}`}
                    </p>
                  </motion.div>
                )}

                <div className="grid gap-2 sm:grid-cols-2">
                  {options.map((option, index) => {
                    const selected = selectedFilmId === option.id;
                    const revealedCorrect = phase === "revealed" && option.id === film.id;
                    const revealedWrong = phase === "revealed" && selected && option.id !== film.id;
                    const optionStateClass = revealedCorrect
                      ? "border-[#4ade80] bg-[#4ade80]/12 shadow-[0_0_34px_rgba(74,222,128,0.18)]"
                      : revealedWrong
                        ? "border-[#e8453c] bg-[#e8453c]/10 shadow-[0_0_34px_rgba(232,69,60,0.12)]"
                        : selected
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_30px_rgba(212,175,55,0.12)]"
                          : "border-[#2a2a3e] bg-[#09090f] hover:border-[#e8453c]/60 hover:bg-[#141421]";
                    const markerStateClass = revealedCorrect
                      ? "border-[#4ade80] bg-[#4ade80] text-[#07110b]"
                      : revealedWrong
                        ? "border-[#e8453c] bg-[#e8453c] text-[#F5F5F0]"
                        : "border-[#2a2a3e] bg-[#10101b] text-[#D4AF37] group-hover:border-[#D4AF37]/60";

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          if (phase !== "revealed") setSelectedFilmId(option.id);
                        }}
                        className={[
                          "group flex min-h-20 items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
                          optionStateClass,
                        ].join(" ")}
                        disabled={phase === "revealed"}
                      >
                        <span
                          className={[
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest transition-colors",
                            markerStateClass,
                          ].join(" ")}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-[#F5F5F0]">
                            {option.title}
                          </span>
                          <span className="mt-1 block font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.18em] text-[#66667a]">
                            Candidate
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside
              className={[
                "relative flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-[#34344c] bg-[linear-gradient(160deg,#12121f,#09090f_60%)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.38)]",
                "lg:h-full lg:min-h-0 lg:self-stretch",
              ].join(" ")}
            >
              <div
                className={[
                  "pointer-events-none absolute inset-x-0 top-0 h-1",
                  phase === "revealed" && correct ? "bg-[#4ade80]" : "bg-[#D4AF37]",
                ].join(" ")}
              />
              {phase === "revealed" ? (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className="flex h-full min-h-0 flex-col gap-3"
                >
                  {correct && (
                    <motion.div
                      initial={reduced ? false : { opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 }}
                      className="relative overflow-hidden rounded-xl border border-[#4ade80]/45 bg-[#4ade80]/10 px-4 py-3 text-center shadow-[0_0_40px_rgba(74,222,128,0.12)]"
                    >
                      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[#bbf7d0]/70" />
                      <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.22em] text-[#4ade80]">
                        Case cracked
                      </p>
                      <p className="mt-1 text-sm text-[#d4d4df]">
                        Perfect read. You found the hidden film.
                      </p>
                    </motion.div>
                  )}
                  <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-[#2a2a3e] bg-[#09090f] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                    {film.posterUrl ? (
                      <Image src={film.posterUrl} alt={film.title} fill sizes="380px" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Clapperboard className="h-12 w-12 text-[#2a2a3e]" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/78 to-transparent p-4 pt-20 text-center">
                      <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.24em] text-[#D4AF37]">
                        {correct ? "Case Closed" : "The Answer"}
                      </p>
                      <h2 className="mt-2 line-clamp-2 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
                        {film.title}
                      </h2>
                      <p className="mt-1 text-sm text-[#d4d4df]">{film.year}</p>
                    </div>
                  </div>
                  <Link
                    href={`/film/${film.slug}`}
                    className="flex h-14 items-center justify-center rounded-xl bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
                  >
                    View Film
                  </Link>
                  <button
                    type="button"
                    onClick={() => void loadFilm()}
                    className="flex h-14 items-center justify-center gap-2 rounded-xl border border-[#2a2a3e] bg-[#111118] font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#888899] transition-colors hover:border-[#e8453c]/60 hover:text-[#F5F5F0]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Next Film
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-[#393950] bg-[#09090f]/75">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#e8453c]/30 bg-[#e8453c]/10">
                        <Eye className="h-10 w-10 text-[#e8453c]" />
                      </div>
                      <p className="max-w-48 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#555568]">
                        Title, poster, and plot hidden
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleReveal}
                      disabled={!selectedFilmId}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition hover:bg-[#d7372f] hover:shadow-[0_0_40px_rgba(232,69,60,0.25)] disabled:cursor-not-allowed disabled:bg-[#2a2a3e] disabled:text-[#77778b] disabled:shadow-none"
                    >
                      <Trophy className="h-3.5 w-3.5" />
                      Reveal
                    </button>
                  </div>
                </>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

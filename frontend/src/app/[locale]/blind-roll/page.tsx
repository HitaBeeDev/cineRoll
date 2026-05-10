"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Clapperboard, Eye, RefreshCw, Trophy } from "lucide-react";
import type { AwardRecord } from "@cineroll/types";
import { AppHeader } from "@/components/app-header";
import { fetchRandom, type RollFilm } from "@/lib/api";

type Phase = "loading" | "ready" | "revealed" | "error";

async function fetchBlindFilm(): Promise<RollFilm> {
  const result = await fetchRandom();
  return result.film;
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

function normalizeGuess(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isCorrectGuess(guess: string, film: RollFilm): boolean {
  const normalizedGuess = normalizeGuess(guess);
  if (!normalizedGuess) return false;
  return normalizeGuess(film.title) === normalizedGuess;
}

function getDecade(year: number): string {
  return `${Math.floor(year / 10) * 10}s`;
}

export default function BlindRollPage() {
  const reduced = useReducedMotion() ?? false;
  const [film, setFilm] = useState<RollFilm | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [guess, setGuess] = useState("");
  const [correct, setCorrect] = useState<boolean | null>(null);

  const loadFilm = useCallback(async () => {
    setPhase("loading");
    setGuess("");
    setCorrect(null);
    try {
      const nextFilm = await fetchBlindFilm();
      setFilm(nextFilm);
      setPhase("ready");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchBlindFilm()
      .then((nextFilm) => {
        if (ignore) return;
        setFilm(nextFilm);
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
    setCorrect(isCorrectGuess(guess, film));
    setPhase("revealed");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-2 text-center">
          <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#e8453c]/70">
            Blind Roll
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold sm:text-5xl">
            Guess the hidden film
          </h1>
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
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <section className="rounded-2xl border border-[#1a1a28] bg-[#0d0d1a] p-5">
              <div className="mb-5 grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-[#222232] bg-[#09090f] p-4">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.18em] text-[#555568]">
                    Release Decade
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
                    {getDecade(film.year)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#222232] bg-[#09090f] p-4">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.18em] text-[#555568]">
                    Runtime
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
                    {film.runtime ? `${film.runtime} min` : "Unknown"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#222232] bg-[#09090f] p-4">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.18em] text-[#555568]">
                    Total Nominations
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
                    {totalNominations}
                  </p>
                </div>
                <div className="rounded-xl border border-[#222232] bg-[#09090f] p-4">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.18em] text-[#555568]">
                    Total Wins
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[#D4AF37]">
                    {totalWins}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {awards.length > 0 ? (
                  awards.map((award, index) => (
                    <div
                      key={`${award.awardBody}-${award.awardYear}-${award.category}-${award.nominee}-${index}`}
                      className="flex flex-col gap-2 rounded-xl border border-[#222232] bg-[#09090f] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.2em] text-[#e8453c]">
                          {formatAwardBody(award.awardBody)} · {award.awardYear}
                        </p>
                        <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold">
                          {award.category}
                        </p>
                        <p className="mt-1 text-sm text-[#888899]">{award.nominee}</p>
                      </div>
                      <span className="w-fit rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.16em] text-[#D4AF37]">
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

            <aside className="flex flex-col gap-4 rounded-2xl border border-[#1a1a28] bg-[#0d0d1a] p-5">
              {phase === "revealed" ? (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className="flex flex-col gap-4"
                >
                  <div className="relative mx-auto w-44 overflow-hidden rounded-xl border border-[#222232] bg-[#09090f]" style={{ aspectRatio: "2/3" }}>
                    {film.posterUrl ? (
                      <Image src={film.posterUrl} alt={film.title} fill sizes="176px" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Clapperboard className="h-12 w-12 text-[#2a2a3e]" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.24em] text-[#D4AF37]">
                      {correct ? "Correct" : "Revealed"}
                    </p>
                    <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
                      {film.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#888899]">{film.year}</p>
                  </div>
                  <Link
                    href={`/film/${film.slug}`}
                    className="flex items-center justify-center rounded-xl bg-[#e8453c] py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
                  >
                    View Film
                  </Link>
                  <button
                    type="button"
                    onClick={() => void loadFilm()}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#222232] py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#888899] transition-colors hover:text-[#F5F5F0]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Next Film
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed border-[#2a2a3e] bg-[#09090f]">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Eye className="h-10 w-10 text-[#e8453c]/70" />
                      <p className="max-w-48 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#555568]">
                        Title, poster, and plot hidden
                      </p>
                    </div>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#888899]">
                      What film is this?
                    </span>
                    <input
                      value={guess}
                      onChange={(event) => setGuess(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleReveal();
                      }}
                      className="rounded-xl border border-[#222232] bg-[#09090f] px-4 py-3 text-sm text-[#F5F5F0] outline-none transition-colors placeholder:text-[#555568] focus:border-[#e8453c]/60"
                      placeholder="Type your guess"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleReveal}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#e8453c] py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
                  >
                    <Trophy className="h-3.5 w-3.5" />
                    Reveal
                  </button>
                </>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

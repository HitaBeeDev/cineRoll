"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Clapperboard,
  Crown,
  Flame,
  RefreshCw,
  Share2,
  Trophy,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { fetchRandom, type RollFilm } from "@/lib/api";
import { buildBattleCluster } from "@/lib/roll-battle-matchmaking";

const TOTAL_ROUNDS = 5;
const BATTLE_SET_SIZE = TOTAL_ROUNDS + 1;
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

function awardWinCount(film: RollFilm): number {
  return film.oscarWins + film.ggWins + film.cannesWins;
}

function nominationCount(film: RollFilm): number {
  return film.oscarNominations + film.ggNominations + film.cannesNominations;
}

function formatAwardSummary(film: RollFilm): string {
  const wins = awardWinCount(film);
  const nominations = nominationCount(film);
  if (wins > 0 && nominations > 0) return `${wins} wins · ${nominations} nominations`;
  if (wins > 0) return wins === 1 ? "1 win" : `${wins} wins`;
  if (nominations > 0) return nominations === 1 ? "1 nomination" : `${nominations} nominations`;
  return "No major award records";
}

function primaryGenre(film: RollFilm): string {
  return film.genres[0] ?? "Archive";
}

function decadeLabel(film: RollFilm): string | null {
  const year = Number(film.releaseYear ?? film.year);
  if (!Number.isFinite(year)) return null;
  return `${Math.floor(year / 10) * 10}s`;
}

function shortPlot(plot: string | null | undefined): string {
  if (!plot) return "A mystery pick from the CineRoll archive.";
  const compact = plot.replace(/\s+/g, " ").trim();
  if (compact.length <= 138) return compact;
  return `${compact.slice(0, 135).trim()}...`;
}

function buildMoodTags(film: RollFilm): string[] {
  const tags: string[] = [];
  const genre = primaryGenre(film);
  if (genre !== "Archive") tags.push(genre);

  const decade = decadeLabel(film);
  if (decade) tags.push(decade);

  if ((film.runtime ?? 0) >= 150) tags.push("Epic");
  else if ((film.runtime ?? 0) > 0 && (film.runtime ?? 0) <= 95) tags.push("Lean");

  if ((film.imdbRating ?? 0) >= 8) tags.push("Critic favorite");
  if (awardWinCount(film) > 0) tags.push("Award winner");

  return [...new Set(tags)].slice(0, 4);
}

function ratingBand(film: RollFilm): string | null {
  if (film.imdbRating == null) return null;
  if (film.imdbRating >= 8) return "high-rating range";
  if (film.imdbRating >= 7) return "strong-rating range";
  return "similar rating range";
}

function buildPairingReasons(left: RollFilm, right: RollFilm): string[] {
  const reasons: string[] = [];
  const sharedGenres = left.genres.filter((genre) => right.genres.includes(genre));
  if (sharedGenres.length > 0) reasons.push(`shared ${sharedGenres[0]!.toLowerCase()} DNA`);

  const leftDecade = decadeLabel(left);
  const rightDecade = decadeLabel(right);
  if (leftDecade && rightDecade) {
    reasons.push(leftDecade === rightDecade ? `${leftDecade} matchup` : `${leftDecade} vs ${rightDecade}`);
  }

  if (
    left.imdbRating != null &&
    right.imdbRating != null &&
    Math.abs(left.imdbRating - right.imdbRating) <= 0.7
  ) {
    reasons.push(ratingBand(left) ?? "similar rating range");
  }

  if (
    left.runtime != null &&
    right.runtime != null &&
    Math.abs(left.runtime - right.runtime) <= 25
  ) {
    reasons.push("nearby runtime");
  }

  if (reasons.length === 0) {
    reasons.push(`${primaryGenre(left).toLowerCase()} pressure test`, `${primaryGenre(right).toLowerCase()} challenger`);
  }

  return reasons.slice(0, 3);
}

function buildMatchupTitle(left: RollFilm, right: RollFilm): string {
  const sharedGenre = left.genres.find((genre) => right.genres.includes(genre));
  if (sharedGenre) return `${sharedGenre} duel`;

  const leftDecade = decadeLabel(left);
  const rightDecade = decadeLabel(right);
  if (leftDecade && rightDecade && leftDecade !== rightDecade) {
    return `${leftDecade} vs ${rightDecade}`;
  }

  return `${primaryGenre(left)} vs ${primaryGenre(right)}`;
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
    if (genre !== "Archive") {
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

  if (signals.length === 0) return "Your taste stayed balanced across the bracket.";
  return `Your taste leaned toward ${signals.slice(0, 3).join(", ")}.`;
}

interface FilmBattleCardProps {
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
}: FilmBattleCardProps) {
  const runtime = formatRuntime(film.runtime);
  const imageUrl = film.posterUrl ?? film.backdropUrl;
  const wins = awardWinCount(film);
  const tags = buildMoodTags(film);

  return (
    <motion.button
      type="button"
      onClick={onPick}
      disabled={isPicked || isRejected}
      initial={reduced ? false : { opacity: 0, x: side === "left" ? -24 : 24 }}
      animate={{
        opacity: isRejected ? 0.36 : 1,
        filter: isRejected ? "grayscale(0.55) brightness(0.72)" : "grayscale(0) brightness(1)",
        x: isRejected
          ? side === "left"
            ? -28
            : 28
          : isPicked
            ? side === "left"
              ? 18
              : -18
            : 0,
        y: isPicked ? -10 : 0,
        scale: isPicked ? 1.025 : isRejected ? 0.97 : 1,
      }}
      {...(!isPicked && !isRejected && !reduced
        ? { whileHover: { y: -6, scale: 1.01 } }
        : {})}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="group relative flex min-h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#262633] bg-[#0e0e18] text-left shadow-[0_22px_70px_rgba(0,0,0,0.34)] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff635a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f] disabled:cursor-default enabled:hover:border-[#e8453c]/75 enabled:hover:shadow-[0_0_46px_rgba(232,69,60,0.18)]"
      aria-label={`Choose ${film.title} as the winner`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#07070d] sm:aspect-[4/5] lg:aspect-[2/3]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={film.title}
            fill
            sizes="(max-width: 767px) 92vw, (max-width: 1023px) 42vw, 360px"
            className="object-cover transition duration-500 group-hover:scale-[1.025] group-hover:brightness-110 group-hover:saturate-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#171724]">
            <Clapperboard className="h-12 w-12 text-[#3b3b4d]" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/18 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full border border-[#F5F5F0]/14 bg-[#09090f]/78 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-xs font-semibold text-[#F5F5F0]/86 backdrop-blur-md">
          {film.year}
        </div>
        <div
          className={`absolute right-3 top-3 rounded-full border px-3 py-1 font-[family-name:var(--font-geist-mono)] text-xs font-semibold backdrop-blur-md ${
            wins > 0
              ? "border-[#D4AF37]/45 bg-[#D4AF37]/16 text-[#f1d77f]"
              : "border-[#F5F5F0]/14 bg-[#09090f]/62 text-[#F5F5F0]/62"
          }`}
        >
          {wins > 0 ? `${wins} wins` : "contender"}
        </div>

        {isPicked && (
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-[#e8453c]/18 ring-2 ring-inset ring-[#ff635a]/70"
          >
            <div className="flex items-center gap-2 rounded-full bg-[#e8453c] px-4 py-2 font-[family-name:var(--font-geist-mono)] text-xs font-bold text-[#fff8f3] shadow-[0_0_32px_rgba(232,69,60,0.48)]">
              <Crown className="h-4 w-4" />
              advances
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="space-y-1.5">
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-[#F5F5F0] sm:text-[1.7rem]">
            {film.title}
          </h3>
          <p className="text-sm font-medium leading-5 text-[#c8c8d5]">
            {film.director ? `Directed by ${film.director}` : primaryGenre(film)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {runtime && <InfoPill>{runtime}</InfoPill>}
          {film.imdbRating != null && <InfoPill>IMDb {film.imdbRating.toFixed(1)}</InfoPill>}
          {film.rtScore != null && <InfoPill>RT {film.rtScore}%</InfoPill>}
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-[#F5F5F0]/72">{shortPlot(film.plot)}</p>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#e8453c]/24 bg-[#e8453c]/10 px-2.5 py-1 text-xs font-semibold text-[#ff8a82]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto border-t border-[#F5F5F0]/10 pt-3">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[#e8453c] px-4 py-3 font-[family-name:var(--font-geist-mono)] text-xs font-bold text-[#fff8f3] transition-colors group-hover:bg-[#ff554b]">
            <span>This one wins</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function InfoPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-[#F5F5F0]/12 bg-[#09090f]/72 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-xs font-semibold text-[#F5F5F0]/78">
      {children}
    </span>
  );
}

function BattleStatus({
  round,
  selectedFilm,
  champion,
  leftFilm,
  rightFilm,
}: {
  round: number;
  selectedFilm: RollFilm | null;
  champion: RollFilm | null;
  leftFilm: RollFilm;
  rightFilm: RollFilm;
}) {
  const reasons = buildPairingReasons(leftFilm, rightFilm);
  const roundsLeft = selectedFilm ? TOTAL_ROUNDS - round - 1 : TOTAL_ROUNDS - round;

  return (
    <section className="grid gap-4 rounded-2xl border border-[#242432] bg-[#0c0c15]/88 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] lg:grid-cols-[1fr_auto_1fr] lg:items-center">
      <div>
        <p className="font-[family-name:var(--font-geist-mono)] text-xs font-semibold text-[#D4AF37]">
          Round {round + 1} of {TOTAL_ROUNDS}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#F5F5F0] sm:text-4xl">
          Choose the film that survives.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#F5F5F0]/72 sm:text-base">
          Each pick becomes the champion and faces the next challenger. After five rounds,
          your choices crown one film for tonight.
        </p>
      </div>

      <div className="flex items-center gap-2 lg:flex-col">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 rounded-full transition-all duration-300 lg:w-2.5 ${
              i < round || (selectedFilm && i === round)
                ? "w-9 bg-[#e8453c] shadow-[0_0_16px_rgba(232,69,60,0.42)]"
                : i === round
                  ? "w-9 bg-[#D4AF37]"
                  : "w-5 bg-[#2a2a38]"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="rounded-xl border border-[#F5F5F0]/10 bg-[#09090f]/70 p-3 lg:text-right">
        <p className="font-[family-name:var(--font-geist-mono)] text-xs font-semibold text-[#ff8a82]">
          {buildMatchupTitle(leftFilm, rightFilm)}
        </p>
        <p className="mt-1 text-sm leading-5 text-[#F5F5F0]/68">
          Matched by {reasons.join(", ")}.
        </p>
        <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-xs font-semibold text-[#F5F5F0]/58">
          {champion ? `${champion.title} is defending` : "First choice starts the bracket"} ·{" "}
          {roundsLeft} {roundsLeft === 1 ? "choice" : "choices"} left
        </p>
      </div>
    </section>
  );
}

function VersusMedallion({ selectedFilm }: { selectedFilm: RollFilm | null }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 md:block">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#e8453c]/70 bg-[#130d12] shadow-[0_0_60px_rgba(232,69,60,0.34)]">
        <div className="absolute h-[1px] w-40 bg-gradient-to-r from-transparent via-[#e8453c]/70 to-transparent" />
        <span className="relative font-[family-name:var(--font-display)] text-3xl font-black text-[#ff635a]">
          VS
        </span>
      </div>
      <AnimatePresence>
        {selectedFilm && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 whitespace-nowrap rounded-full border border-[#e8453c]/35 bg-[#09090f]/88 px-3 py-1 text-center font-[family-name:var(--font-geist-mono)] text-xs font-bold text-[#ff8a82]"
          >
            {selectedFilm.title} advances
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChampionResult({
  champion,
  pickedFilms,
  shareStatus,
  onShare,
  onReset,
  reduced,
}: {
  champion: RollFilm;
  pickedFilms: RollFilm[];
  shareStatus: "idle" | "copied";
  onShare: () => void;
  onReset: () => void;
  reduced: boolean;
}) {
  const imageUrl = champion.posterUrl ?? champion.backdropUrl;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="mx-auto flex w-full max-w-4xl flex-col gap-6"
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5 text-[#D4AF37]" />
          <span className="font-[family-name:var(--font-geist-mono)] text-xs font-bold text-[#D4AF37]">
            Battle champion
          </span>
        </div>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-[#F5F5F0] sm:text-5xl">
          {champion.title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#F5F5F0]/70">
          Five choices built this winner. {buildTasteSummary(pickedFilms)}
        </p>
      </div>

      <div className="grid gap-6 rounded-2xl border border-[#242432] bg-[#0c0c15] p-4 sm:grid-cols-[240px_1fr] sm:p-5">
        <div className="relative mx-auto w-48 overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-[#0d0d1a] shadow-[0_0_46px_rgba(212,175,55,0.16)] sm:w-full">
          <div className="aspect-[2/3]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={champion.title}
                fill
                sizes="(max-width: 640px) 192px, 240px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Clapperboard className="h-12 w-12 text-[#2a2a3e]" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <InfoPill>{champion.year}</InfoPill>
            {formatRuntime(champion.runtime) && <InfoPill>{formatRuntime(champion.runtime)}</InfoPill>}
            {champion.imdbRating != null && <InfoPill>IMDb {champion.imdbRating.toFixed(1)}</InfoPill>}
            {champion.rtScore != null && <InfoPill>RT {champion.rtScore}%</InfoPill>}
          </div>

          <div className="flex flex-wrap gap-2">
            {buildMoodTags(champion).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#e8453c]/25 bg-[#e8453c]/10 px-3 py-1 text-sm font-semibold text-[#ff8a82]"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="font-[family-name:var(--font-geist-mono)] text-xs font-semibold text-[#D4AF37]">
            {formatAwardSummary(champion)}
          </p>
          {champion.plot && (
            <p className="text-base leading-7 text-[#F5F5F0]/72">{champion.plot}</p>
          )}

          <div className="mt-auto grid gap-3 sm:grid-cols-3">
            <Link
              href={`/film/${champion.slug}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#e8453c] px-4 py-3 font-[family-name:var(--font-geist-mono)] text-xs font-bold text-[#fff8f3] transition-colors hover:bg-[#ff554b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a82]"
            >
              Watch this tonight
            </Link>
            <button
              type="button"
              onClick={onShare}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#2a2a38] bg-[#11111d] px-4 py-3 font-[family-name:var(--font-geist-mono)] text-xs font-bold text-[#F5F5F0] transition-colors hover:border-[#e8453c]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a82]"
            >
              <Share2 className="h-4 w-4" />
              {shareStatus === "copied" ? "Copied" : "Share winner"}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#242432] px-4 py-3 font-[family-name:var(--font-geist-mono)] text-xs font-bold text-[#b6b6c8] transition-colors hover:border-[#3a3a4a] hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a82]"
            >
              <RefreshCw className="h-4 w-4" />
              New battle
            </button>
          </div>
        </div>
      </div>
    </motion.div>
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
  const selectedFilm = useMemo(() => {
    if (pickedId == null) return null;
    if (leftFilm?.id === pickedId) return leftFilm;
    if (rightFilm?.id === pickedId) return rightFilm;
    return null;
  }, [leftFilm, pickedId, rightFilm]);

  function handlePick(film: RollFilm) {
    if (pickedId !== null) return;
    setPickedId(film.id);
    setPickedFilms((current) => [...current, film]);
    const delay = reduced ? 0 : 850;
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
    const text = `Roll Battle picked "${film.title}" (${film.year}) as my film tonight. Try it on CineRoll: ${shareUrl.toString()}`;
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
      // User cancelled or clipboard was unavailable.
    }
  }

  return (
    <div className="min-h-dvh bg-[#09090f]">
      <AppHeader />

      <main className="relative min-h-[calc(100dvh-73px)] overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(232,69,60,0.14),transparent_32%),linear-gradient(90deg,rgba(232,69,60,0.08),transparent_26%,transparent_74%,rgba(212,175,55,0.08))]" />

        {phase === "loading" && (
          <div className="relative flex min-h-[60dvh] flex-col items-center justify-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8453c]/30 border-t-[#e8453c]" />
            <p className="font-[family-name:var(--font-geist-mono)] text-xs font-semibold text-[#8d8d9f]">
              Building a fair five-round bracket...
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className="relative flex min-h-[60dvh] flex-col items-center justify-center gap-6 text-center">
            <p className="text-base text-[#c8c8d5]">Couldn&apos;t load films. Please try again.</p>
            <button
              type="button"
              onClick={() => void loadFilms()}
              className="flex items-center gap-2 rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-xs font-bold text-[#fff8f3] transition-colors hover:bg-[#ff554b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a82]"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {phase === "battling" && leftFilm != null && rightFilm != null && (
          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
            <BattleStatus
              round={round}
              selectedFilm={selectedFilm}
              champion={round > 0 ? leftFilm : null}
              leftFilm={leftFilm}
              rightFilm={rightFilm}
            />

            <AnimatePresence mode="wait">
              <motion.section
                key={round}
                initial={reduced ? false : { opacity: 0, y: 18, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? {} : { opacity: 0, y: -18, scale: 0.99 }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                className="relative grid items-stretch gap-4 md:grid-cols-2 md:gap-6"
              >
                <FilmBattleCard
                  film={leftFilm}
                  onPick={() => handlePick(leftFilm)}
                  isPicked={pickedId === leftFilm.id}
                  isRejected={pickedId !== null && pickedId !== leftFilm.id}
                  side="left"
                  reduced={reduced}
                />

                <div className="flex items-center justify-center md:hidden">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#e8453c]/60 bg-[#130d12] font-[family-name:var(--font-display)] text-xl font-black text-[#ff635a] shadow-[0_0_36px_rgba(232,69,60,0.28)]">
                    VS
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

                <VersusMedallion selectedFilm={selectedFilm} />
              </motion.section>
            </AnimatePresence>

            <p className="mx-auto max-w-2xl text-center text-sm leading-6 text-[#F5F5F0]/58">
              Choose carefully. Every winner carries your taste into the next round.
            </p>
          </div>
        )}

        {phase === "result" && champion != null && (
          <ChampionResult
            champion={champion}
            pickedFilms={pickedFilms}
            shareStatus={shareStatus}
            onShare={() => void handleShare(champion)}
            onReset={() => void loadFilms()}
            reduced={reduced}
          />
        )}

        <Flame className="pointer-events-none absolute bottom-8 left-8 hidden h-24 w-24 text-[#e8453c]/5 lg:block" />
      </main>
    </div>
  );
}

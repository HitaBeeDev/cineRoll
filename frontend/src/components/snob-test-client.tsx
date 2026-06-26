"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Clapperboard, RefreshCw, Share2, Sparkles, Trophy, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/app-header";
import {
  fetchSnobTestFilms,
  scoreSnobTest,
  type SnobTestFilm,
  type SnobTestScore,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const awardLabels: Record<"oscar" | "goldenglobe" | "cannes", string> = {
  oscar: "Oscar",
  goldenglobe: "Golden Globe",
  cannes: "Cannes",
};

const titleDescriptions: Record<string, string> = {
  "Certified Normie": "You kept your film-dinner conversation refreshingly normal.",
  "Casual Watcher": "You know the big names, but the deep shelf is still waiting.",
  "Film Enthusiast": "You have enough range to make a watchlist intimidating.",
  "Award Season Regular": "You have done the red-carpet homework.",
  "Serious Cinephile": "Your queue has taste, stamina, and a little menace.",
  "Film School Graduate": "You have seen the canon and probably corrected someone about it.",
  "The Snob": "You are the reason this test needed a top tier.",
};

const RECENT_FILM_IDS_KEY = "cineroll-snob-test-recent-film-ids";
const RECENT_FILM_IDS_LIMIT = 80;

type QuizBreakdown = {
  awardBody: Array<{ label: string; seen: number; total: number; percent: number }>;
  decade: Array<{ label: string; seen: number; total: number; percent: number }>;
};

function percent(seen: number, total: number) {
  return total === 0 ? 0 : Math.round((seen / total) * 100);
}

// Mirrors backend titleForScore (snobTestRoute/scoring.ts) for a live preview.
// The authoritative title still comes from the API on submit.
function projectedTitleForScore(score: number): string {
  if (score <= 10) return "Certified Normie";
  if (score <= 25) return "Casual Watcher";
  if (score <= 45) return "Film Enthusiast";
  if (score <= 65) return "Award Season Regular";
  if (score <= 80) return "Serious Cinephile";
  if (score <= 95) return "Film School Graduate";
  return "The Snob";
}

function getAwardBodies(film: SnobTestFilm): Array<"oscar" | "goldenglobe" | "cannes"> {
  if (film.awardBodies.length > 0) return film.awardBodies;
  const bodies: Array<"oscar" | "goldenglobe" | "cannes"> = [];
  if (film.oscarNominations + film.oscarWins > 0) bodies.push("oscar");
  if (film.ggNominations + film.ggWins > 0) bodies.push("goldenglobe");
  if (film.cannesNominations + film.cannesWins > 0) bodies.push("cannes");
  return bodies;
}

function buildBreakdown(films: SnobTestFilm[], selectedIds: Set<string>): QuizBreakdown {
  const awardBody = new Map<"oscar" | "goldenglobe" | "cannes", { seen: number; total: number }>();
  const decade = new Map<string, { seen: number; total: number }>();

  for (const film of films) {
    const seen = selectedIds.has(film.id) ? 1 : 0;
    const decadeLabel = `${film.decade}s`;
    const decadeBucket = decade.get(decadeLabel) ?? { seen: 0, total: 0 };
    decadeBucket.seen += seen;
    decadeBucket.total += 1;
    decade.set(decadeLabel, decadeBucket);

    for (const body of getAwardBodies(film)) {
      const bucket = awardBody.get(body) ?? { seen: 0, total: 0 };
      bucket.seen += seen;
      bucket.total += 1;
      awardBody.set(body, bucket);
    }
  }

  return {
    awardBody: Array.from(awardBody.entries())
      .map(([body, bucket]) => ({
        label: awardLabels[body],
        ...bucket,
        percent: percent(bucket.seen, bucket.total),
      }))
      .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label)),
    decade: Array.from(decade.entries())
      .map(([label, bucket]) => ({
        label,
        ...bucket,
        percent: percent(bucket.seen, bucket.total),
      }))
      .sort((a, b) => Number(a.label.slice(0, 4)) - Number(b.label.slice(0, 4))),
  };
}

function mostCommon<T extends string | number>(values: T[]): T | null {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function buildGapHref(films: SnobTestFilm[], selectedIds: Set<string>) {
  const unseenFilms = films.filter(film => !selectedIds.has(film.id));
  if (unseenFilms.length === 0) return "/browse";

  const params = new URLSearchParams();
  const awardBody = mostCommon(unseenFilms.flatMap(film => getAwardBodies(film)));
  const genre = mostCommon(unseenFilms.flatMap(film => film.genres));
  const decade = mostCommon(unseenFilms.map(film => film.decade));

  if (awardBody) params.set("awardBody", awardBody);
  if (genre) params.set("genre", genre);
  if (decade != null) {
    params.set("decadeMin", String(decade));
    params.set("decadeMax", String(decade + 9));
  }

  const query = params.toString();
  return query ? `/browse?${query}` : "/browse";
}

function buildResultSentences(breakdown: QuizBreakdown) {
  const topAwardBody = breakdown.awardBody[0];
  const cannes = breakdown.awardBody.find(item => item.label === "Cannes");
  const topDecade = [...breakdown.decade].sort((a, b) => b.total - a.total)[0];
  const sentences: string[] = [];

  if (topAwardBody) {
    sentences.push(`You've seen ${topAwardBody.percent}% of ${topAwardBody.label} picks in this round.`);
  }
  if (cannes && cannes !== topAwardBody) {
    sentences.push(`You've seen ${cannes.percent}% of Cannes picks.`);
  }
  if (topDecade) {
    sentences.push(`You've seen ${topDecade.percent}% of films from the ${topDecade.label}.`);
  }

  return sentences;
}

function buildShareUrl(score: SnobTestScore) {
  const url = new URL(window.location.href);
  url.searchParams.set("score", String(score.score));
  url.searchParams.set("title", score.title);
  url.searchParams.set("seen", String(score.seen));
  url.searchParams.set("total", String(score.total));
  return url.toString();
}

function buildSaveHref(selectedIds: Set<string>) {
  const params = new URLSearchParams({
    source: "snob-test",
  });
  if (selectedIds.size > 0) {
    params.set("seenFilmIds", [...selectedIds].join(","));
  }
  return `/sign-up?${params.toString()}`;
}

function readRecentFilmIds() {
  try {
    const raw = window.sessionStorage.getItem(RECENT_FILM_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function rememberRecentFilmIds(filmIds: string[]) {
  try {
    const recentFilmIds = [...new Set([...filmIds, ...readRecentFilmIds()])].slice(0, RECENT_FILM_IDS_LIMIT);
    window.sessionStorage.setItem(RECENT_FILM_IDS_KEY, JSON.stringify(recentFilmIds));
  } catch {}
}

function PosterFallback({ title, color }: { title: string; color: string | null }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-4 text-center"
      style={{ backgroundColor: color ?? "#171720" }}
    >
      <span className="font-[family-name:var(--font-display)] text-sm font-semibold leading-tight text-[#F5F5F0]">
        {title}
      </span>
    </div>
  );
}

export function SnobTestClient() {
  const [films, setFilms] = useState<SnobTestFilm[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [score, setScore] = useState<SnobTestScore | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "scoring" | "error">("loading");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");

  const selectedCount = selectedIds.size;
  const projectedScore = Math.round((selectedCount / 20) * 100);
  const projectedTitle = projectedTitleForScore(projectedScore);
  const breakdown = useMemo(() => buildBreakdown(films, selectedIds), [films, selectedIds]);
  const liveDistribution = useMemo(
    () => [...breakdown.awardBody, ...breakdown.decade.slice(0, 4)].filter(item => item.total > 0),
    [breakdown],
  );
  const gapHref = useMemo(() => buildGapHref(films, selectedIds), [films, selectedIds]);
  const resultSentences = useMemo(() => buildResultSentences(breakdown), [breakdown]);
  const saveHref = useMemo(() => buildSaveHref(selectedIds), [selectedIds]);

  const loadFilms = useCallback(async () => {
    setStatus("loading");
    setScore(null);
    setSelectedIds(new Set());
    try {
      const nextFilms = await fetchSnobTestFilms(readRecentFilmIds());
      setFilms(nextFilms);
      rememberRecentFilmIds(nextFilms.map(film => film.id));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void loadFilms(), 0);
    return () => window.clearTimeout(id);
  }, [loadFilms]);

  function toggleFilm(filmId: string) {
    if (score) return;
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(filmId)) next.delete(filmId);
      else next.add(filmId);
      return next;
    });
  }

  async function submitScore() {
    setStatus("scoring");
    try {
      const result = await scoreSnobTest([...selectedIds]);
      setScore(result);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  async function shareScore() {
    if (!score) return;
    const text = `I scored ${score.score}% on the CineRoll Snob Test: ${score.title}`;
    const url = buildShareUrl(score);

    try {
      if (navigator.share) {
        await navigator.share({ title: "CineRoll Snob Test", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShareStatus("copied");
        window.setTimeout(() => setShareStatus("idle"), 2000);
      }
    } catch {
      setShareStatus("failed");
      window.setTimeout(() => setShareStatus("idle"), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />

      <main className="px-5 py-4 sm:px-8 lg:px-10 lg:py-5">
        <section className="grid gap-5 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-8">
            <div className="relative overflow-hidden border border-[#1f1f2f] bg-[#0d0d15]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#e8453c] via-[#D4AF37] to-[#4a9eff]" />
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                  <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.28em] text-[#D4AF37]">
                    {"// AWARDS GAUNTLET · 20 POSTERS"}
                  </p>
                  <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(3rem,4.2vw,4.6rem)] font-bold leading-[0.95] tracking-normal text-[#F5F5F0]">
                    The Snob <span className="text-[#e8453c]">Test.</span>
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-[#a8a8b6] sm:text-base">
                    Tap the films you have seen. Get a title, a score, and a list of gaps worth filling.
                  </p>
                </div>

                <div className="flex items-stretch justify-end gap-3">
                  <button
                    type="button"
                    className={cn(
                      "flex h-14 min-w-32 items-center justify-center gap-2 border border-[#2a2a3e] bg-[#111118] px-4",
                      "font-[family-name:var(--font-geist-mono)] text-sm font-bold uppercase tracking-widest text-[#F5F5F0]",
                      "transition hover:border-[#e8453c]/60 hover:bg-[#171720] hover:text-[#e8453c]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                    onClick={() => void loadFilms()}
                    disabled={status === "loading" || status === "scoring"}
                  >
                    <RefreshCw className={cn("h-4 w-4", status === "loading" && "animate-spin")} />
                    Again
                  </button>
                  <div className="flex h-14 min-w-36 items-center justify-center gap-3 border border-[#2a2a3e] bg-[#09090f] px-4">
                    <span className="font-[family-name:var(--font-geist-mono)] text-2xl font-bold leading-none text-[#F5F5F0]">
                      {selectedCount}/20
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#555568]">
                      Seen
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {status === "error" ? (
              <div className="flex flex-1 items-center justify-center border border-[#2b1f24] bg-[#120d10] p-8 text-center">
                <div>
                  <p className="text-lg font-semibold text-[#F5F5F0]">Could not load the test.</p>
                  <Button className="mt-4" type="button" onClick={() => void loadFilms()}>
                    Try again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {status === "loading"
                  ? Array.from({ length: 20 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-[2/3] animate-pulse border border-[#1c1c28] bg-[#111118]"
                    />
                  ))
                  : films.map((film) => {
                  const selected = selectedIds.has(film.id);
                  return (
                    <button
                      key={film.id}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`Mark ${film.title} as ${selected ? "not seen" : "seen"}`}
                      onClick={() => toggleFilm(film.id)}
                      className={cn(
                        "group relative aspect-[2/3] overflow-hidden border bg-[#111118] text-left",
                        "transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]",
                        selected
                          ? "border-[#D4AF37] shadow-[0_0_0_2px_rgba(212,175,55,0.18),0_18px_48px_rgba(212,175,55,0.12)]"
                          : "border-[#20202c] hover:-translate-y-0.5 hover:border-[#D4AF37]/55 hover:shadow-[0_16px_42px_rgba(0,0,0,0.35)]",
                      )}
                    >
                      {film.posterUrl ? (
                        <Image
                          src={film.posterUrl}
                          alt={`${film.title} poster`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className={cn(
                            "object-cover transition duration-300 group-hover:scale-[1.03]",
                            selected
                              ? "brightness-100 saturate-110"
                              : "brightness-[0.45] saturate-[0.55] group-hover:brightness-[0.7]",
                          )}
                        />
                      ) : (
                        <PosterFallback title={film.title} color={film.posterColor} />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,#000_0%,#000_38%,rgba(0,0,0,0.72)_64%,transparent_100%)] p-3 pt-16">
                        <h2 className="line-clamp-2 font-[family-name:var(--font-display)] text-sm font-semibold leading-tight text-white">
                          {film.title}
                        </h2>
                        <div className="mt-1 flex items-center gap-2 text-xs font-medium text-[#e6e6ee]">
                          <span>{film.year}</span>
                          {film.imdbRating != null && (
                            <span className="text-[#F0C64A]">{film.imdbRating.toFixed(1)} IMDb</span>
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition",
                          selected
                            ? "border-[#D4AF37] bg-[#D4AF37] text-[#09090f] shadow-[0_0_0_1.5px_rgba(9,9,15,0.6),0_2px_10px_rgba(212,175,55,0.5)]"
                            : "border-white/70 bg-black/55 text-transparent shadow-[0_1px_6px_rgba(0,0,0,0.6)] group-hover:border-white/90",
                        )}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 transition-opacity",
                            !selected && "opacity-0 text-white/70 group-hover:opacity-100",
                          )}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-20 lg:col-span-4 lg:h-fit">
            {!score ? (
              <div className="flex flex-col gap-4">
              <div className="overflow-hidden border border-[#242435] bg-[#101017]">
                <div className="border-b border-[#242435] bg-[#0b0b12] px-5 py-4">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Clapperboard className="h-4 w-4" />
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest">
                      Your ballot
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-[#242435] bg-[#09090f] p-3">
                      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#555568]">
                        Selected
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-3xl font-bold leading-none text-[#e8453c]">
                        {selectedCount}
                      </p>
                    </div>
                    <div className="border border-[#242435] bg-[#09090f] p-3">
                      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#555568]">
                        Score so far
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-3xl font-bold leading-none text-[#D4AF37]">
                        {projectedScore}%
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#b8b8c6]">
                    Your score is the share of these 20 films you have seen. Each poster you tap is worth 5% — no wrong answers, no account required.
                  </p>
                  <div className="mt-5 rounded-2xl border-2 border-dashed border-[#e8453c]/30 p-1.5">
                    <Button
                      type="button"
                      size="lg"
                      className="h-14 w-full rounded-xl bg-[#e8453c] text-[#F5F5F0] hover:bg-[#d7372f] hover:shadow-[0_0_40px_rgba(232,69,60,0.25)]"
                      disabled={status !== "ready"}
                      onClick={() => void submitScore()}
                    >
                      <Trophy className="h-4 w-4" />
                      {status === "scoring" ? "Scoring..." : "See My Score"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border border-[#242435] bg-[#101017] p-5">
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#555568]">
                    Projected rank
                  </span>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#D4AF37]">
                    {projectedScore}%
                  </span>
                </div>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-[#F5F5F0]">
                  {projectedTitle}
                </h3>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#242435]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#e8453c] to-[#D4AF37] transition-[width] duration-300"
                    style={{ width: `${projectedScore}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-[#888899]">
                  {selectedCount === 0
                    ? "Tap a poster to start climbing the ranks."
                    : selectedCount >= 20
                      ? "You have topped out — full marks, you are The Snob."
                      : `${20 - selectedCount} more to reach The Snob.`}
                </p>
              </div>

              {liveDistribution.length > 0 && (
                <div className="border border-[#242435] bg-[#101017] p-5">
                  <h3 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#888899]">
                    Live distribution
                  </h3>
                  <div className="mt-4 space-y-3">
                    {liveDistribution.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#F5F5F0]">{item.label}</span>
                          <span className="text-[#a8a8b6]">
                            {item.seen}/{item.total}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#242435]">
                          <div
                            className="h-full rounded-full bg-[#e8453c] transition-[width] duration-300"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="border border-[#D4AF37]/35 bg-[#101017] p-5">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest">
                      Result
                    </span>
                  </div>
                  <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[#F5F5F0]">
                    {score.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#b8b8c6]">
                    {titleDescriptions[score.title] ?? "Your award-film score is in."}
                  </p>
                  <div className="mt-5">
                    <div className="flex items-end justify-between">
                      <span className="text-5xl font-bold text-[#D4AF37]">{score.score}%</span>
                      <span className="pb-1 text-sm text-[#888899]">
                        {score.seen}/{score.total} seen
                      </span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#242435]">
                      <div
                        className="h-full rounded-full bg-[#D4AF37] transition-[width] duration-700"
                        style={{ width: `${score.score}%` }}
                      />
                    </div>
                  </div>
                  {resultSentences.length > 0 && (
                    <div className="mt-5 space-y-1.5 text-sm leading-6 text-[#d4d4df]">
                      {resultSentences.map(sentence => (
                        <p key={sentence}>{sentence}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="overflow-hidden border border-[#D4AF37]/35 bg-[#111118]">
                  <div className="relative aspect-[1.91/1] min-h-[188px] bg-[#111118] p-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(212,175,55,0.22),transparent_34%),linear-gradient(135deg,rgba(232,69,60,0.22),transparent_45%)]" />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-widest text-[#D4AF37]">
                          CineRoll
                        </span>
                        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#c9c9d4]">
                          Snob Test
                        </span>
                      </div>
                      <div>
                        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#888899]">
                          My result
                        </p>
                        <h3 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[#F5F5F0]">
                          {score.title}
                        </h3>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-6xl font-bold leading-none text-[#D4AF37]">{score.score}%</span>
                        <span className="pb-1 text-sm font-medium text-[#F5F5F0]">
                          {score.seen}/{score.total} films
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-[#242435] bg-[#101017] p-5">
                  <h3 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#888899]">
                    Breakdown
                  </h3>
                  <div className="mt-4 space-y-3">
                    {[...breakdown.awardBody.slice(0, 3), ...breakdown.decade.slice(0, 4)].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#F5F5F0]">{item.label}</span>
                          <span className="text-[#a8a8b6]">
                            {item.percent}% ({item.seen}/{item.total})
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#242435]">
                          <div className="h-full rounded-full bg-[#e8453c]" style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="border border-[#242435] bg-[#101017] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#D4AF37] text-[#09090f]">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#F5F5F0]">
                          Save your seen films
                        </h3>
                        <p className="mt-1 text-sm leading-5 text-[#a8a8b6]">
                          Create a profile to keep these {selectedCount} picks in your watched list.
                        </p>
                      </div>
                    </div>
                    <Button asChild className="mt-4 w-full bg-[#D4AF37] text-[#09090f] hover:brightness-110">
                      <Link href={saveHref}>Sign up to save</Link>
                    </Button>
                  </div>

                  <Button type="button" onClick={() => void shareScore()} className="bg-[#e8453c] text-[#F5F5F0]">
                    <Share2 className="h-4 w-4" />
                    {shareStatus === "copied" ? "Copied" : shareStatus === "failed" ? "Could not share" : "Share my score"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="border-[#343449] bg-[#111118] text-[#F5F5F0]"
                    onClick={() => void loadFilms()}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Take the test again
                  </Button>
                  <Button asChild variant="ghost" className="text-[#D4AF37] hover:bg-[#171720] hover:text-[#f1ca51]">
                    <Link href={gapHref}>Find films to fill the gaps</Link>
                  </Button>
                </div>
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Clapperboard, RefreshCw, Share2, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNavigation } from "@/components/site-navigation";
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

type QuizBreakdown = {
  awardBody: Array<{ label: string; seen: number; total: number; percent: number }>;
  decade: Array<{ label: string; seen: number; total: number; percent: number }>;
};

function percent(seen: number, total: number) {
  return total === 0 ? 0 : Math.round((seen / total) * 100);
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
  const breakdown = useMemo(() => buildBreakdown(films, selectedIds), [films, selectedIds]);
  const gapHref = useMemo(() => buildGapHref(films, selectedIds), [films, selectedIds]);
  const resultSentences = useMemo(() => buildResultSentences(breakdown), [breakdown]);

  const loadFilms = useCallback(async () => {
    setStatus("loading");
    setScore(null);
    setSelectedIds(new Set());
    try {
      const nextFilms = await fetchSnobTestFilms();
      setFilms(nextFilms);
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
    const url = window.location.href;

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
    <div className="min-h-screen bg-[#08080d] text-[#F5F5F0]">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#1a1a28] bg-[#08080d]/95 px-5 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-[family-name:var(--font-geist-mono)] text-[1.1rem] font-bold uppercase tracking-[0.15em] text-[#e8453c]"
          >
            Cine.Roll
          </Link>
          <span className="hidden rounded-full border border-[#D4AF37]/30 px-2.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#D4AF37] sm:inline-flex">
            Snob Test
          </span>
        </div>
        <SiteNavigation />
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-h-[calc(100vh-8.5rem)] flex-col gap-5">
            <div className="flex flex-col gap-4 border-b border-[#1a1a28] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#D4AF37]">
                  20-film awards gauntlet
                </p>
                <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-[#F5F5F0] sm:text-5xl">
                  The Snob Test
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-md border border-[#232333] px-3 py-2 text-right">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#888899]">
                    Seen
                  </p>
                  <p className="text-2xl font-semibold text-[#F5F5F0]">{selectedCount}/20</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="border-[#343449] bg-[#111118] text-[#F5F5F0] hover:bg-[#171720]"
                  onClick={() => void loadFilms()}
                  disabled={status === "loading" || status === "scoring"}
                >
                  <RefreshCw className={cn("h-4 w-4", status === "loading" && "animate-spin")} />
                  Again
                </Button>
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
                      className="aspect-[2/3] animate-pulse rounded-md border border-[#1c1c28] bg-[#111118]"
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
                        "group relative aspect-[2/3] overflow-hidden rounded-md border bg-[#111118] text-left",
                        "transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]",
                        selected
                          ? "border-[#D4AF37] shadow-[0_0_0_2px_rgba(212,175,55,0.22)]"
                          : "border-[#20202c] hover:border-[#D4AF37]/55",
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
                            selected && "brightness-75",
                          )}
                        />
                      ) : (
                        <PosterFallback title={film.title} color={film.posterColor} />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent p-3 pt-14">
                        <h2 className="line-clamp-2 font-[family-name:var(--font-display)] text-sm font-semibold leading-tight text-white">
                          {film.title}
                        </h2>
                        <div className="mt-1 flex items-center gap-2 text-xs text-[#c9c9d4]">
                          <span>{film.year}</span>
                          {film.imdbRating != null && <span>{film.imdbRating.toFixed(1)} IMDb</span>}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md",
                          selected
                            ? "border-[#D4AF37] bg-[#D4AF37] text-[#09090f]"
                            : "border-white/20 bg-black/50 text-white/60",
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            {!score ? (
              <div className="border border-[#242435] bg-[#101017] p-5">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Clapperboard className="h-4 w-4" />
                  <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest">
                    Your ballot
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#b8b8c6]">
                  Tick every film you have seen. No sign-in, no saved data, just a score you can share.
                </p>
                <Button
                  type="button"
                  size="lg"
                  className="mt-5 w-full bg-[#e8453c] text-[#F5F5F0] hover:bg-[#d7372f]"
                  disabled={status !== "ready"}
                  onClick={() => void submitScore()}
                >
                  <Trophy className="h-4 w-4" />
                  {status === "scoring" ? "Scoring..." : "See My Score"}
                </Button>
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

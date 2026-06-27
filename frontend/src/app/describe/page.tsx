"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import {
  fetchNaturalRoll,
  type NaturalRollError,
  type NaturalRollFilters,
  type NaturalRollInterpreted,
  type NaturalRollResult,
  type RollFilm,
} from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "Something sad but beautiful",
  "A dark French thriller from the 80s",
  "Something uplifting that won Best Picture",
  "The most obscure Cannes winner you have",
  "Hidden gem sci-fi from the 90s",
  "A film my dad would love",
];

const PROMPT_PLACEHOLDER = [
  "Describe the film you want tonight...",
  "Try: Something sad but beautiful",
  "Or: Une comedie francaise des annees 90",
  "Or: Ein ruhiger Oscar-Gewinner mit Drama",
].join("\n");

const AWARD_LABELS: Record<string, string> = {
  oscar: "Oscar",
  goldenglobe: "Golden Globe",
  cannes: "Cannes",
  all: "Award",
};

const LANGUAGE_LABELS: Record<string, string> = {
  fr: "French", it: "Italian", de: "German", ja: "Japanese",
  es: "Spanish", ko: "Korean", pt: "Portuguese", zh: "Chinese",
  ru: "Russian", sv: "Swedish", pl: "Polish", da: "Danish",
  nl: "Dutch", hi: "Hindi", ar: "Arabic", he: "Hebrew",
  tr: "Turkish", el: "Greek", cs: "Czech", hu: "Hungarian",
  fi: "Finnish", no: "Norwegian", ro: "Romanian", fa: "Persian",
};

function formatFilterChips(filters: NaturalRollFilters): string[] {
  const chips: string[] = [];
  const awardBody =
    typeof filters.awardBody === "string" ? filters.awardBody : undefined;

  if (awardBody) {
    const award = AWARD_LABELS[awardBody] ?? awardBody;
    if (filters.winnerOnly === true) {
      chips.push(`${award} winner`);
    } else if (filters.nominatedOnly === true) {
      chips.push(`${award} nominee`);
    } else if (awardBody !== "all") {
      chips.push(award);
    }
  } else if (filters.winnerOnly === true) {
    chips.push("Winner");
  } else if (filters.nominatedOnly === true) {
    chips.push("Nominee");
  }

  if (typeof filters.language === "string") {
    chips.push(LANGUAGE_LABELS[filters.language] ?? filters.language.toUpperCase());
  }
  if (typeof filters.genre === "string") chips.push(filters.genre);
  if (typeof filters.contentType === "string") chips.push(filters.contentType);
  if (typeof filters.person === "string") chips.push(filters.person);
  if (typeof filters.director === "string")
    chips.push(`Dir. ${filters.director}`);
  if (filters.femaleDirectorOnly === true) chips.push("Female director");

  const min =
    typeof filters.decadeMin === "number" ? filters.decadeMin : undefined;
  const max =
    typeof filters.decadeMax === "number" ? filters.decadeMax : undefined;
  if (
    min !== undefined &&
    max !== undefined &&
    min % 10 === 0 &&
    max === min + 9
  ) {
    chips.push(`${min}s`);
  } else if (min !== undefined && max !== undefined) {
    chips.push(`${min}-${max}`);
  } else if (min !== undefined) {
    chips.push(`${min}+`);
  } else if (max !== undefined) {
    chips.push(`Before ${max}`);
  }

  if (typeof filters.category === "string") chips.push(filters.category);
  if (typeof filters.awardYear === "number")
    chips.push(String(filters.awardYear));
  if (typeof filters.runtimeMax === "number")
    chips.push(`Under ${filters.runtimeMax} min`);
  if (typeof filters.imdbRatingMin === "number")
    chips.push(`IMDb ${filters.imdbRatingMin}+`);
  if (typeof filters.rtScoreMin === "number")
    chips.push(`RT ${filters.rtScoreMin}+`);
  if (filters.imdbTopMoviesOnly === true) chips.push("IMDb Top Movies");
  if (filters.imdbTopTvOnly === true) chips.push("IMDb Top TV");
  if (typeof filters.tvType === "string") chips.push(filters.tvType);
  if (typeof filters.certificate === "string") chips.push(filters.certificate);
  if (typeof filters.search === "string") chips.push(filters.search);

  return [...new Set(chips)];
}

function FilterChips({ chips }: { chips: string[] }) {
  if (chips.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#888899]">
        Searched for
      </p>
      <div className="flex min-w-0 flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="max-w-full break-words rounded-full border border-[#2a2a3e] bg-[#09090f]/70 px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.12em] text-[#F5F5F0] sm:text-[11px] sm:tracking-widest"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

const AWARD_BODIES = [
  { key: "oscar", label: "Oscar", wins: (f: RollFilm) => f.oscarWins, noms: (f: RollFilm) => f.oscarNominations },
  { key: "gg", label: "GG", wins: (f: RollFilm) => f.ggWins, noms: (f: RollFilm) => f.ggNominations },
  { key: "cannes", label: "Cannes", wins: (f: RollFilm) => f.cannesWins, noms: (f: RollFilm) => f.cannesNominations },
] as const;

function FilmCard({ film }: { film: RollFilm }) {
  const imageUrl = film.posterUrl ?? film.backdropUrl;
  const awardBodies = AWARD_BODIES.filter(b => b.noms(film) > 0);
  const genre = film.genres[0];

  return (
    <Link
      href={`/film/${film.slug}`}
      onClick={() => {
        trackEvent({
          type: "recommendation_click",
          filmId: film.id,
          context: {
            source: "natural_roll",
            slug: film.slug,
          },
        });
      }}
      className="group relative flex min-h-[260px] overflow-hidden rounded-lg border border-[#1e1e2a] bg-[#09090f]/70 transition-colors hover:border-[#e8453c]/40 sm:min-h-0"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${film.title} poster`}
          fill
          sizes="(min-width: 1024px) 20vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#09090f]" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/58 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#09090f]/30 to-transparent" />

      <div className="relative z-10 mt-auto flex min-w-0 flex-col gap-2 p-3 sm:p-4">
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-[#F5F5F0] line-clamp-2">
          {film.title}
        </h3>
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase leading-4 tracking-widest text-[#b6b6c6]">
          {film.year}
          {film.director ? ` · ${film.director}` : ""}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {genre && (
            <span className="rounded-full border border-[#F5F5F0]/20 bg-[#09090f]/70 px-2 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#F5F5F0]">
              {genre}
            </span>
          )}
          {film.imdbRating != null && (
            <span className="rounded-full border border-[#e8453c]/35 bg-[#09090f]/70 px-2 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest text-[#e8453c]">
              IMDb {film.imdbRating.toFixed(1)}
            </span>
          )}
        </div>

        {awardBodies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {awardBodies.map((b) => (
              <span
                key={b.key}
                className="rounded border border-[#2a2a3e] bg-[#09090f]/75 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#d8d8df]"
              >
                {b.label}{" "}
                {b.wins(film) > 0 && (
                  <span className="text-[#e8453c]">{b.wins(film)}W</span>
                )}
                {b.wins(film) > 0 && b.noms(film) > b.wins(film) && " "}
                {b.noms(film) > b.wins(film) && (
                  <span className="text-[#888899]">{b.noms(film) - b.wins(film)}N</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

// Single source for both the requested pick count and the skeleton grid, so the
// placeholder always matches the number of cards that replace it. Four fills the
// two-column results panel as two rows (backend allows up to 6).
const ROLL_COUNT = 4;

function SkeletonCard() {
  return (
    <div className="relative min-h-0 overflow-hidden rounded-lg border border-[#1e1e2a] bg-[#09090f]/70">
      <div className="absolute inset-0 bg-gradient-to-br from-[#15151f] to-[#0b0b12] motion-safe:animate-pulse" />
      <div className="relative z-10 flex h-full flex-col justify-end gap-2 p-3 sm:p-4">
        <div className="h-6 w-3/4 rounded bg-[#1e1e2a] motion-safe:animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-[#161622] motion-safe:animate-pulse" />
        <div className="h-5 w-16 rounded-full bg-[#161622] motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

/** Loading surface for the two-stage pipeline. Shows the interpreted-filter
 *  chips the instant Stage 1 streams back, with skeleton cards standing in for
 *  the picks while the rerank (Stage 2) finishes. */
function ProcessingPanel({ interpreted }: { interpreted: NaturalRollInterpreted | null }) {
  const chips = interpreted ? formatFilterChips(interpreted.interpretedFilters) : [];

  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#e8453c]/80 motion-safe:animate-pulse">
          {interpreted ? "Ranking picks" : "Reading description"}
        </p>
        {interpreted?.relaxed && (
          <span className="rounded-full border border-[#2a2a3e] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
            Relaxed filters
          </span>
        )}
        {chips.length > 0 && (
          <div className="ml-auto flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[#2a2a3e] bg-[#09090f]/70 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest text-[#F5F5F0]"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: ROLL_COUNT }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}

export default function DescribePage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<NaturalRollResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noMatchFilters, setNoMatchFilters] =
    useState<NaturalRollFilters | null>(null);
  // Interpreted filters arrive mid-stream (after Stage 1) so we can show the
  // "Searched for" chips while the rerank is still running.
  const [interpreted, setInterpreted] =
    useState<NaturalRollInterpreted | null>(null);

  async function handleSubmit() {
    if (!prompt.trim() || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setNoMatchFilters(null);
    setInterpreted(null);
    try {
      const nextResult = await fetchNaturalRoll(prompt, ROLL_COUNT, setInterpreted);
      setResult(nextResult);
      nextResult.films.forEach((film, index) => {
        trackEvent({
          type: "recommendation_served",
          filmId: film.id,
          context: {
            source: "natural_roll",
            rank: index + 1,
            promptLength: prompt.length,
            interpretedFilters: nextResult.interpretedFilters,
            relaxed: nextResult.relaxed,
          },
        });
      });
    } catch (err) {
      const naturalRollError = err as Partial<NaturalRollError>;
      if (
        naturalRollError.code === "NO_FILMS_FOUND" &&
        naturalRollError.interpretedFilters
      ) {
        setNoMatchFilters(naturalRollError.interpretedFilters);
      } else {
        setError(err instanceof Error ? err.message : "Natural roll failed");
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function handleReset() {
    setPrompt("");
    setResult(null);
    setError(null);
    setNoMatchFilters(null);
    setInterpreted(null);
    window.setTimeout(() => textareaRef.current?.focus(), 80);
  }

  const noMatchChips = noMatchFilters ? formatFilterChips(noMatchFilters) : [];
  const hasOutcome = Boolean(result || error || noMatchFilters);

  // Screen-reader status mirroring the progressive states the panel renders.
  const statusMessage = isProcessing
    ? interpreted
      ? `Interpreted${
          formatFilterChips(interpreted.interpretedFilters).length > 0
            ? ` as ${formatFilterChips(interpreted.interpretedFilters).join(", ")}`
            : ""
        }. Ranking the best picks…`
      : "Reading your description…"
    : error
      ? `Roll interrupted. ${error}`
      : noMatchFilters
        ? "No matching films. Try loosening the description."
        : result
          ? `${result.films.length} ${result.films.length === 1 ? "pick" : "picks"} ready.`
          : "";

  // At lg the cockpit fills the viewport *minus* the global footer (flex-1 inside
  // PageTransition) and scrolls its panels internally — so the page itself never
  // scrolls and the footer stays in view. Below lg the columns stack and the page
  // scrolls normally, so nothing — especially the CTA — gets clipped.
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden bg-[#09090f] text-[#F5F5F0] lg:min-h-0 lg:overflow-hidden">
      <AppHeader />

      <main className="min-h-0 min-w-0 flex-1 px-4 py-4 sm:px-8 lg:flex lg:flex-col lg:overflow-hidden lg:px-10 lg:py-5">
        <section className="grid min-h-0 min-w-0 gap-4 lg:flex-1 lg:grid-rows-[auto_minmax(0,1fr)]">
          <div className="shrink-0">
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#e8453c]/70 sm:text-[11px] sm:tracking-[0.3em]">
              ◈ Natural Language Roll ◈
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold leading-none tracking-tight text-[#F5F5F0] sm:text-5xl lg:text-6xl">
              Describe It
            </h1>
          </div>

          <div className="grid min-h-0 min-w-0 gap-5 lg:grid-cols-12">
            {/* Left: input panel */}
            <div className="flex min-h-0 min-w-0 flex-col lg:col-span-7">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-[#1e1e2a] bg-[#0d0d16] shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#1e1e2a] px-4 py-3 sm:gap-4 sm:px-5">
                  <span className="min-w-0 truncate font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-[#888899] sm:text-[11px] sm:tracking-widest">
                    Describe the mood, era, awards, or people
                  </span>
                  <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
                    {prompt.length}/500
                  </span>
                </div>

                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(event) =>
                    setPrompt(event.target.value.slice(0, 500))
                  }
                  onKeyDown={(event) => {
                    // ⌘/Ctrl+Enter rolls, matching the "type and roll" flow.
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                      event.preventDefault();
                      void handleSubmit();
                    }
                  }}
                  disabled={isProcessing}
                  placeholder={PROMPT_PLACEHOLDER}
                  className={cn(
                    // A usable height on mobile (no fixed viewport to fill); shrinks
                    // to fit inside the lg cockpit.
                    "min-h-[180px] flex-1 resize-none bg-transparent px-4 py-4 outline-none sm:px-5 sm:py-5 lg:min-h-0",
                    // Mono for the editorial feel, but NOT uppercase/letter-spaced:
                    // forcing those on what the user types hurts legibility and mangles
                    // accented/non-Latin input (e.g. the French/German example prompts).
                    "font-[family-name:var(--font-geist-mono)] text-[0.8rem] leading-7 tracking-normal text-[#8d8da1] lg:text-[0.8rem] lg:leading-8",
                    "placeholder:text-[#888899]",
                    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e8453c]",
                  )}
                  aria-label="Describe the kind of film you want"
                />

                <div className="shrink-0 border-t border-[#1e1e2a] px-4 py-4 sm:px-5">
                  <div className="mb-4 flex min-w-0 flex-wrap gap-2">
                    {EXAMPLE_PROMPTS.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setPrompt(example)}
                        disabled={isProcessing}
                        className={cn(
                          "max-w-full whitespace-normal break-words rounded-full border border-[#2a2a3e] px-3 py-1.5 text-left",
                          "font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-[#888899] sm:text-[11px] sm:tracking-widest",
                          "transition-colors hover:border-[#e8453c]/45 hover:text-[#F5F5F0]",
                          "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#2a2a3e]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                        )}
                      >
                        {example}
                      </button>
                    ))}
                  </div>

                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    {hasOutcome && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={isProcessing}
                        className={cn(
                          "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-[#2a2a3e] px-4 sm:px-5",
                          "font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.12em] text-[#F5F5F0] sm:text-[11px] sm:tracking-widest",
                          "transition-colors hover:border-[#e8453c]/45 hover:text-[#e8453c]",
                          "disabled:cursor-not-allowed disabled:opacity-40",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                          "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
                        )}
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                        Reset
                      </button>
                    )}

                    <button
                      type="button"
                      title="⌘/Ctrl + Enter"
                      onClick={() => void handleSubmit()}
                      disabled={!prompt.trim() || isProcessing}
                      className={cn(
                        // The single primary action: full-width, tall, solid accent —
                        // the loudest element in the panel, not a corner-floated button.
                        "inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 sm:px-5",
                        "bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-[#F5F5F0] sm:text-xs sm:tracking-widest",
                        "transition-colors hover:bg-[#d5342b]",
                        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#e8453c]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                        "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
                      )}
                    >
                      {isProcessing ? (
                        <span className="motion-safe:animate-pulse">
                          Asking the algorithm…
                        </span>
                      ) : (
                        <>
                          <span className="min-w-0 text-center">Roll From Description</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: results panel */}
            <div
              aria-live="polite"
              aria-busy={isProcessing}
              className={cn(
                "min-h-[420px] min-w-0 rounded-lg border border-[#1a1a28] bg-[#0d0d16] lg:col-span-5 lg:min-h-0",
                // Internal scrolling only in the fixed lg cockpit; on mobile the
                // panel grows with its content and the page scrolls normally.
                result
                  ? "lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:w-0"
                  : "lg:overflow-hidden",
              )}
            >
              <p className="sr-only" role="status">
                {statusMessage}
              </p>
              {isProcessing ? (
                <ProcessingPanel interpreted={interpreted} />
              ) : error ? (
                <div className="flex h-full flex-col justify-center p-6">
                  <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#e8453c]/70">
                    Roll interrupted
                  </p>
                  <p className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#F5F5F0]">
                    {error}
                  </p>
                </div>
              ) : noMatchFilters ? (
                <div className="flex h-full flex-col justify-center p-6">
                  <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#e8453c]/70">
                    No matching films
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[#F5F5F0]">
                    Try loosening the description.
                  </h2>
                  <p className="mt-3 max-w-xl font-[family-name:var(--font-geist-mono)] text-[11px] uppercase leading-5 tracking-widest text-[#8d8da1]">
                    Gemini understood the request, but the film pool came back
                    empty. Remove a year, award, rating, or exact person and
                    roll again.
                  </p>
                  <FilterChips chips={noMatchChips} />
                </div>
              ) : result ? (
                <div className="flex h-full min-h-0 min-w-0 flex-col p-4">
                  <div className="mb-3 flex min-w-0 shrink-0 flex-wrap items-center gap-2">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#e8453c]/80 sm:text-[11px] sm:tracking-[0.24em]">
                      {result.films.length === 1 ? "Your roll" : `${result.films.length} picks`}
                    </p>
                    {result.relaxed && (
                      <span className="rounded-full border border-[#2a2a3e] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
                        Relaxed filters
                      </span>
                    )}
                    <div className="flex min-w-0 flex-wrap gap-1.5 sm:ml-auto">
                      {formatFilterChips(result.interpretedFilters).map((chip) => (
                        <span
                          key={chip}
                          className="max-w-full break-words rounded-full border border-[#2a2a3e] bg-[#09090f]/70 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.12em] text-[#F5F5F0] sm:text-[11px] sm:tracking-widest"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                    {result.films.map((film) => (
                      <FilmCard key={film.id} film={film} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-w-0 flex-col p-5 sm:p-6">
                  <div>
                    <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#e8453c]/70 sm:text-[11px] sm:tracking-[0.24em]">
                      Channel 04 · Describe
                    </p>
                    {/* Demoted to a subtitle so "Describe It" is the page's single
                        serif hero — not two display headlines competing. */}
                    <p className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-tight text-[#b6b6c6]">
                      A sentence is enough.
                    </p>
                  </div>

                  {/* A worked example fills the panel instead of leaving a void, and
                      previews the actual payoff: free text → interpreted filters →
                      films (the same chip UI a real roll renders above). */}
                  <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 py-6">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#888899]">
                      For example, you type
                    </p>
                    <p className="break-words font-[family-name:var(--font-geist-mono)] text-sm leading-6 text-[#b6b6c6]">
                      “A dark French thriller from the 80s”
                    </p>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#888899] sm:tracking-[0.24em]">
                        We read
                      </span>
                      <span className="h-px flex-1 bg-[#1e1e2a]" />
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      {["French", "Thriller", "1980s"].map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-[#2a2a3e] bg-[#09090f]/70 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.12em] text-[#F5F5F0] sm:text-[11px] sm:tracking-widest"
                        >
                          {chip}
                        </span>
                      ))}
                      <span className="max-w-full break-words font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.12em] text-[#888899] sm:text-[11px] sm:tracking-widest">
                        → four films rolled
                      </span>
                    </div>
                  </div>

                  {/* The parser's full reach, as one prose line — not a second grid
                      of category "tiles" competing with the left-hand starter
                      prompts. Free text is the single input paradigm. */}
                  <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase leading-5 tracking-[0.18em] text-[#7a7a8c]">
                    Reads mood, era, awards, genre &amp; director — in any language.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import {
  fetchNaturalRoll,
  type NaturalRollError,
  type NaturalRollFilters,
  type NaturalRollResult,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "Something sad but beautiful",
  "A film my dad would love",
  "The most obscure Cannes winner you have",
];

const AWARD_LABELS: Record<string, string> = {
  oscar: "Oscar",
  goldenglobe: "Golden Globe",
  cannes: "Cannes",
  all: "Award",
};

function formatFilterChips(filters: NaturalRollFilters): string[] {
  const chips: string[] = [];
  const awardBody = typeof filters.awardBody === "string" ? filters.awardBody : undefined;

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

  if (typeof filters.genre === "string") chips.push(filters.genre);
  if (typeof filters.contentType === "string") chips.push(filters.contentType);
  if (typeof filters.person === "string") chips.push(filters.person);
  if (typeof filters.director === "string") chips.push(`Dir. ${filters.director}`);
  if (filters.femaleDirectorOnly === true) chips.push("Female director");

  const min = typeof filters.decadeMin === "number" ? filters.decadeMin : undefined;
  const max = typeof filters.decadeMax === "number" ? filters.decadeMax : undefined;
  if (min !== undefined && max !== undefined && min % 10 === 0 && max === min + 9) {
    chips.push(`${min}s`);
  } else if (min !== undefined && max !== undefined) {
    chips.push(`${min}-${max}`);
  } else if (min !== undefined) {
    chips.push(`${min}+`);
  } else if (max !== undefined) {
    chips.push(`Before ${max}`);
  }

  if (typeof filters.category === "string") chips.push(filters.category);
  if (typeof filters.awardYear === "number") chips.push(String(filters.awardYear));
  if (typeof filters.runtimeMax === "number") chips.push(`Under ${filters.runtimeMax} min`);
  if (typeof filters.imdbRatingMin === "number") chips.push(`IMDb ${filters.imdbRatingMin}+`);
  if (typeof filters.rtScoreMin === "number") chips.push(`RT ${filters.rtScoreMin}+`);
  if (filters.imdbTopMoviesOnly === true) chips.push("IMDb Top Movies");
  if (filters.imdbTopTvOnly === true) chips.push("IMDb Top TV");
  if (typeof filters.tvType === "string") chips.push(filters.tvType);
  if (typeof filters.certificate === "string") chips.push(filters.certificate);
  if (typeof filters.search === "string") chips.push(filters.search);

  return [...new Set(chips)];
}

export default function DescribePage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<NaturalRollResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noMatchFilters, setNoMatchFilters] = useState<NaturalRollFilters | null>(null);

  async function handleSubmit() {
    if (!prompt.trim() || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setNoMatchFilters(null);
    try {
      setResult(await fetchNaturalRoll(prompt));
    } catch (err) {
      const naturalRollError = err as Partial<NaturalRollError>;
      if (naturalRollError.code === "NO_FILMS_FOUND" && naturalRollError.interpretedFilters) {
        setNoMatchFilters(naturalRollError.interpretedFilters);
      } else {
        setError(err instanceof Error ? err.message : "Natural roll failed");
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function handleRefine() {
    setResult(null);
    setError(null);
    setNoMatchFilters(null);
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => textareaRef.current?.focus(), 120);
  }

  const interpretedChips = result ? formatFilterChips(result.interpretedFilters) : [];
  const noMatchChips = noMatchFilters ? formatFilterChips(noMatchFilters) : [];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />

      <main className="flex flex-1 flex-col overflow-y-auto px-5 py-5 [scrollbar-width:none] sm:px-8 lg:px-10 lg:py-7 [&::-webkit-scrollbar]:w-0">
        <section className="flex min-h-full flex-col">
          <div className="mb-5 flex flex-col gap-2">
            <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#e8453c]/70">
              ◈ Natural Language Roll ◈
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none tracking-tight text-[#F5F5F0] sm:text-6xl">
              Describe It
            </h1>
          </div>

          <div className="flex flex-1 flex-col rounded-lg border border-[#1e1e2a] bg-[#0d0d16]">
            <div className="flex items-center justify-between gap-4 border-b border-[#1e1e2a] px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center">
                <span className="truncate font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest text-[#888899]">
                  Describe in any language
                </span>
              </div>
              <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#444458]">
                {prompt.length}/500
              </span>
            </div>

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value.slice(0, 500))}
              disabled={isProcessing}
              placeholder={`${EXAMPLE_PROMPTS[0]}\n${EXAMPLE_PROMPTS[1]}\n${EXAMPLE_PROMPTS[2]}`}
              className={cn(
                "min-h-[360px] flex-1 resize-none bg-transparent px-4 py-4 outline-none sm:px-5 sm:py-5",
                "font-[family-name:var(--font-geist-sans)] text-xl leading-8 text-[#F5F5F0] sm:text-2xl sm:leading-9",
                "placeholder:text-[#3a3a4d]",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e8453c]",
              )}
              aria-label="Describe the kind of film you want"
            />

            <div className="flex flex-col gap-4 border-t border-[#1e1e2a] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setPrompt(example)}
                    disabled={isProcessing}
                    className={cn(
                      "rounded-full border border-[#2a2a3e] px-3 py-1.5 text-left",
                      "font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-widest text-[#888899]",
                      "transition-colors hover:border-[#e8453c]/45 hover:text-[#F5F5F0]",
                      "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#2a2a3e]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                    )}
                  >
                    {example}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!prompt.trim() || isProcessing}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5",
                  "bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest text-[#F5F5F0]",
                  "transition-colors hover:bg-[#d5342b]",
                  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#e8453c]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
                )}
              >
                {isProcessing ? (
                  <span className="motion-safe:animate-pulse">Asking the algorithm…</span>
                ) : (
                  <>
                    Roll From Description
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </>
                )}
              </button>
            </div>
          </div>

          {(result || error || noMatchFilters) && (
            <div className="mt-5 rounded-lg border border-[#1e1e2a] bg-[#0d0d16] p-4 sm:p-5">
              {error ? (
                <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase leading-5 tracking-widest text-[#e8453c]">
                  {error}
                </p>
              ) : noMatchFilters ? (
                <div>
                  <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.24em] text-[#e8453c]/70">
                    No matching films
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#F5F5F0]">
                    Try loosening the description.
                  </h2>
                  <p className="mt-2 max-w-2xl font-[family-name:var(--font-geist-mono)] text-[10px] uppercase leading-5 tracking-widest text-[#66667a]">
                    Gemini interpreted the request, but the film pool came back empty.
                    Remove a year, award, rating, or exact person and roll again.
                  </p>

                  {noMatchChips.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.22em] text-[#555568]">
                        Searched for
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {noMatchChips.map((chip) => (
                          <span
                            key={chip}
                            className="rounded-full border border-[#2a2a3e] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-widest text-[#F5F5F0]"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRefine}
                    className={cn(
                      "mt-5 inline-flex h-10 w-fit items-center justify-center rounded-full border border-[#2a2a3e] px-4",
                      "font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest text-[#F5F5F0]",
                      "transition-colors hover:border-[#e8453c]/45 hover:text-[#e8453c]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
                    )}
                  >
                    Refine
                  </button>
                </div>
              ) : result ? (
                <div className="grid gap-4 lg:grid-cols-[140px_1fr]">
                  <Link
                    href={`/film/${result.film.slug}`}
                    className="relative block aspect-[2/3] overflow-hidden rounded-md border border-[#1e1e2a] bg-[#111118]"
                    aria-label={`${result.film.title} (${result.film.year})`}
                  >
                    {result.film.posterUrl ? (
                      <Image
                        src={result.film.posterUrl}
                        alt={`${result.film.title} poster`}
                        fill
                        sizes="140px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#555568]">
                        No poster
                      </div>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-col justify-center">
                    <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.24em] text-[#e8453c]/70">
                      Your roll
                    </p>
                    <Link
                      href={`/film/${result.film.slug}`}
                      className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#F5F5F0] transition-colors hover:text-[#e8453c]"
                    >
                      {result.film.title}
                    </Link>
                    <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#66667a]">
                      {result.film.year}
                      {result.film.director ? ` · Dir. ${result.film.director}` : ""}
                    </p>

                    {interpretedChips.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.22em] text-[#555568]">
                          Searched for
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {interpretedChips.map((chip) => (
                            <span
                              key={chip}
                              className="rounded-full border border-[#2a2a3e] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-widest text-[#F5F5F0]"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleRefine}
                      className={cn(
                        "mt-5 inline-flex h-10 w-fit items-center justify-center rounded-full border border-[#2a2a3e] px-4",
                        "font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest text-[#F5F5F0]",
                        "transition-colors hover:border-[#e8453c]/45 hover:text-[#e8453c]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                        "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
                      )}
                    >
                      Refine
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

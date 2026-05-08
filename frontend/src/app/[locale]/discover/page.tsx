"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ArrowRight, RotateCcw, Bookmark } from "lucide-react";
import { SiteNavigation } from "@/components/site-navigation";
import { fetchFilms, type RollFilm } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { FilterState, AwardBody } from "@cineroll/types";
import type { PaginatedFilms } from "@cineroll/types";

// ── Prompt examples ───────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  "A dark French thriller from the 80s",
  "Something uplifting that won Best Picture",
  "Classic noir with a twist",
  "Hidden gem sci-fi from the 90s",
  "Cannes Palme d'Or winner, not too long",
  "An emotional drama with an 8+ IMDb rating",
  "Comedy nominated for a Golden Globe",
  "War film that won an Oscar",
];

const PLACEHOLDER_CYCLE = [
  "A sad French film from the 80s…",
  "Something like Blade Runner but lighter…",
  "Award-winning comedy from the 90s…",
  "Hidden gem with 8+ IMDb rating…",
  "Classic Cannes winner, under 2 hours…",
];

// ── Prompt parser ─────────────────────────────────────────────────────────────

type ParsedFilters = Partial<FilterState> & { summary: string[] };

function parsePrompt(prompt: string): ParsedFilters {
  const lower = prompt.toLowerCase();
  const filters: Partial<FilterState> = {};
  const summary: string[] = [];

  // Decades
  const decadePatterns: [RegExp, number, number, string][] = [
    [/\b(1920s?|twenties)\b/, 1920, 1929, "1920s"],
    [/\b(1930s?|thirties)\b/, 1930, 1939, "1930s"],
    [/\b(1940s?|forties)\b/, 1940, 1949, "1940s"],
    [/\b(1950s?|fifties)\b/, 1950, 1959, "1950s"],
    [/\b(1960s?|sixties)\b/, 1960, 1969, "1960s"],
    [/\b(1970s?|seventies)\b/, 1970, 1979, "1970s"],
    [/\b(1980s?|eighties?|'80s?)\b/, 1980, 1989, "1980s"],
    [/\b(1990s?|nineties?|'90s?)\b/, 1990, 1999, "1990s"],
    [/\b(2000s?|noughties)\b/, 2000, 2009, "2000s"],
    [/\b(2010s?)\b/, 2010, 2019, "2010s"],
    [/\b(2020s?|recent|new|latest|modern)\b/, 2015, 2030, "Recent"],
    [/\b(classic|old|vintage|golden age)\b/, 1920, 1979, "Classic era"],
  ];
  for (const [re, min, max, label] of decadePatterns) {
    if (re.test(lower)) {
      filters.decadeMin = min;
      filters.decadeMax = max;
      summary.push(label);
      break;
    }
  }

  // Genres
  const genrePatterns: [RegExp, string][] = [
    [/\b(horror|scary|frightening)\b/, "Horror"],
    [/\b(thriller|suspense)\b/, "Thriller"],
    [/\b(comedy|funny|laugh|comic|humour)\b/, "Comedy"],
    [/\b(drama|dramatic|emotional|moving|sad)\b/, "Drama"],
    [/\b(romance|romantic|love story)\b/, "Romance"],
    [/\b(action|adventure)\b/, "Action"],
    [/\b(sci-?fi|science fiction|futuristic|space)\b/, "Science Fiction"],
    [/\b(documentary|doc)\b/, "Documentary"],
    [/\b(animation|animated|cartoon)\b/, "Animation"],
    [/\b(crime|heist|gangster|mob)\b/, "Crime"],
    [/\b(mystery|whodunit)\b/, "Mystery"],
    [/\b(fantasy|magical)\b/, "Fantasy"],
    [/\b(war|military|combat)\b/, "War"],
    [/\b(western|cowboy)\b/, "Western"],
    [/\b(musical|music)\b/, "Music"],
    [/\b(biography|biopic|based on a true)\b/, "Biography"],
    [/\b(noir|dark|bleak)\b/, "Thriller"],
    [/\b(feel.?good|uplifting|heartwarming)\b/, "Drama"],
  ];
  for (const [re, genre] of genrePatterns) {
    if (re.test(lower)) {
      filters.genre = genre;
      summary.push(genre);
      break;
    }
  }

  // Award bodies
  if (/\b(oscar|academy award|academy)\b/.test(lower)) {
    filters.awardBody = "oscar" as AwardBody;
    summary.push("Oscar");
  } else if (/\b(cannes|palme d.or|palme)\b/.test(lower)) {
    filters.awardBody = "cannes" as AwardBody;
    summary.push("Cannes");
  } else if (/\b(golden globe|gg)\b/.test(lower)) {
    filters.awardBody = "goldenglobe" as AwardBody;
    summary.push("Golden Globe");
  }

  // Win / nominated
  if (/\b(won|winner|winning|win)\b/.test(lower)) {
    filters.winnerOnly = true;
    summary.push("Winners only");
  } else if (/\b(nominated|nomination)\b/.test(lower)) {
    filters.nominatedOnly = true;
    summary.push("Nominated");
  }

  // IMDb rating hints
  if (/\b(masterpiece|perfect|greatest|all.?time)\b/.test(lower)) {
    filters.imdbRatingMin = 8.5;
    summary.push("IMDb 8.5+");
  } else if (/\b(acclaimed|highly rated|critically|must.?watch|best)\b/.test(lower)) {
    filters.imdbRatingMin = 8;
    summary.push("IMDb 8+");
  } else if (/\b(hidden gem|underrated|overlooked|underseen)\b/.test(lower)) {
    filters.imdbRatingMin = 7;
    summary.push("Hidden Gem");
  }

  // Director / person search
  const personMatch = lower.match(
    /(?:by|directed by|from|starring|with)\s+([a-z]+(?:\s+[a-z]+)?)/,
  );
  if (personMatch?.[1]) {
    const name = personMatch[1];
    if (!["the", "a", "an", "it", "is"].includes(name.split(" ")[0] ?? "")) {
      filters.person = name;
      summary.push(`Person: ${name}`);
    }
  }

  return { ...filters, summary };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; films: PaginatedFilms["films"]; total: number; summary: string[] }
  | { status: "error" };

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ status: "idle" });
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle placeholder text
  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_CYCLE.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  async function handleSearch(q = query) {
    if (!q.trim()) return;
    setSearch({ status: "loading" });
    const { summary, ...filters } = parsePrompt(q);
    try {
      const result = await fetchFilms(filters, 12);
      setSearch({
        status: "done",
        films: result.films,
        total: result.total,
        summary,
      });
    } catch {
      setSearch({ status: "error" });
    }
  }

  function handleExample(prompt: string) {
    setQuery(prompt);
    void handleSearch(prompt);
    inputRef.current?.focus();
  }

  function handleReset() {
    setQuery("");
    setSearch({ status: "idle" });
    inputRef.current?.focus();
  }

  const currentPlaceholder = PLACEHOLDER_CYCLE[placeholderIndex] ?? PLACEHOLDER_CYCLE[0] ?? "";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#1a1a28] bg-[#09090f] px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-[family-name:var(--font-geist-mono)] text-[1.1rem] font-bold uppercase tracking-[0.15em] text-[#e8453c]"
          >
            Cine·Roll
          </Link>
          <span className="hidden items-center rounded-full border border-[#e8453c]/25 px-2.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#e8453c]/55 sm:inline-flex">
            AI Discover
          </span>
        </div>
        <SiteNavigation />
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0">
        {/* Hero input section */}
        <div
          className={cn(
            "flex flex-col items-center px-6 transition-all duration-500",
            search.status === "idle" || search.status === "loading"
              ? "justify-center flex-1 gap-8 py-16"
              : "gap-6 py-10 border-b border-[#1a1a28]",
          )}
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(232,69,60,0.06)_0%,transparent_60%)]" />

          <div className="flex flex-col items-center gap-2 text-center">
            <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#e8453c]/70">
              ◈ Natural Language Discovery ◈
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0] sm:text-4xl lg:text-5xl">
              What are you in the{" "}
              <span className="text-[#e8453c]">mood for?</span>
            </h1>
            <p className="max-w-md font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#555568]">
              Describe it in plain English — we'll find the films
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full max-w-2xl">
            <div className="relative flex items-center rounded-2xl border border-[#1e1e2a] bg-[#0d0d1a] transition-colors focus-within:border-[#e8453c]/50">
              <Sparkles className="ml-4 h-4 w-4 shrink-0 text-[#e8453c]/50" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
                placeholder={currentPlaceholder}
                className={cn(
                  "flex-1 bg-transparent px-3 py-4 outline-none",
                  "font-[family-name:var(--font-geist-sans)] text-sm text-[#F5F5F0]",
                  "placeholder:text-[#333348]",
                )}
              />
              {query && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="mr-2 rounded-full p-1.5 text-[#444458] transition-colors hover:text-[#F5F5F0]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleSearch()}
                disabled={!query.trim() || search.status === "loading"}
                className={cn(
                  "m-1.5 flex items-center gap-2 rounded-xl px-4 py-2.5",
                  "font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest",
                  "bg-[#e8453c] text-white transition-all",
                  "hover:bg-[#d5342b] disabled:opacity-40",
                )}
              >
                {search.status === "loading" ? (
                  <span className="animate-pulse">···</span>
                ) : (
                  <>
                    Find <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Example prompts */}
          {(search.status === "idle" || search.status === "loading") && (
            <div className="flex max-w-2xl flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleExample(p)}
                  className={cn(
                    "rounded-full border border-[#1e1e2a] px-3 py-1.5",
                    "font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]",
                    "transition-colors hover:border-[#e8453c]/40 hover:text-[#F5F5F0]",
                    query === p && "border-[#e8453c]/40 text-[#F5F5F0]",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <AnimatePresence>
          {search.status === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 px-6 py-8 sm:px-10"
            >
              {/* Interpreted as */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
                  Interpreted as:
                </span>
                {search.summary.length > 0 ? (
                  search.summary.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#e8453c]/30 bg-[#e8453c]/8 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#e8453c]"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#444458]">
                    Open search (no specific filters detected)
                  </span>
                )}
                <span className="ml-auto font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#444458]">
                  {search.total} films found
                </span>
              </div>

              {search.films.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <Search className="h-8 w-8 text-[#222234]" />
                  <p className="font-[family-name:var(--font-display)] text-xl text-[#222234]">
                    No films matched your description
                  </p>
                  <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#333348]">
                    Try a broader description or different keywords
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {search.films.map((film, i) => (
                    <ResultCard key={film.id} film={film} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {search.status === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-16 text-center"
            >
              <p className="font-[family-name:var(--font-display)] text-xl text-[#e8453c]/60">
                Something went wrong
              </p>
              <button
                type="button"
                onClick={() => void handleSearch()}
                className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568] hover:text-[#F5F5F0]"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ResultCard({ film, index }: { film: RollFilm; index: number }) {
  const imageUrl = film.backdropUrl ?? film.posterUrl;
  const genre = film.genres[0] ?? "";
  const totalWins = film.oscarWins + film.ggWins + film.cannesWins;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 28 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] transition-colors hover:border-[#2a2a3e]"
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={film.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#09090f]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/80 to-transparent" />
        {totalWins > 0 && (
          <span className="absolute bottom-2 left-2 rounded-full border border-[#e8453c]/30 bg-[#09090f]/80 px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#e8453c]">
            {totalWins}× Winner
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-[family-name:var(--font-display)] text-base font-bold leading-tight text-[#F5F5F0]">
            {film.title}
          </h3>
          <button
            type="button"
            aria-label="Bookmark"
            className="mt-0.5 shrink-0 text-[#333348] transition-colors hover:text-[#e8453c]"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
          {film.year}{genre && ` · ${genre}`}
        </p>

        {film.director && (
          <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#444458]">
            Dir. {film.director}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Link
            href={`/film/${film.slug}`}
            className="flex flex-1 items-center justify-center rounded-lg bg-[#e8453c] py-2 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#d5342b]"
          >
            View Film
          </Link>
          {film.imdbRating != null && (
            <span className="font-[family-name:var(--font-geist-mono)] text-[9px] font-bold text-[#888899]">
              {film.imdbRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

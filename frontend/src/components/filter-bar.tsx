"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Globe, Link2, PawPrint, TreePalm, X } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { filtersToParams } from "@/lib/api";
import { cn, nameToSlug } from "@/lib/utils";
import type { FilterState, AwardBodyFilter } from "@cineroll/types";

interface FilterBarProps {
  filters: FilterState;
  genres: string[];
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onClearFilters: () => void;
  className?: string;
}

const DECADE_MIN = 1900;
const DECADE_MAX = 2030;


const AWARD_BODIES: { value: AwardBodyFilter; label: string }[] = [
  { value: "oscar", label: "Oscar" },
  { value: "goldenglobe", label: "Golden Globe" },
  { value: "cannes", label: "Cannes" },
  { value: "berlin", label: "Berlinale" },
];

const CONTENT_TYPES: { value: string; label: string }[] = [
  { value: "movie", label: "Movie" },
  { value: "short", label: "Short" },
  { value: "animation", label: "Animation" },
  { value: "documentary", label: "Documentary" },
  { value: "tv-series", label: "TV Series" },
];

/** Add/remove `value` in a multi-select facet array. */
function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function awardBodyName(body: AwardBodyFilter): string {
  return AWARD_BODIES.find((b) => b.value === body)?.label ?? body;
}

export function FilterBar({
  filters,
  genres,
  onFiltersChange,
  onClearFilters,
  className,
}: FilterBarProps) {
  const activeChips = getActiveFilterChips(filters, onFiltersChange);
  const recipe = buildRollRecipe(filters);
  const [isCopied, setIsCopied] = React.useState(false);

  async function handleShareFilters() {
    const params = filtersToParams(filters);
    const url = `${window.location.origin}/browse?${params.toString()}`;
    const captionText = recipe ? `Rolling from: ${recipe}` : "My CineRoll filters";

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "CineRoll — My Roll Recipe", text: captionText, url });
        return;
      } catch { /* user cancelled or API unavailable */ }
    }

    try {
      await navigator.clipboard.writeText(`${captionText}\n${url}`);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2500);
    } catch { /* ignore */ }
  }

  return (
    <div
      aria-label="Filter films"
      className={cn("flex flex-col gap-3", className)}
    >
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#686880]">
        Build Your Roll
      </p>

      {/* AWARDS — bodies are multi-select (combine Oscar + Golden Globe, etc.);
          the IMDb lists are independent toggles that can coexist with them. */}
      <FilterRow label="Awards">
        <PillToggle
          active={filters.awardBodies.length === 0}
          onClick={() => onFiltersChange({ awardBodies: [], page: 1 })}
        >
          All
        </PillToggle>
        {AWARD_BODIES.map(({ value, label }) => (
          <PillToggle
            key={value}
            active={filters.awardBodies.includes(value)}
            onClick={() =>
              onFiltersChange({ awardBodies: toggleValue(filters.awardBodies, value), page: 1 })
            }
          >
            <span className="inline-flex items-center gap-1">
              {value === "oscar" && <OscarIcon />}
              {value === "goldenglobe" && <Globe className="h-[14px] w-[14px] shrink-0" aria-hidden />}
              {value === "cannes" && <TreePalm className="h-[14px] w-[14px] shrink-0" aria-hidden />}
              {value === "berlin" && <PawPrint className="h-[14px] w-[14px] shrink-0" aria-hidden />}
              {label}
            </span>
          </PillToggle>
        ))}
        <PillToggle
          active={filters.imdbTopMoviesOnly}
          onClick={() =>
            onFiltersChange({
              imdbTopMoviesOnly: !filters.imdbTopMoviesOnly,
              imdbTopTvOnly: false,
              page: 1,
            })
          }
        >
          IMDb Top 250 Movies
        </PillToggle>
        <PillToggle
          active={filters.imdbTopTvOnly}
          onClick={() =>
            onFiltersChange({
              imdbTopTvOnly: !filters.imdbTopTvOnly,
              imdbTopMoviesOnly: false,
              page: 1,
            })
          }
        >
          IMDb Top 250 Shows
        </PillToggle>
      </FilterRow>

      {/* STATUS */}
      <FilterRow label="Status">
        <PillToggle
          active={!filters.winnerOnly && !filters.nominatedOnly}
          onClick={() =>
            onFiltersChange({
              winnerOnly: false,
              nominatedOnly: false,
              page: 1,
            })
          }
        >
          Any
        </PillToggle>
        <PillToggle
          active={filters.winnerOnly}
          onClick={() =>
            onFiltersChange({ winnerOnly: true, nominatedOnly: false, page: 1 })
          }
        >
          Won
        </PillToggle>
        <PillToggle
          active={filters.nominatedOnly && !filters.winnerOnly}
          onClick={() =>
            onFiltersChange({ winnerOnly: false, nominatedOnly: true, page: 1 })
          }
        >
          Nominated
        </PillToggle>
      </FilterRow>

      {/* TYPE — multi-select; "All" clears the selection */}
      <FilterRow label="Type">
        <PillToggle
          active={filters.contentTypes.length === 0}
          onClick={() => onFiltersChange({ contentTypes: [], page: 1 })}
        >
          All
        </PillToggle>
        {CONTENT_TYPES.map(({ value, label }) => (
          <PillToggle
            key={value}
            active={filters.contentTypes.includes(value)}
            onClick={() => onFiltersChange({ contentTypes: toggleValue(filters.contentTypes, value), page: 1 })}
          >
            {label}
          </PillToggle>
        ))}
      </FilterRow>

      {/* GENRE */}
      <FilterRow label="Genre">
        <MultiSelect
          ariaLabel="Genre"
          selected={filters.genres}
          onChange={(vals) => onFiltersChange({ genres: vals, page: 1 })}
          placeholder="All"
          searchable
          variant="pill"
          options={genres.map((genre) => ({ value: genre, label: genre }))}
        />
      </FilterRow>

      {/* Active filter chips */}
      <AnimatePresence>
        {activeChips.length > 0 && (
          <motion.div
            key="chips-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 -mt-1 mb-1"
          >
            <div className="relative flex flex-1 flex-wrap gap-1.5">
              <AnimatePresence mode="popLayout">
                {activeChips.map((chip) => (
                  <motion.div
                    key={chip.key}
                    layout
                    initial={{ opacity: 0, scale: 0.85, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cn(
                      "inline-flex h-6 items-center gap-0 rounded-full",
                      "border border-[#25253a] bg-[#0d0d1a]",
                      "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-[#9898b8]",
                    )}
                  >
                    {chip.href && (
                      <Link
                        href={chip.href}
                        className="flex h-full items-center pl-2.5 pr-1 transition-colors hover:text-[#e8453c]"
                        title="View profile"
                      >
                        <ArrowUpRight className="h-3 w-3" aria-hidden />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className={cn(
                        "flex h-full items-center gap-1 transition-colors hover:text-[#F5F5F0]",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c] focus-visible:rounded-full",
                        chip.href ? "pr-2.5" : "px-2.5",
                      )}
                      aria-label={`Remove ${chip.label} filter`}
                    >
                      {chip.label}
                      <X className="h-2.5 w-2.5 shrink-0 text-[#9090a8]" aria-hidden />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={onClearFilters}
              className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#9090a8] transition-colors hover:text-[#e8453c] focus-visible:outline-none"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roll Recipe + share */}
      {recipe && (
        <p className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-wide text-[#686880]">
          <span className="min-w-0">
            <span className="text-[#444458]">Rolling from:</span>{" "}{recipe}
          </span>
          <button
            type="button"
            onClick={() => void handleShareFilters()}
            title="Share these filters"
            aria-label="Share these filters"
            className="shrink-0 text-[#444458] transition-colors hover:text-[#e8453c] focus-visible:outline-none focus-visible:text-[#e8453c]"
          >
            {isCopied
              ? <Check className="h-3 w-3" aria-hidden />
              : <Link2 className="h-3 w-3" aria-hidden />}
          </button>
        </p>
      )}
    </div>
  );
}

function buildRollRecipe(filters: FilterState): string {
  const parts: string[] = [];

  if (filters.imdbTopMoviesOnly) parts.push("IMDb Top 250 Movies");
  if (filters.imdbTopTvOnly) parts.push("IMDb Top 250 Shows");

  const bodyLabel = filters.awardBodies.length > 0
    ? filters.awardBodies.map(awardBodyName).join(" & ")
    : null;
  if (bodyLabel !== null) {
    if (filters.winnerOnly) parts.push(`${bodyLabel} winners`);
    else if (filters.nominatedOnly) parts.push(`${bodyLabel} nominations`);
    else parts.push(`${bodyLabel} films`);
  } else if (!filters.imdbTopMoviesOnly && !filters.imdbTopTvOnly) {
    if (filters.winnerOnly) parts.push("winners");
    else if (filters.nominatedOnly) parts.push("nominated films");
  }

  const contentLabels: Record<string, string> = {
    movie: "movies",
    short: "short films",
    animation: "animations",
    documentary: "documentaries",
    "tv-series": "TV shows",
  };
  const contentLabel = filters.contentTypes.map((t) => contentLabels[t] ?? t).join(" & ");
  if (contentLabel) parts.push(contentLabel);

  if (filters.genres.length > 0) parts.push(filters.genres.join(" & "));
  if (filters.categories.length > 0) parts.push(filters.categories.join(" & "));

  const minSet = filters.decadeMin !== DECADE_MIN;
  const maxSet = filters.decadeMax !== DECADE_MAX;
  if (minSet && maxSet) parts.push(`${filters.decadeMin}s–${filters.decadeMax}s`);
  else if (minSet) parts.push(`${filters.decadeMin}s onwards`);
  else if (maxSet) parts.push(`up to ${filters.decadeMax}s`);

  if (filters.awardYear != null) parts.push(`${filters.awardYear} ceremony`);
  if (filters.nominationCount != null) parts.push(`${filters.nominationCount}+ nominations`);
  if (filters.person.trim()) parts.push(filters.person.trim());
  if (filters.femaleDirectorOnly) parts.push("female-directed");
  if (filters.search.trim()) parts.push(`"${filters.search.trim()}"`);
  if (filters.imdbRatingMin > 0) parts.push(`IMDb ${filters.imdbRatingMin}+`);
  if (filters.rtScoreMin > 0) parts.push(`RT ${filters.rtScoreMin}%+`);

  if (filters.runtimeMax != null) {
    const runtimeLabel =
      filters.runtimeMax === 89 ? "Quick Watch" :
      filters.runtimeMax === 119 ? "Standard" :
      filters.runtimeMax === 149 ? "Long Haul" :
      `under ${filters.runtimeMax + 1} min`;
    parts.push(runtimeLabel);
  }

  return parts.join(" · ");
}

function OscarIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      width="14"
      height="14"
      fill="currentColor"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="7" cy="1.8" r="1.4" />
      <path d="M5.5 3.2 L5 8.5 L9 8.5 L8.5 3.2 Z" />
      <rect x="4" y="8.5" width="6" height="1.5" rx="0.3" />
      <rect x="3" y="10" width="8" height="1.8" rx="0.3" />
      <rect x="2" y="11.8" width="10" height="1.5" rx="0.3" />
    </svg>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-[42px] shrink-0 pt-[7px] font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#a2a2bb]">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function PillToggle({
  active,
  onClick,
  children,
  activeClassName,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeClassName?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 transition-colors duration-150",
        "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-1 focus-visible:ring-offset-[#09090f]",
        active
          ? (activeClassName ?? "border-[#c08818] bg-gradient-to-br from-[#deba4a] to-[#c08818] text-[#1a0d00]")
          : "border-[#34344d] bg-[#0e0e1a] text-[#aaaac6] hover:border-[#e8453c]/45 hover:text-[#F5F5F0]",
      )}
    >
      {children}
    </button>
  );
}

type ActiveFilterChip = {
  key: string;
  label: string;
  href?: string;
  onRemove: () => void;
};

function getActiveFilterChips(
  filters: FilterState,
  onFiltersChange: (updates: Partial<FilterState>) => void,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.search.trim()) {
    chips.push({
      key: "search",
      label: `Title: ${filters.search.trim()}`,
      onRemove: () => onFiltersChange({ search: "", page: 1 }),
    });
  }

  if (filters.person.trim()) {
    chips.push({
      key: "person",
      label: `Person: ${filters.person.trim()}`,
      href: `/person/${nameToSlug(filters.person.trim())}`,
      onRemove: () => onFiltersChange({ person: "", page: 1 }),
    });
  }

  if (filters.femaleDirectorOnly) {
    chips.push({
      key: "femaleDirectorOnly",
      label: "Female director",
      onRemove: () => onFiltersChange({ femaleDirectorOnly: false, page: 1 }),
    });
  }

  for (const body of filters.awardBodies) {
    chips.push({
      key: `awardBody:${body}`,
      label: awardBodyName(body),
      onRemove: () =>
        onFiltersChange({ awardBodies: filters.awardBodies.filter((b) => b !== body), page: 1 }),
    });
  }

  if (filters.winnerOnly) {
    chips.push({
      key: "winnerOnly",
      label: "Won",
      onRemove: () =>
        onFiltersChange({ winnerOnly: false, nominatedOnly: false, page: 1 }),
    });
  } else if (filters.nominatedOnly) {
    chips.push({
      key: "nominatedOnly",
      label: "Nominated",
      onRemove: () => onFiltersChange({ nominatedOnly: false, page: 1 }),
    });
  }

  for (const category of filters.categories) {
    chips.push({
      key: `category:${category}`,
      label: category,
      onRemove: () =>
        onFiltersChange({ categories: filters.categories.filter((c) => c !== category), page: 1 }),
    });
  }

  if (filters.awardYear != null) {
    chips.push({
      key: "awardYear",
      label: `Year: ${filters.awardYear}`,
      onRemove: () => onFiltersChange({ awardYear: null, page: 1 }),
    });
  }

  for (const genre of filters.genres) {
    chips.push({
      key: `genre:${genre}`,
      label: genre,
      onRemove: () =>
        onFiltersChange({ genres: filters.genres.filter((g) => g !== genre), page: 1 }),
    });
  }

  if (filters.runtimeMax != null) {
    chips.push({
      key: "runtimeMax",
      label: `Under ${filters.runtimeMax + 1} min`,
      onRemove: () => onFiltersChange({ runtimeMax: null, page: 1 }),
    });
  }

  if (filters.decadeMin !== DECADE_MIN || filters.decadeMax !== DECADE_MAX) {
    chips.push({
      key: "decade",
      label: `${filters.decadeMin}–${filters.decadeMax}`,
      onRemove: () =>
        onFiltersChange({
          decadeMin: DECADE_MIN,
          decadeMax: DECADE_MAX,
          page: 1,
        }),
    });
  }

  if (filters.nominationCount != null) {
    chips.push({
      key: "nominationCount",
      label: `${filters.nominationCount} nomination${filters.nominationCount === 1 ? "" : "s"}`,
      onRemove: () => onFiltersChange({ nominationCount: null, page: 1 }),
    });
  }

  const contentTypeLabels: Record<string, string> = {
    movie: "Movie",
    short: "Short",
    animation: "Animation",
    documentary: "Documentary",
    "tv-series": "TV Series",
    "tv-mini-series": "TV Mini-Series",
  };
  for (const type of filters.contentTypes) {
    chips.push({
      key: `contentType:${type}`,
      label: contentTypeLabels[type] ?? type,
      onRemove: () =>
        onFiltersChange({ contentTypes: filters.contentTypes.filter((t) => t !== type), page: 1 }),
    });
  }

  if (filters.imdbTopMoviesOnly) {
    chips.push({
      key: "imdbTopMovies",
      label: "IMDb Top 250 Movies",
      onRemove: () => onFiltersChange({ imdbTopMoviesOnly: false, page: 1 }),
    });
  }

  if (filters.imdbTopTvOnly) {
    chips.push({
      key: "imdbTopTv",
      label: "IMDb Top 250 Shows",
      onRemove: () => onFiltersChange({ imdbTopTvOnly: false, page: 1 }),
    });
  }

  if (filters.imdbRatingMin > 0) {
    chips.push({
      key: "imdb",
      label: `IMDb ${filters.imdbRatingMin}+`,
      onRemove: () => onFiltersChange({ imdbRatingMin: 0, page: 1 }),
    });
  }

  if (filters.rtScoreMin > 0) {
    chips.push({
      key: "rt",
      label: `RT ${filters.rtScoreMin}%+`,
      onRemove: () => onFiltersChange({ rtScoreMin: 0, page: 1 }),
    });
  }

  return chips;
}

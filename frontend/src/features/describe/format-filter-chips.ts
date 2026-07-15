import type { NaturalRollFilters } from "@/lib/api";
import { AWARD_LABELS, LANGUAGE_LABELS } from "./filter-labels";

function formatAwardFilter(filters: NaturalRollFilters): string | null {
  const awardBody = filters.awardBody;

  if (!awardBody) {
    if (filters.winnerOnly === true) return "Winner";
    if (filters.nominatedOnly === true) return "Nominee";
    return null;
  }

  const award = AWARD_LABELS[awardBody] ?? awardBody;
  if (filters.winnerOnly === true) return `${award} winner`;
  if (filters.nominatedOnly === true) return `${award} nominee`;
  return awardBody === "all" ? null : award;
}

function formatYearFilter(filters: NaturalRollFilters): string | null {
  const { decadeMin: min, decadeMax: max } = filters;

  if (min !== undefined && max === min + 9 && min % 10 === 0) {
    return `${min}s`;
  }
  if (min !== undefined && max !== undefined) return `${min}-${max}`;
  if (min !== undefined) return `${min}+`;
  if (max !== undefined) return `Before ${max}`;
  return null;
}

function addStringChip(chips: string[], value: unknown, prefix = ""): void {
  if (typeof value === "string") chips.push(`${prefix}${value}`);
}

export function formatFilterChips(filters: NaturalRollFilters): string[] {
  const chips: string[] = [];
  const award = formatAwardFilter(filters);
  const year = formatYearFilter(filters);

  if (award) chips.push(award);
  if (filters.language) {
    chips.push(LANGUAGE_LABELS[filters.language] ?? filters.language.toUpperCase());
  }
  addStringChip(chips, filters.genre);
  addStringChip(chips, filters.contentType);
  addStringChip(chips, filters.person);
  addStringChip(chips, filters.director, "Dir. ");
  if (filters.femaleDirectorOnly === true) chips.push("Female director");
  if (year) chips.push(year);
  addRemainingFilterChips(chips, filters);

  return [...new Set(chips)];
}

function addRemainingFilterChips(
  chips: string[],
  filters: NaturalRollFilters,
): void {
  addStringChip(chips, filters.category);
  if (filters.awardYear !== undefined) chips.push(String(filters.awardYear));
  if (filters.runtimeMax !== undefined) chips.push(`Under ${filters.runtimeMax} min`);
  if (filters.imdbRatingMin !== undefined) chips.push(`IMDb ${filters.imdbRatingMin}+`);
  if (filters.rtScoreMin !== undefined) chips.push(`RT ${filters.rtScoreMin}+`);
  if (filters.imdbTopMoviesOnly === true) chips.push("IMDb Top Movies");
  if (filters.imdbTopTvOnly === true) chips.push("IMDb Top TV");
  addStringChip(chips, filters.tvType);
  addStringChip(chips, filters.certificate);
  addStringChip(chips, filters.search);
}

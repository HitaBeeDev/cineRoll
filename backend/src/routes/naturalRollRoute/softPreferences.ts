import type { AllowedFilterValues } from "../../lib/allowedFilterValues";
import { resolveValidatedFilter } from "../../lib/validateFilters/resolvers";
import { NATURAL_ROLL_LIMITS } from "./constants";
import { Stage1Filters } from "./schemas";

/** The extracted signals that shape ranking. `requiredGenres` also hard-filter
 *  candidates (what the film must BE); `preferredGenres` are genre-ish
 *  qualities ("with music") that only score. `contentType` is the canonical
 *  validated value, carried for the reranker's movie-vs-series guard. */
export type SoftPreferences = {
  requiredGenres: string[];
  preferredGenres: string[];
  tones: string[];
  themes: string[];
  keywords: string[];
  contentType: string | null;
};

// Stage-1 fields that must be stripped before filter validation — they are
// ranking signals, not queryable columns. The genre split is stripped too:
// filterPreparation folds it into the single effective `genres` filter first.
const SOFT_KEYS = [
  "tones",
  "themes",
  "keywords",
  "resultCount",
  "requiredGenres",
  "preferredGenres",
] as const;

export function stripSoftFields<T extends Stage1Filters>(stage1: T): T {
  const hard = { ...stage1 };
  for (const key of SOFT_KEYS) delete hard[key];

  return hard;
}

export function softPreferencesFrom(
  stage1: Stage1Filters,
  appliedFilters: Record<string, unknown>,
  allowed: AllowedFilterValues,
): SoftPreferences {
  return {
    requiredGenres: canonicalGenres(stage1.requiredGenres, allowed),
    preferredGenres: canonicalGenres(stage1.preferredGenres, allowed),
    tones: stringList(stage1.tones) ?? [],
    themes: stringList(stage1.themes) ?? [],
    keywords: stringList(stage1.keywords) ?? [],
    contentType: typeof appliedFilters.contentType === "string" ? appliedFilters.contentType : null,
  };
}

// Canonicalize against the catalog ("musical" → "Music") so scoring compares
// like with like; genres that resolve to nothing fall back to the raw words —
// they simply never match a film and cost their penalty honestly.
function canonicalGenres(
  requested: string[] | null | undefined,
  allowed: AllowedFilterValues,
): string[] {
  const raw = stringList(requested);
  if (!raw) return [];

  const resolved = resolveValidatedFilter("genres", raw, allowed);

  return Array.isArray(resolved) ? (resolved as string[]) : raw;
}

/** The user's explicit count ("suggest only one movie") beats the client's
 *  requested count, which beats the server default. Always clamped to the
 *  API's 1..6 range. */
export function resolveResultCount(
  stage1: Stage1Filters,
  bodyCount: number | undefined,
): number {
  const requested = stage1.resultCount ?? bodyCount ?? NATURAL_ROLL_LIMITS.defaultCount;

  return Math.min(6, Math.max(1, Math.round(requested)));
}

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const strings = value.filter((item): item is string => typeof item === "string");

  return strings.length > 0 ? strings : null;
}

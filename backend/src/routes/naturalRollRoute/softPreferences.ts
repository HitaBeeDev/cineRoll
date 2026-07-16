import { NATURAL_ROLL_LIMITS } from "./constants";
import { Stage1Filters } from "./schemas";

/** The extracted signals that shape ranking but never become SQL filters.
 *  `genres` doubles as both: it hard-filters candidates (OR-overlap) AND
 *  weights the ranking, so a film matching all requested genres beats one
 *  that squeaked in on a single overlap. `contentType` is the canonical
 *  validated value, carried for the reranker's movie-vs-series guard. */
export type SoftPreferences = {
  genres: string[];
  tones: string[];
  themes: string[];
  keywords: string[];
  contentType: string | null;
};

// Stage-1 fields that must be stripped before filter validation — they are
// ranking signals, not queryable columns.
const SOFT_KEYS = ["tones", "themes", "keywords", "resultCount"] as const;

export function stripSoftFields(stage1: Stage1Filters): Stage1Filters {
  const hard = { ...stage1 };
  for (const key of SOFT_KEYS) delete hard[key];

  return hard;
}

export function softPreferencesFrom(
  stage1: Stage1Filters,
  appliedFilters: Record<string, unknown>,
): SoftPreferences {
  return {
    // Prefer the validated canonical genres; fall back to the raw extraction
    // when validation dropped the filter (unmatched words simply never score).
    genres: stringList(appliedFilters.genre) ?? stringList(stage1.genres) ?? [],
    tones: stringList(stage1.tones) ?? [],
    themes: stringList(stage1.themes) ?? [],
    keywords: stringList(stage1.keywords) ?? [],
    contentType: typeof appliedFilters.contentType === "string" ? appliedFilters.contentType : null,
  };
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

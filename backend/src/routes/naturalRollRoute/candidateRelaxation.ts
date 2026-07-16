import { AllowedFilterValues } from "../../lib/allowedFilterValues";
import { validateStructuralFilters } from "../../lib/validateFilters";
import { getQualityCandidates, getRandomCount, RandomFilmRow } from "../random";
import { NATURAL_ROLL_LIMITS, RELAX_PRIORITY } from "./constants";
import { EffectiveStructuralFilters, naturalRollQuery } from "./filterPreparation";
import { stripSoftFields } from "./softPreferences";

export type RelaxationResult = {
  films: RandomFilmRow[];
  total: number;
  appliedFilters: Record<string, unknown>;
  droppedFilters: string[];
  relaxed: boolean;
};

export async function loadCandidatesWithRelaxation(
  structuralFilters: EffectiveStructuralFilters,
  userId: string | undefined,
  allowed: AllowedFilterValues,
  appliedFilters: Record<string, unknown>,
  droppedFilters: string[],
): Promise<RelaxationResult> {
  const films = await loadCandidateFilms(appliedFilters, userId);
  if (films.length > 0) {
    return finalize(films, appliedFilters, userId, droppedFilters, false);
  }

  return relaxUntilCandidatesFound(structuralFilters, userId, allowed, appliedFilters, droppedFilters);
}

async function relaxUntilCandidatesFound(
  structuralFilters: EffectiveStructuralFilters,
  userId: string | undefined,
  allowed: AllowedFilterValues,
  appliedFilters: Record<string, unknown>,
  droppedFilters: string[],
): Promise<RelaxationResult> {
  const removed: string[] = [];

  for (const key of relaxableKeys(structuralFilters)) {
    removed.push(key);
    const relaxedFilters = cleanWithRemovedFilters(structuralFilters, removed, allowed);
    const films = await loadCandidateFilms(relaxedFilters, userId);

    if (films.length > 0) {
      return finalize(films, relaxedFilters, userId, [...droppedFilters, ...removed], true);
    }
  }

  // Nothing matched even fully relaxed. The caller reports NO_FILMS_FOUND and
  // never reads `total` here, so skip the count entirely.
  return { films: [], total: 0, appliedFilters, droppedFilters, relaxed: false };
}

// Resolve the pool count once — only for the filter set that actually produced
// films — instead of on every relaxation probe.
async function finalize(
  films: RandomFilmRow[],
  appliedFilters: Record<string, unknown>,
  userId: string | undefined,
  droppedFilters: string[],
  relaxed: boolean,
): Promise<RelaxationResult> {
  const total = await getRandomCount(naturalRollQuery(appliedFilters, userId));
  return { films, total, appliedFilters, droppedFilters, relaxed };
}

// Relaxation drops STRUCTURAL keys (the Stage-1 extraction shape), so it keys
// off the structural filters, not the validated query filters — the two use
// different names for genres ("genres" list in, "genre" CSV out).
function relaxableKeys(structuralFilters: EffectiveStructuralFilters): string[] {
  return RELAX_PRIORITY.filter(
    key => structuralFilters[key] !== null && structuralFilters[key] !== undefined,
  );
}

function cleanWithRemovedFilters(
  structuralFilters: EffectiveStructuralFilters,
  removed: string[],
  allowed: AllowedFilterValues,
): Record<string, unknown> {
  const overrides = Object.fromEntries(removed.map(key => [key, null]));
  const { filters } = validateStructuralFilters(
    stripSoftFields({ ...structuralFilters, ...overrides }),
    allowed,
  );

  return filters;
}

function loadCandidateFilms(
  filters: Record<string, unknown>,
  userId: string | undefined,
): Promise<RandomFilmRow[]> {
  return getQualityCandidates(
    naturalRollQuery(filters, userId),
    NATURAL_ROLL_LIMITS.candidateTop,
    NATURAL_ROLL_LIMITS.candidateSample,
  );
}

import { AllowedFilterValues } from "../../lib/allowedFilterValues";
import { validateStructuralFilters } from "../../lib/validateFilters";
import { getQualityCandidates, RandomFilmRow } from "../random";
import { NATURAL_ROLL_LIMITS, RELAX_PRIORITY } from "./constants";
import { naturalRollQuery } from "./filterPreparation";
import { Stage1Filters } from "./schemas";

export type CandidateResult = {
  films: RandomFilmRow[];
  total: number;
};

export type RelaxationResult = CandidateResult & {
  appliedFilters: Record<string, unknown>;
  droppedFilters: string[];
  relaxed: boolean;
};

export async function loadCandidatesWithRelaxation(
  structuralFilters: Stage1Filters,
  userId: string | undefined,
  allowed: AllowedFilterValues,
  appliedFilters: Record<string, unknown>,
  droppedFilters: string[],
): Promise<RelaxationResult> {
  const initial = await loadCandidates(naturalRollQuery(appliedFilters, userId));
  if (initial.films.length > 0) {
    return { ...initial, appliedFilters, droppedFilters, relaxed: false };
  }

  return relaxUntilCandidatesFound(structuralFilters, userId, allowed, appliedFilters, droppedFilters);
}

async function relaxUntilCandidatesFound(
  structuralFilters: Stage1Filters,
  userId: string | undefined,
  allowed: AllowedFilterValues,
  appliedFilters: Record<string, unknown>,
  droppedFilters: string[],
): Promise<RelaxationResult> {
  let latest: CandidateResult = { films: [], total: 0 };
  const removed: string[] = [];

  for (const key of relaxableKeys(appliedFilters)) {
    removed.push(key);
    const relaxedFilters = cleanWithRemovedFilters(structuralFilters, removed, allowed);
    latest = await loadCandidates(naturalRollQuery(relaxedFilters, userId));

    if (latest.films.length > 0) {
      return {
        ...latest,
        appliedFilters: relaxedFilters,
        droppedFilters: [...droppedFilters, ...removed],
        relaxed: true,
      };
    }
  }

  return { ...latest, appliedFilters, droppedFilters, relaxed: false };
}

function relaxableKeys(filters: Record<string, unknown>): string[] {
  return RELAX_PRIORITY.filter(key => key in filters);
}

function cleanWithRemovedFilters(
  structuralFilters: Stage1Filters,
  removed: string[],
  allowed: AllowedFilterValues,
): Record<string, unknown> {
  const overrides = Object.fromEntries(removed.map(key => [key, null]));
  const { filters } = validateStructuralFilters({ ...structuralFilters, ...overrides }, allowed);

  return filters;
}

function loadCandidates(query: Parameters<typeof getQualityCandidates>[0]): Promise<CandidateResult> {
  return getQualityCandidates(
    query,
    NATURAL_ROLL_LIMITS.candidateTop,
    NATURAL_ROLL_LIMITS.candidateSample,
  );
}

import type { RelaxationResult } from "../candidateRelaxation";
import { NATURAL_ROLL_LIMITS } from "../constants";
import { naturalRollQuery } from "../filterPreparation";
import { capPerDirector } from "./capPerDirector";
import { queryReferenceCandidates } from "./queryReferenceCandidates";
import type { ReferenceOutcome } from "./referenceTypes";

// A neighbourhood thinner than this isn't a neighbourhood — better to fall back
// to the normal filtered pool than to anchor six picks on one or two loose hits.
const MIN_REFERENCE_CANDIDATES = 3;

/** The candidate pool for a resolved reference film, or null to fall back to
 *  the normal filter-driven pool.
 *
 *  `total` is the size of the neighbourhood itself, not of the whole filtered
 *  catalogue: for this query the neighbourhood IS the pool the picks came from,
 *  and reporting the catalogue count would overstate what was considered. */
export const referenceCandidateResult = async (
  reference: ReferenceOutcome,
  appliedFilters: Record<string, unknown>,
  droppedFilters: string[],
  userId: string | undefined,
): Promise<RelaxationResult | null> => {
  if (reference.kind !== "resolved") return null;

  const films = await queryReferenceCandidates(
    reference.film,
    naturalRollQuery(appliedFilters, userId),
    NATURAL_ROLL_LIMITS.candidateTop,
  );

  if (films.length < MIN_REFERENCE_CANDIDATES) return null;

  return {
    films: capPerDirector(films),
    total: films.length,
    appliedFilters,
    droppedFilters,
    relaxed: false,
  };
};

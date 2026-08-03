import type { ListQuery } from "../../../lib/filmFilters/listQuerySchema";

/**
 * The facets the browse panel counts. Names match the response payload and the
 * frontend's FacetCounts type.
 */
export const FACET_KEYS = [
  "awardBodies",
  "categories",
  "awardYears",
  "contentTypes",
  "tvTypes",
  "genres",
  "releaseYears",
  "languages",
  "countries",
] as const;

export type FacetKey = (typeof FACET_KEYS)[number];

/** Query keys a facet owns — every one of them is optional in ListQuery. */
type OwnedFilterKey =
  | "awardBody"
  | "category"
  | "awardYearMin"
  | "awardYearMax"
  | "contentType"
  | "tvType"
  | "genre"
  | "genreAll"
  | "yearMin"
  | "yearMax"
  | "language"
  | "country";

/**
 * Which filter each facet is the control for. Counting a facet drops exactly
 * these keys and keeps everything else.
 */
const FACET_OWNED_KEYS: Record<FacetKey, readonly OwnedFilterKey[]> = {
  awardBodies: ["awardBody"],
  categories: ["category"],
  // One control writing two bounds, so both go — same as the release-year pair.
  awardYears: ["awardYearMin", "awardYearMax"],
  contentTypes: ["contentType"],
  tvTypes: ["tvType"],
  // One control writes both, so one control has to clear both: `genre` is the
  // OR-semantics facet, `genreAll` the AND-semantics one over the same column.
  genres: ["genre", "genreAll"],
  releaseYears: ["yearMin", "yearMax"],
  languages: ["language"],
  countries: ["country"],
};

/**
 * The query a facet is counted under: every active filter EXCEPT the one this
 * facet controls.
 *
 * This exclusion is the whole point of the endpoint. Count genres under the full
 * filter set and picking Drama makes every other genre read 0 — each remaining
 * film is a Drama, so the UI would say no second genre exists and the user could
 * never add one. Dropping the facet's own key makes "Comedy 488" mean what the
 * user needs it to mean: 488 films *would* be added by ticking Comedy. Every
 * other facet still constrains normally, which is what keeps the numbers honest.
 *
 * Note it drops the key from the whole query, not just from the WHERE clause: the
 * award facets rebuild their per-award conditions from the same scoped object
 * (see awardElementConditions), so category counts stop constraining on category
 * at both levels without a second place to remember it.
 */
export function scopeQueryToFacet(query: ListQuery, facet: FacetKey): ListQuery {
  const scoped: ListQuery = { ...query };
  for (const key of FACET_OWNED_KEYS[facet]) {
    delete scoped[key];
  }

  return scoped;
}

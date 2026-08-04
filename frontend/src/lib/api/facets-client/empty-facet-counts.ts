import type { FacetCounts } from "@cineroll/types";

/** Empty lists — what a caller renders from before the first response lands, or if it fails. */
export const EMPTY_FACET_COUNTS: FacetCounts = {
  awardBodies: [],
  categories: [],
  awardYears: [],
  contentTypes: [],
  tvTypes: [],
  genres: [],
  releaseYears: [],
  languages: [],
  countries: [],
};

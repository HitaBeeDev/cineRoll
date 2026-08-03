import type { FacetCounts, FilterState } from "@cineroll/types";
import { API_URL } from "./constants";
import { filtersToParams } from "./filters-to-params";
import { getCachedPromise } from "./promise-cache";

type StringFacet = "genres" | "countries" | "languages" | "categories";

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

/**
 * Every browse facet's reachable options and their counts under `filters`.
 *
 * Unlike the fixed lists below this is filter-dependent, so it is deliberately
 * uncached here: the response changes with every filter edit, and the server
 * already caches it per filter set.
 */
export async function fetchFacetCounts(
  filters: Partial<FilterState>,
  signal: AbortSignal,
): Promise<FacetCounts> {
  const params = filtersToParams(filters);
  const response = await fetch(`${API_URL}/api/films/facets?${params}`, {
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`facets ${response.status}`);
  return response.json() as Promise<FacetCounts>;
}

export function fetchGenres(): Promise<string[]> {
  return fetchStringFacet("genres");
}

export function fetchCountries(): Promise<string[]> {
  return fetchStringFacet("countries");
}

export function fetchLanguages(): Promise<string[]> {
  return fetchStringFacet("languages");
}

export function fetchCategories(): Promise<string[]> {
  return fetchStringFacet("categories");
}

export function fetchAwardYears(): Promise<number[]> {
  return getCachedPromise("awardYears", async () => {
    const response = await fetch(`${API_URL}/api/films/award-years`, {
      cache: "force-cache",
    });
    if (!response.ok) throw new Error(`award-years ${response.status}`);
    return ((await response.json()) as { awardYears: number[] }).awardYears;
  }).catch(() => []);
}

export function fetchReleaseYears(): Promise<number[]> {
  return getCachedPromise("releaseYears", async () => {
    const response = await fetch(`${API_URL}/api/films/release-years`, {
      cache: "force-cache",
    });
    if (!response.ok) throw new Error(`release-years ${response.status}`);
    return ((await response.json()) as { releaseYears: number[] }).releaseYears;
  }).catch(() => []);
}

function fetchStringFacet(facet: StringFacet): Promise<string[]> {
  return getCachedPromise(facet, async () => {
    const response = await fetch(`${API_URL}/api/films/${facet}`, {
      cache: "force-cache",
    });
    if (!response.ok) throw new Error(`${facet} ${response.status}`);
    return ((await response.json()) as Record<StringFacet, string[]>)[facet];
  }).catch(() => []);
}

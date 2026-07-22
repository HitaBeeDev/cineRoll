import { API_URL } from "./constants";
import { getCachedPromise } from "./promise-cache";

type StringFacet = "genres" | "countries" | "languages" | "categories";

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

function fetchStringFacet(facet: StringFacet): Promise<string[]> {
  return getCachedPromise(facet, async () => {
    const response = await fetch(`${API_URL}/api/films/${facet}`, {
      cache: "force-cache",
    });
    if (!response.ok) throw new Error(`${facet} ${response.status}`);
    return ((await response.json()) as Record<StringFacet, string[]>)[facet];
  }).catch(() => []);
}

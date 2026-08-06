import { config } from "../../../config";
import type { ExternalReference } from "./referenceTypes";
import { tmdbGenreNames } from "./tmdbGenreNames";

const TMDB_BASE = "https://api.themoviedb.org/3";
// Ask AI already pays for two Gemini hops; a slow third party must not be
// allowed to hold the stream open on top of that. Missing attributes degrade
// the answer, a hung request breaks it.
const TIMEOUT_MS = 2_500;
const MAX_KEYWORDS = 12;

type TmdbSearchResponse = {
  results?: Array<{ id: number; genre_ids?: number[]; release_date?: string; title?: string }>;
};

type TmdbKeywordsResponse = { keywords?: Array<{ name?: string }> };

/** Attributes of a film the user named that the catalogue does not hold —
 *  because it won no major award, which is the whole point of the catalogue.
 *  Returning null means "couldn't identify it", which the caller reports
 *  honestly rather than papering over. */
export const fetchExternalReference = async (
  title: string,
): Promise<ExternalReference | null> => {
  if (!config.tmdbApiKey) return null;

  const match = await searchTmdb(title);
  if (!match) return null;

  return {
    title: match.title ?? title,
    year: releaseYear(match.release_date),
    genres: tmdbGenreNames(match.genre_ids ?? []),
    keywords: await fetchKeywords(match.id),
  };
};

async function searchTmdb(title: string): Promise<NonNullable<TmdbSearchResponse["results"]>[number] | null> {
  const url = `${TMDB_BASE}/search/movie?api_key=${config.tmdbApiKey}`
    + `&query=${encodeURIComponent(title)}&language=en-US`;
  const data = await getJson<TmdbSearchResponse>(url);

  return data?.results?.[0] ?? null;
}

// Best-effort: keywords sharpen the soft preferences but the genres alone
// already carry the answer, so a failure here is silent rather than fatal.
async function fetchKeywords(tmdbId: number): Promise<string[]> {
  const url = `${TMDB_BASE}/movie/${tmdbId}/keywords?api_key=${config.tmdbApiKey}`;
  const data = await getJson<TmdbKeywordsResponse>(url);

  return (data?.keywords ?? [])
    .map(keyword => keyword.name)
    .filter((name): name is string => Boolean(name))
    .slice(0, MAX_KEYWORDS);
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) return null;

    return (await response.json()) as T;
  } catch (error) {
    console.warn("TMDB reference lookup failed.", error);
    return null;
  }
}

function releaseYear(releaseDate: string | undefined): number | null {
  const year = Number.parseInt(releaseDate?.slice(0, 4) ?? "", 10);

  return Number.isFinite(year) ? year : null;
}

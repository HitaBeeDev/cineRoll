import type { Film, FilterState, PaginatedFilms } from "@cineroll/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const DEFAULT_DECADE_MIN = 1900;
const DEFAULT_DECADE_MAX = 2030;

export type RollFilm = Pick<
  Film,
  | "id"
  | "slug"
  | "title"
  | "year"
  | "releaseYear"
  | "runtime"
  | "genres"
  | "plot"
  | "director"
  | "posterUrl"
  | "posterColor"
  | "backdropUrl"
  | "imdbRating"
  | "rtScore"
  | "oscarNominations"
  | "oscarWins"
  | "ggNominations"
  | "ggWins"
  | "cannesNominations"
  | "cannesWins"
>;

export type RandomResult = { film: RollFilm; total: number };

export type PickOfDayFilm = Pick<
  Film,
  | "id"
  | "slug"
  | "title"
  | "year"
  | "releaseYear"
  | "runtime"
  | "genres"
  | "plot"
  | "director"
  | "posterUrl"
  | "posterColor"
  | "backdropUrl"
  | "imdbRating"
  | "rtScore"
  | "oscarNominations"
  | "oscarWins"
  | "pickOfDayDate"
>;

export function filtersToParams(filters: Partial<FilterState>): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.person?.trim()) params.set("person", filters.person.trim());
  if (filters.director?.trim()) params.set("director", filters.director.trim());
  if (filters.awardBody && filters.awardBody !== "all") params.set("awardBody", filters.awardBody);
  if (filters.winnerOnly) params.set("winnerOnly", "true");
  if (filters.nominatedOnly) params.set("nominatedOnly", "true");
  if (filters.category?.trim()) params.set("category", filters.category.trim());
  if (filters.awardYear != null) params.set("awardYear", String(filters.awardYear));
  if (filters.genre?.trim()) params.set("genre", filters.genre.trim());
  if (filters.contentType?.trim()) params.set("contentType", filters.contentType.trim());
  if (filters.decadeMin != null && filters.decadeMin !== DEFAULT_DECADE_MIN) {
    params.set("decadeMin", String(filters.decadeMin));
  }
  if (filters.decadeMax != null && filters.decadeMax !== DEFAULT_DECADE_MAX) {
    params.set("decadeMax", String(filters.decadeMax));
  }
  if (filters.imdbRatingMin != null && filters.imdbRatingMin > 0) {
    params.set("imdbRatingMin", String(filters.imdbRatingMin));
  }
  if (filters.rtScoreMin != null && filters.rtScoreMin > 0) {
    params.set("rtScoreMin", String(filters.rtScoreMin));
  }
  return params;
}

export async function fetchRandom(filters?: Partial<FilterState>): Promise<RandomResult> {
  const params = filtersToParams(filters ?? {});
  const qs = params.toString();
  const res = await fetch(`${API_URL}/api/random${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { code?: string };
    const err = Object.assign(new Error("fetch failed"), { code: body.code ?? "UNKNOWN" });
    throw err;
  }
  return res.json() as Promise<RandomResult>;
}

export async function fetchFilms(filters: Partial<FilterState>, limit = 12): Promise<PaginatedFilms> {
  const params = filtersToParams(filters);
  params.set("limit", String(limit));
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const res = await fetch(`${API_URL}/api/films?${params}`);
  if (!res.ok) throw new Error("Failed to fetch films");
  return res.json() as Promise<PaginatedFilms>;
}

export async function fetchPickOfDay(): Promise<PickOfDayFilm | null> {
  const res = await fetch(`${API_URL}/api/pick-of-day`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch pick of the day");
  return res.json() as Promise<PickOfDayFilm>;
}

export async function fetchGenres(): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/films/genres`);
  if (!res.ok) return [];
  const data = await res.json() as { genres: string[] };
  return data.genres;
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/films/categories`);
  if (!res.ok) return [];
  const data = await res.json() as { categories: string[] };
  return data.categories;
}

export async function fetchAwardYears(): Promise<number[]> {
  const res = await fetch(`${API_URL}/api/films/award-years`);
  if (!res.ok) return [];
  const data = await res.json() as { awardYears: number[] };
  return data.awardYears;
}

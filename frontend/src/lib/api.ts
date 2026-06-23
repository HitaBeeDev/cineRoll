import type { AwardRecord, Film, FilterState, PaginatedFilms } from "@cineroll/types";
import { trackEvent } from "@/lib/analytics";

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
  | "imdbTopMovieRank"
  | "imdbTopTvRank"
  | "oscarCategories"
  | "oscarNominations"
  | "oscarWins"
  | "ggCategories"
  | "ggNominations"
  | "ggWins"
  | "cannesCategories"
  | "cannesNominations"
  | "cannesWins"
> & {
  oscarCategories: AwardRecord[];
  ggCategories: AwardRecord[];
  cannesCategories: AwardRecord[];
};

export type RandomResult = {
  film: RollFilm;
  total: number;
  // Present only on personalized rolls; `exploration` flags an ε-greedy explore draw.
  personalized?: boolean;
  exploration?: boolean;
};

export type MarathonResult = { films: RollFilm[]; totalRuntime: number; total: number };

export type NaturalRollFilters = Partial<Record<keyof FilterState, string | number | boolean>>;

export type NaturalRollResult = {
  films: RollFilm[];
  total: number;
  interpretedFilters: NaturalRollFilters;
  relaxed: boolean;
};

export type NaturalRollError = Error & {
  code: string;
  interpretedFilters?: NaturalRollFilters;
};

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

export type SnobTestFilm = Pick<
  Film,
  | "id"
  | "slug"
  | "title"
  | "originalTitle"
  | "year"
  | "releaseYear"
  | "genres"
  | "posterUrl"
  | "posterColor"
  | "imdbRating"
  | "imdbTopMovieRank"
  | "imdbTopTvRank"
  | "oscarNominations"
  | "oscarWins"
  | "ggNominations"
  | "ggWins"
  | "cannesNominations"
  | "cannesWins"
> & {
  decade: number;
  awardBodies: Array<"oscar" | "goldenglobe" | "cannes">;
};

export type SnobTestScore = {
  score: number;
  title: string;
  seen: number;
  total: number;
  breakdown: {
    byDecade: Record<string, { seen: number; total: number }>;
    byAwardBody: Record<"oscar" | "goldenglobe" | "cannes", { seen: number; total: number }>;
  };
};

export type PersonSuggestion = {
  name: string;
  roles: string[];
  count: number;
};

export type TasteCardFilm = PaginatedFilms["films"][number];

export function filtersToParams(filters: Partial<FilterState>): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.person?.trim()) params.set("person", filters.person.trim());
  if (filters.director?.trim()) params.set("director", filters.director.trim());
  if (filters.femaleDirectorOnly) params.set("femaleDirectorOnly", "true");
  if (filters.awardBody && filters.awardBody !== "all") params.set("awardBody", filters.awardBody);
  if (filters.winnerOnly) params.set("winnerOnly", "true");
  if (filters.nominatedOnly) params.set("nominatedOnly", "true");
  if (filters.category?.trim()) params.set("category", filters.category.trim());
  if (filters.awardYear != null) params.set("awardYear", String(filters.awardYear));
  if (filters.genre?.trim()) params.set("genre", filters.genre.trim());
  if (filters.language?.trim()) params.set("language", filters.language.trim());
  if (filters.country?.trim()) params.set("country", filters.country.trim());
  if (filters.contentType?.trim()) params.set("contentType", filters.contentType.trim());
  if (filters.runtimeMax != null) params.set("runtimeMax", String(filters.runtimeMax));
  if (filters.decadeMin != null && filters.decadeMin !== DEFAULT_DECADE_MIN) {
    params.set("decadeMin", String(filters.decadeMin));
  }
  if (filters.decadeMax != null && filters.decadeMax !== DEFAULT_DECADE_MAX) {
    params.set("decadeMax", String(filters.decadeMax));
  }
  if (filters.nominationCount != null) params.set("nominationCount", String(filters.nominationCount));
  if (filters.imdbRatingMin != null && filters.imdbRatingMin > 0) {
    params.set("imdbRatingMin", String(filters.imdbRatingMin));
  }
  if (filters.rtScoreMin != null && filters.rtScoreMin > 0) {
    params.set("rtScoreMin", String(filters.rtScoreMin));
  }
  if (filters.imdbRatingMax != null) params.set("imdbRatingMax", String(filters.imdbRatingMax));
  if (filters.imdbTopMoviesOnly) params.set("imdbTopMoviesOnly", "true");
  if (filters.imdbTopTvOnly) params.set("imdbTopTvOnly", "true");
  if (filters.certificate?.trim()) params.set("certificate", filters.certificate.trim());
  if (filters.tvType?.trim()) params.set("tvType", filters.tvType.trim());
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.sortOrder && filters.sortOrder !== "desc") params.set("sortOrder", filters.sortOrder);
  return params;
}

export async function fetchMarathon(
  filters?: Partial<FilterState>,
  count = 3,
): Promise<MarathonResult> {
  const params = filtersToParams(filters ?? {});
  if (count !== 3) params.set("count", String(count));
  const qs = params.toString();
  const res = await fetch(`${API_URL}/api/marathon${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { code?: string };
    const err = Object.assign(new Error("fetch failed"), { code: body.code ?? "UNKNOWN" });
    throw err;
  }
  return res.json() as Promise<MarathonResult>;
}

export async function fetchRandom(
  filters?: Partial<FilterState>,
  userId?: string,
  personalized?: boolean,
  excludeIds?: string[],
): Promise<RandomResult> {
  const params = filtersToParams(filters ?? {});
  // When signed in, the backend excludes films the user marked "Not Interested".
  if (userId) params.set("userId", userId);
  // Opt-in taste-weighted roll (signed-in only); the backend ignores it without a userId.
  if (personalized && userId) params.set("personalized", "1");
  // Films to exclude server-side (e.g. a guest's session-hidden films), so the
  // roll never returns one instead of relying on the client to re-roll past it.
  if (excludeIds && excludeIds.length > 0) params.set("excludeIds", excludeIds.join(","));
  const qs = params.toString();
  const res = await fetch(`${API_URL}/api/random${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { code?: string };
    const err = Object.assign(new Error("fetch failed"), { code: body.code ?? "UNKNOWN" });
    throw err;
  }
  return res.json() as Promise<RandomResult>;
}

/** Pool count for the given filters, without fetching a film. Use when only the
 *  `total` is needed (e.g. the home page's mount-time catalog count). */
export async function fetchRandomCount(filters?: Partial<FilterState>): Promise<number> {
  const params = filtersToParams(filters ?? {});
  const qs = params.toString();
  const res = await fetch(`${API_URL}/api/random/count${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("fetch failed");
  const data = (await res.json()) as { total: number };
  return data.total;
}

export async function fetchNaturalRoll(prompt: string, count = 2): Promise<NaturalRollResult> {
  const res = await fetch(`${API_URL}/api/natural-roll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, count }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as {
      code?: string;
      error?: string;
      interpretedFilters?: NaturalRollFilters;
    };
    const err = Object.assign(new Error(body.error ?? "Natural roll failed"), {
      code: body.code ?? "UNKNOWN",
      interpretedFilters: body.interpretedFilters,
    }) as NaturalRollError;
    throw err;
  }
  return res.json() as Promise<NaturalRollResult>;
}

// Records a roll decision against the signed-in user's account.
//   doNotSuggest: false → "Watched"; true → "Not Interested" (hidden from future rolls).
export async function markFilmWatched(
  filmId: string,
  doNotSuggest: boolean,
  sentiment?: "like" | "dislike" | null,
): Promise<void> {
  const body = sentiment === undefined
    ? { filmId, doNotSuggest }
    : { filmId, doNotSuggest, sentiment };

  const res = await fetch(`/api/user/watched`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { code?: string };
    throw Object.assign(new Error("Failed to save"), {
      code: body.code ?? "UNKNOWN",
      status: res.status,
    });
  }

  if (sentiment) {
    trackEvent({
      type: "sentiment_set",
      filmId,
      context: { source: "watched_api", sentiment },
    });
  }
}

export async function saveOnboardingGenres(genres: string[]): Promise<void> {
  const res = await fetch(`/api/user/onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genres }),
  });
  if (!res.ok && res.status !== 204) {
    throw Object.assign(new Error("Failed to save onboarding genres"), {
      status: res.status,
    });
  }
}

export async function removeFilmWatched(filmId: string): Promise<void> {
  const res = await fetch(`/api/user/watched`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filmId }),
  });
  if (!res.ok && res.status !== 204) {
    const body = (await res.json().catch(() => ({}))) as { code?: string };
    throw Object.assign(new Error("Failed to remove"), {
      code: body.code ?? "UNKNOWN",
      status: res.status,
    });
  }
}

export type FilmStatus = {
  watched: boolean;
  sentiment: "like" | "dislike" | null;
  doNotSuggest: boolean;
  inWatchlist: boolean;
  rating: number | null;
};

export async function fetchFilmStatus(filmId: string): Promise<FilmStatus> {
  const res = await fetch(`/api/user/film-status/${encodeURIComponent(filmId)}`);
  if (!res.ok) {
    throw Object.assign(new Error("Failed to load film status"), {
      status: res.status,
    });
  }
  return res.json() as Promise<FilmStatus>;
}

export async function saveFilmRating(filmId: string, rating: number): Promise<void> {
  const res = await fetch("/api/user/ratings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filmId, rating }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { code?: string };
    throw Object.assign(new Error("Failed to save rating"), {
      code: body.code ?? "UNKNOWN",
      status: res.status,
    });
  }

  trackEvent({
    type: "rating_set",
    filmId,
    context: { source: "rating_widget", rating },
  });
}

export async function addFilmToWatchlist(filmId: string): Promise<void> {
  const res = await fetch(`/api/user/watchlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filmId }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { code?: string };
    throw Object.assign(new Error("Failed to save"), {
      code: body.code ?? "UNKNOWN",
      status: res.status,
    });
  }

  trackEvent({
    type: "watchlist_add",
    filmId,
    context: { source: "watchlist_api" },
  });
}

export async function removeFilmFromWatchlist(filmId: string): Promise<void> {
  const res = await fetch(`/api/user/watchlist`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filmId }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { code?: string };
    throw Object.assign(new Error("Failed to remove"), {
      code: body.code ?? "UNKNOWN",
      status: res.status,
    });
  }

  trackEvent({
    type: "watchlist_remove",
    filmId,
    context: { source: "watchlist_api" },
  });
}

export async function fetchFilmBySlug(slug: string): Promise<RollFilm> {
  const res = await fetch(`${API_URL}/api/films/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch film");
  return res.json() as Promise<RollFilm>;
}

export async function fetchFilms(filters: Partial<FilterState>, limit = 12): Promise<PaginatedFilms> {
  const params = filtersToParams(filters);
  params.set("limit", String(limit));
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const res = await fetch(`${API_URL}/api/films?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch films");
  return res.json() as Promise<PaginatedFilms>;
}

export async function fetchOnboardingTasteCards(): Promise<PaginatedFilms["films"]> {
  const params = new URLSearchParams({
    sample: "onboarding",
    limit: "8",
  });
  const res = await fetch(`${API_URL}/api/films?${params}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json() as PaginatedFilms;
  return data.films;
}

export async function fetchPickOfDay(): Promise<PickOfDayFilm | null> {
  const res = await fetch(`${API_URL}/api/pick-of-day`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch pick of the day");
  return res.json() as Promise<PickOfDayFilm>;
}

export async function fetchSnobTestFilms(excludeFilmIds: string[] = []): Promise<SnobTestFilm[]> {
  const params = new URLSearchParams();
  if (excludeFilmIds.length > 0) params.set("excludeFilmIds", excludeFilmIds.join(","));
  const qs = params.toString();
  const res = await fetch(`${API_URL}/api/snob-test/films${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch Snob Test films");
  const data = await res.json() as { films: SnobTestFilm[] };
  return data.films;
}

export async function scoreSnobTest(seenFilmIds: string[]): Promise<SnobTestScore> {
  const res = await fetch(`${API_URL}/api/snob-test/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seenFilmIds }),
  });
  if (!res.ok) throw new Error("Failed to score Snob Test");
  return res.json() as Promise<SnobTestScore>;
}

// Facet lists (genres, countries, …) are effectively static within a session,
// so each is fetched at most once and the resolved promise is reused across
// component mounts and SPA navigations. `force-cache` lets a hard reload reuse
// the HTTP cache too. Failures are not cached — a rejected load is evicted so
// the next caller retries instead of being stuck with the empty fallback.
const facetCache = new Map<string, Promise<unknown>>();

function cachedFacet<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const cached = facetCache.get(key) as Promise<T> | undefined;
  if (cached) return cached;
  const pending = loader().catch((err) => {
    facetCache.delete(key);
    throw err;
  });
  facetCache.set(key, pending);
  return pending;
}

export function fetchGenres(): Promise<string[]> {
  return cachedFacet("genres", async () => {
    const res = await fetch(`${API_URL}/api/films/genres`, { cache: "force-cache" });
    if (!res.ok) throw new Error(`genres ${res.status}`);
    return (await res.json() as { genres: string[] }).genres;
  }).catch(() => []);
}

export function fetchCountries(): Promise<string[]> {
  return cachedFacet("countries", async () => {
    const res = await fetch(`${API_URL}/api/films/countries`, { cache: "force-cache" });
    if (!res.ok) throw new Error(`countries ${res.status}`);
    return (await res.json() as { countries: string[] }).countries;
  }).catch(() => []);
}

export function fetchLanguages(): Promise<string[]> {
  return cachedFacet("languages", async () => {
    const res = await fetch(`${API_URL}/api/films/languages`, { cache: "force-cache" });
    if (!res.ok) throw new Error(`languages ${res.status}`);
    return (await res.json() as { languages: string[] }).languages;
  }).catch(() => []);
}

export function fetchCategories(): Promise<string[]> {
  return cachedFacet("categories", async () => {
    const res = await fetch(`${API_URL}/api/films/categories`, { cache: "force-cache" });
    if (!res.ok) throw new Error(`categories ${res.status}`);
    return (await res.json() as { categories: string[] }).categories;
  }).catch(() => []);
}

export function fetchAwardYears(): Promise<number[]> {
  return cachedFacet("awardYears", async () => {
    const res = await fetch(`${API_URL}/api/films/award-years`, { cache: "force-cache" });
    if (!res.ok) throw new Error(`award-years ${res.status}`);
    return (await res.json() as { awardYears: number[] }).awardYears;
  }).catch(() => []);
}

export type AutocompleteResult = {
  films: { slug: string; title: string; year: number; posterUrl: string | null }[];
  people: { name: string; roles: string[] }[];
};

export async function fetchAutocomplete(q: string): Promise<AutocompleteResult> {
  const params = new URLSearchParams({ q });
  const res = await fetch(`${API_URL}/api/autocomplete?${params}`);
  if (!res.ok) return { films: [], people: [] };
  return res.json() as Promise<AutocompleteResult>;
}

export async function fetchPersonSuggestions(query: string): Promise<PersonSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const params = new URLSearchParams({ query: trimmed, limit: "8" });
  const res = await fetch(`${API_URL}/api/films/people?${params}`);
  if (!res.ok) return [];
  const data = await res.json() as { people: PersonSuggestion[] };
  return data.people;
}

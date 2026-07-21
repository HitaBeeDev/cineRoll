import type {
  AwardRecord,
  Film,
  FilterState,
  PaginatedFilms,
  UserListMeta,
  UserListSummary,
} from "@cineroll/types";
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
  | "contentType"
  | "tvSeasons"
  | "tvEpisodes"
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

export type BanditLane = "safe" | "gem" | "wild";
export type BetaArm = { alpha: number; beta: number };
export type LaneBandit = Record<BanditLane, BetaArm>;

export type RandomResult = {
  film: RollFilm;
  total: number;
  // Present only on personalized rolls; `exploration` flags an ε-greedy explore draw.
  personalized?: boolean;
  exploration?: boolean;
  // The bandit lane drawn for this base roll, so the client can credit the
  // user's engagement back to the right arm. Absent on personalized/seed rolls.
  lane?: BanditLane;
  // Authoritative posteriors returned for signed-in users (whose bandit state
  // lives in the DB), so the client can overwrite its local copy.
  bandit?: LaneBandit;
};

export type MarathonResult = { films: RollFilm[]; totalRuntime: number; total: number };

// The natural-roll ("describe") path is independent of the browse multi-select
// model: the AI emits single-value structural constraints under its own keys, so
// this type is spelled out explicitly rather than derived from FilterState (whose
// facets are now arrays). Kept in sync with the backend Stage-1 schema.
export type NaturalRollFilters = {
  search?: string;
  person?: string;
  director?: string;
  femaleDirectorOnly?: boolean;
  awardBody?: string;
  winnerOnly?: boolean;
  nominatedOnly?: boolean;
  category?: string;
  awardYear?: number;
  language?: string;
  // The backend extracts every named genre; older cached responses may still
  // carry a single string. `genreAll` is the AND-semantics filter (the film
  // must be ALL of these) used for required genres.
  genre?: string | string[];
  genreAll?: string[];
  country?: string;
  contentType?: string;
  decadeMin?: number;
  decadeMax?: number;
  runtimeMax?: number;
  imdbRatingMin?: number;
  rtScoreMin?: number;
  imdbTopMoviesOnly?: boolean;
  imdbTopTvOnly?: boolean;
  tvType?: string;
  certificate?: string;
};

export type NaturalRollResult = {
  films: RollFilm[];
  total: number;
  interpretedFilters: NaturalRollFilters;
  relaxed: boolean;
};

// Emitted by the streamed endpoint as soon as Stage-1 extraction + candidate
// selection finish, before the (separate) rerank LLM call returns. Lets the UI
// show the interpreted filters while the final picks are still being ranked.
export type NaturalRollInterpreted = {
  interpretedFilters: NaturalRollFilters;
  relaxed: boolean;
  total: number;
  // How many picks the backend will return — the count stated in the prompt
  // ("suggest only one movie") wins over the client's requested count.
  resultCount?: number;
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
  | "contentType"
  | "tvSeasons"
  | "tvEpisodes"
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

// ── Taste Test ──────────────────────────────────────────────────────────────
export type TasteQuestionOption = {
  id: string;
  title: string;
  year: number;
  posterUrl: string | null;
  posterColor: string | null;
};

export type TasteQuestion = {
  id: string;
  a: TasteQuestionOption;
  b: TasteQuestionOption;
};

export type TasteRecFilm = Pick<
  Film,
  | "id"
  | "slug"
  | "title"
  | "year"
  | "contentType"
  | "posterUrl"
  | "posterColor"
  | "backdropUrl"
  | "imdbRating"
  | "genres"
  | "director"
> & {
  /** 0–100 fit to the taste profile. */
  match: number;
};

export type TasteResult = {
  archetype: { key: string; label: string; emoji: string; blurb: string; accent: string };
  secondaryArchetype: { key: string; label: string; emoji: string };
  traits: string[];
  profile: { origin: number; mood: number; lane: number };
  /** Best-fitting film of any kind — the headline pick (null if the pool is empty). */
  hero: TasteRecFilm | null;
  recommendations: TasteRecFilm[];
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
  // Multi-select facets are serialized as comma-joined lists under the original
  // (singular) param names, so old single-value shared links still parse.
  if (filters.awardBodies?.length) params.set("awardBody", filters.awardBodies.join(","));
  if (filters.winnerOnly) params.set("winnerOnly", "true");
  if (filters.nominatedOnly) params.set("nominatedOnly", "true");
  if (filters.categories?.length) params.set("category", filters.categories.join(","));
  if (filters.awardYear != null) params.set("awardYear", String(filters.awardYear));
  if (filters.genres?.length) params.set("genre", filters.genres.join(","));
  if (filters.languages?.length) params.set("language", filters.languages.join(","));
  if (filters.countries?.length) params.set("country", filters.countries.join(","));
  if (filters.contentTypes?.length) params.set("contentType", filters.contentTypes.join(","));
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
  if (filters.imdbTopExclude) params.set("imdbTopExclude", "true");
  if (filters.winsMax != null) params.set("winsMax", String(filters.winsMax));
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

export type RerollPenalty = {
  genre: Record<string, number>;
  contentType: Record<string, number>;
};

export async function fetchRandom(
  filters?: Partial<FilterState>,
  userId?: string,
  personalized?: boolean,
  excludeIds?: string[],
  rerollPenalty?: RerollPenalty,
  bandit?: LaneBandit,
  banditFeedback?: { lane: BanditLane; reward: number },
): Promise<RandomResult> {
  const params = filtersToParams(filters ?? {});
  // When signed in, the backend excludes films the user marked "Not Interested".
  if (userId) params.set("userId", userId);
  // Opt-in taste-weighted roll (signed-in only); the backend ignores it without a userId.
  if (personalized && userId) params.set("personalized", "1");
  // Films to exclude server-side (e.g. a guest's session-hidden films), so the
  // roll never returns one instead of relying on the client to re-roll past it.
  if (excludeIds && excludeIds.length > 0) params.set("excludeIds", excludeIds.join(","));
  // Reroll-learning signal (§6): accumulated genre / content-type penalties from
  // titles skipped this session, so recently-skipped kinds are softly avoided.
  if (rerollPenalty) {
    if (Object.keys(rerollPenalty.genre).length > 0) {
      params.set("rerollGenre", JSON.stringify(rerollPenalty.genre));
    }
    if (Object.keys(rerollPenalty.contentType).length > 0) {
      params.set("rerollType", JSON.stringify(rerollPenalty.contentType));
    }
  }
  // Lane-bandit posteriors (§6b): the backend Thompson-samples the roll's lane
  // from these, so the split adapts to what this user engages with.
  if (bandit) params.set("bandit", JSON.stringify(bandit));
  // Engagement reward for the previous roll's lane — signed-in users only; the
  // backend folds it into their DB posteriors before drawing the next lane.
  if (banditFeedback) params.set("banditFeedback", JSON.stringify(banditFeedback));
  const qs = params.toString();
  const res = await fetch(`${API_URL}/api/random${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { code?: string };
    const err = Object.assign(new Error("fetch failed"), { code: body.code ?? "UNKNOWN" });
    throw err;
  }
  return res.json() as Promise<RandomResult>;
}

/** Deterministic counterpart to {@link fetchRandom}: the same `seed` + filters
 *  always resolves to the same film from an unchanged pool. Used by the daily
 *  picks page so every visitor sees the same curated set for a given day, and
 *  it rolls over when the seed (a date key) changes — rather than a fresh
 *  random roll per visitor. */
export async function fetchSeededRandom(
  seed: string,
  filters?: Partial<FilterState>,
  excludeIds?: string[],
  userId?: string,
): Promise<RandomResult> {
  const params = filtersToParams(filters ?? {});
  params.set("seed", seed);
  // Films to exclude server-side — used to dedupe across daily-pick slots so
  // the same film never fills two of them.
  if (excludeIds && excludeIds.length > 0) params.set("excludeIds", excludeIds.join(","));
  // Signed-in: also drops the user's "seen / not interested" films server-side,
  // so a film they marked seen never returns in a future daily pick.
  if (userId) params.set("userId", userId);
  const res = await fetch(`${API_URL}/api/random?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { code?: string };
    throw Object.assign(new Error("fetch failed"), { code: body.code ?? "UNKNOWN" });
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

type NaturalRollEvent =
  | ({ type: "interpreted" } & NaturalRollInterpreted)
  | ({ type: "result" } & NaturalRollResult)
  | {
      type: "error";
      error?: string;
      code?: string;
      interpretedFilters?: NaturalRollFilters;
    };

/** Reads a `ReadableStream` of newline-delimited JSON, invoking `onLine` for
 *  each complete line. A trailing partial line is buffered until its newline
 *  arrives (or flushed at end-of-stream). */
async function readNdjson(
  stream: ReadableStream<Uint8Array>,
  onLine: (value: unknown) => void,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const flushLines = (final: boolean) => {
    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) onLine(JSON.parse(line));
      newlineIndex = buffer.indexOf("\n");
    }
    if (final && buffer.trim()) onLine(JSON.parse(buffer.trim()));
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    flushLines(false);
  }
  buffer += decoder.decode();
  flushLines(true);
}

/** Streams the natural-roll pipeline. `onInterpreted` fires the moment the
 *  backend resolves the interpreted filters (Stage 1), before the rerank (Stage
 *  2) completes; the returned promise resolves once the final picks arrive. */
export async function fetchNaturalRoll(
  prompt: string,
  count = 4,
  onInterpreted?: (stage: NaturalRollInterpreted) => void,
): Promise<NaturalRollResult> {
  const res = await fetch(`${API_URL}/api/natural-roll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, count }),
  });

  // Pre-stream failures (validation, rate limit) still come back as a single
  // JSON body with a non-2xx status, never as a stream.
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({})) as {
      code?: string;
      error?: string;
      interpretedFilters?: NaturalRollFilters;
    };
    throw Object.assign(new Error(body.error ?? "Natural roll failed"), {
      code: body.code ?? "UNKNOWN",
      interpretedFilters: body.interpretedFilters,
    }) as NaturalRollError;
  }

  let result: NaturalRollResult | null = null;
  let streamError: NaturalRollError | null = null;

  await readNdjson(res.body, (value) => {
    const event = value as NaturalRollEvent;
    if (event.type === "interpreted") {
      onInterpreted?.({
        interpretedFilters: event.interpretedFilters,
        relaxed: event.relaxed,
        total: event.total,
      });
    } else if (event.type === "result") {
      result = {
        films: event.films,
        total: event.total,
        interpretedFilters: event.interpretedFilters,
        relaxed: event.relaxed,
      };
    } else if (event.type === "error") {
      streamError = Object.assign(new Error(event.error ?? "Natural roll failed"), {
        code: event.code ?? "UNKNOWN",
        interpretedFilters: event.interpretedFilters,
      }) as NaturalRollError;
    }
  });

  if (streamError) throw streamError;
  if (!result) {
    throw Object.assign(new Error("Natural roll returned no result"), {
      code: "EMPTY_STREAM",
    }) as NaturalRollError;
  }
  return result;
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

// ─── Custom lists ────────────────────────────────────────────────────────────

async function throwApiError(res: Response, fallback: string): Promise<never> {
  const body = (await res.json().catch(() => ({}))) as { code?: string; error?: string };
  throw Object.assign(new Error(body.error ?? fallback), {
    code: body.code ?? "UNKNOWN",
    status: res.status,
  });
}

export type UserListsResponse = {
  lists: UserListSummary[];
  total: number;
  maxLists: number;
};

export async function fetchUserLists(filmId?: string): Promise<UserListsResponse> {
  const qs = filmId ? `?filmId=${encodeURIComponent(filmId)}` : "";
  const res = await fetch(`/api/user/lists${qs}`);
  if (!res.ok) await throwApiError(res, "Failed to load lists");
  return res.json() as Promise<UserListsResponse>;
}

export async function createUserList(name: string): Promise<UserListMeta> {
  const res = await fetch(`/api/user/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) await throwApiError(res, "Failed to create list");
  return res.json() as Promise<UserListMeta>;
}

export async function renameUserList(listId: string, name: string): Promise<UserListMeta> {
  const res = await fetch(`/api/user/lists/${encodeURIComponent(listId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) await throwApiError(res, "Failed to rename list");
  return res.json() as Promise<UserListMeta>;
}

export async function deleteUserList(listId: string): Promise<void> {
  const res = await fetch(`/api/user/lists/${encodeURIComponent(listId)}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) await throwApiError(res, "Failed to delete list");
}

export async function addFilmToList(listId: string, filmId: string): Promise<void> {
  const res = await fetch(`/api/user/lists/${encodeURIComponent(listId)}/films`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filmId }),
  });
  if (!res.ok) await throwApiError(res, "Failed to add to list");
}

export async function removeFilmFromList(listId: string, filmId: string): Promise<void> {
  const res = await fetch(
    `/api/user/lists/${encodeURIComponent(listId)}/films/${encodeURIComponent(filmId)}`,
    { method: "DELETE" },
  );
  if (!res.ok && res.status !== 204) await throwApiError(res, "Failed to remove from list");
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

export async function fetchTasteQuestions(): Promise<TasteQuestion[]> {
  const res = await fetch(`${API_URL}/api/taste-test/questions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load the Taste Test");
  const data = (await res.json()) as { questions: TasteQuestion[] };
  return data.questions;
}

export type TasteComparison = { chosenId: string; otherId: string };

export async function submitTasteResult(comparisons: TasteComparison[]): Promise<TasteResult> {
  const res = await fetch(`${API_URL}/api/taste-test/result`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comparisons }),
  });
  if (!res.ok) throw new Error("Failed to read your taste");
  return res.json() as Promise<TasteResult>;
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

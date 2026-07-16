export interface CastMember {
  name: string;
  character: string;
  photoUrl: string | null;
}

export interface AwardRecord {
  awardBody: "oscar" | "goldenglobe" | "cannes" | "berlin";
  awardYear: number;
  category: string;
  nominee: string;
  won: boolean;
}

export type AwardCategory = AwardRecord;

export interface Film {
  id: string;
  slug: string;
  tmdbId: number | null;
  imdbId: string | null;
  title: string;
  originalTitle: string | null;
  releaseYear: number;
  /** Alias used by the current database/API shape. */
  year: number;
  runtime: number | null;
  genres: string[];
  countries: string[];
  contentType: string;
  plot: string | null;
  director: string | null;
  cast: CastMember[];
  language: string | null;
  posterUrl: string | null;
  posterColor: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  imdbRating: number | null;
  averageRating: number | null;
  ratingCount: number;
  rtScore: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  certificate: string | null;
  tvType: string | null;
  tvStartYear: number | null;
  tvEndYear: number | null;
  tvSeasons: number | null;
  tvEpisodes: number | null;
  oscarNominations: number;
  oscarWins: number;
  oscarCategories: AwardRecord[];
  ggNominations: number;
  ggWins: number;
  ggCategories: AwardRecord[];
  cannesNominations: number;
  cannesWins: number;
  cannesCategories: AwardRecord[];
  berlinNominations: number;
  berlinWins: number;
  berlinCategories: AwardRecord[];
  watchProviders: Record<string, unknown> | null;
  isPickOfDay: boolean;
  pickOfDayDate: string | null;
}

export interface RollEvent {
  id: string;
  filmId: string;
  timestamp: string;
  /** Alias used by the current database/API shape. */
  rolledAt: string;
}

export type AwardBody = "oscar" | "goldenglobe" | "cannes" | "berlin" | "all";
/** A concrete award corpus selectable in the multi-select award filter (no "all" sentinel — an empty array means "all"). */
export type AwardBodyFilter = Exclude<AwardBody, "all">;
export type FilmSort = "newest" | "title" | "rating" | "rt" | "awards";
export type SortOrder = "asc" | "desc";

export interface FilterState {
  search: string;
  person: string;
  director: string;
  femaleDirectorOnly: boolean;
  // Multi-select facets: an empty array means "no constraint" (was the "all"/""
  // sentinel in the old single-value model). Matching is OR within a facet.
  awardBodies: AwardBodyFilter[];
  winnerOnly: boolean;
  nominatedOnly: boolean;
  categories: string[];
  awardYear: number | null;
  languages: string[];
  genres: string[];
  countries: string[];
  contentTypes: string[];
  runtimeMax: number | null;
  decadeMin: number;
  decadeMax: number;
  nominationCount: number | null;
  imdbRatingMin: number;
  imdbRatingMax: number | null;
  rtScoreMin: number;
  certificate: string;
  imdbTopMoviesOnly: boolean;
  imdbTopTvOnly: boolean;
  // Hidden-gem obscurity signals. `imdbTopExclude` drops the IMDb Top 250 (the
  // famous canon); `winsMax` caps total major award wins (a sweep signals fame,
  // not obscurity). Together they express "acclaimed but overlooked".
  imdbTopExclude: boolean;
  winsMax: number | null;
  tvType: string;
  sort: FilmSort;
  sortOrder: SortOrder;
  page: number;
}

export interface PaginatedFilms {
  films: Film[];
  total: number;
  page: number;
  totalPages: number;
  /** Page size the server actually applied (its clamped limit), so clients can size the window without assuming their requested limit was honored. */
  pageSize: number;
}

export interface ApiError {
  error: string;
  code: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export type CompletionCategoryKey =
  | "oscar"
  | "goldenglobe"
  | "cannes"
  | "berlin"
  | "imdb-movies"
  | "imdb-tv";

export interface CompletionProgressCount {
  watched: number;
  total: number;
  percentage: number;
}

export interface CompletionCategoryProgress extends CompletionProgressCount {
  key: CompletionCategoryKey;
  label: string;
}

export interface CompletionProgress {
  overall: CompletionProgressCount;
  categories: CompletionCategoryProgress[];
}

export interface WatchlistEntry {
  id: string;
  userId: string;
  filmId: string;
  addedAt: string;
}

export interface WatchedEntry {
  id: string;
  userId: string;
  filmId: string;
  watchedAt: string;
  doNotSuggest: boolean;
}

// A user-authored custom list, as returned by the lists overview endpoint.
export interface UserListSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  filmCount: number;
  // A handful of recent poster URLs for the cover stack (may be empty).
  previewPosters: string[];
  // Only meaningful when the list was fetched with a filmId (save popover);
  // false otherwise.
  containsFilm: boolean;
}

// The lighter list shape returned by create/rename (no posters/membership).
export interface UserListMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  filmCount: number;
}

export interface UserRating {
  id: string;
  userId: string;
  filmId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface FilmComment {
  id: string;
  userId: string;
  filmId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

export interface SiteFeedback {
  id: string;
  email: string | null;
  body: string;
  createdAt: string;
}

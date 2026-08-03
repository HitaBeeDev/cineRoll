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
  /**
   * The derived type SET (`deriveFilmTypes`) — a title can be several things at
   * once (a 9-minute war documentary is documentary + short). This, not the
   * single-valued `contentType`, is what the UI labels a title with.
   */
  types: string[];
  plot: string | null;
  director: string | null;
  cast: CastMember[];
  language: string | null;
  posterUrl: string | null;
  posterColor: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  imdbRating: number | null;
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
/** `awards` is the pre-split name for `wins`; the API still accepts it. */
export type FilmSort = "newest" | "title" | "rating" | "rt" | "awards" | "wins" | "noms";
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
  /** A single ceremony year — what the natural-roll extractor produces from
   *  "won in 1994", and what older browse links carry. The API folds it into the
   *  bounds below, so the two can never disagree. */
  awardYear: number | null;
  // Inclusive ceremony-year bounds, the browse control's shape: "Oscars
  // 1970-1979" is a question the single year above cannot ask.
  awardYearMin: number | null;
  awardYearMax: number | null;
  languages: string[];
  genres: string[];
  /**
   * How the selected genres combine. false (the default) is OR — any of them,
   * the `genre` query param. true is AND — every one of them, the `genreAll`
   * param, which is what makes "romantic musical drama" a single askable thing
   * rather than a list of three separate moods.
   */
  genresMatchAll: boolean;
  countries: string[];
  contentTypes: string[];
  // Runtime bounds in minutes, inclusive; null on either side means "no bound".
  runtimeMin: number | null;
  runtimeMax: number | null;
  // Release-year bounds, inclusive; null on either side means "no bound". The
  // Decade control is a shortcut that writes a whole decade into this one pair
  // rather than a filter of its own, so a decade and a year range can never
  // disagree. (Was decadeMin/decadeMax, which held years but read as decades and
  // used 1900/2030 sentinels for "unset".)
  yearMin: number | null;
  yearMax: number | null;
  nominationCount: number | null;
  /** How many of the four ceremonies recognised the film, at least this many —
   *  consensus across juries, not volume at one of them (see nominationCount). */
  ceremonyCount: number | null;
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
  /** Total major award wins, at least this many — the counterpart to nominationCount. */
  winsMin: number | null;
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

/**
 * One selectable option and how many films sit behind it under the filters
 * currently applied — with this facet's own filter excluded, so the number reads
 * as "what picking this would leave", not "what it already matched".
 *
 * `value` is always a string, years included, because it is the value a control
 * round-trips through the URL.
 */
export interface FacetCount {
  value: string;
  count: number;
}

/**
 * A category, plus the ceremonies that award it — the dropdown groups by them,
 * since "Best Director" alone does not say whose.
 *
 * Usually one body. A handful of names are awarded by two (Cannes and Berlinale
 * both give a "Special Mention"), and since the filter matches the NAME across
 * every selected ceremony, such a category is one selectable value that appears
 * under each of its groups rather than two independent options.
 */
export interface CategoryFacetCount extends FacetCount {
  bodies: AwardBodyFilter[];
}

/**
 * The browse panel's option lists, counted against the current filter set.
 *
 * Lists whose membership varies (categories, genres, countries, languages,
 * years) only contain reachable values. Fixed control rows (award bodies,
 * content types) always contain every value, counted — a chip row that dropped
 * its members would reflow under the pointer.
 */
export interface FacetCounts {
  awardBodies: FacetCount[];
  categories: CategoryFacetCount[];
  awardYears: FacetCount[];
  contentTypes: FacetCount[];
  /** Kinds of television (Miniseries, Scripted, Documentary …) — empty for a
   *  filter set that matches no series, which is when its control is hidden. */
  tvTypes: FacetCount[];
  genres: FacetCount[];
  releaseYears: FacetCount[];
  languages: FacetCount[];
  countries: FacetCount[];
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

export interface SiteFeedback {
  id: string;
  email: string | null;
  body: string;
  createdAt: string;
}

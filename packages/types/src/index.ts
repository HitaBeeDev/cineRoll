export interface CastMember {
  name: string;
  character: string;
  photoUrl: string | null;
}

export interface AwardRecord {
  awardBody: "oscar" | "goldenglobe" | "cannes";
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
  rtScore: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  certificate: string | null;
  tvType: string | null;
  tvStartYear: number | null;
  tvEndYear: number | null;
  oscarNominations: number;
  oscarWins: number;
  oscarCategories: AwardRecord[];
  ggNominations: number;
  ggWins: number;
  ggCategories: AwardRecord[];
  cannesNominations: number;
  cannesWins: number;
  cannesCategories: AwardRecord[];
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

export type AwardBody = "oscar" | "goldenglobe" | "cannes" | "all";
export type FilmSort = "newest" | "title" | "rating" | "rt" | "awards";
export type SortOrder = "asc" | "desc";

export interface FilterState {
  search: string;
  person: string;
  director: string;
  femaleDirectorOnly: boolean;
  awardBody: AwardBody;
  winnerOnly: boolean;
  nominatedOnly: boolean;
  category: string;
  awardYear: number | null;
  language: string;
  genre: string;
  contentType: string;
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

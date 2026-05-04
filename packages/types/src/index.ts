export interface AwardRecord {
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
  releaseYear: number;
  /** Alias used by the current database/API shape. */
  year: number;
  runtime: number | null;
  genres: string[];
  plot: string | null;
  director: string | null;
  cast: string[];
  language: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  oscarNominations: number;
  oscarWins: number;
  oscarCategories: AwardRecord[];
  ggNominations: number;
  ggWins: number;
  ggCategories: AwardRecord[];
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

export type AwardBody = "oscar" | "goldenglobe" | "both";

export interface FilterState {
  search: string;
  person: string;
  director: string;
  awardBody: AwardBody;
  winnerOnly: boolean;
  nominatedOnly: boolean;
  category: string;
  awardYear: number | null;
  genre: string;
  decadeMin: number;
  decadeMax: number;
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

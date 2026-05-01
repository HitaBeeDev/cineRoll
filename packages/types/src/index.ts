export interface AwardCategory {
  category: string;
  year: number;
  won: boolean;
}

export interface Film {
  id: string;
  slug: string;
  tmdbId: number | null;
  imdbId: string | null;
  title: string;
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
  oscarCategories: AwardCategory[];
  ggNominations: number;
  ggWins: number;
  ggCategories: AwardCategory[];
  isPickOfDay: boolean;
  pickOfDayDate: string | null;
}

export interface RollEvent {
  id: string;
  filmId: string;
  rolledAt: string;
}

export interface FilterState {
  search: string;
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

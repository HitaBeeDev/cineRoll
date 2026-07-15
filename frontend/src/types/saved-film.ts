export type SavedFilm = {
  id: string;
  slug: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
  genres: string[];
  contentType: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  oscarWins: number;
  oscarNominations: number;
  ggWins: number;
  ggNominations: number;
  cannesWins: number;
  cannesNominations: number;
  berlinWins: number;
  berlinNominations: number;
};

export type SavedFilmEntry = {
  id: string;
  film: SavedFilm;
};

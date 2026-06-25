export type AwardRow = {
  filmSlug: string;
  filmTitle: string;
  releaseYear: number;
  posterUrl: string | null;
  category: string;
  awardYear: number;
  won: boolean;
};

export type FilmRow = {
  id: string;
  slug: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  imdbRating: number | null;
};

export type PersonFilm = FilmRow & {
  role: "director" | "nominee";
};

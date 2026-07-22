import type { Film, PaginatedFilms } from "@cineroll/types";

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

export type PersonSuggestion = {
  name: string;
  roles: string[];
  count: number;
};

export type TasteCardFilm = PaginatedFilms["films"][number];

export type AutocompleteResult = {
  films: {
    slug: string;
    title: string;
    year: number;
    posterUrl: string | null;
  }[];
  people: { name: string; roles: string[] }[];
};

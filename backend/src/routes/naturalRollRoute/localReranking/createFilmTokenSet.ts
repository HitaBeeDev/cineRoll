import type { RandomFilmRow } from "../../random";
import { tokenize } from "../tokenize";

export const createFilmTokenSet = (film: RandomFilmRow): Set<string> => {
  const tags = [...(film.moodTags ?? []), ...(film.keywords ?? [])];

  return new Set([
    ...tokenizeFilmFields(film),
    ...tags.map(tag => tag.toLowerCase()),
    ...tokenize(tags.join(" ")),
  ]);
};

const tokenizeFilmFields = (film: RandomFilmRow): string[] =>
  tokenize([
    film.title,
    film.originalTitle,
    film.year,
    film.genres.join(" "),
    film.director,
    film.plot,
  ].filter(Boolean).join(" "));

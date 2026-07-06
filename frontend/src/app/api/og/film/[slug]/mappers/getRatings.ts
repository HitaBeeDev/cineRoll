import type { Film } from "@cineroll/types";

import type { FilmOgRating } from "../filmOgTypes";

export function getRatings(film: Film): FilmOgRating[] {
  return [getImdbRating(film), getRottenTomatoesRating(film)].filter(
    (rating): rating is FilmOgRating => Boolean(rating),
  );
}

function getImdbRating(film: Film): FilmOgRating | null {
  if (film.imdbRating == null) return null;
  return { label: "IMDb", value: film.imdbRating.toFixed(1), dotColor: "#E3B53E" };
}

function getRottenTomatoesRating(film: Film): FilmOgRating | null {
  if (film.rtScore == null) return null;
  return { label: "RT", value: `${film.rtScore}%`, dotColor: "#FA320A" };
}

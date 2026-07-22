import { createAwardTokens } from "./createAwardTokens";
import { createDecadeToken } from "./createDecadeToken";
import type { FeatureToken, TfidfFilm } from "./types";

// Binary term frequency: each feature is emitted at most once.
export const createFilmTokens = (film: TfidfFilm): FeatureToken[] => {
  const tokens = new Set<FeatureToken>();

  for (const genre of film.genres) tokens.add(`genre:${genre}`);
  if (film.director) tokens.add(`director:${film.director}`);

  const decade = createDecadeToken(film.releaseYear);
  if (decade) tokens.add(decade);

  for (const award of createAwardTokens(film)) tokens.add(award);

  return [...tokens];
};

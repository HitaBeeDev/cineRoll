import { createFilmTokens } from "./createFilmTokens";
import type { FeatureToken, IdfTable, TfidfFilm } from "./types";

// Smoothed IDF: ln((1 + document count) / (1 + document frequency)) + 1.
export const buildIdf = (films: TfidfFilm[]): IdfTable => {
  const documentFrequency = countDocumentFrequency(films);
  const idf: IdfTable = new Map();

  for (const [token, frequency] of documentFrequency) {
    idf.set(token, Math.log((1 + films.length) / (1 + frequency)) + 1);
  }

  return idf;
};

const countDocumentFrequency = (films: TfidfFilm[]): Map<FeatureToken, number> => {
  const frequencies = new Map<FeatureToken, number>();

  for (const film of films) {
    for (const token of createFilmTokens(film)) {
      frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
    }
  }

  return frequencies;
};

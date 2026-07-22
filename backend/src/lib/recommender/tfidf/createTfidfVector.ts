import { createFilmTokens } from "./createFilmTokens";
import type { IdfTable, SparseVector, TfidfFilm } from "./types";

export const createTfidfVector = (
  film: TfidfFilm,
  idf: IdfTable,
): SparseVector => {
  const vector: SparseVector = new Map();

  for (const token of createFilmTokens(film)) {
    const weight = idf.get(token);
    if (weight != null) vector.set(token, weight);
  }

  return vector;
};

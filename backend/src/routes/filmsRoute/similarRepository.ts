import { buildSimilaritySql } from "./buildSimilaritySql";
import { findSimilaritySourceFilm } from "./findSimilaritySourceFilm";
import { querySimilarFilmRows } from "./querySimilarFilmRows";
import { hasNarrowingCriterion } from "./similarityClauses";
import type { SimilarFilmRow } from "./similarFilmRow";

export const getSimilarFilms = async (
  slug: string,
): Promise<SimilarFilmRow[] | null> => {
  const sourceFilm = await findSimilaritySourceFilm(slug);
  if (!sourceFilm) return null;

  const similarity = buildSimilaritySql(sourceFilm);
  // No narrowing criterion means no neighbourhood to search: a film with no
  // director, no genres, no cast and no award years has nothing to be like.
  if (!hasNarrowingCriterion(similarity)) return [];

  const rows = await querySimilarFilmRows(sourceFilm.id, similarity);
  return rows.map(row => ({ ...row, year: row.releaseYear }));
};

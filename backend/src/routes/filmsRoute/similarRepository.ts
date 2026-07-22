import { buildSimilaritySql } from "./buildSimilaritySql";
import { findSimilaritySourceFilm } from "./findSimilaritySourceFilm";
import { querySimilarFilmRows } from "./querySimilarFilmRows";
import type { SimilarFilmRow } from "./similarFilmRow";

export const getSimilarFilms = async (
  slug: string,
): Promise<SimilarFilmRow[] | null> => {
  const sourceFilm = await findSimilaritySourceFilm(slug);
  if (!sourceFilm) return null;

  const similarity = buildSimilaritySql(sourceFilm);
  if (similarity.whereParts.length === 0) return [];

  const rows = await querySimilarFilmRows(sourceFilm.id, similarity);
  return rows.map(row => ({ ...row, year: row.releaseYear }));
};

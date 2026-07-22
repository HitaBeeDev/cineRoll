import { Prisma } from "@prisma/client";

import { createCeremonyYearCheck } from "./createCeremonyYearCheck";
import { extractAwardYears } from "./extractAwardYears";
import type { SimilaritySourceFilm } from "./similaritySourceFilm";
import type { SimilaritySql } from "./similaritySql";

export const buildSimilaritySql = (film: SimilaritySourceFilm): SimilaritySql => {
  const similarity: SimilaritySql = { whereParts: [], scoreParts: [] };

  addDirectorCriterion(similarity, film.director);
  addGenreCriterion(similarity, film.genres);
  addCeremonyYearCriterion(similarity, extractAwardYears(film));

  return similarity;
};

const addDirectorCriterion = (
  similarity: SimilaritySql,
  director: string | null,
): void => {
  if (!director) return;

  const condition = Prisma.sql`"Film"."director" = ${director}`;
  similarity.whereParts.push(condition);
  similarity.scoreParts.push(Prisma.sql`CASE WHEN ${condition} THEN 1 ELSE 0 END`);
};

const addGenreCriterion = (similarity: SimilaritySql, genres: string[]): void => {
  if (genres.length === 0) return;

  const genreArray = Prisma.join(genres.map(genre => Prisma.sql`${genre}`), ",");
  const condition = Prisma.sql`"Film"."genres" && ARRAY[${genreArray}]::text[]`;
  similarity.whereParts.push(condition);
  similarity.scoreParts.push(Prisma.sql`CASE WHEN ${condition} THEN 1 ELSE 0 END`);
};

const addCeremonyYearCriterion = (
  similarity: SimilaritySql,
  ceremonyYears: number[],
): void => {
  if (ceremonyYears.length === 0) return;

  const condition = createCeremonyYearCheck(ceremonyYears);
  similarity.whereParts.push(condition);
  similarity.scoreParts.push(Prisma.sql`CASE WHEN ${condition} THEN 1 ELSE 0 END`);
};

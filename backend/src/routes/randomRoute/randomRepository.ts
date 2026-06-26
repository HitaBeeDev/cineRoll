import { Prisma } from "@prisma/client";

import { buildWhereClause } from "../../lib/filmFilters/whereClause";
import { RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { prisma } from "../../lib/prisma";
import { countFilms } from "./countRepository";
import { buildExclusionConditions } from "./exclusions";
import { randomSelect } from "./selects";
import { RandomFilmRow, RandomFilmResult } from "./types";

export async function getRandomFilm(query: RandomQuery): Promise<RandomFilmResult> {
  const { films, total } = await getRandomFilms(query, 1);

  return { film: films[0] ?? null, total };
}

export async function getRandomFilms(
  query: RandomQuery,
  count: number,
): Promise<{ films: RandomFilmRow[]; total: number }> {
  const additionalConditions = await buildExclusionConditions(query);
  const whereSql = buildWhereClause(query, additionalConditions);
  // A seed makes ordering deterministic: hashing seed+id gives a stable but
  // well-shuffled order, so the same seed always surfaces the same film(s)
  // from an unchanged pool. Without a seed we keep true per-request randomness.
  const orderBy = query.seed
    ? Prisma.sql`ORDER BY md5(${query.seed} || "Film"."id")`
    : Prisma.sql`ORDER BY RANDOM()`;
  const [films, total] = await Promise.all([
    prisma.$queryRaw<RandomFilmRow[]>(
      Prisma.sql`SELECT ${randomSelect} FROM "Film" ${whereSql} ${orderBy} LIMIT ${count}`,
    ),
    countFilms(query, whereSql, additionalConditions.length === 0),
  ]);

  return { films, total };
}

export async function getQualityCandidates(
  query: RandomQuery,
  topN: number,
  sampleN: number,
): Promise<{ films: RandomFilmRow[]; total: number }> {
  const additionalConditions = await buildExclusionConditions(query);
  const whereSql = buildWhereClause(query, additionalConditions);
  const [films, total] = await Promise.all([
    prisma.$queryRaw<RandomFilmRow[]>(
      Prisma.sql`
        SELECT top_films.*
        FROM (
          SELECT ${randomSelect}
          FROM "Film"
          ${whereSql}
          ORDER BY "Film"."imdbRating" DESC NULLS LAST
          LIMIT ${topN}
        ) top_films
        ORDER BY RANDOM()
        LIMIT ${sampleN}
      `,
    ),
    countFilms(query, whereSql, additionalConditions.length === 0),
  ]);

  return { films, total };
}

export async function getRandomCount(query: RandomQuery): Promise<number> {
  const additionalConditions = await buildExclusionConditions(query);
  const whereSql = buildWhereClause(query, additionalConditions);

  return countFilms(query, whereSql, additionalConditions.length === 0);
}

export async function getPersonalizedPool(query: RandomQuery, limit: number) {
  const additionalConditions = await buildExclusionConditions(query);
  const whereSql = buildWhereClause(query, additionalConditions);
  const [pool, total] = await Promise.all([
    prisma.$queryRaw<RandomFilmRow[]>(
      Prisma.sql`
        SELECT ${randomSelect}
        FROM "Film"
        ${whereSql}
        ORDER BY "Film"."imdbRating" DESC NULLS LAST
        LIMIT ${limit}
      `,
    ),
    countFilms(query, whereSql, additionalConditions.length === 0),
  ]);

  return { pool, total };
}

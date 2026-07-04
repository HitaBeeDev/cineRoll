import { Prisma } from "@prisma/client";

import { buildWhereClause } from "../../lib/filmFilters/whereClause";
import { RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { prisma } from "../../lib/prisma";
import { countFilms } from "./countRepository";
import { eligibilityConditions } from "./eligibility";
import { buildExclusionConditions } from "./exclusions";
import { randomSelect } from "./selects";
import { RandomFilmRow, RandomFilmResult } from "./types";

// Every roll path shares the same WHERE add-ons: the constant eligibility gate
// plus any user-specific exclusions. `cacheable` tracks only the user-specific
// part — the pool count stays cacheable per filter set even though the (constant)
// eligibility gate is always applied.
async function rollConditions(
  query: RandomQuery,
): Promise<{ conditions: Prisma.Sql[]; cacheable: boolean }> {
  const exclusions = await buildExclusionConditions(query);
  return {
    conditions: [...eligibilityConditions(), ...exclusions],
    cacheable: exclusions.length === 0,
  };
}

export async function getRandomFilm(query: RandomQuery): Promise<RandomFilmResult> {
  const { films, total } = await getRandomFilms(query, 1);

  return { film: films[0] ?? null, total };
}

export async function getRandomFilms(
  query: RandomQuery,
  count: number,
): Promise<{ films: RandomFilmRow[]; total: number }> {
  const { conditions, cacheable } = await rollConditions(query);
  const whereSql = buildWhereClause(query, conditions);
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
    countFilms(query, whereSql, cacheable),
  ]);

  return { films, total };
}

// Returns a quality-biased candidate sample only — no pool count. The caller
// (natural-roll relaxation) may probe several filter sets before one matches,
// so the (single) total is computed once, separately, via getRandomCount rather
// than on every probe.
export async function getQualityCandidates(
  query: RandomQuery,
  topN: number,
  sampleN: number,
): Promise<RandomFilmRow[]> {
  const { conditions } = await rollConditions(query);
  const whereSql = buildWhereClause(query, conditions);

  return prisma.$queryRaw<RandomFilmRow[]>(
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
  );
}

export async function getRandomCount(query: RandomQuery): Promise<number> {
  const { conditions, cacheable } = await rollConditions(query);
  const whereSql = buildWhereClause(query, conditions);

  return countFilms(query, whereSql, cacheable);
}

// The number the UI shows as the "Reel Pool". Counts the FULL catalog for the
// given filters — no eligibility gate, no user exclusions — so the pool always
// reads the real total X even though the roll draws from the narrower eligible
// set. The one exception: when nothing is actually rollable we report 0, so an
// all-ineligible filter set surfaces as "No matches" instead of a non-zero count
// you can't roll from.
export async function getDisplayCount(query: RandomQuery): Promise<number> {
  const { conditions, cacheable } = await rollConditions(query);
  const [catalog, rollable] = await Promise.all([
    countFilms(query, buildWhereClause(query, []), true, "catalog"),
    countFilms(query, buildWhereClause(query, conditions), cacheable),
  ]);

  return rollable === 0 ? 0 : catalog;
}

export async function getPersonalizedPool(query: RandomQuery, limit: number) {
  const { conditions, cacheable } = await rollConditions(query);
  const whereSql = buildWhereClause(query, conditions);
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
    countFilms(query, whereSql, cacheable),
  ]);

  return { pool, total };
}

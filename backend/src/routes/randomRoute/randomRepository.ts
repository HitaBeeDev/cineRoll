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

// How many films the roll can actually draw from, for these filters. This is the
// number any control that PROMISES a draw must quote — browse's "Roll from N
// films" is a claim about what pressing it will do.
export async function getRandomCount(query: RandomQuery): Promise<number> {
  const { conditions, cacheable } = await rollConditions(query);
  const whereSql = buildWhereClause(query, conditions);

  return countFilms(query, whereSql, cacheable);
}

/**
 * How big the catalogue is for these filters, ignoring the roll's quality gate.
 *
 * The home page states the size of the ARCHIVE — the same 9,180 browse and stats
 * report — rather than the size of the reel, so the headline figure is one
 * number across the whole product. The roll still draws from the narrower
 * eligible set; that is a fact about the draw, not about the collection, and the
 * label above the number says "archive" so the figure is not read as a promise.
 *
 * The one place the gate does leak in: when NOTHING is rollable this returns 0
 * rather than the catalogue size. Callers use the same number to decide whether
 * to disable the roll, and a filter set that lists films but can draw none has
 * to read as "no matches" — otherwise the button offers a draw that 404s.
 */
export async function getCatalogCount(query: RandomQuery): Promise<number> {
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

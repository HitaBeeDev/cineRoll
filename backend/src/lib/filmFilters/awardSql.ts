import { Prisma } from "@prisma/client";

import { AWARD_BODY_VALUES, AwardBodyValue } from "./constants";
import { ListQuery } from "./listQuerySchema";

// The JSON columns to search for an award match. With no bodies selected (empty
// or undefined) every corpus is searched; otherwise only the chosen ones are,
// unioned with OR by the caller.
const AWARD_JSON_COLUMNS: Record<AwardBodyValue, Prisma.Sql> = {
  oscar: Prisma.sql`"Film"."oscarCategories"`,
  goldenglobe: Prisma.sql`"Film"."ggCategories"`,
  cannes: Prisma.sql`"Film"."cannesCategories"`,
  berlin: Prisma.sql`"Film"."berlinCategories"`,
};

/**
 * The same sources paired with the body they belong to, for callers that have to
 * report which ceremony a row came from rather than just match against it.
 */
export function awardJsonSourceEntries(
  awardBodies: ListQuery["awardBody"],
): { body: AwardBodyValue; source: Prisma.Sql }[] {
  const bodies =
    !awardBodies || awardBodies.length === 0 ? [...AWARD_BODY_VALUES] : awardBodies;

  return bodies.map(body => ({ body, source: AWARD_JSON_COLUMNS[body] }));
}

export function awardJsonSources(awardBodies: ListQuery["awardBody"]) {
  return awardJsonSourceEntries(awardBodies).map(entry => entry.source);
}

export function awardExists(
  awardBodies: ListQuery["awardBody"],
  awardConditions: Prisma.Sql[] = [],
) {
  const whereSql =
    awardConditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(awardConditions, " AND ")}`
      : Prisma.empty;

  const existsClauses = awardJsonSources(awardBodies).map(source => Prisma.sql`
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements(${source}) AS award
      ${whereSql}
    )
  `);

  return Prisma.sql`(${Prisma.join(existsClauses, " OR ")})`;
}

/**
 * The conditions a single award row must satisfy, over an `award` alias bound by
 * `jsonb_array_elements`. They all live inside one EXISTS, so they describe ONE
 * award: "winner, in 1994, of Best Picture" never matches a film that won
 * something else in 1994 and was merely nominated for Best Picture.
 *
 * Exported because the facet counts enumerate the same award rows to count them
 * (see facetCounts/). Deriving both from this one function is what lets a facet
 * drop its own filter simply by deleting that key from the query — the award-level
 * conditions then rebuild themselves without it, with no second list to keep in sync.
 */
export function awardElementConditions(query: ListQuery): Prisma.Sql[] {
  const awardConditions: Prisma.Sql[] = [];

  if (query.awardYearMin !== undefined) {
    awardConditions.push(Prisma.sql`(award->>'awardYear')::INT >= ${query.awardYearMin}`);
  }

  if (query.awardYearMax !== undefined) {
    awardConditions.push(Prisma.sql`(award->>'awardYear')::INT <= ${query.awardYearMax}`);
  }

  if (query.category && query.category.length > 0) {
    // Multiple categories are OR'd: an award matching any selected category counts.
    const categoryMatches = query.category.map(
      cat => Prisma.sql`award->>'category' ILIKE ${`%${cat}%`}`,
    );
    awardConditions.push(Prisma.sql`(${Prisma.join(categoryMatches, " OR ")})`);
  }

  if (query.winnerOnly === true) {
    awardConditions.push(Prisma.sql`(award->>'won')::BOOLEAN = true`);
  }

  return awardConditions;
}

export function awardFilter(query: ListQuery) {
  const awardConditions = awardElementConditions(query);

  const noBodies = !query.awardBody || query.awardBody.length === 0;
  if (noBodies && query.nominatedOnly !== true && awardConditions.length === 0) {
    return undefined;
  }

  return awardExists(query.awardBody, awardConditions);
}

export { AWARD_BODY_VALUES };
export type { AwardBodyValue };

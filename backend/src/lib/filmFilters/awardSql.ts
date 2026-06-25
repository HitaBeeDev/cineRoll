import { Prisma } from "@prisma/client";

import { AWARD_BODY_VALUES, AwardBodyValue } from "./constants";
import { ListQuery } from "./querySchemas";

// The JSON columns to search for an award match. With no bodies selected (empty
// or undefined) every corpus is searched; otherwise only the chosen ones are,
// unioned with OR by the caller.
export function awardJsonSources(awardBodies: ListQuery["awardBody"]) {
  const byBody: Record<AwardBodyValue, Prisma.Sql> = {
    oscar: Prisma.sql`"Film"."oscarCategories"`,
    goldenglobe: Prisma.sql`"Film"."ggCategories"`,
    cannes: Prisma.sql`"Film"."cannesCategories"`,
    berlin: Prisma.sql`"Film"."berlinCategories"`,
  };

  if (!awardBodies || awardBodies.length === 0) {
    return Object.values(byBody);
  }

  return awardBodies.map(body => byBody[body]);
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

export function awardFilter(query: ListQuery) {
  const awardConditions: Prisma.Sql[] = [];

  if (query.awardYear !== undefined) {
    awardConditions.push(Prisma.sql`(award->>'awardYear')::INT = ${query.awardYear}`);
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

  const noBodies = !query.awardBody || query.awardBody.length === 0;
  if (noBodies && query.nominatedOnly !== true && awardConditions.length === 0) {
    return undefined;
  }

  return awardExists(query.awardBody, awardConditions);
}

export { AWARD_BODY_VALUES };
export type { AwardBodyValue };

import { Prisma } from "@prisma/client";
import type { CategoryFacetCount, FacetCount } from "@cineroll/types";

import {
  awardElementConditions,
  awardJsonSourceEntries,
  awardJsonSources,
  AWARD_BODY_VALUES,
  type AwardBodyValue,
} from "../../../lib/filmFilters/awardSql";
import { CONTENT_TYPE_FACET_VALUES } from "../../../lib/filmFilters/constants";
import { contentTypeSql } from "../../../lib/filmFilters/contentTypeSql";
import type { ListQuery } from "../../../lib/filmFilters/listQuerySchema";
import { buildWhereClause } from "../../../lib/filmFilters/whereClause";
import { andWhereClause } from "../../../lib/filmFilters/whereSql";
import { prisma } from "../../../lib/prisma";
import { scopeQueryToFacet } from "./facetScope";

/**
 * One counting query per facet. Every one of them scopes the query with
 * `scopeQueryToFacet` first, so each answers "how many films would this option
 * add / leave", not "how many match everything including itself".
 *
 * Option order is deliberately the natural one — alphabetical for names,
 * chronological for years — never by count. A list that reshuffles itself on
 * every tick makes the option under the pointer move between clicks; the count
 * column carries the magnitude without moving anything.
 */

type CountRow = { value: string | null; count: number };
type CategoryCountRow = CountRow & { bodies: string[] | null };
type AggregateRow = Record<string, number>;

/** Counts for values held in a TEXT[] column (genres, origin countries). */
async function countArrayColumn(
  query: ListQuery,
  facet: "genres" | "countries",
  column: string,
): Promise<FacetCount[]> {
  const scoped = scopeQueryToFacet(query, facet);
  const arrayColumn = Prisma.raw(`"Film"."${column}"`);

  const rows = await prisma.$queryRaw<CountRow[]>`
    SELECT "facetValue"."item" AS "value", COUNT(DISTINCT "Film"."id")::INT AS "count"
    FROM "Film", LATERAL unnest(${arrayColumn}) AS "facetValue"("item")
    ${buildWhereClause(scoped)}
    GROUP BY "facetValue"."item"
    ORDER BY "facetValue"."item" ASC
  `;

  return toFacetCounts(rows);
}

export function countGenres(query: ListQuery): Promise<FacetCount[]> {
  return countArrayColumn(query, "genres", "genres");
}

export function countCountries(query: ListQuery): Promise<FacetCount[]> {
  // originCountries, not countries — the facet has to count what the filter
  // matches on, or every number here would be a promise the filter breaks.
  return countArrayColumn(query, "countries", "originCountries");
}

export async function countLanguages(query: ListQuery): Promise<FacetCount[]> {
  const scoped = scopeQueryToFacet(query, "languages");
  const where = buildWhereClause(scoped, [
    Prisma.sql`"Film"."language" IS NOT NULL AND "Film"."language" <> ''`,
  ]);

  const rows = await prisma.$queryRaw<CountRow[]>`
    SELECT "Film"."language" AS "value", COUNT(*)::INT AS "count"
    FROM "Film"
    ${where}
    GROUP BY "Film"."language"
    ORDER BY "Film"."language" ASC
  `;

  return toFacetCounts(rows);
}

export async function countReleaseYears(query: ListQuery): Promise<FacetCount[]> {
  const scoped = scopeQueryToFacet(query, "releaseYears");
  const where = buildWhereClause(scoped, [Prisma.sql`"Film"."year" IS NOT NULL`]);

  const rows = await prisma.$queryRaw<CountRow[]>`
    SELECT "Film"."year"::TEXT AS "value", COUNT(*)::INT AS "count"
    FROM "Film"
    ${where}
    GROUP BY "Film"."year"
    ORDER BY "Film"."year" ASC
  `;

  return toFacetCounts(rows);
}

/**
 * Content types can't be counted with a GROUP BY: `types` is a set a film can
 * hold several of, and "Movie" means the feature (shorts excluded) rather than
 * the raw column value. So each bucket is counted by its own predicate — the
 * same `contentTypeSql` the filter uses — in one pass over the scoped set.
 */
export async function countContentTypes(query: ListQuery): Promise<FacetCount[]> {
  const scoped = scopeQueryToFacet(query, "contentTypes");
  const typesColumn = Prisma.sql`"Film"."types"`;

  const columns = CONTENT_TYPE_FACET_VALUES.map(
    (value, index) => Prisma.sql`
      (COUNT(*) FILTER (WHERE ${contentTypeSql(typesColumn, value)}))::INT AS ${aggregateAlias(index)}
    `,
  );

  const rows = await prisma.$queryRaw<AggregateRow[]>`
    SELECT ${Prisma.join(columns, ", ")}
    FROM "Film"
    ${buildWhereClause(scoped)}
  `;

  return readAggregateRow(rows[0], CONTENT_TYPE_FACET_VALUES);
}

/**
 * Films per award body, under every other filter. Same one-pass shape as content
 * types, because the four bodies are separate JSON columns rather than values of
 * one — each is counted by an EXISTS carrying the award-level conditions that
 * survive the scoping (category, ceremony year, winner-only).
 */
export async function countAwardBodies(query: ListQuery): Promise<FacetCount[]> {
  const scoped = scopeQueryToFacet(query, "awardBodies");
  const awardWhere = andWhereClause(awardElementConditions(scoped));

  const columns = AWARD_BODY_VALUES.map((body, index) => {
    const [source] = awardJsonSources([body]);
    return Prisma.sql`
      (COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(${source}) AS award ${awardWhere}
        )
      ))::INT AS ${aggregateAlias(index)}
    `;
  });

  const rows = await prisma.$queryRaw<AggregateRow[]>`
    SELECT ${Prisma.join(columns, ", ")}
    FROM "Film"
    ${buildWhereClause(scoped)}
  `;

  return readAggregateRow(rows[0], AWARD_BODY_VALUES);
}

/**
 * Award categories, counted over the award rows themselves.
 *
 * The `awardBody` filter is deliberately NOT scoped away here — it is what makes
 * the list finally answer "which categories can this ceremony actually give?".
 * With Cannes selected, only the Cannes JSON column is enumerated, so an Oscar
 * category can no longer be offered as a choice that returns nothing.
 *
 * Counting the rows rather than the films is what keeps winner-only honest: a
 * film that WON Best Director and was only nominated for Best Picture contributes
 * to Best Director alone, exactly as the filter would resolve it.
 */
export async function countCategories(query: ListQuery): Promise<CategoryFacetCount[]> {
  const scoped = scopeQueryToFacet(query, "categories");
  const where = buildWhereClause(scoped, [
    Prisma.sql`award->>'category' IS NOT NULL`,
    ...awardElementConditions(scoped),
  ]);

  // Each arm carries its ceremony through the union so the grouped dropdown can
  // say which body awards a category — "Best Director" alone does not.
  const sources = awardJsonSourceEntries(scoped.awardBody).map(
    ({ body, source }) => Prisma.sql`
      SELECT
        "Film"."id" AS "filmId",
        award->>'category' AS "category",
        -- Cast required: a bound parameter arrives untyped, and array_agg over an
        -- unknown-typed column is a planner error, not a runtime surprise.
        ${body}::TEXT AS "awardBody"
      FROM "Film", jsonb_array_elements(${source}) AS award
      ${where}
    `,
  );

  const rows = await prisma.$queryRaw<CategoryCountRow[]>`
    SELECT
      "category" AS "value",
      COUNT(DISTINCT "filmId")::INT AS "count",
      array_agg(DISTINCT "awardBody") AS "bodies"
    FROM (${Prisma.join(sources, " UNION ALL ")}) AS "awardRows"
    GROUP BY "category"
    ORDER BY "category" ASC
  `;

  // The count stays per category, not per (category, ceremony): one value is one
  // checkbox matching across every selected ceremony, so a per-ceremony number
  // would promise less than ticking it actually returns.
  return rows
    .filter((row): row is CategoryCountRow & { value: string } => row.value !== null)
    .map(row => ({
      value: row.value,
      count: Number(row.count),
      bodies: (row.bodies ?? []).filter(isAwardBody),
    }));
}

function isAwardBody(body: string): body is AwardBodyValue {
  return (AWARD_BODY_VALUES as readonly string[]).includes(body);
}

/** Ceremony years, over the same enumerated award rows as the categories. */
export async function countAwardYears(query: ListQuery): Promise<FacetCount[]> {
  const scoped = scopeQueryToFacet(query, "awardYears");
  const where = buildWhereClause(scoped, [
    Prisma.sql`award->>'awardYear' IS NOT NULL`,
    ...awardElementConditions(scoped),
  ]);

  const sources = awardJsonSources(scoped.awardBody).map(
    source => Prisma.sql`
      SELECT "Film"."id" AS "filmId", (award->>'awardYear')::INT AS "awardYear"
      FROM "Film", jsonb_array_elements(${source}) AS award
      ${where}
    `,
  );

  const rows = await prisma.$queryRaw<CountRow[]>`
    SELECT "awardYear"::TEXT AS "value", COUNT(DISTINCT "filmId")::INT AS "count"
    FROM (${Prisma.join(sources, " UNION ALL ")}) AS "awardRows"
    GROUP BY "awardYear"
    ORDER BY "awardYear" ASC
  `;

  return toFacetCounts(rows);
}

/** Positional alias (c0, c1 …) — generated, never user input. */
function aggregateAlias(index: number): Prisma.Sql {
  return Prisma.raw(`"c${index}"`);
}

/**
 * Turn a single wide aggregate row into the facet list, in the order the values
 * were declared. A value the scoped set has none of stays in the list with a
 * count of 0 — the fixed chip rows show it dimmed rather than reflowing.
 */
function readAggregateRow(
  row: AggregateRow | undefined,
  values: readonly string[],
): FacetCount[] {
  return values.map((value, index) => ({
    value,
    count: Number(row?.[`c${index}`] ?? 0),
  }));
}

function toFacetCounts(rows: CountRow[]): FacetCount[] {
  return rows
    .filter((row): row is CountRow & { value: string } => row.value !== null)
    .map(row => ({ value: row.value, count: Number(row.count) }));
}

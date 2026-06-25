import { prisma } from "../../lib/prisma";

export type PersonSuggestion = {
  name: string;
  roles: string[];
  count: number;
};

export async function searchPeople(query: string, limit: number): Promise<PersonSuggestion[]> {
  const queryLike = `%${query}%`;
  const queryPrefix = `${query}%`;
  const rows = await prisma.$queryRaw<{ name: string; roles: string[]; count: bigint }[]>`
    WITH names AS (
      SELECT "Film"."director" AS name, 'Director' AS role
      FROM "Film"
      WHERE "Film"."director" IS NOT NULL AND "Film"."director" <> ''

      UNION ALL

      SELECT "castName" AS name, 'Cast' AS role
      FROM "Film", jsonb_array_elements_text("Film"."cast") AS "castName"
      WHERE "castName" IS NOT NULL AND "castName" <> ''

      UNION ALL

      SELECT award->>'nominee' AS name, 'Award nominee' AS role
      FROM "Film", jsonb_array_elements("Film"."oscarCategories") AS award
      WHERE award->>'nominee' IS NOT NULL AND award->>'nominee' <> ''

      UNION ALL

      SELECT award->>'nominee' AS name, 'Award nominee' AS role
      FROM "Film", jsonb_array_elements("Film"."ggCategories") AS award
      WHERE award->>'nominee' IS NOT NULL AND award->>'nominee' <> ''

      UNION ALL

      SELECT award->>'nominee' AS name, 'Award nominee' AS role
      FROM "Film", jsonb_array_elements("Film"."cannesCategories") AS award
      WHERE award->>'nominee' IS NOT NULL AND award->>'nominee' <> ''
    )
    SELECT
      name,
      ARRAY_AGG(DISTINCT role ORDER BY role) AS roles,
      COUNT(*)::BIGINT AS count
    FROM names
    WHERE name ILIKE ${queryLike}
    GROUP BY name
    ORDER BY
      CASE WHEN name ILIKE ${queryPrefix} THEN 0 ELSE 1 END,
      count DESC,
      name ASC
    LIMIT ${limit}
  `;

  return rows.map(row => ({
    name: row.name,
    roles: row.roles,
    count: Number(row.count),
  }));
}

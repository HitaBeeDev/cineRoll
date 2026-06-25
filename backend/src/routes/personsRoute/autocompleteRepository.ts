import { prisma } from "../../lib/prisma";
import { nameToSlug } from "./slug";

export async function autocompletePeople(q: string, limit: number) {
  const queryLike = `%${q}%`;
  const queryPrefix = `${q}%`;
  const rows = await prisma.$queryRaw<{ name: string; roles: string[]; count: bigint }[]>`
    WITH names AS (
      SELECT "Film"."director" AS name, 'director' AS role
      FROM "Film"
      WHERE "Film"."director" IS NOT NULL AND "Film"."director" <> ''
      UNION ALL
      SELECT award->>'nominee', 'nominee'
      FROM "Film", jsonb_array_elements("Film"."oscarCategories") AS award
      WHERE award->>'nominee' IS NOT NULL AND award->>'nominee' <> '' AND award->>'nominee' <> 'NaN'
      UNION ALL
      SELECT award->>'nominee', 'nominee'
      FROM "Film", jsonb_array_elements("Film"."ggCategories") AS award
      WHERE award->>'nominee' IS NOT NULL AND award->>'nominee' <> '' AND award->>'nominee' <> 'NaN'
      UNION ALL
      SELECT award->>'nominee', 'nominee'
      FROM "Film", jsonb_array_elements("Film"."cannesCategories") AS award
      WHERE award->>'nominee' IS NOT NULL AND award->>'nominee' <> '' AND award->>'nominee' <> 'NaN'
    )
    SELECT name, ARRAY_AGG(DISTINCT role ORDER BY role) AS roles, COUNT(*)::BIGINT AS count
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
    slug: nameToSlug(row.name),
    roles: row.roles,
    count: Number(row.count),
  }));
}

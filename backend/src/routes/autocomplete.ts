import { Router } from "express";
import { z } from "zod";
import { setPublicCache } from "../lib/cache";
import { prisma } from "../lib/prisma";
import { getValidated, validate } from "../middleware/validate";

export const autocompleteRouter = Router();

const schema = z.object({
  q: z.string().trim().min(1).max(80),
});

autocompleteRouter.get("/", validate(schema, "query"), async (req, res) => {
  const { q } = getValidated<z.infer<typeof schema>>(req, "query");
  const queryLike = `%${q}%`;
  const queryPrefix = `${q}%`;

  const [filmRows, peopleRows] = await Promise.all([
    prisma.$queryRaw<{ slug: string; title: string; year: number; posterUrl: string | null }[]>`
      SELECT slug, title, year, "posterUrl"
      FROM "Film"
      WHERE title ILIKE ${queryLike}
      ORDER BY
        CASE WHEN title ILIKE ${queryPrefix} THEN 0 ELSE 1 END,
        COALESCE("imdbRating", 0) DESC,
        title ASC
      LIMIT 5
    `,
    prisma.$queryRaw<{ name: string; roles: string[]; count: bigint }[]>`
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
      LIMIT 5
    `,
  ]);

  setPublicCache(res, 60);
  res.json({
    films: filmRows.map((r) => ({ slug: r.slug, title: r.title, year: r.year, posterUrl: r.posterUrl })),
    people: peopleRows.map((r) => ({ name: r.name, roles: r.roles, count: Number(r.count) })),
  });
});

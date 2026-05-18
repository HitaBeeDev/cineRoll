import { Router } from "express";
import { z } from "zod";
import { setPublicCache } from "../lib/cache";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";

export const personsRouter = Router();

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type AwardRow = {
  filmSlug: string;
  filmTitle: string;
  releaseYear: number;
  posterUrl: string | null;
  category: string;
  awardYear: number;
  won: boolean;
};

type FilmRow = {
  id: string;
  slug: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  imdbRating: number | null;
};

// GET /api/persons/autocomplete?q=&limit=
const autocompleteSchema = z.object({
  q: z.string().trim().min(1).max(80),
  limit: z.coerce.number().int().min(1).max(12).default(8),
});

personsRouter.get("/autocomplete", validate(autocompleteSchema, "query"), async (req, res) => {
  const { q, limit } = getValidated<z.infer<typeof autocompleteSchema>>(req, "query");
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

  setPublicCache(res, 300);
  res.json({
    people: rows.map((r) => ({
      name: r.name,
      slug: nameToSlug(r.name),
      roles: r.roles,
      count: Number(r.count),
    })),
  });
});

// GET /api/persons/:slug
personsRouter.get("/:slug", async (req, res) => {
  const { slug } = req.params as { slug: string };

  // Candidate search string: "meryl-streep" → "meryl streep"
  const candidate = slug.replace(/-/g, " ");

  // Find all unique names that match and whose slug equals the input
  const nameRows = await prisma.$queryRaw<{ name: string }[]>`
    SELECT DISTINCT name FROM (
      SELECT "Film"."director" AS name
      FROM "Film"
      WHERE "Film"."director" ILIKE ${candidate}
      UNION
      SELECT award->>'nominee'
      FROM "Film", jsonb_array_elements("Film"."oscarCategories") AS award
      WHERE award->>'nominee' ILIKE ${candidate}
        AND award->>'nominee' <> 'NaN'
      UNION
      SELECT award->>'nominee'
      FROM "Film", jsonb_array_elements("Film"."ggCategories") AS award
      WHERE award->>'nominee' ILIKE ${candidate}
        AND award->>'nominee' <> 'NaN'
      UNION
      SELECT award->>'nominee'
      FROM "Film", jsonb_array_elements("Film"."cannesCategories") AS award
      WHERE award->>'nominee' ILIKE ${candidate}
        AND award->>'nominee' <> 'NaN'
    ) all_names
    WHERE name IS NOT NULL AND name <> ''
  `;

  // Find the name whose slug matches exactly
  const canonicalName = nameRows.find((r) => nameToSlug(r.name) === slug)?.name;

  if (!canonicalName) {
    throw new HttpError(404, `Person not found: ${slug}`, "PERSON_NOT_FOUND");
  }

  const nameLike = canonicalName; // exact match (case-insensitive via ILIKE)

  // Award records across all three bodies
  const [oscarRows, ggRows, cannesRows, directorFilms, nomineeFilms] = await Promise.all([
    prisma.$queryRaw<AwardRow[]>`
      SELECT
        f."slug" AS "filmSlug",
        f."title" AS "filmTitle",
        f."year" AS "releaseYear",
        f."posterUrl" AS "posterUrl",
        award->>'category' AS category,
        (award->>'awardYear')::INT AS "awardYear",
        (award->>'won')::BOOLEAN AS won
      FROM "Film" f, jsonb_array_elements(f."oscarCategories") AS award
      WHERE award->>'nominee' ILIKE ${nameLike}
      ORDER BY "awardYear" DESC, category ASC
    `,
    prisma.$queryRaw<AwardRow[]>`
      SELECT
        f."slug" AS "filmSlug",
        f."title" AS "filmTitle",
        f."year" AS "releaseYear",
        f."posterUrl" AS "posterUrl",
        award->>'category' AS category,
        (award->>'awardYear')::INT AS "awardYear",
        (award->>'won')::BOOLEAN AS won
      FROM "Film" f, jsonb_array_elements(f."ggCategories") AS award
      WHERE award->>'nominee' ILIKE ${nameLike}
      ORDER BY "awardYear" DESC, category ASC
    `,
    prisma.$queryRaw<AwardRow[]>`
      SELECT
        f."slug" AS "filmSlug",
        f."title" AS "filmTitle",
        f."year" AS "releaseYear",
        f."posterUrl" AS "posterUrl",
        award->>'category' AS category,
        (award->>'awardYear')::INT AS "awardYear",
        (award->>'won')::BOOLEAN AS won
      FROM "Film" f, jsonb_array_elements(f."cannesCategories") AS award
      WHERE award->>'nominee' ILIKE ${nameLike}
      ORDER BY "awardYear" DESC, category ASC
    `,
    // Films as director
    prisma.$queryRaw<FilmRow[]>`
      SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl", "imdbRating"
      FROM "Film"
      WHERE "director" ILIKE ${nameLike}
      ORDER BY "year" DESC
    `,
    // Films as nominee (distinct)
    prisma.$queryRaw<FilmRow[]>`
      SELECT DISTINCT f."id", f."slug", f."title", f."year" AS "releaseYear", f."posterUrl", f."imdbRating"
      FROM "Film" f
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(f."oscarCategories") a WHERE a->>'nominee' ILIKE ${nameLike}
      )
      OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(f."ggCategories") a WHERE a->>'nominee' ILIKE ${nameLike}
      )
      OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(f."cannesCategories") a WHERE a->>'nominee' ILIKE ${nameLike}
      )
      ORDER BY f."year" DESC
    `,
  ]);

  // Merge films: director films take priority, then nominee films
  const filmMap = new Map<string, FilmRow & { role: "director" | "nominee" }>();
  for (const f of nomineeFilms) {
    filmMap.set(f.id, { ...f, role: "nominee" });
  }
  for (const f of directorFilms) {
    filmMap.set(f.id, { ...f, role: "director" });
  }
  const films = [...filmMap.values()].sort((a, b) => b.releaseYear - a.releaseYear);

  const [allRecords, personRecord] = [
    [...oscarRows, ...ggRows, ...cannesRows],
    await prisma.person.findUnique({ where: { slug }, select: { photoUrl: true, bio: true } }),
  ];
  const totalNominations = allRecords.length;
  const totalWins = allRecords.filter((r) => r.won).length;

  setPublicCache(res, 3600);
  res.json({
    name: canonicalName,
    slug,
    photoUrl: personRecord?.photoUrl ?? null,
    bio: personRecord?.bio ?? null,
    totalNominations,
    totalWins,
    oscarRecords: oscarRows,
    ggRecords: ggRows,
    cannesRecords: cannesRows,
    films,
  });
});

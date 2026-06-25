import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { AwardRow, FilmRow } from "./types";

export async function findCandidateNames(candidate: string): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ name: string }[]>`
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

  return rows.map(row => row.name);
}

export async function getPersonAwardRows(name: string) {
  const [oscarRows, ggRows, cannesRows] = await Promise.all([
    getAwardRows("oscarCategories", name),
    getAwardRows("ggCategories", name),
    getAwardRows("cannesCategories", name),
  ]);

  return { oscarRows, ggRows, cannesRows };
}

export async function getPersonFilmRows(name: string) {
  const [directorFilms, nomineeFilms] = await Promise.all([
    getDirectorFilms(name),
    getNomineeFilms(name),
  ]);

  return { directorFilms, nomineeFilms };
}

export function getPersonRecord(slug: string) {
  return prisma.person.findUnique({
    where: { slug },
    select: { photoUrl: true, bio: true },
  });
}

function getAwardRows(column: string, name: string): Promise<AwardRow[]> {
  return prisma.$queryRaw<AwardRow[]>`
    SELECT
      f."slug" AS "filmSlug",
      f."title" AS "filmTitle",
      f."year" AS "releaseYear",
      f."posterUrl" AS "posterUrl",
      award->>'category' AS category,
      (award->>'awardYear')::INT AS "awardYear",
      (award->>'won')::BOOLEAN AS won
    FROM "Film" f, jsonb_array_elements(f.${prismaColumn(column)}) AS award
    WHERE award->>'nominee' ILIKE ${name}
    ORDER BY "awardYear" DESC, category ASC
  `;
}

function getDirectorFilms(name: string): Promise<FilmRow[]> {
  return prisma.$queryRaw<FilmRow[]>`
    SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl", "imdbRating"
    FROM "Film"
    WHERE "director" ILIKE ${name}
    ORDER BY "year" DESC
  `;
}

function getNomineeFilms(name: string): Promise<FilmRow[]> {
  return prisma.$queryRaw<FilmRow[]>`
    SELECT DISTINCT f."id", f."slug", f."title", f."year" AS "releaseYear", f."posterUrl", f."imdbRating"
    FROM "Film" f
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements(f."oscarCategories") a WHERE a->>'nominee' ILIKE ${name}
    )
    OR EXISTS (
      SELECT 1 FROM jsonb_array_elements(f."ggCategories") a WHERE a->>'nominee' ILIKE ${name}
    )
    OR EXISTS (
      SELECT 1 FROM jsonb_array_elements(f."cannesCategories") a WHERE a->>'nominee' ILIKE ${name}
    )
    ORDER BY f."year" DESC
  `;
}

function prismaColumn(column: string): Prisma.Sql {
  return Prisma.raw(`"${column}"`);
}

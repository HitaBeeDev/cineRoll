import { prisma } from "../../lib/prisma";

export async function listCertificates(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ certificate: string }[]>`
    SELECT DISTINCT "Film"."certificate"
    FROM "Film"
    WHERE "Film"."certificate" IS NOT NULL AND "Film"."certificate" <> ''
    ORDER BY "Film"."certificate" ASC
  `;

  return rows.map(row => row.certificate);
}

export async function listLanguages(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ language: string }[]>`
    SELECT DISTINCT "Film"."language"
    FROM "Film"
    WHERE "Film"."language" IS NOT NULL AND "Film"."language" <> ''
    ORDER BY "Film"."language" ASC
  `;

  return rows.map(row => row.language);
}

export async function listTvTypes(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ tvType: string }[]>`
    SELECT DISTINCT "Film"."tvType"
    FROM "Film"
    WHERE "Film"."tvType" IS NOT NULL AND "Film"."tvType" <> ''
    ORDER BY "Film"."tvType" ASC
  `;

  return rows.map(row => row.tvType);
}

export async function listGenres(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ genre: string }[]>`
    SELECT DISTINCT unnest("Film"."genres") AS genre
    FROM "Film"
    WHERE array_length("Film"."genres", 1) > 0
    ORDER BY genre ASC
  `;

  return rows.map(row => row.genre);
}

export async function listCountries(): Promise<string[]> {
  // The dropdown must offer exactly what the filter matches on — originCountries — or it
  // would list co-financing countries that now return nothing.
  const rows = await prisma.$queryRaw<{ country: string }[]>`
    SELECT DISTINCT unnest("Film"."originCountries") AS country
    FROM "Film"
    WHERE array_length("Film"."originCountries", 1) > 0
    ORDER BY country ASC
  `;

  return rows.map(row => row.country);
}

export async function listAwardYears(): Promise<number[]> {
  const rows = await prisma.$queryRaw<{ awardYear: number }[]>`
    SELECT DISTINCT (award->>'awardYear')::INT AS "awardYear"
    FROM "Film", jsonb_array_elements("Film"."oscarCategories") AS award
    WHERE award->>'awardYear' IS NOT NULL
    UNION
    SELECT DISTINCT (award->>'awardYear')::INT AS "awardYear"
    FROM "Film", jsonb_array_elements("Film"."ggCategories") AS award
    WHERE award->>'awardYear' IS NOT NULL
    UNION
    SELECT DISTINCT (award->>'awardYear')::INT AS "awardYear"
    FROM "Film", jsonb_array_elements("Film"."cannesCategories") AS award
    WHERE award->>'awardYear' IS NOT NULL
    ORDER BY "awardYear" ASC
  `;

  return rows.map(row => row.awardYear);
}

export async function listCategories(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ category: string }[]>`
    SELECT DISTINCT award->>'category' AS category
    FROM "Film", jsonb_array_elements("Film"."oscarCategories") AS award
    WHERE award->>'category' IS NOT NULL
    UNION
    SELECT DISTINCT award->>'category' AS category
    FROM "Film", jsonb_array_elements("Film"."ggCategories") AS award
    WHERE award->>'category' IS NOT NULL
    UNION
    SELECT DISTINCT award->>'category' AS category
    FROM "Film", jsonb_array_elements("Film"."cannesCategories") AS award
    WHERE award->>'category' IS NOT NULL
    ORDER BY category ASC
  `;

  return rows.map(row => row.category);
}

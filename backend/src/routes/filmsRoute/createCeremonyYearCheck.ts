import { Prisma } from "@prisma/client";

export const createCeremonyYearCheck = (years: number[]): Prisma.Sql => {
  const yearArray = Prisma.join(years.map(year => Prisma.sql`${year}`), ",");

  return Prisma.sql`(
    EXISTS (SELECT 1 FROM jsonb_array_elements("Film"."oscarCategories") AS a WHERE (a->>'awardYear')::int = ANY(ARRAY[${yearArray}]::int[]))
    OR EXISTS (SELECT 1 FROM jsonb_array_elements("Film"."ggCategories") AS a WHERE (a->>'awardYear')::int = ANY(ARRAY[${yearArray}]::int[]))
    OR EXISTS (SELECT 1 FROM jsonb_array_elements("Film"."cannesCategories") AS a WHERE (a->>'awardYear')::int = ANY(ARRAY[${yearArray}]::int[]))
  )`;
};

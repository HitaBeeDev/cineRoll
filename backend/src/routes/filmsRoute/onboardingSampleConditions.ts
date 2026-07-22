import { Prisma } from "@prisma/client";

export const createOnboardingSampleConditions = (): Prisma.Sql[] => [
  Prisma.sql`"Film"."contentType" = 'movie'`,
  Prisma.sql`"Film"."posterUrl" IS NOT NULL`,
  Prisma.sql`"Film"."imdbRating" IS NOT NULL`,
];

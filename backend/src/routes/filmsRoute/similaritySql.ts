import type { Prisma } from "@prisma/client";

export type SimilaritySql = {
  whereParts: Prisma.Sql[];
  scoreParts: Prisma.Sql[];
};

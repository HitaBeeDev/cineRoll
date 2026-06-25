import { Prisma } from "@prisma/client";

export function andWhereClause(predicates: Prisma.Sql[]): Prisma.Sql {
  return predicates.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(predicates, " AND ")}`
    : Prisma.empty;
}

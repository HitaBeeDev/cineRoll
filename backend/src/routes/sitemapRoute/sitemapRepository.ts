import { prisma } from "../../lib/prisma";

export type SitemapEntry = { slug: string; updatedAt: Date };
export type PersonCreditRow = { name: string; credits: number; updatedAt: Date };

/** Every film page, with the real time its row last changed. */
export function findFilmSitemapRows(): Promise<SitemapEntry[]> {
  return prisma.film.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { slug: "asc" },
  });
}

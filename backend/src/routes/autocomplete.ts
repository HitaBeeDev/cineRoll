import { Router } from "express";
import { z } from "zod";
import { setPublicCache } from "../lib/cache";
import { searchPeople } from "../lib/people/searchPeople";
import type { CreditSource } from "../lib/people/types";
import { prisma } from "../lib/prisma";
import { getValidated, validate } from "../middleware/validate";

export const autocompleteRouter = Router();

const schema = z.object({
  q: z.string().trim().min(1).max(80),
});

const PEOPLE_SOURCES: CreditSource[] = ["director", "nominee"];
const PEOPLE_LIMIT = 5;
const ROLE_LABELS: Record<CreditSource, string> = {
  director: "director",
  cast: "cast",
  nominee: "nominee",
};

autocompleteRouter.get("/", validate(schema, "query"), async (req, res) => {
  const { q } = getValidated<z.infer<typeof schema>>(req, "query");
  const queryLike = `%${q}%`;
  const queryPrefix = `${q}%`;

  const [filmRows, people] = await Promise.all([
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
    searchPeople(q, PEOPLE_SOURCES, PEOPLE_LIMIT),
  ]);

  setPublicCache(res, 60);
  res.json({
    films: filmRows.map((r) => ({ slug: r.slug, title: r.title, year: r.year, posterUrl: r.posterUrl })),
    people: people.map((person) => ({
      name: person.name,
      roles: person.sources.map((source) => ROLE_LABELS[source]),
      count: person.count,
    })),
  });
});

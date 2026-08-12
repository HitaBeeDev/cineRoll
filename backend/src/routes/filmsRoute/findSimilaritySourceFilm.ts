import { prisma } from "../../lib/prisma";
import type { SimilaritySourceFilm } from "./similaritySourceFilm";

export const findSimilaritySourceFilm = (
  slug: string,
): Promise<SimilaritySourceFilm | null> => prisma.film.findUnique({
  where: { slug },
  select: {
    id: true,
    director: true,
    genres: true,
    contentType: true,
    releaseYear: true,
    originCountries: true,
    language: true,
    cast: true,
    oscarCategories: true,
    ggCategories: true,
    cannesCategories: true,
  },
});

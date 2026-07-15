import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";

import { FilmFeatures } from "./model";

/**
 * A candidate film for the Taste Test: the display fields for quiz posters and
 * recommendation cards, plus everything `filmToVector` needs to place it in
 * taste space.
 */
export interface CandidateFilm extends FilmFeatures {
  id: string;
  slug: string;
  title: string;
  year: number;
  contentType: string;
  posterUrl: string | null;
  posterColor: string | null;
  backdropUrl: string | null;
  plot: string | null;
  director: string | null;
  runtime: number | null;
}

// How many recognizable films to keep per content type. Movies dominate the
// award corpus, so they get the deepest bench; the rest get enough for both a
// varied quiz and one confident recommendation each.
const PER_TYPE_CAP: Record<string, number> = {
  movie: 160,
  documentary: 60,
  animation: 60,
  "tv-series": 60,
  short: 45,
};
const DEFAULT_TYPE_CAP = 40;

/**
 * Recognizable award films, spread across content types so recommendations can
 * cover every type. Each type is capped independently (window function) and
 * ordered by a "known" score jittered with randomness, so the quiz and picks
 * vary between sessions without ever surfacing an obscure title nobody can
 * recognize. Poster is required — every card shows one.
 */
export async function getCandidatePool(): Promise<CandidateFilm[]> {
  const caps = Object.entries(PER_TYPE_CAP)
    .map(([type, cap]) => `WHEN '${type}' THEN ${cap}`)
    .join(" ");

  return prisma.$queryRawUnsafe<CandidateFilm[]>(`
    WITH scored AS (
      SELECT
        "id", "slug", "title", "year", "year" AS "releaseYear", "contentType",
        "genres", "language", "posterUrl", "posterColor", "backdropUrl", "plot",
        "director", "runtime", "imdbRating", "imdbTopMovieRank", "imdbTopTvRank",
        "oscarWins", "ggWins", "cannesWins", "berlinWins",
        (
          COALESCE("imdbRating", 0) * 9
          + CASE WHEN "imdbTopMovieRank" IS NOT NULL THEN ((260 - "imdbTopMovieRank") * 0.5) ELSE 0 END
          + CASE WHEN "imdbTopTvRank" IS NOT NULL THEN ((260 - "imdbTopTvRank") * 0.5) ELSE 0 END
          + ("oscarWins" * 10) + ("ggWins" * 7) + ("cannesWins" * 8) + ("berlinWins" * 6)
          + (("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations") * 1.5)
        ) AS "knownScore"
      FROM "Film"
      WHERE "posterUrl" IS NOT NULL
        AND ("oscarWins" + "ggWins" + "cannesWins" + "berlinWins"
             + "oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations") > 0
    ),
    ranked AS (
      SELECT scored.*,
        ROW_NUMBER() OVER (
          PARTITION BY "contentType"
          ORDER BY "knownScore" + (RANDOM() * 60) DESC
        ) AS "typeRank"
      FROM scored
    )
    SELECT
      "id", "slug", "title", "year", "contentType", "genres", "language",
      "posterUrl", "posterColor", "backdropUrl", "plot", "director", "runtime",
      "year" AS "releaseYear", "imdbRating", "imdbTopMovieRank", "imdbTopTvRank",
      "oscarWins", "ggWins", "cannesWins", "berlinWins"
    FROM ranked
    WHERE "typeRank" <= (CASE "contentType" ${caps} ELSE ${DEFAULT_TYPE_CAP} END)
  `);
}

/**
 * Fetch specific films by id (the posters a user tapped through the quiz), with
 * the same fields as the pool so their taste vectors can be computed.
 */
export async function getFilmsByIds(ids: string[]): Promise<CandidateFilm[]> {
  if (ids.length === 0) return [];
  return prisma.$queryRaw<CandidateFilm[]>`
    SELECT
      "id", "slug", "title", "year", "contentType", "genres", "language",
      "posterUrl", "posterColor", "backdropUrl", "plot", "director", "runtime",
      "year" AS "releaseYear", "imdbRating", "imdbTopMovieRank", "imdbTopTvRank",
      "oscarWins", "ggWins", "cannesWins", "berlinWins"
    FROM "Film"
    WHERE "id" IN (${Prisma.join([...new Set(ids)])})
  `;
}

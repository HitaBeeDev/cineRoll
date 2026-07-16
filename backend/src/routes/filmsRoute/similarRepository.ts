import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";

type AwardRec = { awardYear: number };

type SimilaritySourceFilm = {
  id: string;
  director: string | null;
  genres: string[];
  oscarCategories: unknown;
  ggCategories: unknown;
  cannesCategories: unknown;
};

type SimilaritySql = {
  whereParts: Prisma.Sql[];
  scoreParts: Prisma.Sql[];
};

export async function getSimilarFilms(slug: string) {
  const film = await findSimilaritySourceFilm(slug);
  if (!film) return null;

  const similarity = buildSimilaritySql(film);
  if (similarity.whereParts.length === 0) return [];

  const rows = await querySimilarRows(film.id, similarity);
  return rows.map(row => ({ ...row, year: row.releaseYear }));
}

async function findSimilaritySourceFilm(slug: string): Promise<SimilaritySourceFilm | null> {
  return prisma.film.findUnique({
    where: { slug },
    select: {
      id: true,
      director: true,
      genres: true,
      oscarCategories: true,
      ggCategories: true,
      cannesCategories: true,
    },
  });
}

function buildSimilaritySql(film: SimilaritySourceFilm): SimilaritySql {
  const whereParts: Prisma.Sql[] = [];
  const scoreParts: Prisma.Sql[] = [];

  addDirectorSimilarity(film, whereParts, scoreParts);
  addGenreSimilarity(film, whereParts, scoreParts);
  addCeremonyYearSimilarity(film, whereParts, scoreParts);

  return { whereParts, scoreParts };
}

function addDirectorSimilarity(
  film: SimilaritySourceFilm,
  whereParts: Prisma.Sql[],
  scoreParts: Prisma.Sql[],
): void {
  if (!film.director) return;

  whereParts.push(Prisma.sql`"Film"."director" = ${film.director}`);
  scoreParts.push(Prisma.sql`CASE WHEN "Film"."director" = ${film.director} THEN 1 ELSE 0 END`);
}

function addGenreSimilarity(
  film: SimilaritySourceFilm,
  whereParts: Prisma.Sql[],
  scoreParts: Prisma.Sql[],
): void {
  if (film.genres.length === 0) return;

  whereParts.push(Prisma.sql`"Film"."genres" && ARRAY[${genreArray(film.genres)}]::text[]`);
  scoreParts.push(
    Prisma.sql`CASE WHEN "Film"."genres" && ARRAY[${genreArray(film.genres)}]::text[] THEN 1 ELSE 0 END`,
  );
}

function addCeremonyYearSimilarity(
  film: SimilaritySourceFilm,
  whereParts: Prisma.Sql[],
  scoreParts: Prisma.Sql[],
): void {
  const ceremonyYears = awardYears(film);
  if (ceremonyYears.length === 0) return;

  const yearCheck = ceremonyYearCheck(ceremonyYears);
  whereParts.push(yearCheck);
  scoreParts.push(Prisma.sql`CASE WHEN ${yearCheck} THEN 1 ELSE 0 END`);
}

function awardYears(film: SimilaritySourceFilm): number[] {
  const allAwards = [
    ...((film.oscarCategories as AwardRec[]) ?? []),
    ...((film.ggCategories as AwardRec[]) ?? []),
    ...((film.cannesCategories as AwardRec[]) ?? []),
  ];

  return [...new Set(allAwards.map(record => record.awardYear))];
}

function genreArray(genres: string[]): Prisma.Sql {
  return Prisma.join(genres.map(genre => Prisma.sql`${genre}`), ",");
}

function ceremonyYearArray(ceremonyYears: number[]): Prisma.Sql {
  return Prisma.join(ceremonyYears.map(year => Prisma.sql`${year}`), ",");
}

function ceremonyYearCheck(ceremonyYears: number[]): Prisma.Sql {
  return Prisma.sql`(
    EXISTS (SELECT 1 FROM jsonb_array_elements("Film"."oscarCategories") AS a WHERE (a->>'awardYear')::int = ANY(ARRAY[${ceremonyYearArray(ceremonyYears)}]::int[]))
    OR EXISTS (SELECT 1 FROM jsonb_array_elements("Film"."ggCategories") AS a WHERE (a->>'awardYear')::int = ANY(ARRAY[${ceremonyYearArray(ceremonyYears)}]::int[]))
    OR EXISTS (SELECT 1 FROM jsonb_array_elements("Film"."cannesCategories") AS a WHERE (a->>'awardYear')::int = ANY(ARRAY[${ceremonyYearArray(ceremonyYears)}]::int[]))
  )`;
}

function querySimilarRows(excludedFilmId: string, similarity: SimilaritySql) {
  return prisma.$queryRaw<SimilarRow[]>(Prisma.sql`
    SELECT
      "Film"."id",
      "Film"."slug",
      "Film"."title",
      "Film"."originalTitle",
      "Film"."year" AS "releaseYear",
      "Film"."year",
      "Film"."genres",
      "Film"."contentType",
      "Film"."director",
      "Film"."posterUrl",
      "Film"."posterColor",
      "Film"."imdbRating",
      "Film"."imdbTopMovieRank",
      "Film"."imdbTopTvRank",
      "Film"."certificate",
      "Film"."tvType",
      "Film"."tvStartYear",
      "Film"."tvEndYear",
      "Film"."tvSeasons",
      "Film"."tvEpisodes",
      "Film"."oscarNominations",
      "Film"."oscarWins",
      "Film"."ggNominations",
      "Film"."ggWins",
      "Film"."cannesNominations",
      "Film"."cannesWins",
      "Film"."berlinNominations",
      "Film"."berlinWins"
    FROM "Film"
    WHERE "Film"."id" != ${excludedFilmId}
      AND (${Prisma.join(similarity.whereParts, " OR ")})
    ORDER BY (${Prisma.join(similarity.scoreParts, " + ")}) DESC, "Film"."imdbRating" DESC NULLS LAST
    LIMIT 6
  `);
}

type SimilarRow = {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  releaseYear: number;
  year: number;
  genres: string[];
  contentType: string;
  director: string | null;
  posterUrl: string | null;
  posterColor: string | null;
  imdbRating: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  certificate: string | null;
  tvType: string | null;
  tvStartYear: number | null;
  tvEndYear: number | null;
  tvSeasons: number | null;
  tvEpisodes: number | null;
  oscarNominations: number;
  oscarWins: number;
  ggNominations: number;
  ggWins: number;
  cannesNominations: number;
  cannesWins: number;
  berlinNominations: number;
  berlinWins: number;
};

import { Router } from "express";
import { setPublicCache } from "../lib/cache";
import { prisma } from "../lib/prisma";

export const statsRouter = Router();

type PersonStat = { name: string; count: number };
type FilmStat = {
  id: string;
  slug: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  count: number;
};
type YearStat = { awardYear: number; totalNominations: number };
type DecadeStat = { decade: number; filmCount: number; avgNominations: number };
type AwardBodyBreakdown = {
  oscarOnly: number;
  ggOnly: number;
  cannesOnly: number;
  multiAward: number;
  total: number;
};

const NON_PERSON_NOMINEE_PATTERN =
  "(award|prize|honou?rary|special|achievement|jury|committee|ensemble|cast|crew|film|picture|series|program|episode|song|score|screenplay|production|cinematography|editing|effects|sound|makeup|costume)";
const PERSON_ROLE_SUFFIX_PATTERN =
  ",\\s*(producer|director|composer|writer|screenwriter|lyricist|performer|actor|actress)$";

let watchlistTableExists: boolean | null = null;
async function hasWatchlist(): Promise<boolean> {
  if (watchlistTableExists !== null) return watchlistTableExists;
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT to_regclass('public."WatchlistEntry"') IS NOT NULL AS "exists"
  `;
  watchlistTableExists = rows[0]?.exists === true;
  return watchlistTableExists;
}

statsRouter.get("/", async (_req, res) => {
  const useWatchlist = await hasWatchlist();

  const [
    mostNominatedPersonRows,
    mostWinningPersonRows,
    mostNominatedFilmRows,
    mostWinningFilmRows,
    mostCompetitiveYearRows,
    decadeRows,
    awardBodyRows,
    topRolledRows,
    topWatchlistedRows,
    totalFilmsRow,
    totalNominationsRow,
    totalWinsRow,
  ] = await Promise.all([
    // Most nominated person (across all award bodies)
    prisma.$queryRaw<{ name: string; count: bigint }[]>`
      SELECT nominee AS name, COUNT(*)::BIGINT AS count
      FROM (
        SELECT regexp_replace(award->>'nominee', ${PERSON_ROLE_SUFFIX_PATTERN}, '', 'i') AS nominee
        FROM "Film", jsonb_array_elements("oscarCategories") AS award
        WHERE award->>'nominee' IS NOT NULL
          AND award->>'nominee' <> ''
          AND award->>'nominee' <> 'NaN'
        UNION ALL
        SELECT regexp_replace(award->>'nominee', ${PERSON_ROLE_SUFFIX_PATTERN}, '', 'i')
        FROM "Film", jsonb_array_elements("ggCategories") AS award
        WHERE award->>'nominee' IS NOT NULL
          AND award->>'nominee' <> ''
          AND award->>'nominee' <> 'NaN'
        UNION ALL
        SELECT regexp_replace(award->>'nominee', ${PERSON_ROLE_SUFFIX_PATTERN}, '', 'i')
        FROM "Film", jsonb_array_elements("cannesCategories") AS award
        WHERE award->>'nominee' IS NOT NULL
          AND award->>'nominee' <> ''
          AND award->>'nominee' <> 'NaN'
      ) all_nominees
      WHERE nominee !~* ${NON_PERSON_NOMINEE_PATTERN}
      GROUP BY nominee
      ORDER BY count DESC
      LIMIT 1
    `,

    // Most winning person (across all award bodies)
    prisma.$queryRaw<{ name: string; count: bigint }[]>`
      SELECT nominee AS name, COUNT(*)::BIGINT AS count
      FROM (
        SELECT regexp_replace(award->>'nominee', ${PERSON_ROLE_SUFFIX_PATTERN}, '', 'i') AS nominee
        FROM "Film", jsonb_array_elements("oscarCategories") AS award
        WHERE award->>'nominee' IS NOT NULL
          AND award->>'nominee' <> ''
          AND award->>'nominee' <> 'NaN'
          AND (award->>'won')::BOOLEAN = true
        UNION ALL
        SELECT regexp_replace(award->>'nominee', ${PERSON_ROLE_SUFFIX_PATTERN}, '', 'i')
        FROM "Film", jsonb_array_elements("ggCategories") AS award
        WHERE award->>'nominee' IS NOT NULL
          AND award->>'nominee' <> ''
          AND award->>'nominee' <> 'NaN'
          AND (award->>'won')::BOOLEAN = true
        UNION ALL
        SELECT regexp_replace(award->>'nominee', ${PERSON_ROLE_SUFFIX_PATTERN}, '', 'i')
        FROM "Film", jsonb_array_elements("cannesCategories") AS award
        WHERE award->>'nominee' IS NOT NULL
          AND award->>'nominee' <> ''
          AND award->>'nominee' <> 'NaN'
          AND (award->>'won')::BOOLEAN = true
      ) all_winners
      WHERE nominee !~* ${NON_PERSON_NOMINEE_PATTERN}
      GROUP BY nominee
      ORDER BY count DESC
      LIMIT 1
    `,

    // Film with most total nominations
    prisma.$queryRaw<{ id: string; slug: string; title: string; releaseYear: number; posterUrl: string | null; count: bigint }[]>`
      SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl",
        ("oscarNominations" + "ggNominations" + "cannesNominations")::BIGINT AS count
      FROM "Film"
      ORDER BY count DESC
      LIMIT 1
    `,

    // Film with most total wins
    prisma.$queryRaw<{ id: string; slug: string; title: string; releaseYear: number; posterUrl: string | null; count: bigint }[]>`
      SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl",
        ("oscarWins" + "ggWins" + "cannesWins")::BIGINT AS count
      FROM "Film"
      ORDER BY count DESC
      LIMIT 1
    `,

    // Most competitive ceremony year
    prisma.$queryRaw<{ awardYear: number; totalNominations: bigint }[]>`
      SELECT award_year AS "awardYear", SUM(nom_count)::BIGINT AS "totalNominations"
      FROM (
        SELECT (award->>'awardYear')::INT AS award_year, COUNT(*) AS nom_count
        FROM "Film", jsonb_array_elements("oscarCategories") AS award
        WHERE award->>'awardYear' IS NOT NULL
        GROUP BY award_year
        UNION ALL
        SELECT (award->>'awardYear')::INT, COUNT(*)
        FROM "Film", jsonb_array_elements("ggCategories") AS award
        WHERE award->>'awardYear' IS NOT NULL
        GROUP BY 1
        UNION ALL
        SELECT (award->>'awardYear')::INT, COUNT(*)
        FROM "Film", jsonb_array_elements("cannesCategories") AS award
        WHERE award->>'awardYear' IS NOT NULL
        GROUP BY 1
      ) years
      GROUP BY award_year
      ORDER BY "totalNominations" DESC
      LIMIT 1
    `,

    // Decade breakdown
    prisma.$queryRaw<{ decade: number; filmCount: bigint; avgNominations: number }[]>`
      SELECT
        FLOOR("year" / 10) * 10 AS decade,
        COUNT(*)::BIGINT AS "filmCount",
        ROUND(AVG("oscarNominations" + "ggNominations" + "cannesNominations")::NUMERIC, 2)::FLOAT AS "avgNominations"
      FROM "Film"
      WHERE "year" IS NOT NULL AND "year" >= 1920
      GROUP BY decade
      ORDER BY decade
    `,

    // Award body breakdown
    prisma.$queryRaw<{
      oscarOnly: bigint;
      ggOnly: bigint;
      cannesOnly: bigint;
      multiAward: bigint;
      total: bigint;
    }[]>`
      SELECT
        COUNT(*) FILTER (
          WHERE "oscarNominations" > 0 AND "ggNominations" = 0 AND "cannesNominations" = 0
        )::BIGINT AS "oscarOnly",
        COUNT(*) FILTER (
          WHERE "ggNominations" > 0 AND "oscarNominations" = 0 AND "cannesNominations" = 0
        )::BIGINT AS "ggOnly",
        COUNT(*) FILTER (
          WHERE "cannesNominations" > 0 AND "oscarNominations" = 0 AND "ggNominations" = 0
        )::BIGINT AS "cannesOnly",
        COUNT(*) FILTER (
          WHERE (
            (CASE WHEN "oscarNominations" > 0 THEN 1 ELSE 0 END)
            + (CASE WHEN "ggNominations" > 0 THEN 1 ELSE 0 END)
            + (CASE WHEN "cannesNominations" > 0 THEN 1 ELSE 0 END)
          ) > 1
        )::BIGINT AS "multiAward",
        COUNT(*)::BIGINT AS total
      FROM "Film"
      WHERE "oscarNominations" > 0 OR "ggNominations" > 0 OR "cannesNominations" > 0
    `,

    // Top 5 most-rolled films
    prisma.$queryRaw<{ id: string; slug: string; title: string; releaseYear: number; posterUrl: string | null; count: bigint }[]>`
      SELECT f."id", f."slug", f."title", f."year" AS "releaseYear", f."posterUrl",
        COUNT(*)::BIGINT AS count
      FROM "RollEvent" r
      JOIN "Film" f ON f."id" = r."filmId"
      GROUP BY f."id", f."slug", f."title", f."year", f."posterUrl"
      ORDER BY count DESC
      LIMIT 5
    `,

    // Top 5 most-watchlisted films (or empty if table doesn't exist yet)
    useWatchlist
      ? prisma.$queryRaw<{ id: string; slug: string; title: string; releaseYear: number; posterUrl: string | null; count: bigint }[]>`
          SELECT f."id", f."slug", f."title", f."year" AS "releaseYear", f."posterUrl",
            COUNT(*)::BIGINT AS count
          FROM "WatchlistEntry" w
          JOIN "Film" f ON f."id" = w."filmId"
          GROUP BY f."id", f."slug", f."title", f."year", f."posterUrl"
          ORDER BY count DESC
          LIMIT 5
        `
      : Promise.resolve([]),

    // Summary counts
    prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*)::BIGINT AS count FROM "Film"`,
    prisma.$queryRaw<{ total: bigint }[]>`
      SELECT SUM("oscarNominations" + "ggNominations" + "cannesNominations")::BIGINT AS total FROM "Film"
    `,
    prisma.$queryRaw<{ total: bigint }[]>`
      SELECT SUM("oscarWins" + "ggWins" + "cannesWins")::BIGINT AS total FROM "Film"
    `,
  ]);

  const toBigIntNumber = (v: bigint | number | null | undefined) => Number(v ?? 0);

  const mostNominatedPerson: PersonStat | null = mostNominatedPersonRows[0]
    ? { name: mostNominatedPersonRows[0].name, count: toBigIntNumber(mostNominatedPersonRows[0].count) }
    : null;

  const mostWinningPerson: PersonStat | null = mostWinningPersonRows[0]
    ? { name: mostWinningPersonRows[0].name, count: toBigIntNumber(mostWinningPersonRows[0].count) }
    : null;

  const mostNominatedFilm: FilmStat | null = mostNominatedFilmRows[0]
    ? { ...mostNominatedFilmRows[0], count: toBigIntNumber(mostNominatedFilmRows[0].count) }
    : null;

  const mostWinningFilm: FilmStat | null = mostWinningFilmRows[0]
    ? { ...mostWinningFilmRows[0], count: toBigIntNumber(mostWinningFilmRows[0].count) }
    : null;

  const mostCompetitiveYear: YearStat | null = mostCompetitiveYearRows[0]
    ? { awardYear: mostCompetitiveYearRows[0].awardYear, totalNominations: toBigIntNumber(mostCompetitiveYearRows[0].totalNominations) }
    : null;

  const decadeBreakdown: DecadeStat[] = decadeRows.map((r) => ({
    decade: r.decade,
    filmCount: toBigIntNumber(r.filmCount),
    avgNominations: r.avgNominations,
  }));

  const awardBodyBreakdown: AwardBodyBreakdown | null = awardBodyRows[0]
    ? {
        oscarOnly: toBigIntNumber(awardBodyRows[0].oscarOnly),
        ggOnly: toBigIntNumber(awardBodyRows[0].ggOnly),
        cannesOnly: toBigIntNumber(awardBodyRows[0].cannesOnly),
        multiAward: toBigIntNumber(awardBodyRows[0].multiAward),
        total: toBigIntNumber(awardBodyRows[0].total),
      }
    : null;

  const topRolledFilms: FilmStat[] = topRolledRows.map((r) => ({
    ...r,
    count: toBigIntNumber(r.count),
  }));

  const topWatchlistedFilms: FilmStat[] = (topWatchlistedRows as typeof topRolledRows).map((r) => ({
    ...r,
    count: toBigIntNumber(r.count),
  }));

  setPublicCache(res, 86_400); // 24 hours
  res.json({
    summary: {
      totalFilms: toBigIntNumber(totalFilmsRow[0]?.count),
      totalNominations: toBigIntNumber(totalNominationsRow[0]?.total),
      totalWins: toBigIntNumber(totalWinsRow[0]?.total),
    },
    mostNominatedPerson,
    mostWinningPerson,
    mostNominatedFilm,
    mostWinningFilm,
    mostCompetitiveYear,
    decadeBreakdown,
    awardBodyBreakdown,
    topRolledFilms,
    topWatchlistedFilms,
  });
});

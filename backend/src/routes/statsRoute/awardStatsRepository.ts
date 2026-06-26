import { prisma } from "../../lib/prisma";
import {
  AwardBodyBreakdownRow,
  DecadeStatRow,
  SummaryCountRow,
  SummaryTotalRow,
  YearStatRow,
} from "./types";

export function getMostCompetitiveYearRows(): Promise<YearStatRow[]> {
  return prisma.$queryRaw<YearStatRow[]>`
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
  `;
}

export function getDecadeRows(): Promise<DecadeStatRow[]> {
  return prisma.$queryRaw<DecadeStatRow[]>`
    SELECT
      FLOOR("year" / 10) * 10 AS decade,
      COUNT(*)::BIGINT AS "filmCount",
      ROUND(AVG("oscarNominations" + "ggNominations" + "cannesNominations")::NUMERIC, 2)::FLOAT AS "avgNominations"
    FROM "Film"
    WHERE "year" IS NOT NULL AND "year" >= 1920
    GROUP BY decade
    ORDER BY decade
  `;
}

export function getAwardBodyRows(): Promise<AwardBodyBreakdownRow[]> {
  // Coverage per award body: films appearing under each body. A film is counted
  // under every body that recognized it, so the shares overlap (sum > total).
  return prisma.$queryRaw<AwardBodyBreakdownRow[]>`
    SELECT
      COUNT(*) FILTER (WHERE "oscarNominations" > 0)::BIGINT AS "oscar",
      COUNT(*) FILTER (WHERE "ggNominations" > 0)::BIGINT AS "goldenGlobe",
      COUNT(*) FILTER (WHERE "cannesNominations" > 0)::BIGINT AS "cannes",
      COUNT(*) FILTER (WHERE "berlinNominations" > 0)::BIGINT AS "berlin",
      COUNT(*)::BIGINT AS total
    FROM "Film"
    WHERE "oscarNominations" > 0 OR "ggNominations" > 0 OR "cannesNominations" > 0 OR "berlinNominations" > 0
  `;
}

export function getTotalFilmsRow(): Promise<SummaryCountRow[]> {
  return prisma.$queryRaw<SummaryCountRow[]>`SELECT COUNT(*)::BIGINT AS count FROM "Film"`;
}

export function getTotalNominationsRow(): Promise<SummaryTotalRow[]> {
  return prisma.$queryRaw<SummaryTotalRow[]>`
    SELECT SUM("oscarNominations" + "ggNominations" + "cannesNominations")::BIGINT AS total FROM "Film"
  `;
}

export function getTotalWinsRow(): Promise<SummaryTotalRow[]> {
  return prisma.$queryRaw<SummaryTotalRow[]>`
    SELECT SUM("oscarWins" + "ggWins" + "cannesWins")::BIGINT AS total FROM "Film"
  `;
}

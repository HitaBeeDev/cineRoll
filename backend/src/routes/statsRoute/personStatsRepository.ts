import { prisma } from "../../lib/prisma";
import {
  NON_PERSON_NOMINEE_PATTERN,
  PERSON_ROLE_SUFFIX_PATTERN,
} from "./constants";
import { PersonStatRow } from "./types";

export function getMostNominatedPersonRows(): Promise<PersonStatRow[]> {
  return prisma.$queryRaw<PersonStatRow[]>`
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
  `;
}

export function getMostWinningPersonRows(): Promise<PersonStatRow[]> {
  return prisma.$queryRaw<PersonStatRow[]>`
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
  `;
}

import type { AwardCoveragePayload } from "./award-coverage-types";
import { AWARD_BODIES } from "./award-bodies";
import { fetchAward } from "./fetch-award";

/**
 * Coverage for all four bodies, in hub order. A body whose fetch fails or has
 * no years is left out, so callers never print a range they could not check.
 */
export async function fetchAllCoverage(): Promise<AwardCoveragePayload[]> {
  const rows = await Promise.all(
    AWARD_BODIES.map((body) =>
      fetchAward<AwardCoveragePayload>(`${body.slug}/coverage`).catch(() => null),
    ),
  );
  return rows.filter((row): row is AwardCoveragePayload => row !== null && row.years.length > 0);
}

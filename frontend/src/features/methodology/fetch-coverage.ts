import { AWARD_BODIES } from "@/features/awards/award-bodies";
import type { AwardBodyPayload } from "@/features/awards/award-types";
import { fetchAward } from "@/features/awards/fetch-award";
import type { BodyCoverage } from "./coverage-types";

/**
 * The real year range on record for each award body, from the same cached
 * award API the hub pages use. A body whose fetch fails is left out, so the
 * page never prints a range it could not check.
 */
export async function fetchCoverage(): Promise<BodyCoverage[]> {
  const rows = await Promise.all(
    AWARD_BODIES.map(async (body): Promise<BodyCoverage | null> => {
      const data = await fetchAward<AwardBodyPayload>(body.slug).catch(() => null);
      if (!data || data.years.length === 0) return null;
      const years = data.years.map((entry) => entry.year);
      return {
        slug: body.slug,
        name: body.name,
        firstYear: Math.min(...years),
        lastYear: Math.max(...years),
        ceremonies: years.length,
        categories: data.categories.length,
      };
    }),
  );
  return rows.filter((row): row is BodyCoverage => row !== null);
}

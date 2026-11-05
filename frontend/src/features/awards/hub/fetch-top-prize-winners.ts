import type { AwardBodyPayload, AwardCategoryPayload } from "../award-types";
import type { AwardCoveragePayload } from "../award-coverage-types";
import type { AWARD_BODIES } from "../award-bodies";
import { fetchAward } from "../fetch-award";
import { findHeadlineCategory } from "../find-headline-category";
import type { TopPrizeWinners } from "./hub-types";

type AwardBody = (typeof AWARD_BODIES)[number];

/**
 * A body's top-prize winners by year, plus which years have a ceremony page and
 * which are on record at all. Null when any of its payloads is unavailable, so
 * the hub degrades to text for that body instead of failing the whole page.
 */
export async function fetchTopPrizeWinners(
  body: AwardBody,
  coverage: AwardCoveragePayload | undefined,
): Promise<TopPrizeWinners | null> {
  try {
    const hub = await fetchAward<AwardBodyPayload>(body.slug);
    const headline = hub ? findHeadlineCategory(hub.categories, body.headline) : undefined;
    if (!hub || !headline) return null;

    const category = await fetchAward<AwardCategoryPayload>(
      `${body.slug}/categories/${headline.slug}`,
    );
    if (!category) return null;

    return {
      slug: body.slug,
      prize: headline.name,
      winners: category.years
        .map((year) => ({
          year: year.year,
          // One entry per credited person, so a single winning film can appear
          // several times (Golden Bear 2026 lists Yellow Letters twice).
          films: [
            ...new Map(
              year.entries.filter((entry) => entry.won).map((entry) => [entry.film.slug, entry.film]),
            ).values(),
          ],
        }))
        .filter((year) => year.films.length > 0)
        .sort((a, b) => b.year - a.year),
      ceremonyPageYears: hub.years.map((year) => year.year),
      recordedYears: coverage?.years.map((year) => year.year) ?? hub.years.map((year) => year.year),
    };
  } catch {
    return null;
  }
}

import type { AwardIndex } from "./buildAwardIndex";

export type CoverageYear = { year: number; films: number; nominations: number; wins: number };
export type AwardCoverage = { films: number; categories: number; years: CoverageYear[] };

/**
 * What one body has on record — every ceremony year, with no page-size cutoff.
 * The hub payload hides years under MIN_FILMS_PER_PAGE because they get no
 * page; coverage must not, or a thin year reads as a year that is missing.
 */
export function summarizeCoverage(index: AwardIndex): AwardCoverage {
  const films = new Set<string>();
  const years = [...index.years]
    .map(([year, bucket]) => {
      for (const slug of bucket.filmSlugs) films.add(slug);
      const entries = [...bucket.byCategory.values()].flat();
      return {
        year,
        films: bucket.filmSlugs.size,
        nominations: entries.length,
        wins: entries.filter(entry => entry.won).length,
      };
    })
    .sort((a, b) => a.year - b.year);

  return { films: films.size, categories: index.categories.size, years };
}

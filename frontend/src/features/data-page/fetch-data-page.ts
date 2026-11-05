import type { AwardCoveragePayload } from "@/features/awards/award-coverage-types";
import { fetchAllCoverage } from "@/features/awards/fetch-all-coverage";
import type { StatsResponse } from "@/features/stats/types";
import { API_URL } from "@/lib/api/constants/api-url";
import { fetchCatalogUpdated } from "@/lib/api/fetch-catalog-updated";
import type { BodyDecades, DataPageData, DecadeCell } from "./data-page-types";

/**
 * Everything /data shows, from live API data only. Each source fails on its
 * own: a missing piece is null/left out and its section is hidden, never
 * filled with a made-up number.
 */
export async function fetchDataPage(): Promise<DataPageData> {
  const [stats, updatedAt, coverage] = await Promise.all([
    fetchDailyStats(),
    fetchCatalogUpdated(),
    fetchAllCoverage(),
  ]);

  const breakdown = stats?.awardBodyBreakdown;
  return {
    summary: stats?.summary ?? null,
    crossover: breakdown ? { multiple: breakdown.composition.multiple, total: breakdown.total } : null,
    bodies: coverage.map(toBodyDecades),
    updatedAt,
  };
}

// The stats page caches /api/stats for 90 days; a page that promises live
// numbers reads it daily instead.
async function fetchDailyStats(): Promise<StatsResponse | null> {
  try {
    const response = await fetch(`${API_URL}/api/stats`, { next: { revalidate: 86400 } });
    if (!response.ok) return null;
    return (await response.json()) as StatsResponse;
  } catch {
    return null;
  }
}

function toBodyDecades(body: AwardCoveragePayload): BodyDecades {
  const decades: Record<number, DecadeCell> = {};
  for (const { year, films, wins } of body.years) {
    const start = Math.floor(year / 10) * 10;
    const cell = (decades[start] ??= { ceremonies: 0, films: 0, wins: 0 });
    cell.ceremonies += 1;
    cell.films += films;
    cell.wins += wins;
  }

  const years = new Set(body.years.map((entry) => entry.year));
  const firstYear = Math.min(...years);
  const lastYear = Math.max(...years);
  const missingYears: number[] = [];
  for (let year = firstYear; year <= lastYear; year++) {
    if (!years.has(year)) missingYears.push(year);
  }

  return {
    slug: body.body,
    name: body.name,
    shortName: body.shortName,
    firstYear,
    lastYear,
    filmCount: body.films,
    decades,
    missingYears,
  };
}

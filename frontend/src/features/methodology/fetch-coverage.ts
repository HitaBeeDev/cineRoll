import { fetchAllCoverage } from "@/features/awards/fetch-all-coverage";
import type { BodyCoverage } from "./coverage-types";

/** The year range, ceremony and category counts on record for each award body. */
export async function fetchCoverage(): Promise<BodyCoverage[]> {
  return (await fetchAllCoverage()).map((body) => {
    const years = body.years.map((entry) => entry.year);
    return {
      slug: body.body,
      name: body.name,
      firstYear: Math.min(...years),
      lastYear: Math.max(...years),
      ceremonies: years.length,
      categories: body.categories,
    };
  });
}

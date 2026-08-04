import type { FilterState } from "@cineroll/types";
import { API_URL } from "@/lib/api/constants/api-url";
import { filtersToParams } from "../filters-to-params";
import { withQuery } from "../url";

export async function fetchRandomCount(
  filters: Partial<FilterState> = {},
): Promise<number> {
  const params = filtersToParams(filters);
  const response = await fetch(withQuery(`${API_URL}/api/random/count`, params), {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("fetch failed");
  const data = (await response.json()) as { total: number };
  return data.total;
}

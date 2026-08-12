import type { FilterState } from "@cineroll/types";
import { API_URL } from "@/lib/api/constants/api-url";
import { filtersToParams } from "../filters-to-params";
import { withQuery } from "../url";

/**
 * The two sizes of a filter set, which are not the same number.
 *
 * `total` is the catalogue — the figure the home page and browse both state, so
 * the product quotes one size for itself. `rollable` is what a draw can land on
 * after the roll's quality gate, and is the only honest number for a control
 * that promises a draw.
 *
 * `total` is 0 whenever nothing is rollable, so it doubles as the "can we roll
 * at all" signal without a second request.
 */
export type PoolCounts = { total: number; rollable: number };

export async function fetchRandomCount(
  filters: Partial<FilterState> = {},
): Promise<PoolCounts> {
  const params = filtersToParams(filters);
  const response = await fetch(withQuery(`${API_URL}/api/random/count`, params), {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("fetch failed");

  return (await response.json()) as PoolCounts;
}

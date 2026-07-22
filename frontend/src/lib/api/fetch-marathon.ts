import type { FilterState } from "@cineroll/types";
import { createApiError } from "./api-error";
import { API_URL } from "./constants";
import { filtersToParams } from "./filters-to-params";
import type { MarathonResult } from "./roll-types";
import { withQuery } from "./url";

export async function fetchMarathon(
  filters: Partial<FilterState> = {},
  count = 3,
): Promise<MarathonResult> {
  const params = filtersToParams(filters);
  if (count !== 3) params.set("count", String(count));

  const response = await fetch(withQuery(`${API_URL}/api/marathon`, params), {
    cache: "no-store",
  });
  if (!response.ok) throw await createApiError(response, "fetch failed");
  return response.json() as Promise<MarathonResult>;
}

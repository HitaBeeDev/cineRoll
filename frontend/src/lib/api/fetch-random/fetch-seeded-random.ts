import type { FilterState } from "@cineroll/types";
import { filtersToParams } from "../filters-to-params";
import type { RandomResult } from "../roll-types";
import { appendUserOptions } from "./append-user-options";
import { requestRandom } from "./request-random";

export async function fetchSeededRandom(
  seed: string,
  filters: Partial<FilterState> = {},
  excludeIds?: string[],
  userId?: string,
): Promise<RandomResult> {
  const params = filtersToParams(filters);
  params.set("seed", seed);
  appendUserOptions(params, userId, false, excludeIds);
  return requestRandom(params);
}

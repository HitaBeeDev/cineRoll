import type { SeededRoll } from "./domain-types";
import { filtersToParams } from "@/lib/api/filters-to-params";
import { appendUserOptions } from "@/lib/api/fetch-random/append-user-options";
import { requestRandom } from "@/lib/api/fetch-random/request-random";

// A day. The seed carries the date, so each day's draws are new URLs and a
// cached answer can never leak into the next day.
const SEEDED_ROLL_REVALIDATE_SECONDS = 86400;

/** Draws on the server, as a guest, through Next's data cache: the same seed is asked of the backend once a day. */
export const serverSeededRoll: SeededRoll = async (seed, filters, excludeIds) => {
  const params = filtersToParams(filters);
  params.set("seed", seed);
  appendUserOptions(params, undefined, false, excludeIds);
  try {
    const result = await requestRandom(params, {
      next: { revalidate: SEEDED_ROLL_REVALIDATE_SECONDS },
    });
    return result.film;
  } catch {
    return null;
  }
};

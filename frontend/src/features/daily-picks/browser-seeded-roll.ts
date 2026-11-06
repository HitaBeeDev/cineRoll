import { fetchSeededRandom } from "@/lib/api";
import type { SeededRoll } from "./domain-types";

/** Draws in the browser, as this user: their watched and hidden films are left out. Never cached. */
export function browserSeededRoll(userId: string | undefined): SeededRoll {
  return async (seed, filters, excludeIds) => {
    try {
      return (await fetchSeededRandom(seed, filters, excludeIds, userId)).film;
    } catch {
      return null;
    }
  };
}

import type { FilterState } from "@cineroll/types";
import { fetchRandom, type RandomResult } from "@/lib/api";
import { getLaneBandit, getRerollPenalty, getRolledBag, resetRolledBag } from "@/lib/home-storage";
import type { SpentRoll } from "./spend-pending-roll";

type NextRollRequest = {
  filters: FilterState;
  userId?: string | undefined;
  personalized: boolean;
  spent: SpentRoll;
};

/**
 * Asks the engine for the next film, carrying everything the session has learned
 * so far: the shuffle bag of what has already come up, the decaying penalties
 * from what has been skipped, the lane posteriors, and the verdict on the draw
 * this one replaces.
 *
 * Both surfaces call this. When only the home page did, a browse roll asked for
 * a film with no bag, no penalties and no bandit state — the same button
 * learning nothing on one page and everything on the other.
 */
export async function requestNextRoll(request: NextRollRequest): Promise<RandomResult> {
  const seenFilmIds = getRolledBag();
  const base = {
    filters: request.filters,
    userId: request.userId,
    personalized: request.personalized,
    rerollPenalty: getRerollPenalty(),
    bandit: getLaneBandit(),
    banditFeedback: request.spent.banditFeedback,
    parentDraw: request.spent.parentDraw,
    drawIndex: request.spent.drawIndex,
  };

  try {
    return await fetchRandom({ ...base, excludeIds: seenFilmIds });
  } catch (error) {
    const code = error instanceof Error ? (error as Error & { code?: string }).code : undefined;
    // The bag narrows the pool, so a tight filter set eventually excludes
    // everything in it. Emptying the bag is the recovery, not an error.
    if (code !== "NO_FILMS_FOUND" || seenFilmIds.length === 0) throw error;
    resetRolledBag();
    return fetchRandom({ ...base, excludeIds: [] });
  }
}

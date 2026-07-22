import type { FilterState } from "@cineroll/types";
import { fetchRandom, type RandomResult } from "@/lib/api";
import {
  getLaneBandit,
  getRerollPenalty,
  getRolledBag,
  resetRolledBag,
} from "@/lib/home-storage";
import type { BanditFeedback } from "./domain-types";

type NextRollRequest = {
  filters: FilterState;
  userId?: string | undefined;
  personalized: boolean;
  banditFeedback?: BanditFeedback | undefined;
};

export async function requestNextRoll(request: NextRollRequest): Promise<RandomResult> {
  const seenFilmIds = getRolledBag();
  const rerollPenalty = getRerollPenalty();
  const bandit = getLaneBandit();
  const fetchWithExclusions = (excludeIds: string[]) => fetchRandom(
    request.filters,
    request.userId,
    request.personalized,
    excludeIds,
    rerollPenalty,
    bandit,
    request.banditFeedback,
  );

  try {
    return await fetchWithExclusions(seenFilmIds);
  } catch (error) {
    const code = error instanceof Error ? (error as Error & { code?: string }).code : undefined;
    if (code !== "NO_FILMS_FOUND" || seenFilmIds.length === 0) throw error;
    resetRolledBag();
    return fetchWithExclusions([]);
  }
}

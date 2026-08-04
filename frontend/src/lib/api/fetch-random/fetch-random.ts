import type { FilterState } from "@cineroll/types";
import { filtersToParams } from "../filters-to-params";
import type {
  BanditFeedback,
  LaneBandit,
  RandomResult,
  RerollPenalty,
} from "../roll-types";
import { appendUserOptions } from "./append-user-options";
import { requestRandom } from "./request-random";

function appendLearningOptions(
  params: URLSearchParams,
  penalty?: RerollPenalty,
  bandit?: LaneBandit,
  feedback?: BanditFeedback,
): void {
  if (penalty) appendRerollPenalty(params, penalty);
  if (bandit) params.set("bandit", JSON.stringify(bandit));
  if (feedback) params.set("banditFeedback", JSON.stringify(feedback));
}

function appendRerollPenalty(
  params: URLSearchParams,
  penalty: RerollPenalty,
): void {
  if (Object.keys(penalty.genre).length) {
    params.set("rerollGenre", JSON.stringify(penalty.genre));
  }
  if (Object.keys(penalty.contentType).length) {
    params.set("rerollType", JSON.stringify(penalty.contentType));
  }
}

export async function fetchRandom(
  filters: Partial<FilterState> = {},
  userId?: string,
  personalized?: boolean,
  excludeIds?: string[],
  rerollPenalty?: RerollPenalty,
  bandit?: LaneBandit,
  banditFeedback?: BanditFeedback,
): Promise<RandomResult> {
  const params = filtersToParams(filters);
  appendUserOptions(params, userId, personalized, excludeIds);
  appendLearningOptions(params, rerollPenalty, bandit, banditFeedback);
  return requestRandom(params);
}

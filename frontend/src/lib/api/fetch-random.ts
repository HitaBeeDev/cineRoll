import type { FilterState } from "@cineroll/types";
import { createApiError } from "./api-error";
import { API_URL } from "./constants";
import { filtersToParams } from "./filters-to-params";
import type {
  BanditFeedback,
  LaneBandit,
  RandomResult,
  RerollPenalty,
} from "./roll-types";
import { withQuery } from "./url";

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

async function requestRandom(params: URLSearchParams): Promise<RandomResult> {
  const response = await fetch(withQuery(`${API_URL}/api/random`, params), {
    cache: "no-store",
  });
  if (!response.ok) throw await createApiError(response, "fetch failed");
  return response.json() as Promise<RandomResult>;
}

function appendUserOptions(
  params: URLSearchParams,
  userId?: string,
  personalized?: boolean,
  excludeIds?: string[],
): void {
  if (userId) params.set("userId", userId);
  if (personalized && userId) params.set("personalized", "1");
  if (excludeIds?.length) params.set("excludeIds", excludeIds.join(","));
}

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

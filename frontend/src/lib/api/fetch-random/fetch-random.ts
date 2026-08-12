import type { FilterState } from "@cineroll/types";
import { filtersToParams } from "../filters-to-params";
import type {
  BanditFeedback,
  LaneBandit,
  ParentDraw,
  RandomResult,
  RerollPenalty,
} from "../roll-types";
import { appendUserOptions } from "./append-user-options";
import { requestRandom } from "./request-random";

/**
 * One draw from the roll engine.
 *
 * Options, not positional arguments: what a roll carries has grown from
 * "filters" to filters + who is asking + what they have already seen + what they
 * have been skipping + which lane has been paying off + which draw this one
 * follows. Nine positions in a row is a call site nobody can read and an easy
 * place to transpose two strings.
 */
export type RandomRequest = {
  filters?: Partial<FilterState>;
  userId?: string | undefined;
  personalized?: boolean | undefined;
  /** The session shuffle bag — films already drawn, kept out of the pool. */
  excludeIds?: string[] | undefined;
  rerollPenalty?: RerollPenalty | undefined;
  bandit?: LaneBandit | undefined;
  banditFeedback?: BanditFeedback | undefined;
  parentDraw?: ParentDraw | undefined;
  drawIndex?: number | undefined;
};

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

// Where this draw sits in the session and what it follows. Observational only —
// the server records them, nothing in selection reads them.
function appendChainOptions(
  params: URLSearchParams,
  parentDraw?: ParentDraw,
  drawIndex?: number,
): void {
  if (parentDraw) params.set("parentDraw", JSON.stringify(parentDraw));
  if (drawIndex != null && drawIndex > 0) params.set("drawIndex", String(drawIndex));
}

export async function fetchRandom(request: RandomRequest = {}): Promise<RandomResult> {
  const params = filtersToParams(request.filters ?? {});
  appendUserOptions(params, request.userId, request.personalized, request.excludeIds);
  appendLearningOptions(
    params,
    request.rerollPenalty,
    request.bandit,
    request.banditFeedback,
  );
  appendChainOptions(params, request.parentDraw, request.drawIndex);
  return requestRandom(params);
}

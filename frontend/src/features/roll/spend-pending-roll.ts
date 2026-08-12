import type { BanditFeedback, ParentDraw, RollOutcome } from "@/lib/api";
import {
  addRerollPenalty,
  clearPendingRoll,
  decayRerollPenalties,
  getPendingRoll,
  updateLaneBandit,
} from "@/lib/home-storage";

export type SpentRoll = {
  banditFeedback?: BanditFeedback | undefined;
  parentDraw?: ParentDraw | undefined;
  /** Where the roll about to be made sits in the session. */
  drawIndex: number;
};

/**
 * Grades the draw that was on screen and clears it.
 *
 * Called at the top of every roll, because asking for another film is itself the
 * verdict on the last one: engaged with it, pushed it away, or rolled straight
 * past. One reading of that verdict feeds three things — the decaying genre/type
 * penalty, the lane bandit's reward, and the chain link the next draw reports.
 * They agree by construction, which they could not when each page kept its own
 * copy of "what happened to the last roll" and browse kept none at all.
 */
export function spendPendingRoll(): SpentRoll {
  decayRerollPenalties();
  const outgoing = getPendingRoll();
  if (!outgoing) return { drawIndex: 0 };
  clearPendingRoll();

  const outcome = readOutcome(outgoing.engaged, outgoing.rejected);
  if (outcome !== "engaged") {
    addRerollPenalty(outgoing.film, outcome === "rejected" ? "strong" : "weak");
  }

  return {
    banditFeedback: creditLane(outgoing.lane, outcome),
    parentDraw: outgoing.drawId ? { drawId: outgoing.drawId, outcome } : undefined,
    drawIndex: outgoing.index + 1,
  };
}

// Engagement wins over rejection: a film you saved and then hid is still one the
// engine learned something positive about.
function readOutcome(engaged: boolean, rejected: boolean): RollOutcome {
  if (engaged) return "engaged";
  return rejected ? "rejected" : "passed";
}

function creditLane(
  lane: BanditFeedback["lane"] | undefined,
  outcome: RollOutcome,
): BanditFeedback | undefined {
  if (!lane) return undefined;

  const feedback = { lane, reward: outcome === "engaged" ? 1 : 0 };
  updateLaneBandit(feedback.lane, feedback.reward);
  return feedback;
}

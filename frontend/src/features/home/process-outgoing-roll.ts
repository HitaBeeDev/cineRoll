import {
  addRerollPenalty,
  decayRerollPenalties,
  updateLaneBandit,
} from "@/lib/home-storage";
import type { BanditFeedback, CurrentRoll } from "./domain-types";

export function processOutgoingRoll(outgoing: CurrentRoll | null): BanditFeedback | undefined {
  decayRerollPenalties();
  if (outgoing && !outgoing.engaged) {
    addRerollPenalty(outgoing.film, outgoing.rejected ? "strong" : "weak");
  }
  if (!outgoing?.lane) return undefined;

  const feedback = { lane: outgoing.lane, reward: outgoing.engaged ? 1 : 0 };
  updateLaneBandit(feedback.lane, feedback.reward);
  return feedback;
}

import type { Stage1Filters } from "../schemas";

type AwardIntent = Pick<
  Stage1Filters,
  "awardBody" | "winnerOnly" | "nominatedOnly" | "femaleDirectorOnly"
>;

export const extractAwardIntent = (prompt: string): AwardIntent => {
  const intent: AwardIntent = {};

  if (/\b(oscar|academy award)\b/i.test(prompt)) intent.awardBody = "oscar";
  if (/\b(golden globe|globes)\b/i.test(prompt)) intent.awardBody = "goldenglobe";
  if (/\bcannes\b/i.test(prompt)) intent.awardBody = "cannes";
  if (/\b(winner|won|winning)\b/i.test(prompt)) intent.winnerOnly = true;
  if (/\b(nominee|nominated|nomination)\b/i.test(prompt)) intent.nominatedOnly = true;
  if (/\b(female|woman|women)\s+director\b/i.test(prompt)) {
    intent.femaleDirectorOnly = true;
  }

  return intent;
};

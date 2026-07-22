import type { Stage1Filters } from "../schemas";

const AWARD_YEAR_PATTERN =
  /\b(18|19|20)\d{2}\s+(oscars?|academy awards?|golden globes?|cannes)\b/i;

export const extractAwardYear = (
  prompt: string,
): Stage1Filters["awardYear"] => {
  const awardPhrase = prompt.match(AWARD_YEAR_PATTERN)?.[0];
  const year = awardPhrase?.match(/\d{4}/)?.[0];

  return year ? Number(year) : undefined;
};

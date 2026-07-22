import type { Stage1Filters } from "../schemas";

const COUNT_WORDS: Readonly<Record<string, number>> = {
  one: 1,
  single: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
};

const QUANTIFIED_MEDIA_PATTERN =
  /\b(one|single|two|three|four|five|six|[1-6])\s+(?:(?!of\b)[a-z'-]+\s+){0,4}?(?:movie|film|series|show|pick|title|recommendation|drama|comedy|thriller|romance|musical|documentary|western|biopic|story|gem|flick|masterpiece)s?\b/i;

export const extractResultCount = (
  prompt: string,
): Stage1Filters["resultCount"] => {
  const quantity = prompt.match(QUANTIFIED_MEDIA_PATTERN)?.[1]?.toLowerCase();
  if (!quantity) return undefined;

  return COUNT_WORDS[quantity] ?? Number(quantity);
};

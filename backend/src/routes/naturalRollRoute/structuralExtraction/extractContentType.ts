import type { Stage1Filters } from "../schemas";

export const extractContentType = (
  prompt: string,
): Stage1Filters["contentType"] => {
  if (/\b(film|movie|movies|feature)\b/i.test(prompt)) return "movie";
  if (/\b(series|show|tv)\b/i.test(prompt)) return "series";

  return undefined;
};

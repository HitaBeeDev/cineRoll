// The layout appends " | CineRoll" (11 characters); search results cut titles
// at about 60, so a page title gets 49 of its own.
const TITLE_BUDGET = 60 - " | CineRoll".length;

/**
 * The first candidate that fits the title budget. Pass candidates from most to
 * least specific; if none fits, the last is cut at a word boundary.
 */
export function fitTitle(...candidates: string[]): string {
  const fitting = candidates.find((candidate) => candidate.length <= TITLE_BUDGET);
  if (fitting) return fitting;

  const last = candidates.at(-1) ?? "";
  const cut = last.slice(0, TITLE_BUDGET - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,–—-]+$/, "")}…`;
}

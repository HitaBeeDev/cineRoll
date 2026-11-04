// Search results show about 155 characters of a meta description.
const DESCRIPTION_BUDGET = 155;

/**
 * A meta description within the budget: whole sentences while they fit, else
 * cut at a word boundary with an ellipsis.
 */
export function fitDescription(text: string): string {
  if (text.length <= DESCRIPTION_BUDGET) return text;

  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [];
  let kept = "";
  for (const sentence of sentences) {
    if ((kept + sentence).trim().length > DESCRIPTION_BUDGET) break;
    kept += sentence;
  }
  if (kept.trim()) return kept.trim();

  const cut = text.slice(0, DESCRIPTION_BUDGET - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:–—-]+$/, "")}…`;
}

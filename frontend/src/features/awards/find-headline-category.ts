/** Lowercase, with en/em dashes folded to a hyphen: award data mixes "-" and "–". */
function normalize(name: string): string {
  return name.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * A body's top-prize category, matched by name. Dash-insensitive: the Golden
 * Globes data says "Best Motion Picture - Drama" while AWARD_BODIES says
 * "Best Motion Picture – Drama", and an exact match silently found nothing.
 */
export function findHeadlineCategory<T extends { name: string }>(
  categories: T[],
  headline: string,
): T | undefined {
  const wanted = normalize(headline);
  return categories.find((category) => normalize(category.name) === wanted);
}

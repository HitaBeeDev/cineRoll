/**
 * Before credit lines were split into people, whole lines became person URLs:
 * /person/adaptation-score-by-leonard-rosenman, /person/written-by-damien-chazelle,
 * /person/stanley-kubrick-producer. Google still has some of them. This finds
 * the one real person such a slug stood for, so the old URL can redirect.
 *
 * Deliberately strict — a wrong permanent redirect is worse than a 404:
 * - exactly one known person must appear in the slug (two people, as in
 *   joel-coen-and-ethan-coen, have no single page to point at), and
 * - every other word must be a credit word ("by", "screenplay", "producer"),
 *   so an unknown real name ("mary-ann-smith") never redirects to a known one
 *   hiding inside it ("ann-smith").
 *
 * Returns the person's slug, or null when the old URL should stay a 404.
 */
export function resolveRetiredPersonSlug(slug: string, knownSlugs: ReadonlyMap<string, unknown>): string | null {
  const words = slug.split("-").filter(Boolean);
  if (words.length < 3) return null;

  const matches: Array<{ start: number; end: number }> = [];
  for (let start = 0; start < words.length; start++) {
    for (let end = start + 2; end <= words.length; end++) {
      if (end - start === words.length) continue; // the whole slug is what was not found
      if (knownSlugs.has(words.slice(start, end).join("-"))) matches.push({ start, end });
    }
  }

  // Keep only the longest names: "leonard-rosenman" wins over any shorter name inside it.
  const outermost = matches.filter(
    match => !matches.some(other => other !== match && other.start <= match.start && other.end >= match.end),
  );
  const names = new Set(outermost.map(match => words.slice(match.start, match.end).join("-")));
  if (names.size !== 1) return null;

  const [match] = outermost;
  const leftover = [...words.slice(0, match!.start), ...words.slice(match!.end)];
  return leftover.every(word => CREDIT_WORDS.has(word)) ? [...names][0]! : null;
}

// The words that surround a name in an award credit line, slugged.
const CREDIT_WORDS = new Set([
  "by", "and", "with", "the", "for", "from", "of", "on", "to", "a",
  "written", "screenplay", "story", "adaptation", "adapted", "based", "dialogue", "original", "screen",
  "directed", "director", "direction", "producer", "producers", "produced", "executive", "co",
  "music", "score", "scoring", "song", "lyrics", "composer", "orchestral", "musical", "thematic",
  "art", "set", "decoration", "design", "designer", "production", "costume", "costumes", "makeup", "hair",
  "cinematography", "photography", "editing", "editor", "film", "sound", "recording", "mixing",
  "visual", "special", "effects", "head", "department", "interior", "supervisor", "supervising",
]);

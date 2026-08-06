// The stem a franchise's entries share, so "similar to John Wick" doesn't just
// return the other John Wick films — the user asking for something *like* a film
// already knows about its sequels. "John Wick: Chapter 4" → "John Wick",
// "The Godfather Part II" → "The Godfather".
const SEQUEL_MARKERS = /\s*(?::|\s—\s|\s-\s|\bpart\b|\bchapter\b|\bvol(?:ume)?\.?\b).*$/i;

const MIN_ROOT_LENGTH = 3;

export const franchiseRoot = (title: string): string | null => {
  const root = title.replace(SEQUEL_MARKERS, "").trim();

  // A stem that is the whole title tells us nothing extra — the id exclusion
  // already covers that film. A very short stem ("Up", "It") would exclude
  // half the catalogue by prefix, so it is not worth the risk.
  if (root.length < MIN_ROOT_LENGTH || root.length === title.trim().length) return null;

  return root;
};

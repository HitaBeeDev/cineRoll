import type { Stage1Filters } from "../schemas";

// "similar to X", "like X", "in the vein of X" — the user is naming a film as a
// reference point, which is a nearest-neighbour question, not a filter. Nothing
// else in Stage 1 can hold it: a title is not a genre, era, award or person, so
// without this it is dropped and the request silently becomes "any film at all".
const REFERENCE_MARKERS = [
  /\b(?:something |anything |films? |movies? |stuff )?(?:similar|comparable) to\b/i,
  /\bin the (?:same )?(?:vein|style|spirit|mould|mold) of\b/i,
  /\b(?:if|since) (?:i|you) (?:liked|loved|enjoyed)\b/i,
  /\b(?:reminds? me of|reminiscent of)\b/i,
  /\b(?:more|others?|another) like\b/i,
  /\b(?:films?|movies?|something|anything) like\b/i,
  /\bfans? of\b/i,
];

// Where a trailing title stops. "like john wick but funnier" must yield "john
// wick", not the whole tail — the qualifier after the conjunction is a separate
// preference the normal extractors already read.
const TITLE_TERMINATORS =
  /\s+\b(?:but|and|or|with|without|that|which|except|only|plus|from the|starring|directed)\b.*$/i;

const TRAILING_NOISE = /[\s,.;:!?"'’)]+$/;
const LEADING_NOISE = /^[\s,.;:"'“(]+/;
// Guards against "similar to that" / "like this one" capturing a pronoun as a
// title, and against a bare genre word ("something like a thriller") — the
// genre extractor already owns that phrasing.
const NOT_A_TITLE =
  /^(?:that|this|those|these|it|them|one|ones|him|her|us|the (?:one|ones|others?)|a|an|the)$/i;

const MAX_TITLE_LENGTH = 80;

export const extractReferenceTitles = (
  prompt: string,
): Stage1Filters["referenceTitles"] => {
  const titles = REFERENCE_MARKERS.flatMap(marker => titleAfterMarker(prompt, marker));
  const unique = [...new Map(titles.map(title => [title.toLowerCase(), title])).values()];

  return unique.length > 0 ? unique : undefined;
};

function titleAfterMarker(prompt: string, marker: RegExp): string[] {
  const match = marker.exec(prompt);
  if (!match) return [];

  const tail = prompt.slice(match.index + match[0].length);
  const title = cleanTitle(tail);

  return title ? [title] : [];
}

function cleanTitle(tail: string): string | null {
  const trimmed = tail
    .replace(TITLE_TERMINATORS, "")
    .replace(LEADING_NOISE, "")
    .replace(TRAILING_NOISE, "")
    .trim();

  if (!trimmed || trimmed.length > MAX_TITLE_LENGTH) return null;
  if (NOT_A_TITLE.test(trimmed)) return null;

  return trimmed;
}

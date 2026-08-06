import { fetchExternalReference } from "./fetchExternalReference";
import { findReferenceFilm } from "./findReferenceFilm";
import type { ReferenceOutcome } from "./referenceTypes";

/** Decide what a user's "similar to X" actually refers to.
 *
 *  Only the first named title anchors retrieval: two anchors would pull the
 *  neighbourhood in two directions and produce a blend of nothing in
 *  particular. Extra titles still reach the reranker through the prompt. */
export const resolveReference = async (
  referenceTitles: string[] | null | undefined,
): Promise<ReferenceOutcome> => {
  const titles = (referenceTitles ?? []).map(title => title.trim()).filter(Boolean);
  const anchor = titles[0];
  if (!anchor) return { kind: "none" };

  const film = await findReferenceFilm(anchor);
  if (film) {
    return {
      kind: "resolved",
      film,
      note: `Anchored on ${film.title} (${film.year}) — showing award-recognised films closest to it.`,
    };
  }

  const external = await fetchExternalReference(anchor);
  if (external) {
    return {
      kind: "external",
      reference: external,
      // The catalogue is award films only, so a named blockbuster genuinely
      // may not be in it. Saying that is a better answer than silently
      // returning six prestige dramas as if they were neighbours.
      note: `${external.title} isn't in the award catalogue — showing award-recognised films that share its ${describeAttributes(external.genres)}.`,
    };
  }

  return {
    kind: "unknown",
    requestedTitles: titles,
    note: `Couldn't identify "${anchor}", so it didn't shape these picks.`,
  };
};

function describeAttributes(genres: string[]): string {
  if (genres.length === 0) return "style";

  return `${genres.slice(0, 2).join(" and ").toLowerCase()} character`;
}

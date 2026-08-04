import type { AwardHighlight } from "./award-highlight";

/**
 * One award body's standing, in words: "1 Oscar win, 3 nominations".
 *
 * Written out rather than abbreviated. The panel this replaced said "1 NOM",
 * which is how the field is named in the pipeline, not how anyone says it — and
 * on the one line the card gives recognition, the reader should not have to
 * expand a token to know whether the film won anything.
 */
export function formatAwardHighlight(highlight: AwardHighlight): string {
  if (highlight.rank != null) return `${highlight.label} · #${highlight.rank}`;

  const parts: string[] = [];
  if (highlight.wins > 0) {
    parts.push(`${highlight.wins} ${highlight.singular} ${highlight.wins === 1 ? "win" : "wins"}`);
  }
  if (highlight.nominations > 0) {
    const noun = highlight.nominations === 1 ? "nomination" : "nominations";
    // The body has already been named by the wins clause, if there was one.
    parts.push(
      highlight.wins > 0
        ? `${highlight.nominations} ${noun}`
        : `${highlight.nominations} ${highlight.singular} ${noun}`,
    );
  }
  return parts.join(", ");
}

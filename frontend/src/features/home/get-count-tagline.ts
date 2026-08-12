/**
 * The line under the reel-pool number, split into the part that must not move
 * and the part that may.
 *
 * It used to be one string, which meant the whole sentence was rewritten as the
 * count resolved: "films in the reel" faded out and "films. Plenty to choose
 * from." faded in, so the reader's eye was pulled back to a line it had already
 * read. Worse, the two phrasings claim different things — one names the set, the
 * other comments on its size — so the swap read as the page correcting itself.
 *
 * Keeping the noun separate means only the editorial half ever animates. The
 * word under the number is fixed from first paint; the remark about how big the
 * number turned out arrives when the number does.
 */
export type CountTagline = {
  /** Fixed from first paint. Singular only when the pool really is one film. */
  noun: "film" | "films";
  /** The editorial remark, or null while the count is still unknown. */
  comment: string | null;
};

export function getCountTagline(count: number | null): CountTagline {
  if (count === null) return { noun: "films", comment: null };
  if (count === 1) return { noun: "film", comment: "You know exactly what you want." };
  if (count <= 5) return { noun: "films", comment: "Very specific taste." };
  if (count <= 20) return { noun: "films", comment: "A good shortlist." };
  if (count <= 100) return { noun: "films", comment: "Ready to roll?" };

  return { noun: "films", comment: "Plenty to choose from." };
}

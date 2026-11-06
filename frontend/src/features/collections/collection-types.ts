export type CollectionSort = "newest" | "wins" | "noms";
export type CollectionGroup = "winners" | "cross-award" | "comparison" | "records";

export type Collection = {
  slug: string;
  group: CollectionGroup;
  h1: string;
  /** <title>, short — the layout appends " | CineRoll". */
  title: string;
  description: string;
  intro: string;
  /** Films-API query: the collection is exactly the films it returns. */
  params: Record<string, string>;
  /** Grid order: "newest" for winners' lists, "wins" / "noms" for rankings. */
  sort: CollectionSort;
  related?: { label: string; href: string };
  /** Winners' lists: the award category behind the list ("oscars/best-picture"), read for ceremony years. */
  topPrize?: { category: string; name: string };
  /** Cross-award lists: two winners' lists whose overlap is the headline fact ("won both the Palme d'Or and Best Picture"). */
  overlap?: { collections: [string, string]; label: string };
};

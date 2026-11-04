export type CollectionGroup = "winners" | "cross-award" | "comparison";

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
  /** How the grid is ordered: "newest" for winners' lists, "wins" for the rest. */
  sort: "newest" | "wins";
  related?: { label: string; href: string };
};

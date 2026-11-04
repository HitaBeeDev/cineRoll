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
};

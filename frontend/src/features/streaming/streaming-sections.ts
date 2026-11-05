import { COLLECTIONS } from "@/features/collections/collections";
import type { CollectionSort } from "@/features/collections/collection-types";

export type StreamingSection = {
  key: string;
  title: string;
  /** The prize on its own ("Palme d'Or"), for sentences — headline sections only. */
  prize?: string;
  params: Record<string, string>;
  sort: CollectionSort;
  /** The full list elsewhere on the site. */
  related?: { label: string; href: string };
};

// The headline prizes reuse the collections' exact queries (every historical
// category name included), so "Palme d'Or winners on MUBI" can never disagree
// with the Palme d'Or collection it is a slice of.
const HEADLINE_SLUGS = [
  ["best-picture-winners", "Best Picture"],
  ["palme-dor-winners", "Palme d'Or"],
  ["golden-bear-winners", "Golden Bear"],
  ["international-feature-winners", "Oscar International Feature"],
] as const;

export const HEADLINE_SECTIONS: StreamingSection[] = HEADLINE_SLUGS.flatMap(([slug, prize]) => {
  const collection = COLLECTIONS.find((entry) => entry.slug === slug);
  return collection
    ? [{
        key: slug,
        title: `${prize} winners`,
        prize,
        params: collection.params,
        sort: collection.sort,
        related: { label: collection.h1, href: `/collections/${slug}` },
      }]
    : [];
});

export const BODY_SECTIONS: StreamingSection[] = [
  { key: "oscar", title: "Oscar winners", params: { awardBody: "oscar", winnerOnly: "true" }, sort: "wins" },
  { key: "goldenglobe", title: "Golden Globe winners", params: { awardBody: "goldenglobe", winnerOnly: "true" }, sort: "wins" },
  { key: "cannes", title: "Cannes winners", params: { awardBody: "cannes", winnerOnly: "true" }, sort: "wins" },
  { key: "berlin", title: "Berlinale winners", params: { awardBody: "berlin", winnerOnly: "true" }, sort: "wins" },
];

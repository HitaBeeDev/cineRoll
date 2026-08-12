import type { Prisma } from "@prisma/client";

export type SimilarityCriterion = {
  condition: Prisma.Sql;
  /** Contribution to the similarity score when the condition holds. */
  weight: number;
  /**
   * Whether this criterion alone is enough to make a film a candidate at all.
   *
   * Only the discriminating ones go into the WHERE: they are what narrows the
   * catalogue to a plausible neighbourhood, and each is backed by an index.
   * The rest — content type, country, language, era — describe how WELL a
   * candidate fits, but on their own they match thousands of rows ("any film
   * from the USA"), so they rank the shortlist instead of creating it.
   */
  narrowing: boolean;
};

export type SimilaritySql = {
  criteria: SimilarityCriterion[];
};

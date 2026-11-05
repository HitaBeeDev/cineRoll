/** One award row of a film, as stored in its category list. */
export type AwardCreditRow = {
  body: "oscar" | "gg" | "cannes";
  filmId: string;
  filmSlug: string;
  filmTitle: string;
  releaseYear: number;
  posterUrl: string | null;
  imdbRating: number | null;
  filmUpdatedAt: Date;
  nominee: string | null;
  category: string;
  awardYear: number;
  won: boolean;
};

/** Everything person features need, keyed by person slug. */
export type PersonCreditIndex = {
  /** slug → the spelling to show (fewest capitals). */
  names: Map<string, string>;
  /** slug → that person's award rows, each row once. */
  credits: Map<string, AwardCreditRow[]>;
};

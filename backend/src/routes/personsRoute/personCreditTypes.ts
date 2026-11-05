/** One award row of a film, as stored in its category list. */
export type AwardCreditRow = {
  body: "oscar" | "gg" | "cannes" | "berlin";
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

/** A film a person directed, as the person page lists it. */
export type DirectedFilm = {
  id: string;
  slug: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  imdbRating: number | null;
};

/** Everything person features need, keyed by person slug. */
export type PersonCreditIndex = {
  /** slug → the spelling to show (fewest capitals). */
  names: Map<string, string>;
  /** slug → that person's award rows, each row once. */
  credits: Map<string, AwardCreditRow[]>;
  /**
   * Built from the Credit tables (after `link-credits --apply`): retired or
   * alternative slugs → the person's slug, verified people for the sitemap, and
   * each director's films. Absent on the legacy path (parsing award JSON).
   */
  aliases?: Map<string, string>;
  verified?: Set<string>;
  directed?: Map<string, DirectedFilm[]>;
};

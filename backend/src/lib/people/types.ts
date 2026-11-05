/** Where a name was found. Endpoints map these to their own display labels. */
export type CreditSource = "director" | "cast" | "nominee";

/** One raw credit line as stored, with the film it belongs to. */
export type CreditRow = {
  name: string;
  source: CreditSource;
  filmId: string;
  filmTitle: string;
  /** The award category for nominee rows ("Writing", "Best Picture"); null for director and cast. */
  category: string | null;
};

/** One person, after credit lines have been split and merged. */
export type PersonSuggestion = {
  name: string;
  sources: CreditSource[];
  /** Distinct films the person is credited on, within the rows searched. */
  count: number;
};

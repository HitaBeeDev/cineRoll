/** One award body in one decade: ceremonies on record, and the films and wins they hold. */
export type DecadeCell = { ceremonies: number; films: number; wins: number };

/** One award body's live coverage for the /data page. */
export type BodyDecades = {
  slug: string;
  name: string;
  shortName: string;
  firstYear: number;
  lastYear: number;
  /** Distinct films with at least one nomination at this body. */
  filmCount: number;
  /** Keyed by decade start (1990 → the 1990s). Missing key = nothing on record. */
  decades: Record<number, DecadeCell>;
  /** Years between the first and last ceremony with nothing on record. */
  missingYears: number[];
};

export type DataPageData = {
  summary: { totalFilms: number; totalNominations: number; totalWins: number } | null;
  /** Films nominated at more than one of the four bodies, out of the total. */
  crossover: { multiple: number; total: number } | null;
  bodies: BodyDecades[];
  updatedAt: string | null;
};

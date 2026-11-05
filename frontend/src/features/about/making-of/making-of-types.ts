import type { AwardRecord } from "@cineroll/types";

/** One top prize a film won, as a badge. */
export type PrizeBadge = { body: string; prize: string; year: number };

/** A film the hero roll demo can land on. */
export type DemoFilm = {
  slug: string;
  title: string;
  posterUrl: string;
  badges: PrizeBadge[];
};

/** One award body's slice of the spotlight film's record. */
export type SpotlightBody = {
  key: AwardRecord["awardBody"];
  name: string;
  wins: number;
  nominations: number;
  records: { category: string; year: number; won: boolean }[];
};

/** The film shown with its record at all four awards side by side. */
export type Spotlight = {
  slug: string;
  title: string;
  year: number;
  posterUrl: string | null;
  bodies: SpotlightBody[];
};

/** A real film whose original and English titles differ, resolved to one record. */
export type MatchExample = {
  slug: string;
  title: string;
  originalTitle: string;
  tmdbId: number | null;
  posterUrl: string | null;
  bodies: { name: string; wins: number; nominations: number }[];
};

export type MakingOfData = {
  pool: DemoFilm[];
  spotlight: Spotlight | null;
  match: MatchExample | null;
};

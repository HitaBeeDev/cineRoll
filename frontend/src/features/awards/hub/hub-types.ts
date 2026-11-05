import type { AwardFilm } from "../award-types";

/** One body's top-prize winners, newest year first. */
export type TopPrizeWinners = {
  slug: string;
  /** The top prize's display name, e.g. "Palme d'Or". */
  prize: string;
  winners: { year: number; films: AwardFilm[] }[];
  /** Years that have a ceremony page on the site. */
  ceremonyPageYears: number[];
  /** Every ceremony year on record, thin years included. */
  recordedYears: number[];
};

/** What one award shows for one year in the year explorer. */
export type YearCell = {
  slug: string;
  shortName: string;
  prize: string;
  /** "none": no ceremony on record that year; "no-winner": a ceremony, but no top-prize winner recorded. */
  status: "winners" | "no-winner" | "none";
  films: AwardFilm[];
  ceremonyHref: string | null;
};

export type YearRow = { year: number; cells: YearCell[] };

/** A film image picked for the hero or a card. */
export type HubImage = { slug: string; title: string; year: number; prize: string; src: string };

export type AwardsHubData = {
  heroPosters: HubImage[];
  cardImages: Record<string, HubImage | undefined>;
  years: YearRow[];
};

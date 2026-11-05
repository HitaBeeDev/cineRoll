/** GET /api/awards/:body/coverage — every ceremony year on record, thin years included. */
export type AwardCoveragePayload = {
  body: string;
  name: string;
  shortName: string;
  films: number;
  categories: number;
  years: { year: number; films: number; nominations: number; wins: number }[];
};

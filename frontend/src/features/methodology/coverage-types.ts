/** One award body's coverage on record: year range, ceremony and category counts. */
export type BodyCoverage = {
  slug: string;
  name: string;
  firstYear: number;
  lastYear: number;
  ceremonies: number;
  categories: number;
};

export type DecadeRangeQuery = {
  decadeMin?: number | undefined;
  decadeMax?: number | undefined;
};

export const validDecadeRange = (query: DecadeRangeQuery) =>
  query.decadeMin === undefined ||
  query.decadeMax === undefined ||
  query.decadeMin <= query.decadeMax;

export const decadeRangeError = {
  message: "decadeMin must be less than or equal to decadeMax",
  path: ["decadeMin"],
};

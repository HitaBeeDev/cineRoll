import type { SimilaritySourceFilm } from "./similaritySourceFilm";

type AwardRecord = { awardYear: number };

export const extractAwardYears = (film: SimilaritySourceFilm): number[] => {
  const awards = [
    ...awardRecords(film.oscarCategories),
    ...awardRecords(film.ggCategories),
    ...awardRecords(film.cannesCategories),
  ];

  return [...new Set(awards.map(award => award.awardYear))];
};

const awardRecords = (value: unknown): AwardRecord[] =>
  Array.isArray(value)
    ? value.filter(isAwardRecord)
    : [];

const isAwardRecord = (value: unknown): value is AwardRecord =>
  typeof value === "object"
  && value !== null
  && "awardYear" in value
  && typeof value.awardYear === "number";

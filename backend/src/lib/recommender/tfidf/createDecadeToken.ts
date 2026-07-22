import type { FeatureToken } from "./types";

export const createDecadeToken = (year: number | null): FeatureToken | null => {
  if (year == null) return null;

  return `decade:${Math.floor(year / 10) * 10}s`;
};

import type { RandomQuery } from "../../../lib/filmFilters/randomQuerySchema";
import type { PinnedDimensions } from "./types";

export const getPinnedDimensions = (query: RandomQuery): PinnedDimensions => ({
  genre: hasValues(query.genre),
  contentType: hasValues(query.contentType),
  decade: query.decadeMin != null || query.decadeMax != null,
  director: query.director != null,
});

const hasValues = (value: string[] | undefined): boolean =>
  Array.isArray(value) && value.length > 0;

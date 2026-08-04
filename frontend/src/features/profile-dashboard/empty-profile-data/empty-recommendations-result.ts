import type { RecommendationsResult } from "../domain-types";

export const EMPTY_RECOMMENDATIONS_RESULT: RecommendationsResult = {
  recommendations: [],
  coldStart: false,
  notEnoughData: false,
};

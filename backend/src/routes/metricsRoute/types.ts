export type SurfaceRow = {
  surface: string;
  served: bigint;
  clicked: bigint;
  saved: bigint;
  watched: bigint;
  disliked: bigint;
};

export type RollRow = {
  variant: string;
  rolled: bigint;
  clicked: bigint;
  saved: bigint;
  watched: bigint;
};

export type RecommendationMetricCounts = {
  served: number;
  clicked: number;
  saved: number;
  watched: number;
  disliked: number;
};

export type RollMetricCounts = {
  rolled: number;
  clicked: number;
  saved: number;
  watched: number;
};

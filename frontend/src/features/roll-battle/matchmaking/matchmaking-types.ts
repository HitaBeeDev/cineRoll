export type FilmFeatures = {
  year: number | null;
  runtime: number | null;
  rating: number | null;
  genres: Set<string>;
  isDocumentary: boolean;
};

export type FeatureRanges = {
  year: number;
  runtime: number;
  rating: number;
};

export type NumericDistanceSignal = {
  left: number;
  right: number;
  range: number;
  weight: number;
};

export type FeatureToken = string;
export type IdfTable = Map<FeatureToken, number>;
export type SparseVector = Map<FeatureToken, number>;

// Minimal structural input required by TF-IDF feature extraction.
export type TfidfFilm = {
  genres: string[];
  director: string | null;
  releaseYear: number | null;
  oscarWins: number;
  oscarNominations: number;
  ggWins: number;
  ggNominations: number;
  cannesWins: number;
  cannesNominations: number;
  berlinWins: number;
  berlinNominations: number;
};

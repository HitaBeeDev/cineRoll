// TF-IDF + cosine similarity for content-based film similarity.
//
// Why this exists: raw genre Jaccard (see `similarity.ts`) treats every shared
// genre as equally meaningful. But "Drama" sits on a huge share of the catalog,
// so sharing it says almost nothing, while sharing "Film-Noir" is highly
// informative. TF-IDF fixes exactly that: each feature is weighted by its
// *rarity* across the catalog (inverse document frequency), so a shared rare
// tag dominates a shared common one. Cosine then compares the weighted vectors.
//
// A film is the "document"; its feature tokens (genres, director, decade,
// awards) are the "terms". Term frequency is binary (a tag is present or not),
// which is the standard choice for short, set-like documents.

export type FeatureToken = string;
export type IdfTable = Map<FeatureToken, number>;
export type SparseVector = Map<FeatureToken, number>;

// The minimal shape TF-IDF needs — satisfied structurally by CandidateFilm and
// any row selecting the same fields, so callers don't need to adapt their data.
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

const AWARD_BODIES = [
  { key: "oscar", wins: "oscarWins", nominations: "oscarNominations" },
  { key: "gg", wins: "ggWins", nominations: "ggNominations" },
  { key: "cannes", wins: "cannesWins", nominations: "cannesNominations" },
  { key: "berlin", wins: "berlinWins", nominations: "berlinNominations" },
] as const;

// The bag of feature tokens for one film — its "terms". De-duplicated so a term
// counts once (binary TF).
export function filmTokens(film: TfidfFilm): FeatureToken[] {
  const tokens = new Set<FeatureToken>();

  for (const genre of film.genres) tokens.add(`genre:${genre}`);
  if (film.director) tokens.add(`director:${film.director}`);

  const decade = decadeToken(film.releaseYear);
  if (decade) tokens.add(decade);

  for (const award of awardTokens(film)) tokens.add(award);

  return [...tokens];
}

// Build the IDF table from a document set (the catalog, ideally). Smoothed the
// scikit-learn way — `ln((1 + N) / (1 + df)) + 1` — so weights stay strictly
// positive even for a term that appears in every film, and no division by zero.
export function buildIdf(films: TfidfFilm[]): IdfTable {
  const documentCount = films.length;
  const documentFrequency = new Map<FeatureToken, number>();

  for (const film of films) {
    for (const token of filmTokens(film)) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }

  const idf: IdfTable = new Map();
  for (const [token, frequency] of documentFrequency) {
    idf.set(token, Math.log((1 + documentCount) / (1 + frequency)) + 1);
  }

  return idf;
}

// A film's TF-IDF vector. Binary TF (1 per present token) × the token's IDF.
// Tokens unseen when the IDF table was built are skipped (they carry no learned
// weight); this keeps out-of-vocabulary terms from silently dominating.
export function tfidfVector(film: TfidfFilm, idf: IdfTable): SparseVector {
  const vector: SparseVector = new Map();

  for (const token of filmTokens(film)) {
    const weight = idf.get(token);
    if (weight != null) vector.set(token, weight);
  }

  return vector;
}

// Cosine similarity of two sparse vectors: dot product over the shared terms,
// divided by the product of magnitudes. 1 = identical direction, 0 = no shared
// terms (orthogonal). Iterates the smaller vector for the dot product.
export function cosineSimilarity(a: SparseVector, b: SparseVector): number {
  if (a.size === 0 || b.size === 0) return 0;

  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [token, weight] of small) {
    const other = large.get(token);
    if (other != null) dot += weight * other;
  }
  if (dot === 0) return 0;

  return dot / (magnitude(a) * magnitude(b));
}

// The centroid (mean vector) of several TF-IDF vectors — used as a "taste
// vector": the average of the films a user liked. Ranking candidates by cosine
// to this centroid is content-based recommendation in one line.
export function centroid(vectors: SparseVector[]): SparseVector {
  if (vectors.length === 0) return new Map();

  const sum: SparseVector = new Map();
  for (const vector of vectors) {
    for (const [token, weight] of vector) {
      sum.set(token, (sum.get(token) ?? 0) + weight);
    }
  }

  for (const [token, weight] of sum) sum.set(token, weight / vectors.length);

  return sum;
}

function magnitude(vector: SparseVector): number {
  let sumOfSquares = 0;
  for (const weight of vector.values()) sumOfSquares += weight * weight;

  return Math.sqrt(sumOfSquares);
}

function decadeToken(year: number | null): FeatureToken | null {
  if (year == null) return null;

  return `decade:${Math.floor(year / 10) * 10}s`;
}

function awardTokens(film: TfidfFilm): FeatureToken[] {
  const tokens: FeatureToken[] = [];

  for (const body of AWARD_BODIES) {
    if (film[body.wins] > 0) tokens.push(`award:${body.key}_winner`);
    else if (film[body.nominations] > 0) tokens.push(`award:${body.key}_nominee`);
  }

  return tokens;
}

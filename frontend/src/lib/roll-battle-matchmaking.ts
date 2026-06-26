import type { RollFilm } from "@/lib/api";

/**
 * Roll Battle matchmaking.
 *
 * A head-to-head "which film wins" only feels fair when the two films are
 * actually comparable — pitting a 1h40 narrative drama against a 7h47
 * documentary is a coin flip, not a contest. Instead of pairing films at
 * random, we score every candidate against every other on a small set of
 * features and pick the tightest *cluster* of comparable films.
 *
 * Because the page runs a king-of-the-hill bracket (the round winner stays on
 * to face the next challenger), the whole set must be mutually comparable —
 * not just consecutive pairs — so that whoever wins, the next fight is still
 * fair. A nearest-neighbour cluster guarantees exactly that.
 *
 * The metric is intentionally simple and explainable; the goal is to remove
 * obvious mismatches, not to model taste. It stays on the client so the page
 * needs no new backend infrastructure.
 */

type FilmFeatures = {
  year: number | null;
  runtime: number | null;
  rating: number | null;
  genres: Set<string>;
  isDocumentary: boolean;
};

// Relative pull of each signal on the distance metric. Genre and medium carry
// the most weight because a different kind of film is the most jarring mismatch
// (the doc-vs-drama problem); runtime is next because a 5x length gap is felt
// immediately.
const WEIGHTS = {
  year: 1.0,
  runtime: 1.2,
  rating: 0.8,
  genre: 1.6,
  medium: 1.4,
} as const;

function toNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toFeatures(film: RollFilm): FilmFeatures {
  const genres = new Set(film.genres.map((g) => g.toLowerCase()));
  return {
    year: toNumber(film.releaseYear) ?? toNumber(film.year),
    runtime: toNumber(film.runtime),
    rating: toNumber(film.imdbRating),
    genres,
    isDocumentary: genres.has("documentary"),
  };
}

function jaccardDistance(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : 1 - intersection / union;
}

type Ranges = { year: number; runtime: number; rating: number };

function computeRanges(features: FilmFeatures[]): Ranges {
  const spread = (values: Array<number | null>): number => {
    const present = values.filter((v): v is number => v != null);
    if (present.length === 0) return 0;
    return Math.max(...present) - Math.min(...present);
  };
  return {
    year: spread(features.map((f) => f.year)),
    runtime: spread(features.map((f) => f.runtime)),
    rating: spread(features.map((f) => f.rating)),
  };
}

/** Normalised 0..1 distance between two films — 0 is identical, 1 is maximally
 *  dissimilar. Missing numeric signals are skipped so they neither help nor
 *  penalise a pairing. */
function filmDistance(a: FilmFeatures, b: FilmFeatures, ranges: Ranges): number {
  let weighted = 0;
  let totalWeight = 0;

  const addNumeric = (
    av: number | null,
    bv: number | null,
    range: number,
    weight: number,
  ) => {
    if (av == null || bv == null || range <= 0) return;
    weighted += weight * (Math.abs(av - bv) / range);
    totalWeight += weight;
  };

  addNumeric(a.year, b.year, ranges.year, WEIGHTS.year);
  addNumeric(a.runtime, b.runtime, ranges.runtime, WEIGHTS.runtime);
  addNumeric(a.rating, b.rating, ranges.rating, WEIGHTS.rating);

  weighted += WEIGHTS.genre * jaccardDistance(a.genres, b.genres);
  totalWeight += WEIGHTS.genre;

  weighted += WEIGHTS.medium * (a.isDocumentary === b.isDocumentary ? 0 : 1);
  totalWeight += WEIGHTS.medium;

  return totalWeight > 0 ? weighted / totalWeight : 1;
}

function dedupeById(films: RollFilm[]): RollFilm[] {
  const seen = new Set<string>();
  const unique: RollFilm[] = [];
  for (const film of films) {
    if (seen.has(film.id)) continue;
    seen.add(film.id);
    unique.push(film);
  }
  return unique;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return result;
}

/**
 * Select `size` mutually-comparable films from `pool` for a king-of-the-hill
 * bracket. The first returned film is the seed (the opening champion); the rest
 * are its nearest neighbours, ordered closest-first.
 *
 * O(n²) over the candidate pool, which is a handful of films — negligible.
 */
export function buildBattleCluster(pool: RollFilm[], size: number): RollFilm[] {
  const unique = dedupeById(pool);
  if (unique.length <= size) return shuffle(unique);

  const features = unique.map(toFeatures);
  const ranges = computeRanges(features);
  const n = unique.length;

  const distance: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const d = filmDistance(features[i]!, features[j]!, ranges);
      distance[i]![j] = d;
      distance[j]![i] = d;
    }
  }

  // For each possible seed, take its (size - 1) nearest neighbours and score the
  // cluster by total distance. The tightest cluster wins.
  let bestSeed = 0;
  let bestMembers: number[] = [];
  let bestCost = Infinity;

  for (let seed = 0; seed < n; seed += 1) {
    const seedRow = distance[seed]!;
    const neighbours = Array.from({ length: n }, (_, i) => i)
      .filter((i) => i !== seed)
      .sort((a, b) => seedRow[a]! - seedRow[b]!)
      .slice(0, size - 1);
    const cost = neighbours.reduce((acc, i) => acc + seedRow[i]!, 0);
    if (cost < bestCost) {
      bestCost = cost;
      bestSeed = seed;
      bestMembers = neighbours;
    }
  }

  return [bestSeed, ...bestMembers].map((i) => unique[i]!);
}

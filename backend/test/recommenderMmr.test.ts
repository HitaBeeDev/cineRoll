import { describe, expect, it } from "vitest";

import type { RecommenderParams } from "../src/lib/experiments";
import { rankCandidates } from "../src/lib/recommender/ranking";
import type { CandidateFilm } from "../src/lib/recommender/types";
import type { TasteProfileVectors } from "../src/lib/tasteProfile";

function candidate(overrides: Partial<CandidateFilm> = {}): CandidateFilm {
  return {
    id: "f",
    slug: "f",
    title: "F",
    releaseYear: 2015,
    runtime: null,
    genres: [],
    director: null,
    posterUrl: null,
    imdbRating: null,
    rtScore: null,
    imdbTopMovieRank: null,
    imdbTopTvRank: null,
    oscarWins: 0,
    oscarNominations: 0,
    ggWins: 0,
    ggNominations: 0,
    cannesWins: 0,
    cannesNominations: 0,
    berlinWins: 0,
    berlinNominations: 0,
    ...overrides,
  };
}

function taste(overrides: Partial<TasteProfileVectors> = {}): TasteProfileVectors {
  return {
    genreWeights: {},
    directorWeights: {},
    decadeWeights: {},
    runtimeBandWeights: {},
    awardAffinity: {},
    ratingTier: {},
    positiveCount: 0,
    negativeCount: 0,
    ...overrides,
  };
}

// Isolate MMR: no quality/recency, only the taste + λ knob varies.
const withLambda = (mmrLambda: number): RecommenderParams => ({
  qualityWeight: 0,
  recencyWeight: 0,
  mmrLambda,
});

const YEAR = 2020;
const directorsOf = (ranked: { film: CandidateFilm }[]) =>
  new Set(ranked.map((s) => s.film.director));

describe("mmrRerank (via rankCandidates)", () => {
  it("λ=1 is pure relevance — near-identical top scorers both rank first, similarity ignored", () => {
    const profile = taste({ genreWeights: { Drama: 1, Comedy: 0.2 } });
    const candidates = [
      candidate({ id: "d1", genres: ["Drama"], director: "Nolan" }),
      // A near-duplicate of d1 (same genre/director/decade → cosine 1).
      candidate({ id: "d2", genres: ["Drama"], director: "Nolan" }),
      // Diverse but far less relevant.
      candidate({ id: "c1", genres: ["Comedy"], director: "Wright", releaseYear: 1995 }),
    ];

    const ranked = rankCandidates(candidates, profile, 3, YEAR, withLambda(1));

    // Highest relevance wins outright; the twin isn't penalized for similarity.
    expect(ranked.map((s) => s.film.id)).toEqual(["d1", "d2", "c1"]);
  });

  it("λ=0 is max diversity — a distant film is promoted over a near-duplicate", () => {
    const profile = taste({ genreWeights: { Drama: 1, Comedy: 0.2 } });
    const candidates = [
      candidate({ id: "d1", genres: ["Drama"], director: "Nolan" }),
      candidate({ id: "d2", genres: ["Drama"], director: "Nolan" }),
      candidate({ id: "c1", genres: ["Comedy"], director: "Wright", releaseYear: 1995 }),
    ];

    const ranked = rankCandidates(candidates, profile, 3, YEAR, withLambda(0));

    // After d1, the orthogonal c1 (sim 0) beats the identical d2 despite far
    // lower relevance — diversity drives the order.
    expect(ranked.map((s) => s.film.id)).toEqual(["d1", "c1", "d2"]);
  });

  it("does not over-concentrate one director when equal-relevance alternatives exist", () => {
    // All Drama → identical taste relevance; director is the only thing that
    // separates them, so MMR's job is to spread the picks across directors.
    const profile = taste({ genreWeights: { Drama: 1 } });
    const candidates = [
      candidate({ id: "n1", genres: ["Drama"], director: "Nolan" }),
      candidate({ id: "n2", genres: ["Drama"], director: "Nolan" }),
      candidate({ id: "n3", genres: ["Drama"], director: "Nolan" }),
      candidate({ id: "v1", genres: ["Drama"], director: "Villeneuve" }),
      candidate({ id: "w1", genres: ["Drama"], director: "Wright" }),
    ];

    // Pure relevance can't tell them apart → falls back to input order and takes
    // all three Nolans: the over-concentration MMR is meant to prevent.
    const pureRelevance = rankCandidates(candidates, profile, 3, YEAR, withLambda(1));
    expect(directorsOf(pureRelevance).size).toBe(1);

    // With diversity in play, the top-3 spreads across distinct directors.
    const diversified = rankCandidates(candidates, profile, 3, YEAR, withLambda(0.7));
    expect(directorsOf(diversified).size).toBe(3);
    const nolanCount = diversified.filter((s) => s.film.director === "Nolan").length;
    expect(nolanCount).toBeLessThanOrEqual(1);
  });
});

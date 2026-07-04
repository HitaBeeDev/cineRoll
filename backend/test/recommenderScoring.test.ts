import { describe, expect, it } from "vitest";

import type { RecommenderParams } from "../src/lib/experiments";
import { RECENCY_BASE_YEAR, SCORE_DIMENSIONS } from "../src/lib/recommender/constants";
import { rankCandidates } from "../src/lib/recommender/ranking";
import { scoreFilm } from "../src/lib/recommender/scoring";
import type { CandidateFilm } from "../src/lib/recommender/types";
import type { TasteProfileVectors } from "../src/lib/tasteProfile";

function candidate(overrides: Partial<CandidateFilm> = {}): CandidateFilm {
  return {
    id: "f",
    slug: "f",
    title: "F",
    releaseYear: null,
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

// Explicit params so the tests don't depend on env-tunable BASELINE_PARAMS.
const params = (p: Partial<RecommenderParams>): RecommenderParams => ({
  qualityWeight: 0,
  recencyWeight: 0,
  mmrLambda: 0.7,
  ...p,
});

const YEAR = 2020;

describe("scoreFilm", () => {
  it("ranks films by taste match when quality/recency are neutralized", () => {
    const profile = taste({ genreWeights: { Drama: 1, Horror: -1 } });
    const only = params({ qualityWeight: 0, recencyWeight: 0 });

    const drama = scoreFilm(candidate({ genres: ["Drama"] }), profile, YEAR, only);
    const comedy = scoreFilm(candidate({ genres: ["Comedy"] }), profile, YEAR, only);
    const horror = scoreFilm(candidate({ genres: ["Horror"] }), profile, YEAR, only);

    expect(drama).toBeCloseTo(SCORE_DIMENSIONS.genre * 1, 10);
    expect(horror).toBeCloseTo(SCORE_DIMENSIONS.genre * -1, 10);
    expect(comedy).toBeCloseTo(0, 10);
    expect(drama).toBeGreaterThan(comedy);
    expect(comedy).toBeGreaterThan(horror);
  });

  it("weights a matched director by the director dimension", () => {
    const profile = taste({ directorWeights: { Nolan: 0.5 } });
    const score = scoreFilm(
      candidate({ director: "Nolan" }),
      profile,
      YEAR,
      params({}),
    );

    expect(score).toBeCloseTo(SCORE_DIMENSIONS.director * 0.5, 10);
  });

  it("rewards higher quality via the quality prior", () => {
    const only = params({ qualityWeight: 1, recencyWeight: 0 });
    const high = scoreFilm(
      candidate({ imdbRating: 9.0, rtScore: 100, oscarWins: 4 }),
      taste(),
      YEAR,
      only,
    );
    const low = scoreFilm(
      candidate({ imdbRating: 2.0, rtScore: 10 }),
      taste(),
      YEAR,
      only,
    );

    // 0.75·avg(rating) + 0.25·awardPrior
    expect(high).toBeCloseTo(0.75 * 0.95 + 0.25 * 1, 10);
    expect(low).toBeCloseTo(0.75 * 0.15, 10);
    expect(high).toBeGreaterThan(low);
  });

  it("rewards more-recent films via the recency prior", () => {
    const only = params({ qualityWeight: 0, recencyWeight: 1 });
    const span = YEAR - RECENCY_BASE_YEAR;

    const newest = scoreFilm(candidate({ releaseYear: YEAR }), taste(), YEAR, only);
    const mid = scoreFilm(
      candidate({ releaseYear: RECENCY_BASE_YEAR + span / 2 }),
      taste(),
      YEAR,
      only,
    );
    const oldest = scoreFilm(candidate({ releaseYear: RECENCY_BASE_YEAR }), taste(), YEAR, only);

    expect(newest).toBeCloseTo(1, 10);
    expect(mid).toBeCloseTo(0.5, 10);
    expect(oldest).toBeCloseTo(0, 10);
    expect(newest).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(oldest);
  });

  it("moves the score as qualityWeight / recencyWeight change", () => {
    const film = candidate({ imdbRating: 9.0, rtScore: 100, oscarWins: 4, releaseYear: YEAR });

    const lowQ = scoreFilm(film, taste(), YEAR, params({ qualityWeight: 0.2 }));
    const highQ = scoreFilm(film, taste(), YEAR, params({ qualityWeight: 1.0 }));
    expect(highQ).toBeGreaterThan(lowQ);
    // The delta is exactly Δweight · qualityPrior (0.9625 here).
    expect(highQ - lowQ).toBeCloseTo((1.0 - 0.2) * 0.9625, 10);

    const lowR = scoreFilm(film, taste(), YEAR, params({ recencyWeight: 0.1 }));
    const highR = scoreFilm(film, taste(), YEAR, params({ recencyWeight: 0.5 }));
    expect(highR).toBeGreaterThan(lowR);
  });
});

describe("rankCandidates", () => {
  it("orders candidates by relevance under pure-relevance MMR (λ=1)", () => {
    const profile = taste({ genreWeights: { Drama: 1, Horror: -1 } });
    const candidates = [
      candidate({ id: "horror", genres: ["Horror"] }),
      candidate({ id: "drama", genres: ["Drama"] }),
      candidate({ id: "comedy", genres: ["Comedy"] }),
    ];

    const ranked = rankCandidates(
      candidates,
      profile,
      3,
      YEAR,
      params({ qualityWeight: 0, recencyWeight: 0, mmrLambda: 1 }),
    );

    expect(ranked.map((s) => s.film.id)).toEqual(["drama", "comedy", "horror"]);
    expect(ranked[0]!.score).toBeGreaterThan(ranked[2]!.score);
  });

  it("lets the quality prior decide ties within the same genre", () => {
    const candidates = [
      candidate({ id: "bad", genres: ["Drama"], imdbRating: 3.0, rtScore: 20 }),
      candidate({ id: "good", genres: ["Drama"], imdbRating: 9.0, rtScore: 95 }),
    ];

    const ranked = rankCandidates(
      candidates,
      taste(),
      2,
      YEAR,
      params({ qualityWeight: 1, recencyWeight: 0, mmrLambda: 1 }),
    );

    expect(ranked.map((s) => s.film.id)).toEqual(["good", "bad"]);
  });

  it("returns at most `limit` scored candidates", () => {
    const candidates = [
      candidate({ id: "a", genres: ["Drama"] }),
      candidate({ id: "b", genres: ["Comedy"] }),
      candidate({ id: "c", genres: ["Horror"] }),
    ];

    const ranked = rankCandidates(candidates, taste(), 2, YEAR, params({ mmrLambda: 1 }));

    expect(ranked).toHaveLength(2);
    for (const scored of ranked) expect(typeof scored.score).toBe("number");
  });
});

import { describe, expect, it } from "vitest";

import {
  abilityPercentile,
  BallotItem,
  DifficultyFilm,
  estimateAbility,
  filmDifficulty,
} from "../src/routes/snobTestRoute/irt";

function ballot(difficulties: number[], seen: (index: number) => boolean): BallotItem[] {
  return difficulties.map((difficulty, index) => ({ difficulty, seen: seen(index) }));
}

describe("estimateAbility", () => {
  const difficulties = [-2, -1, 0, 1, 2];

  it("increases monotonically with the number of items seen", () => {
    const none = estimateAbility(ballot(difficulties, () => false));
    const half = estimateAbility(ballot(difficulties, index => index < 3));
    const all = estimateAbility(ballot(difficulties, () => true));

    expect(none).toBeLessThan(half);
    expect(half).toBeLessThan(all);
  });

  // The whole reason the Snob Test needs IRT: ballots are randomized per user,
  // so equal seen-counts from harder ballots must map to higher ability. (Within
  // a *fixed* ballot the Rasch raw score is a sufficient statistic for theta —
  // asserted separately below — so the difficulty signal only bites across
  // different ballots.)
  it("rewards seeing films from a harder ballot over an easier one", () => {
    const sawHardBallot = estimateAbility(ballot([1, 2], () => true));
    const sawEasyBallot = estimateAbility(ballot([-2, -1], () => true));

    expect(sawHardBallot).toBeGreaterThan(sawEasyBallot);
  });

  it("gives the same ability for equal seen-counts on one fixed ballot (Rasch sufficiency)", () => {
    const items = [-2, -1, 1, 2];
    const sawHard = estimateAbility(ballot(items, index => index >= 2));
    const sawEasy = estimateAbility(ballot(items, index => index < 2));

    expect(sawHard).toBeCloseTo(sawEasy, 10);
  });

  it("stays finite for degenerate all-seen / none-seen ballots", () => {
    expect(Number.isFinite(estimateAbility(ballot(difficulties, () => true)))).toBe(true);
    expect(Number.isFinite(estimateAbility(ballot(difficulties, () => false)))).toBe(true);
  });
});

describe("abilityPercentile", () => {
  it("maps ability into (0, 1), centered at 0.5 and monotonic", () => {
    expect(abilityPercentile(0)).toBeCloseTo(0.5, 5);
    expect(abilityPercentile(-5)).toBeGreaterThan(0);
    expect(abilityPercentile(5)).toBeLessThan(1);
    expect(abilityPercentile(1)).toBeGreaterThan(abilityPercentile(-1));
  });
});

describe("filmDifficulty", () => {
  const famous: DifficultyFilm = {
    imdbRating: 8.5,
    imdbTopMovieRank: 5,
    imdbTopTvRank: null,
    oscarWins: 4,
    ggWins: 3,
    cannesWins: 0,
    oscarNominations: 10,
    ggNominations: 6,
    cannesNominations: 0,
    posterUrl: "https://example.test/poster.jpg",
  };

  const obscure: DifficultyFilm = {
    imdbRating: null,
    imdbTopMovieRank: null,
    imdbTopTvRank: null,
    oscarWins: 0,
    ggWins: 0,
    cannesWins: 1,
    oscarNominations: 0,
    ggNominations: 0,
    cannesNominations: 1,
    posterUrl: null,
  };

  it("assigns higher difficulty to obscure films than to famous ones", () => {
    expect(filmDifficulty(obscure)).toBeGreaterThan(filmDifficulty(famous));
  });

  it("makes a famous, widely-seen film an easy (negative-difficulty) item", () => {
    expect(filmDifficulty(famous)).toBeLessThan(0);
  });
});

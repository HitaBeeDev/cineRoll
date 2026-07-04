import { describe, expect, it } from "vitest";

import { aggregateTasteVectors } from "../src/lib/tasteProfile/aggregator";
import { DAY_MS, TASTE_PROFILE_CONFIG } from "../src/lib/tasteProfile/constants";
import type { FilmFeatures, Signal, Vector } from "../src/lib/tasteProfile/types";

function film(overrides: Partial<FilmFeatures> = {}): FilmFeatures {
  return {
    genres: [],
    director: null,
    releaseYear: null,
    runtime: null,
    imdbRating: null,
    rtScore: null,
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

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY_MS);
}

function signal(weight: number, filmFeatures: FilmFeatures, at: Date = new Date()): Signal {
  return { weight, film: filmFeatures, at };
}

describe("aggregateTasteVectors", () => {
  it("turns a known signal set into the expected normalized genre weights", () => {
    const profile = aggregateTasteVectors(
      [
        signal(1, film({ genres: ["Drama"] })),
        signal(0.5, film({ genres: ["Horror"] })),
      ],
      [],
    );

    // Max-abs normalization pins the strongest signal (Drama, +1) to 1 and scales
    // the rest against it: Horror at half the weight lands at ~0.5.
    expect(profile.genreWeights["Drama"]).toBeCloseTo(1, 5);
    expect(profile.genreWeights["Horror"]).toBeCloseTo(0.5, 5);
    expect(profile.positiveCount).toBe(2);
    expect(profile.negativeCount).toBe(0);
  });

  it("lets recent signals dominate equally-weighted older ones", () => {
    const profile = aggregateTasteVectors(
      [
        signal(1, film({ genres: ["Drama"] }), new Date()),
        // Same +1 weight, but two half-lives old → decays to a quarter.
        signal(1, film({ genres: ["Horror"] }), daysAgo(180)),
      ],
      [],
    );

    expect(profile.genreWeights["Drama"]).toBeGreaterThan(profile.genreWeights["Horror"]!);
    expect(profile.genreWeights["Drama"]).toBeCloseTo(1, 5);
    expect(profile.genreWeights["Horror"]).toBeCloseTo(0.25, 4);
  });

  it("caps every vector at ±1 via max-abs normalization", () => {
    const profile = aggregateTasteVectors(
      [
        signal(
          2,
          film({
            genres: ["Drama", "SciFi"],
            director: "Nolan",
            releaseYear: 2014,
            runtime: 169,
            imdbRating: 8.6,
            rtScore: 87,
            oscarWins: 4,
          }),
        ),
        signal(
          -1,
          film({
            genres: ["Horror"],
            director: "Wan",
            releaseYear: 2013,
            runtime: 98,
            imdbRating: 7.5,
            rtScore: 79,
            ggNominations: 1,
          }),
        ),
      ],
      [],
    );

    const vectors: Vector[] = [
      profile.genreWeights,
      profile.directorWeights,
      profile.decadeWeights,
      profile.runtimeBandWeights,
      profile.awardAffinity,
      profile.ratingTier,
    ];

    for (const vector of vectors) {
      const values = Object.values(vector);
      expect(values.length).toBeGreaterThan(0);
      // Nothing escapes [-1, 1] …
      for (const value of values) expect(Math.abs(value)).toBeLessThanOrEqual(1 + 1e-9);
      // … and each vector's strongest component is pinned to exactly ±1.
      const maxAbs = Math.max(...values.map((v) => Math.abs(v)));
      expect(maxAbs).toBeCloseTo(1, 10);
    }

    expect(profile.positiveCount).toBe(1);
    expect(profile.negativeCount).toBe(1);
  });

  it("blends onboarding genres below the cold-start threshold", () => {
    // 2 positive signals < coldStartThreshold(3) → onboarding genres are seeded.
    const profile = aggregateTasteVectors(
      [
        signal(1, film({ genres: ["Drama"] })),
        signal(1, film({ genres: ["Drama"] })),
      ],
      ["Comedy", "Thriller"],
    );

    expect(profile.positiveCount).toBeLessThan(TASTE_PROFILE_CONFIG.coldStartThreshold);
    // Seeds present, and ranked by onboarding order (earlier genre weighted higher).
    expect(profile.genreWeights["Comedy"]).toBeGreaterThan(0);
    expect(profile.genreWeights["Thriller"]).toBeGreaterThan(0);
    expect(profile.genreWeights["Comedy"]).toBeGreaterThan(profile.genreWeights["Thriller"]!);
  });

  it("does NOT blend onboarding genres once at/above the threshold", () => {
    // 3 positive signals == coldStartThreshold → cold-start no longer applies.
    const profile = aggregateTasteVectors(
      [
        signal(1, film({ genres: ["Drama"] })),
        signal(1, film({ genres: ["Drama"] })),
        signal(1, film({ genres: ["Drama"] })),
      ],
      ["Comedy"],
    );

    expect(profile.positiveCount).toBe(TASTE_PROFILE_CONFIG.coldStartThreshold);
    expect(profile.genreWeights["Comedy"]).toBeUndefined();
  });

  it("cold-starts purely from onboarding genres when there are no signals", () => {
    const profile = aggregateTasteVectors([], ["Comedy", "Thriller"]);

    expect(profile.genreWeights["Comedy"]).toBeCloseTo(1, 10);
    expect(profile.genreWeights["Thriller"]).toBeCloseTo(0.5, 10);
    expect(profile.positiveCount).toBe(0);
  });
});

import { describe, expect, it } from "vitest";

import { createReasonVariety } from "../src/lib/recommender/reason/reasonVariety";
import { buildReason } from "../src/lib/recommender/reasonBuilder";
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

const reasonsFor = (
  films: CandidateFilm[],
  profile: TasteProfileVectors,
  likedByGenre: Map<string, string[]>,
): string[] => {
  const variety = createReasonVariety();

  return films.map((film, index) =>
    buildReason(film, profile, likedByGenre, false, index, variety),
  );
};

describe("recommendation reasons", () => {
  it("rotates the liked anchor instead of repeating one title down the row", () => {
    const profile = taste({ genreWeights: { Drama: 2 }, positiveCount: 5 });
    const liked = new Map([["Drama", ["Ben-Hur", "GoodFellas", "Whiplash"]]]);
    const films = [
      candidate({ id: "a", genres: ["Drama"] }),
      candidate({ id: "b", genres: ["Drama"] }),
      candidate({ id: "c", genres: ["Drama"] }),
    ];

    const reasons = reasonsFor(films, profile, liked);

    expect(reasons[0]).toContain("liked Ben-Hur");
    expect(reasons[1]).toContain("liked GoodFellas");
    expect(reasons[2]).toContain("liked Whiplash");
    expect(new Set(reasons).size).toBe(reasons.length);
  });

  it("falls through to the next distinguishing part once a phrase is spent", () => {
    const profile = taste({
      genreWeights: { Drama: 2 },
      directorWeights: { "Christopher Nolan": 1 },
      decadeWeights: { "2010s": 1 },
      awardAffinity: { oscar_winner: 1 },
      positiveCount: 5,
    });
    const liked = new Map([["Drama", ["Ben-Hur"]]]);
    const films = [
      candidate({ id: "a", genres: ["Drama"] }),
      candidate({ id: "b", genres: ["Drama"], director: "Christopher Nolan" }),
      candidate({ id: "c", genres: ["Drama"], releaseYear: 2014, oscarWins: 1 }),
    ];

    const reasons = reasonsFor(films, profile, liked);

    // Only one liked Drama exists, so the anchor repeats — the second phrase
    // has to carry the difference.
    expect(reasons[0]).toBe("Because you liked Ben-Hur and watch a lot of Drama.");
    expect(reasons[1]).toBe("Because you liked Ben-Hur and like Christopher Nolan.");
    expect(reasons[2]).toContain("favor Oscar winners");
    expect(new Set(reasons).size).toBe(reasons.length);
  });

  it("anchors on any liked genre the film shares, not only the strongest", () => {
    const profile = taste({ genreWeights: { Drama: 2, War: 1 }, positiveCount: 5 });
    const liked = new Map([
      ["Drama", ["Ben-Hur"]],
      ["War", ["Saving Private Ryan"]],
    ]);
    const films = [
      candidate({ id: "a", genres: ["Drama", "War"] }),
      candidate({ id: "b", genres: ["Drama", "War"] }),
    ];

    const reasons = reasonsFor(films, profile, liked);

    expect(reasons[0]).toContain("liked Ben-Hur");
    expect(reasons[1]).toContain("liked Saving Private Ryan");
  });

  it("keeps a title that two liked genres share from being offered twice", () => {
    const profile = taste({ genreWeights: { Drama: 2, War: 1 }, positiveCount: 5 });
    const liked = new Map([
      ["Drama", ["Ben-Hur"]],
      ["War", ["Ben-Hur"]],
    ]);
    const film = candidate({ id: "a", genres: ["Drama", "War"] });

    const reasons = reasonsFor([film], profile, liked);

    expect(reasons[0]).toBe("Because you liked Ben-Hur and watch a lot of Drama.");
  });
});

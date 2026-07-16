import { describe, expect, it } from "vitest";

import type { RandomFilmRow } from "../src/routes/random";
import { localRerankCandidates } from "../src/routes/naturalRollRoute/localReranker";
import type { SoftPreferences } from "../src/routes/naturalRollRoute/softPreferences";

const REGRESSION_PROMPT =
  "Recommend one romantic drama movie with beautiful music, emotional storytelling, " +
  "memorable performances, stunning cinematography, a bittersweet ending, and " +
  "character-driven storytelling.";

// The extraction the regression prompt produces (see naturalRollExtraction.test.ts).
const preferences: SoftPreferences = {
  genres: ["Romance", "Drama", "Music"],
  tones: ["bittersweet", "emotional"],
  themes: ["ambition", "dreams"],
  keywords: ["cinematography", "character-driven", "musical"],
  contentType: "movie",
};

function film(overrides: Partial<RandomFilmRow>): RandomFilmRow {
  return {
    id: "f",
    slug: "f",
    title: "F",
    originalTitle: null,
    releaseYear: 2000,
    year: 2000,
    runtime: 120,
    genres: [],
    contentType: "movie",
    plot: null,
    director: null,
    posterUrl: null,
    posterColor: null,
    backdropUrl: null,
    imdbRating: null,
    rtScore: null,
    imdbTopMovieRank: null,
    imdbTopTvRank: null,
    oscarCategories: null,
    oscarNominations: 0,
    oscarWins: 0,
    ggCategories: null,
    ggNominations: 0,
    ggWins: 0,
    cannesCategories: null,
    cannesNominations: 0,
    cannesWins: 0,
    berlinCategories: null,
    berlinNominations: 0,
    berlinWins: 0,
    ...overrides,
  };
}

// Fixtures modeled on the real failure: a lower-rated film matching every
// requested signal must beat famous, higher-rated titles matching few — and a
// TV series must never appear for a movie request. No titles are hard-coded
// into the scorer; these win or lose purely on their metadata.
const romanticMusical = film({
  id: "romantic-musical",
  title: "City of Dreams",
  genres: ["Romance", "Drama", "Music"],
  imdbRating: 8.0,
  plot: "Two ambitious artists fall in love in a vivid, jazz-filled city, torn between romance and their dreams in a bittersweet parting.",
});

const acclaimedSeries = film({
  id: "acclaimed-series",
  title: "Chemistry Teacher",
  contentType: "tv-series",
  genres: ["Drama", "Crime"],
  imdbRating: 9.5,
  imdbTopTvRank: 1,
  plot: "A dying teacher builds a drug empire in this acclaimed dramatic series.",
});

const famousDrama = film({
  id: "famous-drama",
  title: "Park Bench Chronicle",
  genres: ["Drama"],
  imdbRating: 9.0,
  imdbTopMovieRank: 5,
  plot: "A slow-witted but kind man witnesses decades of history in this beloved drama.",
});

describe("natural roll weighted reranking", () => {
  it("ranks the multi-signal match above famous but irrelevant titles", () => {
    const picks = localRerankCandidates(
      REGRESSION_PROMPT,
      preferences,
      [famousDrama, acclaimedSeries, romanticMusical],
      3,
    );

    expect(picks[0]).toBe("romantic-musical");
  });

  it("never returns a TV series for a movie request", () => {
    const picks = localRerankCandidates(
      REGRESSION_PROMPT,
      preferences,
      [acclaimedSeries, famousDrama, romanticMusical],
      3,
    );

    expect(picks).not.toContain("acclaimed-series");
  });

  it("returns exactly the requested number of picks", () => {
    const picks = localRerankCandidates(
      REGRESSION_PROMPT,
      preferences,
      [famousDrama, romanticMusical],
      1,
    );

    expect(picks).toHaveLength(1);
    expect(picks[0]).toBe("romantic-musical");
  });

  it("lets rating break ties when relevance is equal", () => {
    const lowRated = film({ id: "low", genres: ["Romance"], imdbRating: 6.0 });
    const highRated = film({ id: "high", genres: ["Romance"], imdbRating: 8.5 });

    const picks = localRerankCandidates(
      "a romance",
      { genres: ["Romance"], tones: [], themes: [], keywords: [], contentType: "movie" },
      [lowRated, highRated],
      2,
    );

    expect(picks[0]).toBe("high");
  });
});

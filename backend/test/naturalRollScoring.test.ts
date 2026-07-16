import { describe, expect, it } from "vitest";

import type { RandomFilmRow } from "../src/routes/random";
import { localRerankCandidates } from "../src/routes/naturalRollRoute/localReranker";
import type { SoftPreferences } from "../src/routes/naturalRollRoute/softPreferences";

const ROMANCE_PROMPT =
  "I want a beautiful, emotional romance that feels nostalgic and hopeful at the same time. " +
  "It should have incredible music, colorful visuals, memorable performances, and leave me " +
  "smiling and crying by the end.";

// The extraction the romance prompt produces (see naturalRollExtraction.test.ts).
const preferences: SoftPreferences = {
  requiredGenres: ["Romance"],
  preferredGenres: ["Music"],
  tones: ["emotional", "nostalgic", "hopeful", "bittersweet"],
  themes: [],
  keywords: ["colorful", "musical", "performances"],
  contentType: null,
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
    moodTags: [],
    keywords: [],
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

// Fixtures modeled on the real failures. No titles are hard-coded into the
// scorer; these win or lose purely on their metadata.
const romanticMusical = film({
  id: "romantic-musical",
  title: "City of Dreams",
  genres: ["Romance", "Drama", "Music"],
  imdbRating: 8.0,
  keywords: ["jazz", "melancholy", "musical", "ambition", "dancing"],
  plot: "Two ambitious artists fall in love in a vivid, jazz-filled city, torn between romance and their dreams in a bittersweet parting.",
});

// The title-token trap: "Beautiful" in the title matches the prompt's
// "beautiful" — fame + rating + a title token must not beat a real match.
const beautifulWarDrama = film({
  id: "beautiful-war-drama",
  title: "A Beautiful Life",
  genres: ["Comedy", "Drama", "War"],
  imdbRating: 8.6,
  imdbTopMovieRank: 20,
  plot: "A father uses humor to shield his son from the horrors of a camp in this beautiful, emotional story.",
});

const wartimeDocumentary = film({
  id: "wartime-documentary",
  title: "The Memory of Justice",
  contentType: "documentary",
  genres: ["Documentary"],
  imdbRating: 8.4,
  plot: "An unflinching examination of wartime atrocities and how nations remember them.",
});

const epicAdventure = film({
  id: "epic-adventure",
  title: "The Fellowship",
  genres: ["Adventure", "Fantasy", "Drama"],
  imdbRating: 8.9,
  imdbTopMovieRank: 9,
  plot: "A hobbit sets out on an epic quest to destroy a ring of power.",
});

describe("natural roll weighted reranking — required genres", () => {
  it("ranks every romance above every non-romance, regardless of rating", () => {
    const picks = localRerankCandidates(
      ROMANCE_PROMPT,
      preferences,
      [wartimeDocumentary, epicAdventure, beautifulWarDrama, romanticMusical],
      4,
    );

    expect(picks[0]).toBe("romantic-musical");
    // The non-romances sink below both romance-adjacent titles.
    expect(picks.indexOf("wartime-documentary")).toBeGreaterThan(0);
    expect(picks.indexOf("epic-adventure")).toBeGreaterThan(0);
  });

  it("does not let a title token ('Beautiful') beat a genuine multi-signal match", () => {
    const picks = localRerankCandidates(
      ROMANCE_PROMPT,
      preferences,
      [beautifulWarDrama, romanticMusical],
      2,
    );

    expect(picks[0]).toBe("romantic-musical");
  });

  it("penalizes a missing preferred genre far less than a missing required one", () => {
    const romanceNoMusic = film({
      id: "romance-no-music",
      genres: ["Romance", "Drama"],
      imdbRating: 7.5,
      plot: "Two strangers fall in love over one long night of conversation.",
    });
    const musicNoRomance = film({
      id: "music-no-romance",
      genres: ["Music", "Drama"],
      imdbRating: 8.5,
      plot: "A young drummer is pushed to his limits by a ruthless teacher.",
    });

    const picks = localRerankCandidates(
      ROMANCE_PROMPT,
      preferences,
      [musicNoRomance, romanceNoMusic],
      2,
    );

    // Missing Romance (required) outweighs missing Music (preferred) plus a full point of rating.
    expect(picks[0]).toBe("romance-no-music");
  });
});

describe("natural roll weighted reranking — enriched metadata", () => {
  it("lets moodTags satisfy soft signals a short plot cannot", () => {
    const taggedRomance = film({
      id: "tagged-romance",
      genres: ["Romance", "Drama"],
      imdbRating: 7.0,
      moodTags: ["nostalgic", "hopeful", "bittersweet", "colorful", "musical"],
      plot: "Two people meet.",
    });
    const untaggedRomance = film({
      id: "untagged-romance",
      genres: ["Romance", "Drama"],
      imdbRating: 8.5,
      plot: "Two people meet.",
    });

    const picks = localRerankCandidates(
      ROMANCE_PROMPT,
      preferences,
      [untaggedRomance, taggedRomance],
      2,
    );

    expect(picks[0]).toBe("tagged-romance");
  });

  it("never returns the wrong content type for an explicit request", () => {
    const series = film({ id: "series", contentType: "tv-series", genres: ["Romance"] });
    const movie = film({ id: "movie", genres: ["Romance"] });

    const picks = localRerankCandidates(
      "a romance movie",
      { ...preferences, contentType: "movie" },
      [series, movie],
      2,
    );

    expect(picks).not.toContain("series");
  });

  it("lets rating break ties when relevance is equal", () => {
    const lowRated = film({ id: "low", genres: ["Romance"], imdbRating: 6.0 });
    const highRated = film({ id: "high", genres: ["Romance"], imdbRating: 8.5 });

    const picks = localRerankCandidates(
      "a romance",
      {
        requiredGenres: ["Romance"],
        preferredGenres: [],
        tones: [],
        themes: [],
        keywords: [],
        contentType: "movie",
      },
      [lowRated, highRated],
      2,
    );

    expect(picks[0]).toBe("high");
  });
});

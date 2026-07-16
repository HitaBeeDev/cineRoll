import { describe, expect, it } from "vitest";

import type { AllowedFilterValues } from "../src/lib/allowedFilterValues";
import { validateStructuralFilters } from "../src/lib/validateFilters";
import { extractLocalStructuralFilters } from "../src/routes/naturalRollRoute/localStructuralExtractor";
import { withLocalBackstop } from "../src/routes/naturalRollRoute/structuralExtractor";

// The two prompts that failed in production, verbatim.
const MOVIE_PROMPT =
  "Recommend one romantic drama movie with beautiful music, emotional storytelling, " +
  "memorable performances, stunning cinematography, a bittersweet ending, and " +
  "character-driven storytelling.";

const ROMANCE_PROMPT =
  "I want a beautiful, emotional romance that feels nostalgic and hopeful at the same time. " +
  "It should have incredible music, colorful visuals, memorable performances, and leave me " +
  "smiling and crying by the end.";

const allowed: AllowedFilterValues = {
  awardBodies: new Set(["oscar", "goldenglobe", "cannes", "all"]),
  categories: new Set(["Best Picture"]),
  contentTypes: new Set(["movie", "tv-series", "documentary", "short", "animation"]),
  genres: new Set(["Drama", "Romance", "Music", "Comedy", "Crime"]),
  languages: new Set(["en", "fr"]),
  yearMin: 1920,
  yearMax: 2030,
};

describe("natural roll extraction — required vs preferred genres", () => {
  it("splits what the film must BE from what it should HAVE (movie prompt)", () => {
    const filters = extractLocalStructuralFilters(MOVIE_PROMPT);

    expect(filters.requiredGenres).toEqual(expect.arrayContaining(["Romance", "Drama"]));
    expect(filters.preferredGenres).toEqual(["Music"]);
    expect(filters.contentType).toBe("movie");
    expect(filters.resultCount).toBe(1);
  });

  it("keeps a head-noun romance required even in a flowery prompt", () => {
    const filters = extractLocalStructuralFilters(ROMANCE_PROMPT);

    expect(filters.requiredGenres).toEqual(["Romance"]);
    expect(filters.preferredGenres).toEqual(["Music"]);
    expect(filters.tones).toEqual(
      expect.arrayContaining(["emotional", "nostalgic", "hopeful", "bittersweet"]),
    );
    expect(filters.keywords).toEqual(expect.arrayContaining(["colorful", "musical"]));
  });

  it("parses explicit counts but never bare articles", () => {
    expect(extractLocalStructuralFilters("suggest only one movie").resultCount).toBe(1);
    expect(extractLocalStructuralFilters("give me three french films").resultCount).toBe(3);
    expect(extractLocalStructuralFilters("a movie for tonight").resultCount).toBeUndefined();
    expect(extractLocalStructuralFilters("one of the best movies ever").resultCount).toBeUndefined();
  });

  it("counts genre nouns too — 'one modern romantic musical drama'", () => {
    const filters = extractLocalStructuralFilters(
      "Suggest one modern romantic musical drama with jazz music and a bittersweet ending.",
    );

    expect(filters.resultCount).toBe(1);
    expect(filters.requiredGenres).toEqual(expect.arrayContaining(["Romance", "Music", "Drama"]));
    // "modern" is an era, not a mood.
    expect(filters.decadeMin).toBe(2000);
  });

  it("keeps series vs movie as a deterministic constraint", () => {
    expect(extractLocalStructuralFilters("a gripping tv series").contentType).toBe("series");
    expect(extractLocalStructuralFilters("some movie with jazz").contentType).toBe("movie");
  });
});

describe("natural roll extraction — local backstop over the LLM result", () => {
  it("backfills genres when the model returns none (the production failure)", () => {
    const merged = withLocalBackstop(ROMANCE_PROMPT, { tones: ["emotional"] });

    expect(merged.requiredGenres).toEqual(["Romance"]);
    expect(merged.preferredGenres).toEqual(["Music"]);
    // Model tones are kept and locally-found tones are unioned in.
    expect(merged.tones).toEqual(expect.arrayContaining(["emotional", "nostalgic", "hopeful"]));
  });

  it("keeps the model's split and only adds missed genres as preferred", () => {
    const merged = withLocalBackstop(ROMANCE_PROMPT, { requiredGenres: ["Romance"] });

    expect(merged.requiredGenres).toEqual(["Romance"]);
    expect(merged.preferredGenres).toEqual(["Music"]);
  });

  it("never overrides an explicit model value for hard constraints", () => {
    const merged = withLocalBackstop("a movie about tv shows", { contentType: "movie" });

    expect(merged.contentType).toBe("movie");
  });
});

describe("natural roll extraction — filter validation", () => {
  it("resolves the extracted 'series' to the canonical tv-series type", () => {
    const { filters } = validateStructuralFilters({ contentType: "series" }, allowed);

    expect(filters.contentType).toBe("tv-series");
  });

  it("resolves a genre list to canonical values under the query's genre key", () => {
    const { filters } = validateStructuralFilters(
      { genres: ["romance", "Drama", "musical", "not-a-genre"] },
      allowed,
    );

    expect(filters.genre).toEqual(["Romance", "Drama", "Music"]);
    expect(filters.genres).toBeUndefined();
  });

  it("drops the genre filter only when nothing resolves", () => {
    const { filters, dropped } = validateStructuralFilters({ genres: ["nope"] }, allowed);

    expect(filters.genre).toBeUndefined();
    expect(dropped).toContain("genres");
  });

  it("resolves genresAll to the AND-semantics genreAll query key", () => {
    const { filters } = validateStructuralFilters(
      { genresAll: ["romance", "musical", "drama"] },
      allowed,
    );

    expect(filters.genreAll).toEqual(["Romance", "Music", "Drama"]);
  });
});

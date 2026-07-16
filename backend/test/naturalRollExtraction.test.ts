import { describe, expect, it } from "vitest";

import type { AllowedFilterValues } from "../src/lib/allowedFilterValues";
import { validateStructuralFilters } from "../src/lib/validateFilters";
import {
  extractLocalHardConstraints,
  extractLocalStructuralFilters,
} from "../src/routes/naturalRollRoute/localStructuralExtractor";

const REGRESSION_PROMPT =
  "Recommend one romantic drama movie with beautiful music, emotional storytelling, " +
  "memorable performances, stunning cinematography, a bittersweet ending, and " +
  "character-driven storytelling.";

const allowed: AllowedFilterValues = {
  awardBodies: new Set(["oscar", "goldenglobe", "cannes", "all"]),
  categories: new Set(["Best Picture"]),
  contentTypes: new Set(["movie", "tv-series", "documentary", "short", "animation"]),
  genres: new Set(["Drama", "Romance", "Music", "Comedy", "Crime"]),
  languages: new Set(["en", "fr"]),
  yearMin: 1920,
  yearMax: 2030,
};

describe("natural roll extraction — hard constraints", () => {
  it("extracts media type, all genres, and the requested count from the regression prompt", () => {
    const filters = extractLocalStructuralFilters(REGRESSION_PROMPT);

    expect(filters.contentType).toBe("movie");
    expect(filters.genres).toEqual(expect.arrayContaining(["Romance", "Drama", "Music"]));
    expect(filters.resultCount).toBe(1);
  });

  it("extracts soft tone and keyword signals without turning them into genres", () => {
    const filters = extractLocalStructuralFilters(REGRESSION_PROMPT);

    expect(filters.tones).toEqual(expect.arrayContaining(["bittersweet", "emotional"]));
    expect(filters.keywords).toEqual(
      expect.arrayContaining(["cinematography", "character-driven", "musical"]),
    );
    expect(filters.genres).not.toContain("bittersweet");
  });

  it("parses explicit counts but never bare articles", () => {
    expect(extractLocalHardConstraints("suggest only one movie").resultCount).toBe(1);
    expect(extractLocalHardConstraints("give me three french films").resultCount).toBe(3);
    expect(extractLocalHardConstraints("a movie for tonight").resultCount).toBeUndefined();
    expect(extractLocalHardConstraints("one of the best movies ever").resultCount).toBeUndefined();
  });

  it("keeps series vs movie as a deterministic constraint", () => {
    expect(extractLocalHardConstraints("a gripping tv series").contentType).toBe("series");
    expect(extractLocalHardConstraints("some movie with jazz").contentType).toBe("movie");
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
});

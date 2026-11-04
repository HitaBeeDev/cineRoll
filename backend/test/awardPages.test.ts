import { describe, expect, it } from "vitest";

import type { AwardRow } from "../src/routes/awardsRoute/awardsRepository";
import { buildAwardIndex } from "../src/routes/awardsRoute/buildAwardIndex";
import { canonicalCategory } from "../src/routes/awardsRoute/canonicalCategory";

const row = (over: Partial<AwardRow>): AwardRow => ({
  filmId: over.slug ?? "f",
  slug: "film",
  title: "Film",
  releaseYear: 2000,
  posterUrl: null,
  genres: ["Drama"],
  category: "Golden Bear",
  awardYear: 2000,
  won: false,
  nominee: null,
  ...over,
});

describe("canonicalCategory", () => {
  it("merges a renamed prize under one page", () => {
    expect(canonicalCategory("berlinale", "Golden Bear for Best Film")).toEqual({
      slug: "golden-bear",
      name: "Golden Bear",
    });
    expect(canonicalCategory("oscars", "Outstanding Production").slug).toBe("best-picture");
    expect(canonicalCategory("oscars", "Foreign Language Film").slug).toBe(
      "international-feature-film",
    );
  });

  it("keeps the short-film Palme apart from the Palme d'Or", () => {
    expect(canonicalCategory("cannes", "Palme d'or").slug).toBe("palme-d-or");
    expect(canonicalCategory("cannes", "Palme d'Or - Short Film").slug).toBe(
      "short-film-palme-d-or",
    );
  });

  it("leaves an unaliased name as it is", () => {
    expect(canonicalCategory("oscars", "Film Editing")).toEqual({
      slug: "film-editing",
      name: "Film Editing",
    });
  });
});

describe("buildAwardIndex", () => {
  const rows = [
    row({ slug: "b", title: "Beta", category: "Golden Bear for Best Film", awardYear: 1976 }),
    row({ slug: "a", title: "Alpha", category: "Golden Bear", awardYear: 1976, won: true }),
    row({ slug: "c", title: "Gamma", category: "Golden Bear", awardYear: 1977 }),
  ];
  const index = buildAwardIndex("berlinale", rows);

  it("groups renamed categories together, by year", () => {
    const bear = index.categories.get("golden-bear");
    expect(bear?.filmSlugs.size).toBe(3);
    expect(bear?.byYear.get(1976)?.map(entry => entry.film.slug)).toEqual(["a", "b"]);
  });

  it("lists winners before nominees", () => {
    expect(index.years.get(1976)?.byCategory.get("golden-bear")?.[0]?.won).toBe(true);
  });

  it("counts distinct films per year", () => {
    expect(index.years.get(1976)?.filmSlugs.size).toBe(2);
    expect(index.years.get(1977)?.filmSlugs.size).toBe(1);
  });
});

describe("buildAwardIndex genres", () => {
  it("tallies each film's wins and nominations once per genre", () => {
    const index = buildAwardIndex("oscars", [
      row({ slug: "x", genres: ["Horror", "Thriller"], category: "Sound", won: true }),
      row({ slug: "x", genres: ["Horror", "Thriller"], category: "Film Editing" }),
    ]);
    expect(index.genres.get("horror")?.films.get("x")).toMatchObject({ wins: 1, nominations: 2 });
    expect(index.genres.get("thriller")?.films.size).toBe(1);
  });
});

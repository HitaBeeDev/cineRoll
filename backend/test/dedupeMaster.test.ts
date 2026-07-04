import { describe, expect, it } from "vitest";

import {
  consolidateByTmdbId,
  type AwardRecord,
  type Film,
} from "../data/scripts/dedupeMaster.core";

function film(overrides: Partial<Film> = {}): Film {
  return {
    title: "Untitled",
    slug: "untitled",
    tmdbId: 1,
    releaseYear: 2000,
    contentType: "movie",
    oscarCategories: [],
    ggCategories: [],
    cannesCategories: [],
    berlinCategories: [],
    oscarNominations: 0,
    oscarWins: 0,
    ggNominations: 0,
    ggWins: 0,
    cannesNominations: 0,
    cannesWins: 0,
    berlinNominations: 0,
    berlinWins: 0,
    _sources: [],
    ...overrides,
  };
}

function rec(overrides: Partial<AwardRecord> = {}): AwardRecord {
  return {
    awardBody: "oscar",
    awardYear: 1994,
    category: "Best Picture",
    nominee: "Untitled",
    won: true,
    ...overrides,
  };
}

describe("consolidateByTmdbId", () => {
  it("collapses the same film under different award-body titles into one record", () => {
    // The same movie (tmdbId 100), listed under an Oscar title and a Cannes title.
    const oscarRow = film({
      title: "The Wages of Fear",
      slug: "the-wages-of-fear",
      tmdbId: 100,
      oscarCategories: [rec({ awardBody: "oscar", category: "Best Picture", nominee: "The Wages of Fear" })],
      oscarNominations: 1,
      oscarWins: 1,
      _sources: ["oscar"],
    });
    const cannesRow = film({
      title: "Le Salaire de la peur",
      slug: "le-salaire-de-la-peur",
      tmdbId: 100,
      cannesCategories: [rec({ awardBody: "cannes", category: "Palme d'Or", nominee: "Le Salaire de la peur" })],
      cannesNominations: 1,
      cannesWins: 1,
      _sources: ["cannes"],
    });

    const result = consolidateByTmdbId([oscarRow, cannesRow]);

    // One row out, one dropped — no duplicate.
    expect(result.films).toHaveLength(1);
    expect(result.droppedCount).toBe(1);
    expect(result.duplicateGroups).toHaveLength(1);
    expect(result.distinctKeys).toBe(1);

    // The surviving row carries BOTH award bodies, with recomputed counts.
    const kept = result.films[0]!;
    expect(kept.tmdbId).toBe(100);
    expect(kept.oscarCategories).toHaveLength(1);
    expect(kept.cannesCategories).toHaveLength(1);
    expect(kept.oscarNominations).toBe(1);
    expect(kept.oscarWins).toBe(1);
    expect(kept.cannesNominations).toBe(1);
    expect(kept.cannesWins).toBe(1);
    // Provenance from both rows is preserved.
    expect(new Set(kept._sources)).toEqual(new Set(["oscar", "cannes"]));
  });

  it("keeps the richest row and de-duplicates overlapping award records on union", () => {
    const poor = film({
      slug: "poor",
      tmdbId: 200,
      oscarCategories: [rec({ awardYear: 1995, category: "Best Director", nominee: "A" })],
    });
    const rich = film({
      slug: "rich",
      tmdbId: 200,
      oscarCategories: [
        rec({ awardYear: 1995, category: "Best Director", nominee: "A" }), // dup of poor's record
        rec({ awardYear: 1995, category: "Best Picture", nominee: "A", won: false }),
      ],
      cannesCategories: [rec({ awardBody: "cannes", awardYear: 1995, category: "Palme d'Or", nominee: "A" })],
    });

    const result = consolidateByTmdbId([poor, rich]);

    expect(result.films).toHaveLength(1);
    const kept = result.films[0]!;
    // Richer row (more award records) is the survivor.
    expect(kept.slug).toBe("rich");
    // Union dedupes the shared Best Director record: 2 distinct oscar records, not 3.
    expect(kept.oscarCategories).toHaveLength(2);
    expect(kept.oscarNominations).toBe(2);
    expect(kept.oscarWins).toBe(1); // only Best Director won
    expect(kept.cannesCategories).toHaveLength(1);
  });

  it("keeps films with different tmdbIds apart even when the title is identical", () => {
    const a = film({ title: "Heat", slug: "heat-1972", tmdbId: 300, releaseYear: 1972 });
    const b = film({ title: "Heat", slug: "heat-1995", tmdbId: 301, releaseYear: 1995 });

    const result = consolidateByTmdbId([a, b]);

    expect(result.films).toHaveLength(2);
    expect(result.droppedCount).toBe(0);
    expect(result.duplicateGroups).toHaveLength(0);
  });

  it("does not merge a movie and a tv series that share a tmdbId number", () => {
    const movie = film({ title: "Fargo", slug: "fargo-movie", tmdbId: 400, contentType: "movie" });
    const series = film({ title: "Fargo", slug: "fargo-series", tmdbId: 400, contentType: "tv" });

    const result = consolidateByTmdbId([movie, series]);

    expect(result.films).toHaveLength(2);
    expect(result.droppedCount).toBe(0);
  });

  it("never auto-merges null-tmdbId rows, but reports slug collisions", () => {
    const a = film({ title: "Mystery", slug: "mystery", tmdbId: null, releaseYear: 1980 });
    const b = film({ title: "Mystery", slug: "mystery", tmdbId: null, releaseYear: 1999 });

    const result = consolidateByTmdbId([a, b]);

    expect(result.films).toHaveLength(2);
    expect(result.droppedCount).toBe(0);
    expect(result.nullTmdbRows).toBe(2);
    expect(result.nullSlugCollisions).toHaveLength(1);
    expect(result.nullSlugCollisions[0]!.slug).toBe("mystery");
    expect(result.nullSlugCollisions[0]!.rows).toHaveLength(2);
  });
});

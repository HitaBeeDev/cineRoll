import { describe, expect, it } from "vitest";

import {
  awardBodyFromId,
  buildAwardRecords,
  mergeAwardData,
  type AwardRecord,
  type MasterFilm,
} from "../data/scripts/mergeAwards.core";

function masterFilm(overrides: Partial<MasterFilm> = {}): MasterFilm {
  return {
    title: "Film",
    releaseYear: 2000,
    slug: "film",
    tmdbId: 1,
    // Oscar arrays already sit on the row from build-master.
    oscarCategories: [],
    oscarNominations: 0,
    oscarWins: 0,
    ggNominations: 0,
    ggWins: 0,
    ggCategories: [],
    cannesNominations: 0,
    cannesWins: 0,
    cannesCategories: [],
    berlinNominations: 0,
    berlinWins: 0,
    berlinCategories: [],
    _sources: [],
    ...overrides,
  };
}

function rec(overrides: Partial<AwardRecord> = {}): AwardRecord {
  return {
    awardBody: "goldenglobe",
    awardYear: 1990,
    category: "Best Picture",
    nominee: "Someone",
    won: true,
    ...overrides,
  };
}

describe("awardBodyFromId", () => {
  it("maps the Id prefix to the award body", () => {
    expect(awardBodyFromId("GG-1990-001")).toBe("goldenglobe");
    expect(awardBodyFromId("CN-1990-001")).toBe("cannes");
    expect(awardBodyFromId("CAN-1990-001")).toBe("cannes");
    expect(awardBodyFromId("BER-1990-001")).toBe("berlin");
    expect(awardBodyFromId("OSC-1990-001")).toBeNull();
  });
});

describe("buildAwardRecords", () => {
  it("reads a winner as won, else falls back to the nominee", () => {
    const rows = [
      { "Award Year": "1990", "Type Of Award": "Best Picture", "Award Winner": "Dances with Wolves", "Award Nominee": "" },
      { "Award Year": "1990", "Type Of Award": "Best Actor", "Award Winner": "nan", "Award Nominee": "Kevin Costner" },
    ];

    const recs = buildAwardRecords(rows, "goldenglobe");

    expect(recs[0]).toMatchObject({ awardBody: "goldenglobe", awardYear: 1990, category: "Best Picture", nominee: "Dances with Wolves", won: true });
    expect(recs[1]).toMatchObject({ awardYear: 1990, category: "Best Actor", nominee: "Kevin Costner", won: false });
  });
});

describe("mergeAwardData", () => {
  it("recomputes a body's nomination/win counts from its merged array", () => {
    const film = masterFilm();
    mergeAwardData(film, "goldenglobe", [
      rec({ category: "Best Picture", won: true }),
      rec({ category: "Best Director", won: true }),
      rec({ category: "Best Actor", won: false }),
    ]);

    expect(film.ggCategories).toHaveLength(3);
    expect(film.ggNominations).toBe(3);
    expect(film.ggWins).toBe(2);
  });

  it("de-duplicates records that already exist on the row", () => {
    const existing = rec({ category: "Best Picture", nominee: "A", won: true });
    const film = masterFilm({ ggCategories: [existing], ggNominations: 1, ggWins: 1 });

    mergeAwardData(film, "goldenglobe", [
      rec({ category: "Best Picture", nominee: "A", won: true }), // duplicate of `existing`
      rec({ category: "Best Comedy", nominee: "B", won: false }), // new
    ]);

    expect(film.ggCategories).toHaveLength(2); // dup collapsed, new kept
    expect(film.ggNominations).toBe(2);
    expect(film.ggWins).toBe(1);
  });

  it("lands Oscar + GG + Cannes + Berlin arrays on ONE row with counts summed", () => {
    // Oscar already present (from build-master).
    const film = masterFilm({
      oscarCategories: [rec({ awardBody: "oscar", category: "Best Picture", won: true })],
      oscarNominations: 1,
      oscarWins: 1,
    });

    mergeAwardData(film, "goldenglobe", [rec({ awardBody: "goldenglobe", category: "Best Drama", won: true })]);
    mergeAwardData(film, "cannes", [
      rec({ awardBody: "cannes", category: "Palme d'Or", won: true }),
      rec({ awardBody: "cannes", category: "Grand Prix", won: false }),
    ]);
    mergeAwardData(film, "berlin", [rec({ awardBody: "berlin", category: "Golden Bear", won: false })]);

    // All four bodies coexist on the single row.
    expect((film.oscarCategories as AwardRecord[])).toHaveLength(1);
    expect(film.ggCategories).toHaveLength(1);
    expect(film.cannesCategories).toHaveLength(2);
    expect(film.berlinCategories).toHaveLength(1);

    // Oscar (merged earlier by build-master) is untouched.
    expect(film.oscarNominations as number).toBe(1);
    expect(film.oscarWins as number).toBe(1);

    // Each body's counts recomputed from its array.
    expect([film.ggNominations, film.ggWins]).toEqual([1, 1]);
    expect([film.cannesNominations, film.cannesWins]).toEqual([2, 1]);
    expect([film.berlinNominations, film.berlinWins]).toEqual([1, 0]);

    // Totals summed across every ceremony on this one row.
    const totalNoms =
      (film.oscarNominations as number) + film.ggNominations + film.cannesNominations + film.berlinNominations;
    const totalWins =
      (film.oscarWins as number) + film.ggWins + film.cannesWins + film.berlinWins;
    expect(totalNoms).toBe(5);
    expect(totalWins).toBe(3);
  });
});

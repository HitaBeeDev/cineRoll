import { describe, expect, it } from "vitest";

import { DIFFICULTY_BANDS } from "../src/routes/blindRollRoute/constants";
import { sampleFromBand } from "../src/routes/blindRollRoute/distractors";
import { RandomFilmRow } from "../src/routes/randomRoute/types";

// Minimal rows carrying just an id/index — sampleFromBand only cares about order.
function rankedList(n: number): RandomFilmRow[] {
  return Array.from({ length: n }, (_, i) => ({ id: String(i) }) as RandomFilmRow);
}

const indexOf = (film: RandomFilmRow) => Number(film.id);

describe("sampleFromBand", () => {
  const ranked = rankedList(20); // index 0 = most similar to the target

  it("hard draws the most-similar decoys (top of the ranked list)", () => {
    for (let trial = 0; trial < 50; trial++) {
      const picks = sampleFromBand(ranked, DIFFICULTY_BANDS.hard, 3);
      // hard band [0, 0.25] over 20 → indices 0..4
      for (const film of picks) expect(indexOf(film)).toBeLessThanOrEqual(4);
    }
  });

  it("easy draws the least-similar decoys (bottom of the ranked list)", () => {
    for (let trial = 0; trial < 50; trial++) {
      const picks = sampleFromBand(ranked, DIFFICULTY_BANDS.easy, 3);
      // easy band [0.55, 1.0] over 20 → indices 11..19
      for (const film of picks) expect(indexOf(film)).toBeGreaterThanOrEqual(11);
    }
  });

  it("medium sits strictly between easy and hard", () => {
    for (let trial = 0; trial < 50; trial++) {
      const picks = sampleFromBand(ranked, DIFFICULTY_BANDS.medium, 3);
      // medium band [0.2, 0.6] over 20 → indices 4..11
      for (const film of picks) {
        expect(indexOf(film)).toBeGreaterThanOrEqual(4);
        expect(indexOf(film)).toBeLessThan(12);
      }
    }
  });

  it("returns distinct decoys and always fills the requested count", () => {
    const picks = sampleFromBand(ranked, DIFFICULTY_BANDS.hard, 3);
    expect(picks).toHaveLength(3);
    expect(new Set(picks.map(indexOf)).size).toBe(3);
  });

  it("widens to the whole list rather than under-filling a thin band", () => {
    const tiny = rankedList(4);
    // hard band [0,0.25] over 4 → only index 0; must widen to still return 3.
    const picks = sampleFromBand(tiny, DIFFICULTY_BANDS.hard, 3);
    expect(picks).toHaveLength(3);
    expect(new Set(picks.map(indexOf)).size).toBe(3);
  });
});

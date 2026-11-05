import { describe, expect, it } from "vitest";

import { markCastPages } from "../src/routes/filmsRoute/markCastPages";

describe("markCastPages", () => {
  const index = new Map([["pedro-almodovar", "Pedro Almodóvar"]]);

  it("flags only cast members with a person page, accents ignored", () => {
    expect(
      markCastPages(
        [
          { name: "Pedro ALMODÓVAR", character: "Himself", photoUrl: null },
          { name: "Song Kang-ho", character: "Kim Ki-taek", photoUrl: null },
        ],
        index,
      ),
    ).toEqual([
      { name: "Pedro ALMODÓVAR", character: "Himself", photoUrl: null, hasPage: true },
      { name: "Song Kang-ho", character: "Kim Ki-taek", photoUrl: null, hasPage: false },
    ]);
  });

  it("leaves anything that isn't a cast list alone", () => {
    expect(markCastPages(null, index)).toBeNull();
  });
});

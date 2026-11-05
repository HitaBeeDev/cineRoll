import { describe, expect, it } from "vitest";

import { matchTmdbPerson, nameKey } from "../src/lib/people/tmdbCreditMatch";

describe("nameKey", () => {
  it.each([
    ["Bong Joon Ho", "Bong Joon-ho"],
    ["Bong Joon Ho", "Joon-ho Bong"],
    ["Pedro ALMODÓVAR", "Pedro Almodóvar"],
    ["SHIMIZU Hiroshi", "Hiroshi Shimizu"],
    ["Sammy Davis, Jr.", "Sammy Davis Jr."],
  ])("%s ≡ %s", (left, right) => {
    expect(nameKey(left)).toBe(nameKey(right));
  });

  it("keeps different people apart", () => {
    expect(nameKey("Joel Coen")).not.toBe(nameKey("Ethan Coen"));
  });
});

describe("matchTmdbPerson", () => {
  const jaws = [
    { id: 491, name: "John Williams" },
    { id: 488, name: "Steven Spielberg" },
    { id: 488, name: "Steven Spielberg" }, // listed twice (director and producer) — still one person
  ];

  it("finds the person in this film's credits", () => {
    expect(matchTmdbPerson("John Williams", jaws)).toBe(491);
    expect(matchTmdbPerson("Steven SPIELBERG", jaws)).toBe(488);
  });

  it("does not match a name the film does not credit", () => {
    expect(matchTmdbPerson("John Barry", jaws)).toBeNull();
  });

  it("refuses to choose between two credited people with the same name", () => {
    const twins = [
      { id: 1, name: "John Smith" },
      { id: 2, name: "John Smith" },
    ];
    expect(matchTmdbPerson("John Smith", twins)).toBeNull();
  });
});

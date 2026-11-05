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
    expect(matchTmdbPerson("John Williams", jaws)).toEqual({ id: 491, exact: true });
    expect(matchTmdbPerson("Steven SPIELBERG", jaws)).toEqual({ id: 488, exact: true });
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

  it.each([
    ["Allen Davey", "Allen M. Davey"],
    ["Werner Heymann", "Werner R. Heymann"],
    ["Charles Chaplin", "Charlie Chaplin"],
    ["Samuel Spewack", "Sam Spewack"],
    ["E. H. Hansen", "Edmund H. Hansen"],
    ["Albert Basserman", "Albert Bassermann"],
    ["William Hedgecock", "William Hedgcock"],
  ])("near-matches %s to %s when nothing matches exactly", (award, tmdb) => {
    expect(matchTmdbPerson(award, [{ id: 9, name: tmdb }, { id: 10, name: "Somebody Else" }])).toEqual({ id: 9, exact: false });
  });

  it("does not near-match a different first name or a short surname typo", () => {
    expect(matchTmdbPerson("Bella Spewack", [{ id: 1, name: "Sam Spewack" }])).toBeNull();
    expect(matchTmdbPerson("John Lee", [{ id: 1, name: "John Leo" }])).toBeNull();
  });

  it("prefers an exact match over a near one", () => {
    const credits = [{ id: 1, name: "Sam Spewack" }, { id: 2, name: "Samuel Spewack" }];
    expect(matchTmdbPerson("Samuel Spewack", credits)).toEqual({ id: 2, exact: true });
  });

  it("refuses a near match when two people fit", () => {
    const credits = [{ id: 1, name: "Charlie Chaplin" }, { id: 2, name: "Chuck Chaplin" }];
    expect(matchTmdbPerson("Charles Chaplin", credits)).toBeNull();
  });
});

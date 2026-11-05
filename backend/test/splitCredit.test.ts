import { describe, expect, it } from "vitest";

import { buildPersonCreditIndex } from "../src/routes/personsRoute/buildPersonCreditIndex";
import type { AwardCreditRow } from "../src/routes/personsRoute/personCreditTypes";
import { splitCredit } from "../src/routes/personsRoute/splitCredit";
import { personCreditRowsFromIndex } from "../src/routes/sitemapRoute/personCreditRowsFromIndex";

describe("splitCredit", () => {
  it.each([
    ["Pedro Almodóvar", "Directing", ["Pedro Almodóvar"]],
    ["Written by Pedro Almodóvar", "Writing (Original Screenplay)", ["Pedro Almodóvar"]],
    ["Joel Coen and Ethan Coen", "Writing", ["Joel Coen", "Ethan Coen"]],
    ["Stanley Kubrick, Producer", "Best Picture", ["Stanley Kubrick"]],
    ["Bill Mechanic and David Permut, Producers", "Best Picture", ["Bill Mechanic", "David Permut"]],
    ["Screenplay by Waldemar Young, John L. Balderston; Adaptation by Achmed Abdullah", "Writing", ["Waldemar Young", "John L. Balderston", "Achmed Abdullah"]],
    ["Production Design: Catherine Martin and Karen Murphy; Set Decoration: Bev Dunn", "Production Design", ["Catherine Martin", "Karen Murphy", "Bev Dunn"]],
    ["Mona Lisa in \"Captain Carey, U.S.A.\" Music and Lyrics by Ray Evans and Jay Livingston", "Music (Song)", ["Ray Evans", "Jay Livingston"]],
    ["Sammy Davis, Jr.", "Actor", ["Sammy Davis, Jr."]],
    ["Busby Berkeley", "Dance Direction", ["Busby Berkeley"]],
    ["Cher", "Actress in a Leading Role", ["Cher"]],
    ["Jeff Moss", "Music (Original Song Score)", ["Jeff Moss"]],
    ["(Howard Estabrook)", "Writing", ["Howard Estabrook"]],
    ["Charles LeMaire, Renie", "Costume Design (Black-and-White)", ["Charles LeMaire", "Renie"]],
  ])("%s → people", (nominee, category, expected) => {
    expect(splitCredit(nominee, "Some Film", category)).toEqual(expected);
  });

  it.each([
    ["France", "Foreign Language Film"],
    ["Metro-Goldwyn-Mayer", "Outstanding Production"],
    ["Special Award", "Special Award"],
    ["Remember Me", "Best Original Song - Motion Picture"],
    ["Rockford Files, The", "Best Television Series - Drama"],
    ["Stranger by the Lake", "Un Certain Regard"],
    ["\"Piccolino\" from \"Top Hat\"", "Dance Direction"],
  ])("%s → nobody", (nominee, category) => {
    expect(splitCredit(nominee, "Stranger by the Lake", category)).toEqual([]);
  });
});

const row = (over: Partial<AwardCreditRow>): AwardCreditRow => ({
  body: "oscar", filmId: "f1", filmSlug: "talk-to-her-2002", filmTitle: "Talk to Her", releaseYear: 2002,
  posterUrl: null, imdbRating: null, filmUpdatedAt: new Date("2026-01-01T00:00:00Z"),
  nominee: "Pedro Almodóvar", category: "Directing", awardYear: 2003, won: false, ...over,
});

describe("buildPersonCreditIndex", () => {
  const index = buildPersonCreditIndex(
    [
      row({}),
      row({ nominee: "Written by Pedro Almodóvar", category: "Writing (Original Screenplay)", won: true }),
      row({ filmId: "f2", filmSlug: "fargo-1996", filmTitle: "Fargo", nominee: "Joel Coen and Ethan Coen", category: "Writing" }),
    ],
    ["Pedro ALMODÓVAR"],
  );

  it("credits a credit-line win to the person — Almodóvar's 2003 screenplay Oscar", () => {
    const credits = index.credits.get("pedro-almodovar") ?? [];
    expect(credits).toHaveLength(2);
    expect(credits.filter(credit => credit.won)).toHaveLength(1);
    expect(index.names.get("pedro-almodovar")).toBe("Pedro Almodóvar");
  });

  it("splits pairs and never makes a page for the raw string", () => {
    expect(index.credits.get("joel-coen")).toHaveLength(1);
    expect(index.credits.get("ethan-coen")).toHaveLength(1);
    expect(index.names.has("joel-coen-and-ethan-coen")).toBe(false);
    expect(index.names.has("written-by-pedro-almodovar")).toBe(false);
  });

  it("feeds the sitemap only people with enough credits", () => {
    expect(personCreditRowsFromIndex(index, 2).map(r => r.name)).toEqual(["Pedro Almodóvar"]);
  });
});

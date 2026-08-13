import { describe, expect, it } from "vitest";

import { groupCreditRows } from "../src/lib/people/groupCreditRows";
import { splitCreditNames } from "../src/lib/people/splitCreditNames";
import type { CreditRow } from "../src/lib/people/types";

const row = (name: string, overrides: Partial<CreditRow> = {}): CreditRow => ({
  name,
  source: "nominee",
  filmId: "f1",
  filmTitle: "A Film",
  ...overrides,
});

describe("splitCreditNames", () => {
  it("drops the role a credit line ends with", () => {
    expect(splitCreditNames("Stanley Kubrick, Producer")).toEqual(["Stanley Kubrick"]);
    expect(splitCreditNames("Walt Disney, Producer")).toEqual(["Walt Disney"]);
  });

  it("splits co-credits into one entry per person", () => {
    expect(splitCreditNames("Stanley Kubrick, Peter George, Terry Southern")).toEqual([
      "Stanley Kubrick",
      "Peter George",
      "Terry Southern",
    ]);
    expect(splitCreditNames("Steven Spielberg and Kathleen Kennedy")).toEqual([
      "Steven Spielberg",
      "Kathleen Kennedy",
    ]);
  });

  it("keeps a generational suffix attached to its name", () => {
    expect(splitCreditNames("Seton I. Miller, Fred Niblo, Jr.")).toEqual([
      "Seton I. Miller",
      "Fred Niblo, Jr.",
    ]);
  });

  it("reads the people out of a craft credit and drops the craft label", () => {
    expect(
      splitCreditNames(
        "Art Direction: Cedric Gibbons, Urie McCleary; Interior Decoration: Edwin B. Willis",
      ),
    ).toEqual(["Cedric Gibbons", "Urie McCleary", "Edwin B. Willis"]);
  });

  it("drops the credit verb rather than making a second person of it", () => {
    expect(splitCreditNames("Screenplay by Quentin Tarantino")).toEqual(["Quentin Tarantino"]);
    expect(splitCreditNames("Written for the screen by Joel Coen")).toEqual(["Joel Coen"]);
  });

  it("rejects studios, departments and song credits", () => {
    expect(splitCreditNames("Warner Bros. Studio Sound Department, Nathan Levinson, Sound Director"))
      .toEqual(["Nathan Levinson"]);
    // A company is dropped whole — splitting it would leave half a name behind.
    expect(splitCreditNames("Charles Guggenheim & Associates, Inc.")).toEqual([]);
    expect(splitCreditNames("Australian News & Information Bureau")).toEqual([]);
    expect(splitCreditNames('"Piccolino" from "Top Hat"')).toEqual([]);
    expect(splitCreditNames("NaN")).toEqual([]);
  });

  it("keeps a mononym only when it is the whole credit", () => {
    expect(splitCreditNames("Cher")).toEqual(["Cher"]);
    // A film title parked in the nominee field, article at the end.
    expect(splitCreditNames("Robe, The")).toEqual([]);
  });
});

describe("groupCreditRows", () => {
  it("merges the credit lines that name the same person", () => {
    const rows = [
      row("Stanley Kubrick", { source: "director", filmId: "f1" }),
      row("Stanley Kubrick, Producer", { filmId: "f1" }),
      row("Stanley Kubrick, Arthur C. Clarke", { filmId: "f2" }),
    ];

    const people = groupCreditRows(rows, "kubrick", 5);

    expect(people).toHaveLength(1);
    expect(people[0]?.name).toBe("Stanley Kubrick");
    expect(people[0]?.sources).toEqual(["director", "nominee"]);
    // Two films, though three credit lines name him.
    expect(people[0]?.count).toBe(2);
  });

  it("leaves out co-credits the searcher did not ask about", () => {
    const people = groupCreditRows([row("Stanley Kubrick, Arthur C. Clarke")], "kubrick", 5);

    expect(people.map(person => person.name)).toEqual(["Stanley Kubrick"]);
  });

  it("merges a shouted spelling into the readable one", () => {
    const rows = [
      row("Steven SPIELBERG", { filmId: "f1" }),
      row("Steven Spielberg", { filmId: "f2" }),
      row("Steven Spielberg", { filmId: "f3" }),
    ];

    const people = groupCreditRows(rows, "spielberg", 5);

    expect(people).toHaveLength(1);
    expect(people[0]?.name).toBe("Steven Spielberg");
    expect(people[0]?.count).toBe(3);
  });

  it("does not offer the film's own title as a person", () => {
    const rows = [
      row("Foxcatcher", { filmTitle: "Foxcatcher" }),
      row("The Robe", { name: "Robe, The", filmTitle: "The Robe" }),
    ];

    expect(groupCreditRows(rows, "the", 5)).toEqual([]);
  });

  it("puts names that start with the query first", () => {
    const rows = [
      row("Richard Fleischer", { filmId: "f1" }),
      row("Richard Fleischer", { filmId: "f2" }),
      row("Cher", { filmId: "f3" }),
    ];

    const people = groupCreditRows(rows, "cher", 5);

    expect(people.map(person => person.name)).toEqual(["Cher", "Richard Fleischer"]);
  });
});

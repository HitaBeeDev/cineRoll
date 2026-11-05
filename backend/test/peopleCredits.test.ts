import { describe, expect, it } from "vitest";

import { groupCreditRows } from "../src/lib/people/groupCreditRows";
import type { CreditRow } from "../src/lib/people/types";

const row = (name: string, overrides: Partial<CreditRow> = {}): CreditRow => ({
  name,
  source: "nominee",
  filmId: "f1",
  filmTitle: "A Film",
  category: "Writing",
  ...overrides,
});

// Splitting itself is tested in splitCredit.test.ts — search uses that parser.
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
      // A one-word name counts only in a person category, as on person pages.
      row("Cher", { filmId: "f3", category: "Actress in a Leading Role" }),
    ];

    const people = groupCreditRows(rows, "cher", 5);

    expect(people.map(person => person.name)).toEqual(["Cher", "Richard Fleischer"]);
  });
});

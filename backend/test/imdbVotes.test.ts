import { describe, expect, it } from "vitest";

import { parseImdbVotes } from "../data/scripts/imdbVotes.core";

describe("parseImdbVotes", () => {
  it("reads OMDB's grouped display format", () => {
    expect(parseImdbVotes("1,234,567")).toBe(1234567);
    expect(parseImdbVotes("2,145")).toBe(2145);
    expect(parseImdbVotes("847")).toBe(847);
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseImdbVotes(" 12,000 ")).toBe(12000);
  });

  it("treats OMDB's absent values as absent", () => {
    expect(parseImdbVotes("N/A")).toBeNull();
    expect(parseImdbVotes("")).toBeNull();
    expect(parseImdbVotes(undefined)).toBeNull();
    expect(parseImdbVotes(null)).toBeNull();
  });

  // A partial parse would be indistinguishable from a real count downstream,
  // and a wrong confidence is worse than a missing one: only the missing one is
  // visibly missing.
  it("refuses anything it does not fully understand", () => {
    expect(parseImdbVotes("1.2M")).toBeNull();
    expect(parseImdbVotes("approx 500")).toBeNull();
    expect(parseImdbVotes("12,34")).toBeNull();
    expect(parseImdbVotes("1,234 votes")).toBeNull();
    expect(parseImdbVotes(1234)).toBeNull();
  });

  it("rejects zero — no votes is no confidence, not a count of none", () => {
    expect(parseImdbVotes("0")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { listQuerySchema } from "../src/lib/filmFilters/listQuerySchema";
import { textPredicates } from "../src/lib/filmFilters/textPredicates";

const predicateSql = (params: Record<string, string>): { sql: string; values: unknown[] } => {
  const [predicate] = textPredicates(listQuerySchema.parse(params));

  return { sql: predicate?.sql ?? "", values: predicate?.values ?? [] };
};

describe("textPredicates", () => {
  it("matches a free-text search against people as well as titles", () => {
    const { sql, values } = predicateSql({ search: "kubrick" });

    expect(sql).toContain(`"Film"."title" ILIKE`);
    expect(sql).toContain(`"Film"."director"`);
    expect(sql).toContain(`"castMember"->>'name'`);
    expect(sql).toContain(`award->>'nominee'`);
    // Whole-word on people, so "love" doesn't drag in every Danny Glover film.
    expect(values).toContain("\\ykubrick\\y");
    expect(values).toContain("%kubrick%");
  });

  it("escapes regex metacharacters in the search term", () => {
    const { values } = predicateSql({ search: "M*A*S*H" });

    expect(values).toContain("\\yM\\*A\\*S\\*H\\y");
  });

  it("keeps the person filter a substring match on the whole name", () => {
    const { sql, values } = predicateSql({ person: "Stanley Kubrick" });

    expect(sql).not.toContain("~*");
    // Director, cast, and the nominee on each of the four award bodies.
    expect(values).toEqual(Array(6).fill("%Stanley Kubrick%"));
  });
});

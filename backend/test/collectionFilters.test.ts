import { describe, expect, it } from "vitest";

import { listQuerySchema } from "../src/lib/filmFilters/listQuerySchema";
import { rankingPredicates } from "../src/lib/filmFilters/rankingPredicates";

const predicates = (params: Record<string, string>) =>
  rankingPredicates(listQuerySchema.parse(params)).map(p => ({ sql: p.sql, values: p.values }));

describe("minWinningBodies", () => {
  it("counts the bodies a film won at, across all four", () => {
    const [p] = predicates({ minWinningBodies: "2" });
    for (const column of ["oscarWins", "ggWins", "cannesWins", "berlinWins"]) {
      expect(p?.sql).toContain(`"Film"."${column}"`);
    }
    expect(p?.values).toEqual([2]);
  });

  it("rejects values outside 1–4", () => {
    expect(() => listQuerySchema.parse({ minWinningBodies: "5" })).toThrow();
  });
});

describe("wonAtBodies", () => {
  it("requires a win at every listed body", () => {
    const [p] = predicates({ wonAtBodies: "cannes,oscar" });
    expect(p?.sql).toContain(`"Film"."cannesWins" > 0`);
    expect(p?.sql).toContain(" AND ");
    expect(p?.sql).toContain(`"Film"."oscarWins" > 0`);
  });

  it("ignores unknown bodies", () => {
    expect(predicates({ wonAtBodies: "venice" })).toEqual([]);
  });
});

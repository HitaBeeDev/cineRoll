import { describe, expect, it } from "vitest";

import { awardElementConditions } from "../src/lib/filmFilters/awardSql";
import { listQuerySchema } from "../src/lib/filmFilters/listQuerySchema";

const sqlOf = (params: Record<string, string>) =>
  awardElementConditions(listQuerySchema.parse(params)).map(condition => ({
    sql: condition.sql,
    values: condition.values,
  }));

describe("categoryExact", () => {
  it("matches the whole category name, ignoring case", () => {
    const [condition] = sqlOf({ categoryExact: "Palme d'or" });
    expect(condition?.sql).toContain("LOWER(award->>'category') = LOWER(");
    expect(condition?.values).toEqual(["Palme d'or"]);
  });

  it("leaves the substring `category` filter unchanged", () => {
    const [condition] = sqlOf({ category: "Cinematography" });
    expect(condition?.sql).toContain("ILIKE");
    expect(condition?.values).toEqual(["%Cinematography%"]);
  });
});

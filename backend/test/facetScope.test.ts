import { describe, expect, it } from "vitest";

import { awardElementConditions } from "../src/lib/filmFilters/awardSql";
import { listQuerySchema, type ListQuery } from "../src/lib/filmFilters/listQuerySchema";
import { FACET_KEYS, scopeQueryToFacet } from "../src/routes/filmsRoute/facetCounts/facetScope";

/** A query with every filter a facet could own set to something non-default. */
function fullQuery(overrides: Record<string, string> = {}): ListQuery {
  return listQuerySchema.parse({
    awardBody: "cannes",
    category: "Palme d'Or",
    awardYear: "1994",
    contentType: "movie",
    genre: "Drama",
    genreAll: "Drama",
    yearMin: "1990",
    yearMax: "1999",
    language: "fr",
    country: "France",
    imdbRatingMin: "7",
    winnerOnly: "true",
    ...overrides,
  });
}

describe("scopeQueryToFacet", () => {
  it("drops the filter the facet controls", () => {
    expect(scopeQueryToFacet(fullQuery(), "genres").genre).toBeUndefined();
    expect(scopeQueryToFacet(fullQuery(), "categories").category).toBeUndefined();
    expect(scopeQueryToFacet(fullQuery(), "languages").language).toBeUndefined();
    expect(scopeQueryToFacet(fullQuery(), "countries").country).toBeUndefined();
    expect(scopeQueryToFacet(fullQuery(), "awardYears").awardYearMin).toBeUndefined();
    expect(scopeQueryToFacet(fullQuery(), "awardYears").awardYearMax).toBeUndefined();
    expect(scopeQueryToFacet(fullQuery(), "awardBodies").awardBody).toBeUndefined();
    expect(scopeQueryToFacet(fullQuery(), "contentTypes").contentType).toBeUndefined();
    expect(scopeQueryToFacet(fullQuery({ tvType: "Miniseries" }), "tvTypes").tvType).toBeUndefined();
  });

  // The kind-of-series list is counted under everything else, so picking
  // "Miniseries" must not be what decides which kinds are on offer.
  it("keeps the content type when counting TV types", () => {
    const scoped = scopeQueryToFacet(fullQuery({ contentType: "tv-series", tvType: "Miniseries" }), "tvTypes");

    expect(scoped.contentType).toEqual(["tv-series"]);
    expect(scoped.tvType).toBeUndefined();
  });

  // Both write the same column from one control, so leaving either behind would
  // still collapse the genre list to the genres already picked.
  it("drops both genre filters for the genre facet", () => {
    const scoped = scopeQueryToFacet(fullQuery(), "genres");

    expect(scoped.genre).toBeUndefined();
    expect(scoped.genreAll).toBeUndefined();
  });

  // A single ceremony year is the range [y, y]: other surfaces still send
  // `awardYear`, and the SQL has to see one shape whichever sent it.
  it("folds a single ceremony year into both bounds", () => {
    const folded = fullQuery({ awardYear: "1994" });

    expect(folded.awardYearMin).toBe(1994);
    expect(folded.awardYearMax).toBe(1994);
  });

  it("lets an explicit ceremony-year range through untouched", () => {
    const ranged = fullQuery({ awardYearMin: "1970", awardYearMax: "1979" });

    expect(ranged.awardYearMin).toBe(1970);
    expect(ranged.awardYearMax).toBe(1979);
  });

  it("drops both ceremony-year bounds for the award-year facet", () => {
    const scoped = scopeQueryToFacet(fullQuery(), "awardYears");

    expect(scoped.awardYearMin).toBeUndefined();
    expect(scoped.awardYearMax).toBeUndefined();
  });

  it("drops both year bounds for the release-year facet", () => {
    const scoped = scopeQueryToFacet(fullQuery(), "releaseYears");

    expect(scoped.yearMin).toBeUndefined();
    expect(scoped.yearMax).toBeUndefined();
  });

  it("keeps every other filter, so the counts stay constrained", () => {
    const scoped = scopeQueryToFacet(fullQuery(), "genres");

    expect(scoped.awardBody).toEqual(["cannes"]);
    expect(scoped.category).toEqual(["Palme d'Or"]);
    expect(scoped.awardYearMin).toBe(1994);
    expect(scoped.awardYearMax).toBe(1994);
    expect(scoped.language).toEqual(["fr"]);
    expect(scoped.imdbRatingMin).toBe(7);
    expect(scoped.winnerOnly).toBe(true);
  });

  // Scoping the ceremony away here would put every ceremony's categories back in
  // the list — the exact bug the counts exist to fix.
  it("keeps the award body when counting categories", () => {
    expect(scopeQueryToFacet(fullQuery(), "categories").awardBody).toEqual(["cannes"]);
  });

  it("never mutates the query it was given", () => {
    const query = fullQuery();
    for (const facet of FACET_KEYS) scopeQueryToFacet(query, facet);

    expect(query.genre).toEqual(["Drama"]);
    expect(query.category).toEqual(["Palme d'Or"]);
    expect(query.awardBody).toEqual(["cannes"]);
  });

  // The award facets rebuild their per-award SQL from the scoped query, so the
  // exclusion has to reach the award level too — not just the film-level WHERE.
  it("removes the award-level condition of the facet being counted", () => {
    const forCategories = awardElementConditions(scopeQueryToFacet(fullQuery(), "categories"));
    const forYears = awardElementConditions(scopeQueryToFacet(fullQuery(), "awardYears"));

    expect(sqlOf(forCategories)).not.toContain("category");
    expect(sqlOf(forCategories)).toContain("awardYear");
    expect(sqlOf(forYears)).not.toContain("awardYear");
    expect(sqlOf(forYears)).toContain("category");
  });

  it("keeps winner-only on every facet, since it constrains which award row counts", () => {
    for (const facet of FACET_KEYS) {
      const conditions = awardElementConditions(scopeQueryToFacet(fullQuery(), facet));
      expect(sqlOf(conditions)).toContain("won");
    }
  });
});

function sqlOf(conditions: { sql: string }[]): string {
  return conditions.map(condition => condition.sql).join(" ");
}

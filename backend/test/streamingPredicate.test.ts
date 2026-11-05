import { describe, expect, it } from "vitest";

import { listQuerySchema } from "../src/lib/filmFilters/listQuerySchema";
import { streamingPredicate, streamsInPredicate } from "../src/lib/filmFilters/streamingPredicate";

describe("streamingPredicate", () => {
  it("is absent without a provider — region alone filters nothing", () => {
    expect(streamingPredicate({ region: "DE" })).toBeUndefined();
  });

  it("puts country and provider in the same region object", () => {
    const sql = streamingPredicate({ provider: 8, region: "DE" })!;
    expect(sql.sql).toContain(`"watchProviders" @>`);
    expect(JSON.parse(sql.values[0] as string)).toEqual({
      regions: [{ providers: [{ id: 8 }], country: "DE" }],
    });
  });

  it("matches the service in any country when no region is given", () => {
    const sql = streamingPredicate({ provider: 8 })!;
    expect(JSON.parse(sql.values[0] as string)).toEqual({ regions: [{ providers: [{ id: 8 }] }] });
  });
});

describe("listQuerySchema provider/region", () => {
  it("upper-cases the region and coerces the provider id", () => {
    expect(listQuerySchema.parse({ provider: "8", region: "de" })).toMatchObject({ provider: 8, region: "DE" });
  });

  it("rejects a malformed region or provider", () => {
    expect(listQuerySchema.safeParse({ region: "DEU" }).success).toBe(false);
    expect(listQuerySchema.safeParse({ provider: "netflix" }).success).toBe(false);
  });
});

describe("streamsInPredicate", () => {
  it("tests the country alone", () => {
    expect(streamsInPredicate({})).toBeUndefined();
    const sql = streamsInPredicate({ streamsIn: "DE" })!;
    expect(JSON.parse(sql.values[0] as string)).toEqual({ regions: [{ country: "DE" }] });
  });
});

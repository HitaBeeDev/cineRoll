import { describe, expect, it } from "vitest";

import { toWatchProviders } from "../data/lib/watchProviders";

describe("toWatchProviders", () => {
  it("keeps well-formed regions with their as-of date", () => {
    expect(
      toWatchProviders([{ country: "DE", providers: ["MUBI", "Netflix"] }], "2026-03-01T00:00:00.000Z"),
    ).toEqual({ asOf: "2026-03-01T00:00:00.000Z", regions: [{ country: "DE", providers: ["MUBI", "Netflix"] }] });
  });

  it("drops bad countries, empty regions and duplicate names", () => {
    expect(
      toWatchProviders(
        [
          { country: "de", providers: ["MUBI"] },
          { country: "US", providers: [] },
          { country: "FR", providers: ["Canal+", " Canal+ ", ""] },
        ],
        null,
      ),
    ).toEqual({ asOf: null, regions: [{ country: "FR", providers: ["Canal+"] }] });
  });

  it("is null when nothing usable is left", () => {
    expect(toWatchProviders([], "x")).toBeNull();
    expect(toWatchProviders(undefined, "x")).toBeNull();
    expect(toWatchProviders([{ country: "US", providers: [] }], "x")).toBeNull();
  });
});

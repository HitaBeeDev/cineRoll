import { describe, expect, it } from "vitest";

import {
  resolveAwardFilm,
  type FilmApi,
  type MasterFilm,
  type SourceRow,
} from "../data/scripts/build-master";

function masterFilm(overrides: Partial<MasterFilm> = {}): MasterFilm {
  return {
    title: "Film",
    releaseYear: 2000,
    tmdbId: 100,
    _sources: [],
    oscarCategories: [], oscarNominations: 0, oscarWins: 0,
    ggCategories: [], ggNominations: 0, ggWins: 0,
    cannesCategories: [], cannesNominations: 0, cannesWins: 0,
    berlinCategories: [], berlinNominations: 0, berlinWins: 0,
    ...overrides,
  } as unknown as MasterFilm;
}

function row(overrides: Partial<SourceRow> = {}): SourceRow {
  return {
    id: "OSC-1980-001",
    awardYear: 1980,
    movieName: "Film",
    releaseYear: 2000,
    category: "Best Picture",
    awardWinner: "Film",
    awardNominee: "",
    filmType: "movie",
    ...overrides,
  };
}

/** `searchResult` = what tmdbSearch returns; `detailsOk` = whether tmdbMovieDetails
 *  resolves (defaults to failing/null). */
function spyApi(searchResult: { id: number; matchedYear: number } | null = null) {
  const calls = { tmdbSearch: 0, tmdbMovieDetails: 0, omdbFetch: 0, extractPosterColor: 0 };
  const api: FilmApi = {
    tmdbSearch: async () => { calls.tmdbSearch++; return searchResult; },
    tmdbMovieDetails: async () => { calls.tmdbMovieDetails++; return null; },
    omdbFetch: async () => { calls.omdbFetch++; return null; },
    extractPosterColor: async () => { calls.extractPosterColor++; return null; },
  };
  return { api, calls };
}

describe("resolveAwardFilm — failure routing", () => {
  it("routes a no-TMDB-match film to failure without writing it into master", async () => {
    const master: MasterFilm[] = [];
    const { api, calls } = spyApi(null); // TMDB search finds nothing

    const outcome = await resolveAwardFilm(
      master,
      "A Film TMDB Has Never Heard Of",
      1980,
      "oscar",
      [row({ movieName: "A Film TMDB Has Never Heard Of", releaseYear: 1980 })],
      "oscar/1980.xlsx",
      api,
    );

    // Distinct outcome main() sends to master-fails.xlsx …
    expect(outcome.status).toBe("no-match");
    // … and NOT silently dropped into the dataset as a broken/partial row.
    expect(master).toHaveLength(0);
    // Search was attempted; no enrichment happened for a film we can't identify.
    expect(calls.tmdbSearch).toBe(1);
    expect(calls.tmdbMovieDetails).toBe(0);
  });

  it("returns cleanly (no throw) on no-match, so main routes it as a recorded failure", async () => {
    const { api } = spyApi(null);
    await expect(
      resolveAwardFilm([], "Ghost", 1980, "oscar", [row({ movieName: "Ghost", releaseYear: 1980 })], "oscar/1980.xlsx", api),
    ).resolves.toEqual({ status: "no-match" });
  });

  it("throws (not writes a broken row) when TMDB details fetch fails mid-enrichment", async () => {
    const master: MasterFilm[] = [];
    // Search matches, but details fetch returns null → the row can't be built.
    const { api } = spyApi({ id: 999, matchedYear: 1980 });

    await expect(
      resolveAwardFilm(master, "Half-Fetched Film", 1980, "oscar", [row({ movieName: "Half-Fetched Film", releaseYear: 1980 })], "oscar/1980.xlsx", api),
    ).rejects.toThrow("TMDB details fetch failed");

    // The error propagates to main()'s catch (→ master-fails.xlsx); master is never
    // left holding a partial record.
    expect(master).toHaveLength(0);
  });

  it("isolates a no-match film without corrupting the rest of the batch", async () => {
    const keeper = masterFilm({ title: "Keeper", releaseYear: 2000 });
    const master = [keeper];
    const { api } = spyApi(null);

    const good = await resolveAwardFilm(master, "Keeper", 2000, "oscar", [row({ movieName: "Keeper", releaseYear: 2000 })], "oscar/2000.xlsx", api);
    const bad = await resolveAwardFilm(master, "Ghost", 1980, "oscar", [row({ movieName: "Ghost", releaseYear: 1980 })], "oscar/2000.xlsx", api);

    expect(good.status).toBe("merged");
    expect(bad.status).toBe("no-match");
    // Only the real film remains; the no-match added nothing.
    expect(master).toHaveLength(1);
    expect(master[0]!.title).toBe("Keeper");
  });
});

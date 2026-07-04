import { describe, expect, it } from "vitest";

import {
  resolveAwardFilm,
  type FilmApi,
  type MasterFilm,
  type SourceRow,
} from "../data/scripts/build-master";

// A minimal master row — resolveAwardFilm's merge path only reads title/releaseYear/
// tmdbId/_sources and the award arrays, so the rest is cast away.
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
    id: "GG-2020-001",
    awardYear: 2020,
    movieName: "Film",
    releaseYear: 2000,
    category: "Best Picture",
    awardWinner: "Film",
    awardNominee: "",
    filmType: "movie",
    ...overrides,
  };
}

function spyApi(searchResult: { id: number; matchedYear: number } | null = null) {
  const calls = { tmdbSearch: 0, tmdbMovieDetails: 0, omdbFetch: 0, extractPosterColor: 0 };
  const api: FilmApi = {
    tmdbSearch: async () => { calls.tmdbSearch++; return searchResult; },
    tmdbMovieDetails: async () => { calls.tmdbMovieDetails++; return null; },
    omdbFetch: async () => { calls.omdbFetch++; return null; },
    extractPosterColor: async () => { calls.extractPosterColor++; return null; },
  };
  const totalCalls = () => calls.tmdbSearch + calls.tmdbMovieDetails + calls.omdbFetch + calls.extractPosterColor;
  return { api, calls, totalCalls };
}

describe("resolveAwardFilm — idempotency", () => {
  it("re-running an already-in-master batch merges only and makes ZERO API calls", async () => {
    const master = [
      masterFilm({ title: "Parasite", releaseYear: 2019, tmdbId: 496243 }),
      masterFilm({ title: "1917", releaseYear: 2019, tmdbId: 530915 }),
    ];
    const { api, totalCalls } = spyApi();

    for (const [title, year] of [["Parasite", 2019], ["1917", 2019]] as const) {
      const outcome = await resolveAwardFilm(
        master,
        title,
        year,
        "goldenglobe",
        [row({ movieName: title, releaseYear: year })],
        "gg/2020.xlsx",
        api,
      );
      expect(outcome.status).toBe("merged");
    }

    // No new rows, and not a single network call across the whole batch.
    expect(master).toHaveLength(2);
    expect(totalCalls()).toBe(0);
  });

  it("merges award data onto the existing row (no duplicate) on a title+year hit", async () => {
    const existing = masterFilm({ title: "Parasite", releaseYear: 2019, ggCategories: [] });
    const master = [existing];
    const { api, calls } = spyApi();

    const outcome = await resolveAwardFilm(
      master,
      "Parasite",
      2019,
      "goldenglobe",
      [row({ movieName: "Parasite", releaseYear: 2019, category: "Best Foreign Language Film", awardWinner: "Parasite" })],
      "gg/2020.xlsx",
      api,
    );

    expect(outcome.status).toBe("merged");
    expect(master).toHaveLength(1);
    expect(existing.ggCategories).toHaveLength(1);
    expect(existing.ggNominations).toBe(1);
    expect(existing.ggWins).toBe(1);
    expect(existing._sources).toContain("gg/2020.xlsx");
    expect(calls.tmdbMovieDetails).toBe(0);
    expect(calls.omdbFetch).toBe(0);
  });

  it("resolves a different-title film to the same row by TMDB id — search only, no enrichment", async () => {
    // Stored under its French title; the incoming Oscar/Cannes row uses the English one.
    const existing = masterFilm({ title: "Le Salaire de la peur", releaseYear: 1953, tmdbId: 691 });
    const master = [existing];
    const { api, calls } = spyApi({ id: 691, matchedYear: 1953 });

    const outcome = await resolveAwardFilm(
      master,
      "The Wages of Fear",
      1953,
      "cannes",
      [row({ id: "CN-1953-001", movieName: "The Wages of Fear", releaseYear: 1953, category: "Grand Prix" })],
      "cannes/1953.xlsx",
      api,
    );

    expect(outcome.status).toBe("merged");
    expect(master).toHaveLength(1); // resolved to the existing row — no duplicate
    expect(calls.tmdbSearch).toBe(1); // search ran (title didn't match by title+year)
    expect(calls.tmdbMovieDetails).toBe(0); // but matched by tmdbId → no enrichment fetch
    expect(calls.omdbFetch).toBe(0);
  });

  it("DOES call the API for a genuinely new film (guards against a false zero)", async () => {
    const master: MasterFilm[] = [];
    const { api, calls } = spyApi(null); // search returns no match

    const outcome = await resolveAwardFilm(
      master,
      "Some Brand New Film",
      1999,
      "goldenglobe",
      [row({ movieName: "Some Brand New Film", releaseYear: 1999 })],
      "gg/1999.xlsx",
      api,
    );

    expect(outcome.status).toBe("no-match");
    expect(calls.tmdbSearch).toBe(1); // the API IS reached for unknown films
    expect(master).toHaveLength(0);
  });
});

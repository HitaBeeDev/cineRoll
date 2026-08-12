import { describe, expect, it } from "vitest";

import { likedFilmRefs } from "../src/scripts/evalRecommender/holdout";
import type { WatchedRow } from "../src/scripts/evalRecommender/types";

function row(
  filmId: string,
  sentiment: WatchedRow["sentiment"],
  doNotSuggest = false,
): WatchedRow {
  return {
    filmId,
    sentiment,
    doNotSuggest,
    watchedAt: new Date("2026-01-01"),
    film: {} as WatchedRow["film"],
  };
}

describe("likedFilmRefs", () => {
  // The harness grades the recommender on the films it holds out. If loved films
  // were left out of that set, it would be scoring only the weaker half of each
  // user's taste and reporting the result as the model's accuracy.
  it("treats loved films as ground truth alongside liked ones", () => {
    const refs = likedFilmRefs([row("a", "like"), row("b", "love")]);

    expect(refs.map(ref => ref.filmId).sort()).toEqual(["a", "b"]);
  });

  it("excludes dislikes, unrated watches and hidden films", () => {
    const refs = likedFilmRefs([
      row("a", "dislike"),
      row("b", null),
      row("c", "love", true),
    ]);

    expect(refs).toEqual([]);
  });
});

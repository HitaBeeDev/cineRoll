import { describe, expect, it } from "vitest";

import { progressPayload } from "../src/routes/userRoute/progressRepository";

describe("user completion progress", () => {
  it("calculates percentages and returns every collection in display order", () => {
    const progress = progressPayload([
      { key: "overall", watched: 3n, total: 8n },
      { key: "cannes", watched: 1n, total: 3n },
      { key: "oscar", watched: 2n, total: 4n },
    ]);

    expect(progress.overall).toEqual({ watched: 3, total: 8, percentage: 37.5 });
    expect(progress.categories.map(category => category.key)).toEqual([
      "oscar",
      "goldenglobe",
      "cannes",
      "berlin",
      "imdb-movies",
      "imdb-tv",
    ]);
    expect(progress.categories[0]).toMatchObject({
      label: "Oscar",
      watched: 2,
      total: 4,
      percentage: 50,
    });
    expect(progress.categories[1]).toMatchObject({
      watched: 0,
      total: 0,
      percentage: 0,
    });
    expect(progress.categories[2]).toMatchObject({ percentage: 33.3 });
  });

  it("handles an empty catalog without dividing by zero", () => {
    expect(progressPayload([]).overall).toEqual({
      watched: 0,
      total: 0,
      percentage: 0,
    });
  });
});

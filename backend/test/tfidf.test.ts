import { describe, it, expect } from "vitest";

import {
  calculateCentroid,
} from "../src/lib/recommender/tfidf/calculateCentroid";
import { calculateCosineSimilarity } from "../src/lib/recommender/tfidf/calculateCosineSimilarity";
import { buildIdf } from "../src/lib/recommender/tfidf/buildIdf";
import { createFilmTokens } from "../src/lib/recommender/tfidf/createFilmTokens";
import { createTfidfVector } from "../src/lib/recommender/tfidf/createTfidfVector";
import type { TfidfFilm } from "../src/lib/recommender/tfidf/types";

// A film with no awards — spreads the noise out of the fixtures below.
function film(partial: Partial<TfidfFilm>): TfidfFilm {
  return {
    genres: [],
    director: null,
    releaseYear: null,
    oscarWins: 0,
    oscarNominations: 0,
    ggWins: 0,
    ggNominations: 0,
    cannesWins: 0,
    cannesNominations: 0,
    berlinWins: 0,
    berlinNominations: 0,
    ...partial,
  };
}

describe("createFilmTokens", () => {
  it("emits genre, director, decade, and award tokens", () => {
    const tokens = createFilmTokens(
      film({
        genres: ["Drama", "Crime"],
        director: "Coppola",
        releaseYear: 1972,
        oscarWins: 3,
      }),
    );

    expect(new Set(tokens)).toEqual(
      new Set([
        "genre:Drama",
        "genre:Crime",
        "director:Coppola",
        "decade:1970s",
        "award:oscar_winner",
      ]),
    );
  });

  it("prefers winner over nominee for the same body", () => {
    const tokens = createFilmTokens(film({ oscarWins: 1, oscarNominations: 4 }));

    expect(tokens).toContain("award:oscar_winner");
    expect(tokens).not.toContain("award:oscar_nominee");
  });
});

describe("buildIdf", () => {
  it("gives a rarer token a higher weight than a common one", () => {
    // "Drama" in every film; "Film-Noir" in one → noir must weigh more.
    const catalog = [
      film({ genres: ["Drama"] }),
      film({ genres: ["Drama"] }),
      film({ genres: ["Drama"] }),
      film({ genres: ["Drama", "Film-Noir"] }),
    ];

    const idf = buildIdf(catalog);

    expect(idf.get("genre:Film-Noir")!).toBeGreaterThan(idf.get("genre:Drama")!);
  });

  it("keeps weights positive even for a token in every document", () => {
    const idf = buildIdf([film({ genres: ["Drama"] }), film({ genres: ["Drama"] })]);

    expect(idf.get("genre:Drama")!).toBeGreaterThan(0);
  });
});

describe("calculateCosineSimilarity", () => {
  const catalog = [
    film({ genres: ["Drama"] }),
    film({ genres: ["Drama"] }),
    film({ genres: ["Drama"] }),
    film({ genres: ["Drama", "Film-Noir"], director: "Wilder" }),
    film({ genres: ["Comedy"] }),
  ];
  const idf = buildIdf(catalog);
  const vec = (f: TfidfFilm) => createTfidfVector(f, idf);

  it("is 1 for a vector with itself", () => {
    const v = vec(film({ genres: ["Drama", "Film-Noir"] }));

    expect(calculateCosineSimilarity(v, v)).toBeCloseTo(1);
  });

  it("is 0 when two films share no tokens", () => {
    const drama = vec(film({ genres: ["Drama"] }));
    const comedy = vec(film({ genres: ["Comedy"] }));

    expect(calculateCosineSimilarity(drama, comedy)).toBe(0);
  });

  it("weights a shared RARE tag above a shared COMMON tag", () => {
    // Query shares the rare "Film-Noir" with A, but the common "Drama" with B.
    // TF-IDF should rank the rare-sharing pair as more similar — the whole point
    // that raw Jaccard (which counts both shares equally) gets wrong.
    const query = vec(film({ genres: ["Film-Noir", "Drama"] }));
    const sharesRare = vec(film({ genres: ["Film-Noir", "Comedy"] }));
    const sharesCommon = vec(film({ genres: ["Drama", "Comedy"] }));

    expect(calculateCosineSimilarity(query, sharesRare)).toBeGreaterThan(
      calculateCosineSimilarity(query, sharesCommon),
    );
  });
});

describe("calculateCentroid", () => {
  it("averages liked films into a taste vector nearest the shared theme", () => {
    const catalog = [
      film({ genres: ["Crime"] }),
      film({ genres: ["Drama"] }),
      film({ genres: ["Comedy"] }),
      film({ genres: ["Sci-Fi"] }),
    ];
    const idf = buildIdf(catalog);

    // User liked two crime films → centroid should sit closer to a crime film
    // than to a comedy.
    const taste = calculateCentroid([
      createTfidfVector(film({ genres: ["Crime", "Drama"] }), idf),
      createTfidfVector(film({ genres: ["Crime"] }), idf),
    ]);

    const crime = createTfidfVector(film({ genres: ["Crime"] }), idf);
    const comedy = createTfidfVector(film({ genres: ["Comedy"] }), idf);

    expect(calculateCosineSimilarity(taste, crime)).toBeGreaterThan(
      calculateCosineSimilarity(taste, comedy),
    );
  });

  it("returns an empty vector for no inputs", () => {
    expect(calculateCentroid([]).size).toBe(0);
  });
});

import { describe, expect, it } from "vitest";

import { hasInterpretationSignal } from "../src/routes/naturalRollRoute/interpretationSignal";
import { extractLocalStructuralFilters } from "../src/routes/naturalRollRoute/localStructuralExtractor";
import { capPerDirector } from "../src/routes/naturalRollRoute/referenceFilm/capPerDirector";
import { franchiseRoot } from "../src/routes/naturalRollRoute/referenceFilm/franchiseRoot";
import { withReferencePreferences } from "../src/routes/naturalRollRoute/referenceFilm/referencePreferences";
import type { ReferenceOutcome } from "../src/routes/naturalRollRoute/referenceFilm/referenceTypes";
import { extractReferenceTitles } from "../src/routes/naturalRollRoute/structuralExtraction/extractReferenceTitles";
import type { SoftPreferences } from "../src/routes/naturalRollRoute/softPreferences";

// The prompt that shipped nonsense in production: it returned the six
// highest-rated award films because nothing in it was ever parsed.
const JOHN_WICK_PROMPT = "suggest some movies similar to john wick";

const emptyPreferences: SoftPreferences = {
  requiredGenres: [],
  preferredGenres: [],
  tones: [],
  themes: [],
  keywords: [],
  contentType: null,
};

describe("reference title extraction", () => {
  it("pulls the named film out of the production prompt", () => {
    expect(extractReferenceTitles(JOHN_WICK_PROMPT)).toEqual(["john wick"]);
  });

  it("reaches the Stage-1 output, not just the helper", () => {
    const filters = extractLocalStructuralFilters(JOHN_WICK_PROMPT);

    expect(filters.referenceTitles).toEqual(["john wick"]);
    expect(filters.contentType).toBe("movie");
  });

  it.each([
    ["something in the vein of Blade Runner", "Blade Runner"],
    ["if I liked Parasite", "Parasite"],
    ["movies like Heat", "Heat"],
    ["anything reminiscent of Amelie", "Amelie"],
    ["more like The Godfather", "The Godfather"],
  ])("reads %j as a reference to %j", (prompt, expected) => {
    expect(extractReferenceTitles(prompt)).toEqual([expected]);
  });

  it("drops the qualifier that follows the title", () => {
    expect(extractReferenceTitles("something like Heat but funnier")).toEqual(["Heat"]);
    expect(extractReferenceTitles("films similar to Alien with a female lead")).toEqual(["Alien"]);
  });

  it("does not invent a reference from a pronoun or a bare article", () => {
    expect(extractReferenceTitles("something like that")).toBeUndefined();
    expect(extractReferenceTitles("more like this")).toBeUndefined();
  });

  it("leaves prompts that name no reference alone", () => {
    expect(extractReferenceTitles("a dark french thriller from the 80s")).toBeUndefined();
  });
});

describe("franchise root", () => {
  it("finds the stem a sequel shares with its franchise", () => {
    expect(franchiseRoot("John Wick: Chapter 4")).toBe("John Wick");
    expect(franchiseRoot("The Godfather Part II")).toBe("The Godfather");
  });

  it("returns null when there is no stem worth excluding by", () => {
    // A standalone title adds nothing over the id exclusion, and a stem this
    // short would knock out unrelated films by prefix.
    expect(franchiseRoot("Parasite")).toBeNull();
    expect(franchiseRoot("Up: Part 2")).toBeNull();
  });
});

describe("reference preferences", () => {
  const resolved: ReferenceOutcome = {
    kind: "resolved",
    note: "anchored",
    film: {
      id: "ref",
      slug: "john-wick-chapter-4",
      title: "John Wick: Chapter 4",
      year: 2023,
      director: "Chad Stahelski",
      genres: ["Action", "Thriller", "Crime", "Drama"],
      moodTags: ["stylish"],
      keywords: ["assassin", "revenge"],
      oscarCategories: null,
      ggCategories: null,
      cannesCategories: null,
    },
  };

  it("carries the anchor's genres as preferred, capped so near-clones aren't required", () => {
    const preferences = withReferencePreferences(emptyPreferences, resolved);

    expect(preferences.preferredGenres).toEqual(["Action", "Thriller", "Crime"]);
    expect(preferences.requiredGenres).toEqual([]);
    expect(preferences.keywords).toEqual(["stylish", "assassin", "revenge"]);
  });

  it("keeps what the user actually asked for ahead of the anchor's attributes", () => {
    const preferences = withReferencePreferences(
      { ...emptyPreferences, preferredGenres: ["Music"], keywords: ["slow-burn"] },
      resolved,
    );

    expect(preferences.preferredGenres[0]).toBe("Music");
    expect(preferences.keywords[0]).toBe("slow-burn");
  });

  it("uses TMDB attributes when the named film isn't in the catalogue", () => {
    const external: ReferenceOutcome = {
      kind: "external",
      note: "not in catalogue",
      reference: {
        title: "Fight Club",
        year: 1999,
        genres: ["Drama", "Thriller"],
        keywords: ["insomnia", "dual identity"],
      },
    };

    const preferences = withReferencePreferences(emptyPreferences, external);

    expect(preferences.preferredGenres).toEqual(["Drama", "Thriller"]);
    expect(preferences.keywords).toEqual(["insomnia", "dual identity"]);
  });

  it("adds nothing when the title could not be identified", () => {
    const unknown: ReferenceOutcome = {
      kind: "unknown",
      requestedTitles: ["asdfgh"],
      note: "couldn't identify",
    };

    expect(withReferencePreferences(emptyPreferences, unknown)).toEqual(emptyPreferences);
  });
});

describe("director diversity", () => {
  const byDirector = (id: string, director: string | null) =>
    ({ id, director } as unknown as Parameters<typeof capPerDirector>[0][number]);

  it("pushes a prolific director's surplus behind the rest", () => {
    const capped = capPerDirector([
      byDirector("a1", "Kurosawa"),
      byDirector("a2", "Kurosawa"),
      byDirector("a3", "Kurosawa"),
      byDirector("b1", "Varda"),
    ]);

    expect(capped.map(film => film.id)).toEqual(["a1", "a2", "b1", "a3"]);
  });

  it("keeps every film — the pool is reordered, never shrunk", () => {
    const films = [
      byDirector("a1", "Kurosawa"),
      byDirector("a2", "Kurosawa"),
      byDirector("a3", "Kurosawa"),
      byDirector("n1", null),
    ];

    expect(capPerDirector(films)).toHaveLength(films.length);
  });

  it("never caps unknown directors together — null is not one person", () => {
    const films = [
      byDirector("n1", null),
      byDirector("n2", null),
      byDirector("n3", null),
    ];

    expect(capPerDirector(films).map(film => film.id)).toEqual(["n1", "n2", "n3"]);
  });
});

describe("interpretation signal", () => {
  it("refuses to claim confidence when nothing was understood", () => {
    // Exactly the pre-fix John Wick state: "movie" extracted, nothing else.
    // Without this the reranker still returns a full set, ordered by the IMDb
    // tie-breaker alone, and presents it as a match.
    expect(
      hasInterpretationSignal({ contentType: "movie" }, emptyPreferences, { kind: "none" }),
    ).toBe(false);
  });

  it("treats a resolved reference as signal", () => {
    const reference = { kind: "resolved" } as ReferenceOutcome;

    expect(hasInterpretationSignal({ contentType: "movie" }, emptyPreferences, reference)).toBe(true);
  });

  it("treats an external reference as signal — the attributes still rank", () => {
    const reference = { kind: "external" } as ReferenceOutcome;

    expect(hasInterpretationSignal({}, emptyPreferences, reference)).toBe(true);
  });

  it("does not treat an unidentifiable title as signal", () => {
    const reference = { kind: "unknown" } as ReferenceOutcome;

    expect(hasInterpretationSignal({}, emptyPreferences, reference)).toBe(false);
  });

  it("counts real filters and real preferences", () => {
    expect(hasInterpretationSignal({ genre: ["Horror"] }, emptyPreferences, { kind: "none" })).toBe(true);
    expect(
      hasInterpretationSignal({}, { ...emptyPreferences, tones: ["bleak"] }, { kind: "none" }),
    ).toBe(true);
  });

  it("ignores filter keys that carry no meaning", () => {
    expect(
      hasInterpretationSignal(
        { contentType: "movie", genre: [], language: null, category: "" },
        emptyPreferences,
        { kind: "none" },
      ),
    ).toBe(false);
  });
});

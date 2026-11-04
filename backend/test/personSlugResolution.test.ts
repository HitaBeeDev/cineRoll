import { describe, expect, it } from "vitest";

import { pickCanonicalName } from "../src/routes/personsRoute/pickCanonicalName";
import { nameToSlug } from "../src/routes/personsRoute/slug";
import { personSitemapEntries } from "../src/routes/sitemapRoute/personSitemapEntries";

describe("pickCanonicalName", () => {
  it("resolves an accented name through its Person row", () => {
    expect(pickCanonicalName("pedro-almodovar", "Pedro Almodóvar", [])).toBe("Pedro Almodóvar");
  });

  it("resolves a hyphenated name through its Person row", () => {
    expect(pickCanonicalName("jean-luc-godard", "Jean-Luc Godard", [])).toBe("Jean-Luc Godard");
  });

  it("falls back to the candidate lookup for a plain name with no Person row", () => {
    expect(pickCanonicalName("federico-fellini", null, ["Federico Fellini"])).toBe(
      "Federico Fellini",
    );
  });

  it("ignores a stored name whose slug does not match", () => {
    expect(pickCanonicalName("pedro-almodovar", "Someone Else", [])).toBeNull();
  });

  it("returns null when nothing matches, so the route can 404", () => {
    expect(pickCanonicalName("nobody-here", null, ["Federico Fellini"])).toBeNull();
  });
});

describe("personSitemapEntries", () => {
  const at = new Date("2026-06-01T00:00:00Z");
  const row = (name: string) => ({ name, credits: 3, updatedAt: at });

  it("keeps accented and hyphenated names that have a Person row", () => {
    const slugs = new Set([nameToSlug("Pedro Almodóvar"), nameToSlug("Jean-Luc Godard")]);
    const entries = personSitemapEntries(
      [row("Pedro Almodóvar"), row("Jean-Luc Godard"), row("Federico Fellini")],
      slugs,
    );

    expect(entries.map(entry => entry.slug).sort()).toEqual([
      "federico-fellini",
      "jean-luc-godard",
      "pedro-almodovar",
    ]);
  });

  it("drops names that would 404: no Person row and not a plain name", () => {
    const entries = personSitemapEntries([row("Pedro Almodóvar")], new Set());
    expect(entries).toEqual([]);
  });
});

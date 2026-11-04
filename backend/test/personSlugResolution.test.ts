import { describe, expect, it } from "vitest";

import { buildPersonNameIndex } from "../src/routes/personsRoute/buildPersonNameIndex";
import { personSitemapEntries } from "../src/routes/sitemapRoute/personSitemapEntries";

describe("buildPersonNameIndex", () => {
  const index = buildPersonNameIndex([
    "Pedro Almodóvar",
    "Jean-Luc Godard",
    "Federico Fellini",
    "Federico FELLINI",
  ]);

  it("maps an accented name's slug back to the exact name", () => {
    expect(index.get("pedro-almodovar")).toBe("Pedro Almodóvar");
  });

  it("maps a hyphenated name's slug back to the exact name", () => {
    expect(index.get("jean-luc-godard")).toBe("Jean-Luc Godard");
  });

  it("prefers the spelling with fewer capitals when two share a slug", () => {
    expect(index.get("federico-fellini")).toBe("Federico Fellini");
    expect(buildPersonNameIndex(["Pedro ALMODÓVAR", "Pedro Almodóvar"]).get("pedro-almodovar")).toBe(
      "Pedro Almodóvar",
    );
  });

  it("has no entry for an unknown slug, so the route can 404", () => {
    expect(index.get("nobody-here")).toBeUndefined();
  });
});

describe("personSitemapEntries", () => {
  const row = (name: string, iso: string) => ({ name, credits: 3, updatedAt: new Date(iso) });

  it("lists accented and hyphenated names", () => {
    const slugs = personSitemapEntries([
      row("Pedro Almodóvar", "2026-06-01T00:00:00Z"),
      row("Jean-Luc Godard", "2026-06-01T00:00:00Z"),
    ]).map(entry => entry.slug);

    expect(slugs.sort()).toEqual(["jean-luc-godard", "pedro-almodovar"]);
  });

  it("collapses spellings that share a slug, keeping the newest date", () => {
    const entries = personSitemapEntries([
      row("Federico Fellini", "2026-01-01T00:00:00Z"),
      row("Federico FELLINI", "2026-06-01T00:00:00Z"),
    ]);

    expect(entries).toEqual([
      { slug: "federico-fellini", updatedAt: new Date("2026-06-01T00:00:00Z") },
    ]);
  });
});

describe("displayPersonName", () => {
  it("shows all-caps surnames in normal case", async () => {
    const { displayPersonName } = await import("../src/routes/personsRoute/displayPersonName");
    expect(displayPersonName("Pedro ALMODÓVAR")).toBe("Pedro Almodóvar");
    expect(displayPersonName("Jean-Luc GODARD")).toBe("Jean-Luc Godard");
    expect(displayPersonName("Agnès VARDA-DEMY")).toBe("Agnès Varda-Demy");
  });

  it("leaves normal names and short capitals alone", async () => {
    const { displayPersonName } = await import("../src/routes/personsRoute/displayPersonName");
    expect(displayPersonName("Martin Luther King Jr")).toBe("Martin Luther King Jr");
    expect(displayPersonName("Henry VIII")).toBe("Henry VIII");
  });
});

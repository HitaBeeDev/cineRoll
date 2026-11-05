import { describe, expect, it } from "vitest";

import { resolveRetiredPersonSlug } from "../src/routes/personsRoute/resolveRetiredPersonSlug";

const known = new Map(
  ["leonard-rosenman", "damien-chazelle", "stanley-kubrick", "joel-coen", "ethan-coen", "ann-smith", "pedro-almodovar"].map(
    slug => [slug, slug] as const,
  ),
);

describe("resolveRetiredPersonSlug", () => {
  it.each([
    ["adaptation-score-by-leonard-rosenman", "leonard-rosenman"],
    ["written-by-damien-chazelle", "damien-chazelle"],
    ["stanley-kubrick-producer", "stanley-kubrick"],
    ["screenplay-by-pedro-almodovar", "pedro-almodovar"],
  ])("%s → %s", (slug, expected) => {
    expect(resolveRetiredPersonSlug(slug, known)).toBe(expected);
  });

  it.each([
    // Two people: no single page to send them to.
    ["joel-coen-and-ethan-coen"],
    // An unknown real name must not redirect to a known name inside it.
    ["mary-ann-smith"],
    // Film titles and companies hold no known person.
    ["30-rock"],
    ["pulp-fiction"],
    ["metro-goldwyn-mayer"],
    // Already a short slug: nothing to strip.
    ["leonard-rosenman"],
  ])("%s → stays 404", slug => {
    expect(resolveRetiredPersonSlug(slug, known)).toBeNull();
  });
});

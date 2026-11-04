import { nameToSlug } from "../personsRoute/slug";
import type { AwardBodySlug } from "./awardBodies";

/**
 * Prizes that were renamed over the years, merged under one page. Without this
 * the Golden Bear would be split between "Golden Bear" and "Golden Bear for
 * Best Film", each a half-empty page. Keys are the slug of a stored name;
 * values are the canonical name. Names that differ only in case already share a
 * slug and need no entry here.
 */
const ALIASES: Partial<Record<AwardBodySlug, Record<string, string>>> = {
  oscars: {
    "best-picture": "Best Picture",
    "best-motion-picture": "Best Picture",
    "outstanding-picture": "Best Picture",
    "outstanding-production": "Best Picture",
    "outstanding-motion-picture": "Best Picture",
    "international-feature-film": "International Feature Film",
    "foreign-language-film": "International Feature Film",
  },
  cannes: {
    "palme-d-or": "Palme d'Or",
    "short-film-palme-d-or": "Short Film Palme d'Or",
    "palme-d-or-short-film": "Short Film Palme d'Or",
  },
  berlinale: {
    "golden-bear": "Golden Bear",
    "golden-bear-for-best-film": "Golden Bear",
    "golden-bear-for-best-short-film": "Golden Bear for Best Short Film",
    "golden-bear-short-film": "Golden Bear for Best Short Film",
    "silver-bear-for-outstanding-artistic-contribution":
      "Silver Bear for an Outstanding Artistic Contribution",
    "silver-bear-for-an-outstanding-artistic-contribution":
      "Silver Bear for an Outstanding Artistic Contribution",
    "silver-bear-for-an-outstanding-single-achievement":
      "Silver Bear for an Outstanding Single Achievement",
  },
};

/** The page a stored category name belongs to: its URL slug and display name. */
export function canonicalCategory(
  body: AwardBodySlug,
  stored: string,
): { slug: string; name: string } {
  const alias = ALIASES[body]?.[nameToSlug(stored)];
  const name = alias ?? stored;
  return { slug: nameToSlug(name), name };
}

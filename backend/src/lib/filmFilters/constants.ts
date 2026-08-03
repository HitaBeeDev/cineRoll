export const FEMALE_DIRECTORS = [
  "Agnès Varda",
  "Alice Rohrwacher",
  "Andrea Arnold",
  "Ava DuVernay",
  "Barbra Streisand",
  "Céline Sciamma",
  "Chloé Zhao",
  "Claire Denis",
  "Dee Rees",
  "Emerald Fennell",
  "Greta Gerwig",
  "Jane Campion",
  "Justine Triet",
  "Kathryn Bigelow",
  "Kelly Reichardt",
  "Lina Wertmüller",
  "Lucrecia Martel",
  "Mira Nair",
  "Nancy Meyers",
  "Nora Ephron",
  "Patty Jenkins",
  "Penny Marshall",
  "Sarah Polley",
  "Sofia Coppola",
  "Susanne Bier",
];

export const AWARD_BODY_VALUES = ["oscar", "goldenglobe", "cannes", "berlin"] as const;
export type AwardBodyValue = (typeof AWARD_BODY_VALUES)[number];

/**
 * The content-type facet values, in chip order. `types` is a derived set that
 * crosses two axes, so these are not simply the distinct values in the column —
 * they are the five buckets the UI offers, each resolved by `contentTypeSql`
 * (notably "movie" = feature, excluding shorts). Enumerated here rather than
 * queried because a facet the catalogue happens to have zero of this week must
 * still appear as an option showing 0, not vanish.
 */
export const CONTENT_TYPE_FACET_VALUES = [
  "movie",
  "short",
  "animation",
  "documentary",
  "tv-series",
] as const;

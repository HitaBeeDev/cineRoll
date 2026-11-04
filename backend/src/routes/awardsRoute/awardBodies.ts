/** The four award bodies, keyed by the slug used in page URLs. */
export const AWARD_BODIES = {
  oscars: { column: "oscarCategories", name: "Academy Awards", shortName: "Oscars" },
  "golden-globes": { column: "ggCategories", name: "Golden Globe Awards", shortName: "Golden Globes" },
  cannes: { column: "cannesCategories", name: "Cannes Film Festival", shortName: "Cannes" },
  berlinale: { column: "berlinCategories", name: "Berlin International Film Festival", shortName: "Berlinale" },
} as const;

export type AwardBodySlug = keyof typeof AWARD_BODIES;

export function isAwardBodySlug(value: string): value is AwardBodySlug {
  return Object.prototype.hasOwnProperty.call(AWARD_BODIES, value);
}
